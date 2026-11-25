# Voice Journal

A cozy vintage-style voice journaling app built with React Native and Expo.

## Features

- Voice recording
- Speech-to-text transcription
- Emotion tags
- Timeline view

## Tech Stack

- React Native
- Expo Router
- TypeScript
- pnpm Workspace
- Node.js

## Todos
1. establish the app visual language. 

2. style refinement _2

3. ResponseButton hit delay

4. Auto combine the records of the same day into 1 journal

4. Add loading/Skeleton state for UIs

## API tests

```bash
pnpm --filter api test
```

- Needs Node 22.12+ (vitest 5). Nothing real is called: Supabase and OpenAI are faked, and the database is an in-memory Postgres (PGlite) running the real migration.
- `api/test/fixtures/*.m4a` are generated with ffmpeg and committed, so running the tests doesn't need ffmpeg. To regenerate them (from `api/`):

```bash
ffmpeg -v error -y -bitexact -f lavfi -i "sine=frequency=440:sample_rate=44100" -ac 2 -t 1 -c:a aac -b:a 128k test/fixtures/one-second.m4a
ffmpeg -v error -y -bitexact -f lavfi -i "anullsrc=r=8000:cl=mono" -t 300 -c:a aac -b:a 8k test/fixtures/five-minutes.m4a
ffmpeg -v error -y -bitexact -f lavfi -i "anullsrc=r=8000:cl=mono" -t 360 -c:a aac -b:a 8k test/fixtures/six-minutes.m4a
```

## Deploy checklist

Do the steps in this order. Render deploys the API as soon as `main` changes, so **don't merge into `main` until step 3 says so**.

**1. On your Mac**
- [ ] `pnpm install --frozen-lockfile` passes (if not, the lockfile is out of sync and Render/EAS will fail too)
- [ ] `pnpm --filter api test` passes
- [ ] `cd mobile && npx expo export --platform ios` bundles without errors (checks the app can load `@voice-journal/shared`)

**2. Supabase**
- [ ] Apply `supabase/migrations/20261117000000_cloud_transcription_daily_limit.sql` (SQL editor). **Before the API deploy**, or every Pro transcription gets 503. *(Done 2026-11-17.)*
- [ ] Check: table `cloud_transcription_usage`, functions `consume_cloud_transcription` and `release_cloud_transcription` exist
- [ ] `journals` has RLS on, policies limited to `auth.uid() = user_id` *(Checked 2026-11-17.)*

**3. Render (API)**
- [ ] Root Directory: empty (the repo root), not `api/`. The API now imports `shared/`, and changes outside the Root Directory don't trigger a deploy.
- [ ] Build command: `pnpm install --frozen-lockfile --filter api...`
- [ ] Start command: `pnpm --filter api start`
- [ ] Build Filters → Included paths: `api/**`, `shared/**`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json` (so app-only commits don't redeploy the API)
- [ ] Don't set `NODE_ENV=production`: the API runs with `tsx`, a devDependency.
- [ ] Env vars: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Optional: `PRO_DAILY_CLOUD_TRANSCRIPTION_LIMIT` (default 30).
- [ ] Now merge into `main` and push. After Render deploys, check:
  - the log shows `Pro cloud transcription limit: 30 per UTC day`
  - `GET /health` returns ok
  - `POST /transcribe` with no token returns 401

**4. EAS (app)**
- [ ] EAS production env vars are set: `EXPO_PUBLIC_API_BASE_URL` (the Render URL), `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- [ ] `eas build --platform ios --profile production`, then `eas submit --platform ios --profile production`
- [ ] If the build log says `Unable to resolve module @voice-journal/shared`, EAS didn't install the whole workspace.
- [ ] TestFlight, on a real iPhone with a Pro account:
  - a short recording transcribes (not 415: first real-device recording through the length check)
  - a recording stops on its own at 5 minutes, with an explanation
  - airplane mode shows "No connection", then a new journal opens (offline it can't look up today's)

### Changing the daily limit
- Render → `PRO_DAILY_CLOUD_TRANSCRIPTION_LIMIT` → save and deploy. No app build needed.
- `0` turns cloud transcription off. A value that isn't a whole number stops the API from starting, so check the deploy went through.

### Changing the recording limit
- [ ] Edit `MAX_RECORDING_SECONDS` in `shared/src/recording.ts`
- [ ] Regenerate the 5- and 6-minute fixtures for the new limit, update the two length tests in `api/test/transcribe.test.ts`, run `pnpm --filter api test`
- [ ] Above ~10 minutes, also raise `MAX_AUDIO_BYTES` in `api/src/routes/transcribe.ts`
- [ ] Needs both an API deploy and a new app build:
  - **Raising:** deploy the API first, then ship the app.
  - **Lowering:** ship the app first (old builds still record to the old limit, and the new API would reject them). Deploy the API once most users have updated.