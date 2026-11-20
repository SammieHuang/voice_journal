/** @format */

import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { createTestDb, queryAs, utcToday, usageCount } from "./helpers/testDb";

const USER = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";

let db: PGlite;

// Call the functions as the API does: as service_role.
const consume = async (userId: string, limit: number) => {
  const { rows } = await queryAs<{
    r: { allowed: boolean; used: number; usage_date: string };
  }>(
    db,
    "service_role",
    "select public.consume_cloud_transcription($1, $2) as r",
    [userId, limit],
  );
  return rows[0].r;
};

const release = (userId: string, day: string) =>
  queryAs(
    db,
    "service_role",
    "select public.release_cloud_transcription($1, $2)",
    [userId, day],
  );

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await db.exec(
    "truncate public.cloud_transcription_usage; delete from auth.users;",
  );
  await db.query("insert into auth.users (id) values ($1), ($2)", [
    USER,
    OTHER,
  ]);
});

describe("consume_cloud_transcription", () => {
  it("allows up to the limit, then refuses without going over", async () => {
    const today = await utcToday(db);
    expect(await consume(USER, 2)).toEqual({
      allowed: true,
      used: 1,
      usage_date: today,
    });
    expect(await consume(USER, 2)).toEqual({
      allowed: true,
      used: 2,
      usage_date: today,
    });
    expect(await consume(USER, 2)).toEqual({
      allowed: false,
      used: 2,
      usage_date: today,
    });
    expect(await usageCount(db, USER)).toBe(2);
  });

  it("counts each account separately", async () => {
    await consume(USER, 1);
    expect((await consume(USER, 1)).allowed).toBe(false);
    expect((await consume(OTHER, 1)).allowed).toBe(true);
  });
});

describe("release_cloud_transcription", () => {
  it("gives one back, and then one more is allowed", async () => {
    const today = await utcToday(db);
    await consume(USER, 2);
    await consume(USER, 2);
    await release(USER, today);
    expect(await usageCount(db, USER)).toBe(1);
    expect((await consume(USER, 2)).allowed).toBe(true);
  });
});

describe("app users can't touch the counter", () => {
  for (const role of ["anon", "authenticated"] as const) {
    it(`${role} can't call the functions`, async () => {
      await expect(
        queryAs(db, role, "select public.consume_cloud_transcription($1, 30)", [
          USER,
        ]),
      ).rejects.toThrow(/permission denied for function/);
      await expect(
        queryAs(
          db,
          role,
          "select public.release_cloud_transcription($1, current_date)",
          [USER],
        ),
      ).rejects.toThrow(/permission denied for function/);
    });
  }
});
