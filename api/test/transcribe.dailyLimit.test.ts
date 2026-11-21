/** @format */

import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import type { Express } from "express";
import { createApp } from "../src/app";
import { createTestDb, usageCount } from "./helpers/testDb";
import { backends, resetBackends } from "./helpers/fakeBackends";

// Swap the real Supabase and OpenAI clients for the fakes.
vi.mock("../src/lib/supabase", async () =>
  (await import("./helpers/fakeBackends.js")).fakeSupabaseModule(),
);
vi.mock("../src/lib/openai", async () =>
  (await import("./helpers/fakeBackends.js")).fakeOpenAIModule(),
);

const PRO = {
  id: "aaaaaaaa-0000-0000-0000-000000000001",
  tier: "premium" as const,
  token: "pro-token",
};

// No duration check yet, so any bytes are accepted as "audio".
const FAKE_AUDIO = Buffer.from("not really audio");

let db: PGlite;

/** POST /transcribe the way the mobile app does. */
const transcribe = (app: Express, token?: string) => {
  const req = request(app).post("/transcribe");
  if (token) req.set("Authorization", `Bearer ${token}`);
  return req.attach("audio", FAKE_AUDIO, "recording.m4a");
};

beforeAll(async () => {
  db = await createTestDb();
});

beforeEach(async () => {
  await db.exec(
    "truncate public.cloud_transcription_usage; delete from auth.users;",
  );
  resetBackends(db);
  backends.usersByToken.set(PRO.token, { id: PRO.id, tier: PRO.tier });
  await db.query("insert into auth.users (id) values ($1)", [PRO.id]);
});

describe("POST /transcribe", () => {
  it("missing token -> 401, nothing counted, OpenAI not called", async () => {
    const res = await transcribe(createApp());
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Missing token" });
    expect(backends.rpcCalls).toEqual([]);
    expect(backends.openaiCalls).toBe(0);
  });

  it("pro account -> 200 with the transcript, counted once", async () => {
    const res = await transcribe(createApp(), PRO.token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: backends.transcript });
    expect(backends.openaiCalls).toBe(1);
    expect(await usageCount(db, PRO.id)).toBe(1);
  });
});
