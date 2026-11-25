import fs from "fs";
import path from "path";
import { PGlite } from "@electric-sql/pglite";

const MIGRATION = path.resolve(
  __dirname,
  "../../../supabase/migrations/20261117000000_cloud_transcription_daily_limit.sql",
);

// The bits of a Supabase database the migration relies on: the auth schema,
// the anon/authenticated/service_role roles, and Supabase's default grants
// (anon/authenticated get access to new public tables and functions unless a
// migration revokes it -- which is exactly what we want to verify).
const SUPABASE_SHIM = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (id uuid primary key);

  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

/** Brand-new in-memory Postgres with the Supabase shim and the real migration applied. */
const createTestDb = async (): Promise<PGlite> => {
  const db = new PGlite();
  await db.exec(SUPABASE_SHIM);
  await db.exec(fs.readFileSync(MIGRATION, "utf8"));
  return db;
};

/** Run one statement as a given Supabase role (like PostgREST does). */
const queryAs = async <T = Record<string, unknown>>(
  db: PGlite,
  role: "anon" | "authenticated" | "service_role",
  sql: string,
  params: unknown[] = [],
) =>
  db.transaction(async (tx) => {
    await tx.query(`set local role ${role}`);
    return tx.query<T>(sql, params);
  });

const utcToday = async (db: PGlite): Promise<string> => {
  const { rows } = await db.query<{ d: string }>(
    "select ((now() at time zone 'utc')::date)::text as d",
  );
  return rows[0].d;
};

const usageCount = async (db: PGlite, userId: string): Promise<number> => {
  const { rows } = await db.query<{ count: number }>(
    "select count from public.cloud_transcription_usage where user_id = $1 and usage_date = $2",
    [userId, await utcToday(db)],
  );
  return rows[0]?.count ?? 0;
};

export { createTestDb, queryAs, utcToday, usageCount };
