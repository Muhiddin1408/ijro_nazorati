import { LocalBucket } from "./local-bucket";
import { SqliteD1Database } from "./sqlite-d1";

export type IjroRuntimeEnv = {
  DB: D1Database;
  BUCKET: R2Bucket;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  TELEGRAM_BOT_USERNAME?: string;
  REMINDER_JOB_SECRET?: string;
  SITE_BASE_URL?: string;
  APP_TIMEZONE?: string;
  INFORMATION_INGEST_SECRET?: string;
  TRUST_OAI_AUTHENTICATED_USER_HEADER?: string;
  OWNER_SSO_EMAIL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_SEARCH_MODEL?: string;
  OPENAI_DAILY_REQUEST_LIMIT?: string;
};

type RuntimeResources = { DB: SqliteD1Database; BUCKET: LocalBucket };

// One connection and one bucket per server process, shared across route bundles.
const globalRuntime = globalThis as typeof globalThis & { __ijroRuntime?: RuntimeResources };

function resources(): RuntimeResources {
  if (!globalRuntime.__ijroRuntime) {
    globalRuntime.__ijroRuntime = {
      DB: new SqliteD1Database(process.env.DATABASE_PATH ?? "data/ijro.sqlite"),
      BUCKET: new LocalBucket(process.env.STORAGE_DIR ?? "storage"),
    };
  }
  return globalRuntime.__ijroRuntime;
}

export async function getRuntimeEnv(): Promise<IjroRuntimeEnv> {
  const { DB, BUCKET } = resources();
  return {
    DB,
    BUCKET,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
    REMINDER_JOB_SECRET: process.env.REMINDER_JOB_SECRET,
    SITE_BASE_URL: process.env.SITE_BASE_URL,
    APP_TIMEZONE: process.env.APP_TIMEZONE,
    INFORMATION_INGEST_SECRET: process.env.INFORMATION_INGEST_SECRET,
    // Self-hosted deployments have no trusted identity proxy; owner SSO stays off.
    TRUST_OAI_AUTHENTICATED_USER_HEADER: "false",
    OWNER_SSO_EMAIL: process.env.OWNER_SSO_EMAIL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_SEARCH_MODEL: process.env.OPENAI_SEARCH_MODEL,
    OPENAI_DAILY_REQUEST_LIMIT: process.env.OPENAI_DAILY_REQUEST_LIMIT,
  };
}

export async function getD1(): Promise<D1Database> {
  return resources().DB;
}
