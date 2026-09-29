import { readJson } from "../../../lib/shared/http";
import type { ChatMessage } from "./chat-types";

/** Sends a chat attachment: one request up to 12 MB, otherwise resumable 3-way parallel multipart. */
export function uploadChatFile(file: File, channelId: number, body: string, onProgress: (value: number) => void) {
  const directUpload = () =>
    new Promise<ChatMessage>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `/api/chat/files?channelId=${channelId}`);
      request.responseType = "json";
      request.withCredentials = true;
      request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      request.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
      request.setRequestHeader("X-File-Size", String(file.size));
      request.setRequestHeader("X-Message-Body", encodeURIComponent(body));
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      };
      request.onerror = () => reject(new Error("Faylni serverga yuborishda tarmoq xatosi yuz berdi"));
      request.onload = () => {
        const payload = request.response as { message?: ChatMessage; error?: string } | null;
        if (request.status >= 200 && request.status < 300 && payload?.message) {
          onProgress(100);
          resolve(payload.message);
        } else {
          reject(new Error(payload?.error ?? `Fayl yuklanmadi (${request.status})`));
        }
      };
      request.send(file);
    });

  if (file.size <= 12 * 1024 * 1024) return directUpload();

  return (async () => {
    const initialized = await readJson<{ sessionId: string; chunkSize: number }>(
      await fetch("/api/chat/files?action=init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, fileName: file.name, contentType: file.type, size: file.size, body }),
      }),
    );
    const chunkSize = initialized.chunkSize;
    const partCount = Math.ceil(file.size / chunkSize);
    const uploadedBytes = Array.from({ length: partCount }, () => 0);
    const parts: Array<{ partNumber: number; etag: string }> = Array.from({ length: partCount }, () => ({
      partNumber: 0,
      etag: "",
    }));
    let nextPart = 0;
    const reportProgress = () => {
      const completed = uploadedBytes.reduce((sum, value) => sum + value, 0);
      onProgress(Math.min(96, Math.round((completed / file.size) * 96)));
    };
    async function uploadPart(partIndex: number) {
      const start = partIndex * chunkSize;
      const blob = file.slice(start, Math.min(file.size, start + chunkSize));
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          parts[partIndex] = await new Promise<{ partNumber: number; etag: string }>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open(
              "POST",
              `/api/chat/files?action=part&sessionId=${encodeURIComponent(initialized.sessionId)}&partNumber=${partIndex + 1}`,
            );
            request.responseType = "json";
            request.withCredentials = true;
            request.setRequestHeader("Content-Type", "application/octet-stream");
            request.upload.onprogress = (event) => {
              uploadedBytes[partIndex] = event.lengthComputable ? event.loaded : 0;
              reportProgress();
            };
            request.onerror = () => reject(new Error("Fayl qismini yuborishda tarmoq xatosi"));
            request.onload = () => {
              const payload = request.response as { partNumber?: number; etag?: string; error?: string } | null;
              if (request.status >= 200 && request.status < 300 && payload?.etag) {
                uploadedBytes[partIndex] = blob.size;
                reportProgress();
                resolve({ partNumber: Number(payload.partNumber), etag: payload.etag });
              } else reject(new Error(payload?.error ?? `Fayl qismi yuklanmadi (${request.status})`));
            };
            request.send(blob);
          });
          return;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Fayl qismi yuklanmadi");
          uploadedBytes[partIndex] = 0;
        }
      }
      throw lastError ?? new Error("Fayl qismi yuklanmadi");
    }
    try {
      const workers = Array.from({ length: Math.min(3, partCount) }, async () => {
        while (nextPart < partCount) {
          const partIndex = nextPart;
          nextPart += 1;
          await uploadPart(partIndex);
        }
      });
      await Promise.all(workers);
      const completed = await readJson<{ message: ChatMessage }>(
        await fetch(`/api/chat/files?action=complete&sessionId=${encodeURIComponent(initialized.sessionId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parts }),
        }),
      );
      onProgress(100);
      return completed.message;
    } catch (error) {
      void fetch(`/api/chat/files?sessionId=${encodeURIComponent(initialized.sessionId)}`, { method: "DELETE" });
      throw error;
    }
  })();
}
