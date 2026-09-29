import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite";

/**
 * D1-compatible adapter over Node's built-in SQLite. The application keeps its
 * existing `prepare().bind().first()/all()/run()` and `batch()` calls; every
 * statement executes synchronously, so a batch is one uninterrupted transaction.
 */

const STATEMENT_CACHE_SIZE = 500;
const SLOW_QUERY_MS = 100;

function toSqlValue(value: unknown): SQLInputValue {
  if (value === undefined || value === null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" || typeof value === "bigint" || typeof value === "string") return value;
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return String(value);
}

/**
 * Compiled statements keyed by SQL text (LRU). Execution is synchronous, so a
 * cached StatementSync is never used by two callers at once.
 */
class StatementCache {
  private readonly database: DatabaseSync;
  private readonly statements = new Map<string, StatementSync>();

  constructor(database: DatabaseSync) {
    this.database = database;
  }

  get(sql: string) {
    let statement = this.statements.get(sql);
    if (statement) {
      this.statements.delete(sql);
    } else {
      statement = this.database.prepare(sql);
      if (this.statements.size >= STATEMENT_CACHE_SIZE) {
        this.statements.delete(this.statements.keys().next().value as string);
      }
    }
    this.statements.set(sql, statement);
    return statement;
  }

  clear() {
    this.statements.clear();
  }
}

function timed<T>(sql: string, execute: () => T): T {
  const started = performance.now();
  try {
    return execute();
  } finally {
    const elapsed = performance.now() - started;
    if (elapsed > SLOW_QUERY_MS) {
      console.warn(`Slow SQL (${Math.round(elapsed)} ms): ${sql.replace(/\s+/g, " ").trim().slice(0, 200)}`);
    }
  }
}

class SqlitePreparedStatement implements D1PreparedStatement {
  private readonly cache: StatementCache;
  readonly sql: string;
  private readonly bindings: SQLInputValue[];

  constructor(cache: StatementCache, sql: string, bindings: SQLInputValue[] = []) {
    this.cache = cache;
    this.sql = sql;
    this.bindings = bindings;
  }

  bind(...values: unknown[]): D1PreparedStatement {
    return new SqlitePreparedStatement(this.cache, this.sql, values.map(toSqlValue));
  }

  firstSync<T>(column?: string): T | null {
    const row = timed(this.sql, () => this.cache.get(this.sql).get(...this.bindings)) as Record<string, unknown> | undefined;
    if (!row) return null;
    return (column ? row[column] ?? null : { ...row }) as T | null;
  }

  allSync<T>(): D1Result<T> {
    const rows = timed(this.sql, () => this.cache.get(this.sql).all(...this.bindings)) as Record<string, unknown>[];
    return { results: rows.map((row) => ({ ...row })) as T[], success: true, meta: { changes: 0 } };
  }

  runSync<T>(): D1Result<T> {
    const statement = this.cache.get(this.sql);
    if (statement.columns().length) {
      // INSERT/UPDATE ... RETURNING and plain SELECTs executed through run().
      const rows = timed(this.sql, () => statement.all(...this.bindings)) as Record<string, unknown>[];
      const changes = /^\s*(insert|update|delete|replace)\b/i.test(this.sql) ? rows.length : 0;
      return { results: rows.map((row) => ({ ...row })) as T[], success: true, meta: { changes } };
    }
    const result = timed(this.sql, () => statement.run(...this.bindings));
    return {
      results: [],
      success: true,
      meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) },
    };
  }

  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    return this.firstSync<T>(column);
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return this.allSync<T>();
  }

  async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return this.runSync<T>();
  }
}

export class SqliteD1Database implements D1Database {
  readonly database: DatabaseSync;
  private readonly statements: StatementCache;

  constructor(path: string) {
    this.database = new DatabaseSync(path);
    this.database.exec("PRAGMA journal_mode=WAL");
    this.database.exec("PRAGMA synchronous=NORMAL");
    this.database.exec("PRAGMA busy_timeout=5000");
    // D1 enforces declared foreign keys; keep the same semantics.
    this.database.exec("PRAGMA foreign_keys=ON");
    this.database.exec("PRAGMA cache_size=-65536"); // 64 MB page cache
    this.database.exec("PRAGMA temp_store=MEMORY");
    this.database.exec("PRAGMA mmap_size=268435456"); // 256 MB
    this.statements = new StatementCache(this.database);
  }

  prepare(query: string): D1PreparedStatement {
    return new SqlitePreparedStatement(this.statements, query);
  }

  async batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    this.database.exec("BEGIN IMMEDIATE");
    try {
      for (const statement of statements) {
        if (!(statement instanceof SqlitePreparedStatement)) throw new Error("Foreign statement in SQLite batch");
        results.push(statement.runSync<T>());
      }
      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
    return results;
  }

  /** Refreshes planner statistics; cheap, intended for a daily maintenance job. */
  optimize() {
    this.database.exec("PRAGMA optimize");
  }

  close() {
    this.statements.clear();
    this.database.close();
  }
}
