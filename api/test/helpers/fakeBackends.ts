/**
 * Fake Supabase and OpenAI for the API tests.
 * Tests set `backends` to decide what the fakes do,
 * and read it afterwards to see what the app did.
 *
 */

import type { PGlite } from "@electric-sql/pglite";
import { queryAs } from "./testDb";

type FakeUser = { id: string; tier: "free" | "premium" };

type Backends = {
  db: PGlite | null;
  /** Which access token belongs to which user. */
  usersByToken: Map<string, FakeUser>;
  /** Names of every supabaseAdmin.rpc() call the app made. */
  rpcCalls: string[];
  /** If set, every rpc() call fails with this message (to test 503). */
  rpcError: string | null;
  openaiCalls: number;
  /** If set, the OpenAI call throws this (to test 502 + refund). */
  openaiError: Error | null;
  transcript: string;
};

const backends: Backends = {
  db: null,
  usersByToken: new Map(),
  rpcCalls: [],
  rpcError: null,
  openaiCalls: 0,
  openaiError: null,
  transcript: "hello from the fake transcriber",
};

/** Called before each test so one test can't affect the next. */
const resetBackends = (db: PGlite) => {
  backends.db = db;
  backends.usersByToken.clear();
  backends.rpcCalls = [];
  backends.rpcError = null;
  backends.openaiCalls = 0;
  backends.openaiError = null;
};

/** Replaces src/lib/supabase. */
const fakeSupabaseModule = () => {
  const createUserClient = (accessToken: string) => ({
    auth: {
      getUser: async () => {
        const user = backends.usersByToken.get(accessToken);
        return user
          ? { data: { user: { id: user.id } }, error: null }
          : { data: { user: null }, error: { message: "invalid JWT" } };
      },
    },
    // Only supports what requirePremium does:
    // from("profiles").select("tier").eq("id", userId).single()
    from: (_table: string) => ({
      select: (_columns: string) => ({
        eq: (_column: string, _value: string) => ({
          single: async () => {
            const user = backends.usersByToken.get(accessToken);
            return { data: user ? { tier: user.tier } : null, error: null };
          },
        }),
      }),
    }),
  });

  const supabaseAdmin = {
    // Runs the real SQL function from the migration as service_role,
    // like Supabase's /rest/v1/rpc/<name> does.
    rpc: async (fn: string, args: Record<string, unknown>) => {
      backends.rpcCalls.push(fn);
      if (backends.rpcError) {
        return { data: null, error: { message: backends.rpcError } };
      }
      const names = Object.keys(args);
      const params = names.map((name, i) => `${name} => $${i + 1}`).join(", ");
      try {
        const result = await queryAs<{ result: unknown }>(
          backends.db!,
          "service_role",
          `select public.${fn}(${params}) as result`,
          names.map((name) => args[name]),
        );
        return { data: result.rows[0].result, error: null };
      } catch (err) {
        return { data: null, error: { message: (err as Error).message } };
      }
    },
  };

  return { createUserClient, supabaseAdmin };
};

/** Replaces src/lib/openai (it has a default export). */
const fakeOpenAIModule = () => ({
  default: {
    audio: {
      transcriptions: {
        create: async ({ file }: { file: AsyncIterable<Buffer> }) => {
          backends.openaiCalls += 1;
          // The real SDK reads the whole file, so a missing upload fails here too.
          for await (const _chunk of file) {
          }
          if (backends.openaiError) throw backends.openaiError;
          return { text: backends.transcript };
        },
      },
    },
  },
});

export { backends, resetBackends, fakeSupabaseModule, fakeOpenAIModule };