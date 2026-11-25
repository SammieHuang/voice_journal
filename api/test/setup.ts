import fs from "fs";
import os from "os";
import path from "path";
import { afterAll } from "vitest";
import { DAILY_LIMIT_ENV } from "../src/lib/config";

// multer saves uploads into "uploads/" relative to the current folder.
// Move into an empty temp folder so tests never touch the real api/uploads.
const workDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "voice-journal-api-test-"),
);
process.chdir(workDir);

// Supabase and OpenAI are replaced with fakes in the tests. These fake values
// make sure nothing can reach the real services if a fake is ever forgotten.
process.env.OPENAI_API_KEY = "test-key-not-real";
process.env.SUPABASE_URL = "http://127.0.0.1:9";
process.env.SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
delete process.env[DAILY_LIMIT_ENV];

afterAll(() => {
  fs.rmSync(workDir, { recursive: true, force: true });
});
