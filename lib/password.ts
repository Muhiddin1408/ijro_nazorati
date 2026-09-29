const encoder = new TextEncoder();
// New hashes use the OWASP-recommended 600,000 PBKDF2-SHA256 iterations (the
// former 100,000 cap was a Cloudflare Workers limit; Node has none). Hashes
// from 100,000 up are accepted and upgraded on the next successful login.
// Anything outside the range requires an administrator reset before any
// deriveBits work is attempted, so a crafted row cannot trigger a costly derive.
export const PASSWORD_ITERATIONS = 600_000;
export const MIN_SUPPORTED_PASSWORD_ITERATIONS = 100_000;
export const MAX_SUPPORTED_PASSWORD_ITERATIONS = 600_000;

export class PasswordResetRequiredError extends Error {
  constructor() {
    super("Parolni administrator orqali yangilash kerak");
    this.name = "PasswordResetRequiredError";
  }
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function normalizeUsername(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en-US");
}

export function validateUsername(value: string) {
  return /^[a-zA-Z][a-zA-Z0-9._-]{3,31}$/.test(value.trim());
}

export function validatePassword(value: string) {
  if (value.length < 10 || value.length > 128) return "Parol 10–128 belgidan iborat bo‘lishi kerak";
  if (!/[A-Za-zА-Яа-яЁё]/.test(value) || !/\d/.test(value)) return "Parolda kamida bitta harf va bitta raqam bo‘lishi kerak";
  if (/^(password|parol|admin|123456|qwerty)/i.test(value)) return "Juda sodda parolni ishlatib bo‘lmaydi";
  return null;
}

export function isSupportedPasswordIterations(iterations: number) {
  return Number.isInteger(iterations)
    && iterations >= MIN_SUPPORTED_PASSWORD_ITERATIONS
    && iterations <= MAX_SUPPORTED_PASSWORD_ITERATIONS;
}

export async function hashPassword(password: string, saltValue: string | undefined, iterations: number) {
  if (!isSupportedPasswordIterations(iterations)) {
    throw new PasswordResetRequiredError();
  }
  const salt = saltValue ? fromBase64(saltValue) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return { hash: toBase64(new Uint8Array(bits)), salt: toBase64(salt), iterations };
}

/** Whether a stored hash should be re-derived with the current iteration count. */
export function needsRehash(iterations: number) {
  return Number(iterations) < PASSWORD_ITERATIONS;
}

// A fixed, valid salt for dummy verification of unknown logins.
const DUMMY_SALT = "AAAAAAAAAAAAAAAAAAAAAA==";

/**
 * Spends the same PBKDF2 work as a real verification so response time does not
 * reveal whether a login exists. Always resolves to false.
 */
export async function dummyVerifyPassword(password: string) {
  await hashPassword(password, DUMMY_SALT, PASSWORD_ITERATIONS);
  return false;
}

export async function verifyPassword(password: string, expectedHash: string, salt: string, iterations: number) {
  const result = await hashPassword(password, salt, iterations);
  const a = encoder.encode(result.hash);
  const b = encoder.encode(expectedHash);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

export function randomSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function randomIndex(maximum: number) {
  if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 256) throw new Error("Invalid random range");
  const rejectionLimit = Math.floor(256 / maximum) * maximum;
  const byte = new Uint8Array(1);
  do crypto.getRandomValues(byte); while (byte[0] >= rejectionLimit);
  return byte[0] % maximum;
}

/**
 * Creates a first-login secret. It is returned to the provisioning caller once;
 * callers must persist only the PBKDF2 result produced by `hashPassword`.
 */
export function randomTemporaryPassword(length = 16) {
  const safeLength = Math.max(14, Math.min(32, Math.floor(length)));
  const groups = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    "!@#$%*-_",
  ];
  const all = groups.join("");
  const characters = groups.map((group) => group[randomIndex(group.length)]);
  while (characters.length < safeLength) characters.push(all[randomIndex(all.length)]);
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1);
    [characters[index], characters[target]] = [characters[target], characters[index]];
  }
  return characters.join("");
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
