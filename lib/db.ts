import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";

function connectionString(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!url) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL — injected automatically once a " +
        "Postgres database is linked to the Vercel project (or set it in .env.local for local dev).",
    );
  }
  return url;
}

// Lazily constructed so importing this module (e.g. during Next's build-time
// page-data collection) never requires DATABASE_URL to be set — only an
// actual query at request time does.
let client: NeonQueryFunction<false, false> | null = null;
function getClient(): NeonQueryFunction<false, false> {
  if (!client) client = neon(connectionString());
  return client;
}

type SqlTag = NeonQueryFunction<false, false>;

export const sql: SqlTag = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  getClient()(strings, ...values)) as SqlTag;
sql.query = ((text: string, params?: unknown[]) => getClient().query(text, params)) as SqlTag["query"];

let schemaReady: Promise<void> | null = null;

/** Runs every additive migration in order if needed. Safe to call on every cold start. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const migrationsDir = path.join(process.cwd(), "migrations");
      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();
      for (const file of files) {
        const statements = fs
          .readFileSync(path.join(migrationsDir, file), "utf-8")
          .split(/;\s*(?:\n|$)/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const statement of statements) {
          await sql.query(statement);
        }
      }
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
