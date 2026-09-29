import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";

/**
 * R2-compatible object store on the local filesystem. Object keys map to files
 * under the root; content type is kept in a sidecar JSON file. Multipart parts
 * are staged under `.multipart/<uploadId>/` and concatenated on completion.
 */

type HttpMetadata = { contentType?: string };
type PutValue = ReadableStream | ArrayBuffer | ArrayBufferView | Blob | string;

const META_SUFFIX = ".__meta.json";

function bodyStream(value: PutValue): Readable {
  if (typeof value === "string") return Readable.from([Buffer.from(value)]);
  if (value instanceof ArrayBuffer) return Readable.from([Buffer.from(value)]);
  if (ArrayBuffer.isView(value)) return Readable.from([Buffer.from(value.buffer, value.byteOffset, value.byteLength)]);
  if (typeof Blob !== "undefined" && value instanceof Blob) return Readable.fromWeb(value.stream() as never);
  return Readable.fromWeb(value as never);
}

export class LocalBucket implements R2Bucket {
  private readonly root: string;

  constructor(root: string) {
    this.root = resolve(root);
  }

  private path(key: string) {
    if (!key || key.includes("\0")) throw new Error("Invalid object key");
    const target = resolve(this.root, key);
    if (!target.startsWith(this.root + sep) || target.endsWith(META_SUFFIX)) throw new Error("Invalid object key");
    return target;
  }

  private async readMeta(target: string): Promise<HttpMetadata> {
    try {
      return JSON.parse(await readFile(target + META_SUFFIX, "utf8")) as HttpMetadata;
    } catch {
      return {};
    }
  }

  private async writeObject(key: string, source: Readable, httpMetadata: HttpMetadata = {}) {
    const target = this.path(key);
    await mkdir(dirname(target), { recursive: true });
    const temporary = `${target}.${randomUUID()}.tmp`;
    try {
      await pipeline(source, createWriteStream(temporary, { flags: "wx" }));
      await writeFile(target + META_SUFFIX, JSON.stringify(httpMetadata));
      await rename(temporary, target);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }
    const info = await stat(target);
    return { key, size: info.size, etag: `${info.size}-${info.mtimeMs}`, httpMetadata };
  }

  async put(key: string, value: PutValue, options?: { httpMetadata?: HttpMetadata }) {
    return this.writeObject(key, bodyStream(value), options?.httpMetadata ?? {});
  }

  async head(key: string) {
    const target = this.path(key);
    try {
      const info = await stat(target);
      return { key, size: info.size, httpMetadata: await this.readMeta(target) };
    } catch {
      return null;
    }
  }

  async get(key: string, options?: { range?: { offset: number; length: number } }): Promise<R2ObjectBody | null> {
    const target = this.path(key);
    let size: number;
    try {
      size = (await stat(target)).size;
    } catch {
      return null;
    }
    const httpMetadata = await this.readMeta(target);
    const range = options?.range;
    const offset = range ? Math.max(0, Math.min(range.offset, size)) : 0;
    const length = range ? Math.max(0, Math.min(range.length, size - offset)) : size;
    const stream = length > 0
      ? createReadStream(target, { start: offset, end: offset + length - 1 })
      : Readable.from([]);
    return {
      body: Readable.toWeb(stream) as ReadableStream,
      size,
      range: range ? { offset, length } : undefined,
      httpMetadata,
      writeHttpMetadata(headers: Headers) {
        if (httpMetadata.contentType) headers.set("Content-Type", httpMetadata.contentType);
      },
    };
  }

  async delete(keys: string | string[]) {
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      const target = this.path(key);
      await rm(target, { force: true });
      await rm(target + META_SUFFIX, { force: true });
    }
  }

  private multipartDir(uploadId: string) {
    if (!/^[0-9a-f-]{36}$/.test(uploadId)) throw new Error("Invalid upload id");
    return join(this.root, ".multipart", uploadId);
  }

  async createMultipartUpload(key: string, options?: { httpMetadata?: HttpMetadata }) {
    this.path(key);
    const uploadId = randomUUID();
    const directory = this.multipartDir(uploadId);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, "upload.json"), JSON.stringify({ key, httpMetadata: options?.httpMetadata ?? {} }));
    return this.resumeMultipartUpload(key, uploadId);
  }

  resumeMultipartUpload(key: string, uploadId: string): R2MultipartUpload {
    const directory = this.multipartDir(uploadId);
    const writeObject = this.writeObject.bind(this);
    const get = this.get.bind(this);
    return {
      key,
      uploadId,
      async uploadPart(partNumber: number, value: ReadableStream | ArrayBuffer | Blob) {
        if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10_000) throw new Error("Invalid part number");
        const manifest = JSON.parse(await readFile(join(directory, "upload.json"), "utf8")) as { key: string };
        if (manifest.key !== key) throw new Error("Multipart key mismatch");
        const partPath = join(directory, `part-${String(partNumber).padStart(5, "0")}`);
        await pipeline(bodyStream(value), createWriteStream(partPath));
        return { partNumber, etag: `${uploadId}-${partNumber}-${(await stat(partPath)).size}` };
      },
      async complete(parts: R2UploadedPart[]) {
        const manifest = JSON.parse(await readFile(join(directory, "upload.json"), "utf8")) as { key: string; httpMetadata: HttpMetadata };
        if (manifest.key !== key) throw new Error("Multipart key mismatch");
        const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
        const available = new Set(await readdir(directory));
        const files = ordered.map((part) => {
          const name = `part-${String(part.partNumber).padStart(5, "0")}`;
          if (!available.has(name)) throw new Error(`Missing multipart part ${part.partNumber}`);
          return join(directory, name);
        });
        async function* concatenated() {
          for (const file of files) yield* createReadStream(file);
        }
        await writeObject(key, Readable.from(concatenated()), manifest.httpMetadata);
        await rm(directory, { recursive: true, force: true });
        const object = await get(key);
        if (!object) throw new Error("Multipart result missing");
        return object;
      },
      async abort() {
        await rm(directory, { recursive: true, force: true });
      },
    };
  }
}
