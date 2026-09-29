#!/usr/bin/env node
// Database maintenance CLI for the self-hosted SQLite deployment.
//
//   node scripts/db.mjs migrate                      apply pending drizzle/*.sql migrations
//   node scripts/db.mjs seed-private <file.sql>      apply an untracked private seed once
//   node scripts/db.mjs admin <login> [password]     set the administrator's login/password
//
// DATABASE_PATH selects the database file (default data/ijro.sqlite).
import { pbkdf2Sync, randomBytes, randomInt } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = process.env.DATABASE_PATH ?? join(root, "data", "ijro.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON");
db.exec(`CREATE TABLE IF NOT EXISTS _ijro_migrations (
  name TEXT PRIMARY KEY NOT NULL,
  applied_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
)`);

function applied(name) {
  return Boolean(db.prepare("SELECT 1 FROM _ijro_migrations WHERE name=?").get(name));
}

function apply(name, sql) {
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(sql);
    db.prepare("INSERT INTO _ijro_migrations (name) VALUES (?)").run(name);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw new Error(`${name}: ${error.message}`);
  }
}

function migrate() {
  const directory = join(root, "drizzle");
  const files = readdirSync(directory).filter((name) => /^\d{4}_.*\.sql$/.test(name) && !name.includes("_private_")).sort();
  let count = 0;
  for (const name of files) {
    if (applied(name)) continue;
    apply(name, readFileSync(join(directory, name), "utf8"));
    console.log(`applied ${name}`);
    count += 1;
  }
  console.log(count ? `${count} migration(s) applied` : "database is up to date");
}

function seedPrivate(file) {
  if (!file) throw new Error("usage: seed-private <file.sql>");
  const name = `private:${basename(file)}`;
  if (applied(name)) return console.log(`${name} already applied`);
  apply(name, readFileSync(file, "utf8"));
  console.log(`applied ${name}`);
}

function generatedPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let value = "";
  for (let index = 0; index < 14; index += 1) value += alphabet[randomInt(alphabet.length)];
  return `${value}${randomInt(10)}`;
}

function setAdmin(login, password) {
  if (!login || !/^[a-zA-Z][a-zA-Z0-9._-]{3,31}$/.test(login)) throw new Error("usage: admin <login> [password]  (login: 4–32 chars, starts with a letter)");
  const secret = password ?? generatedPassword();
  if (secret.length < 10 || !/[A-Za-z]/.test(secret) || !/\d/.test(secret)) throw new Error("password: 10+ chars with a letter and a digit");
  const admin = db.prepare(`SELECT e.id FROM app_employees e JOIN app_roles r ON r.id=e.role_id
    WHERE r.code='admin' AND e.active=1 ORDER BY (lower(e.email)='admin@ijro.local') DESC, e.id LIMIT 1`).get();
  if (!admin) throw new Error("no active administrator employee found; run migrate first");
  const salt = randomBytes(16);
  const iterations = 600_000;
  const hash = pbkdf2Sync(secret, salt, iterations, 32, "sha256").toString("base64");
  const normalized = login.trim().normalize("NFKC").toLocaleLowerCase("en-US");
  db.prepare(`INSERT INTO app_user_credentials
      (employee_id,username,username_normalized,password_hash,password_salt,password_iterations,must_change_password,failed_attempts,locked_until)
    VALUES (?,?,?,?,?,?,?,0,NULL)
    ON CONFLICT(employee_id) DO UPDATE SET username=excluded.username,username_normalized=excluded.username_normalized,
      password_hash=excluded.password_hash,password_salt=excluded.password_salt,password_iterations=excluded.password_iterations,
      must_change_password=excluded.must_change_password,failed_attempts=0,locked_until=NULL,
      password_updated_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP`)
    .run(admin.id, login.trim(), normalized, hash, salt.toString("base64"), iterations, password ? 0 : 1);
  db.prepare("DELETE FROM app_sessions WHERE employee_id=?").run(admin.id);
  console.log(`administrator (employee #${admin.id}) login: ${login.trim()}`);
  if (!password) console.log(`temporary password: ${secret}  (must be changed at first login)`);
}

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "migrate") migrate();
  else if (command === "seed-private") seedPrivate(args[0]);
  else if (command === "admin") setAdmin(args[0], args[1]);
  else {
    console.error("commands: migrate | seed-private <file.sql> | admin <login> [password]");
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
