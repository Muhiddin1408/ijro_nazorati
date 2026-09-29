import assert from "node:assert/strict";
import test from "node:test";

import {
  hashPassword,
  MAX_SUPPORTED_PASSWORD_ITERATIONS,
  MIN_SUPPORTED_PASSWORD_ITERATIONS,
  PASSWORD_ITERATIONS,
  PasswordResetRequiredError,
  verifyPassword,
} from "../lib/password.ts";

test("PBKDF2: yangi xeshlar 600 000, eski 100 000 qabul qilinadi, diapazondan tashqarisi hisoblanmasdan rad etiladi", async () => {
  assert.equal(PASSWORD_ITERATIONS, 600_000);
  assert.equal(MIN_SUPPORTED_PASSWORD_ITERATIONS, 100_000);
  assert.equal(MAX_SUPPORTED_PASSWORD_ITERATIONS, 600_000);

  const password = "NodeSafe123!";
  const legacy = await hashPassword(password, undefined, 100_000);
  assert.equal(await verifyPassword(password, legacy.hash, legacy.salt, 100_000), true);
  const current = await hashPassword(password, undefined, PASSWORD_ITERATIONS);
  assert.equal(current.iterations, 600_000);
  assert.equal(await verifyPassword(password, current.hash, current.salt, 600_000), true);

  await assert.rejects(hashPassword(password, undefined, 99_999), PasswordResetRequiredError);
  await assert.rejects(verifyPassword(password, current.hash, current.salt, 600_001), PasswordResetRequiredError);
});
