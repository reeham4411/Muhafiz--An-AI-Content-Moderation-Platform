# AI Content Moderation Platform — Backend

Backend-only REST API for an AI-powered image content moderation platform.
Built with Node.js, Express, TypeScript, MongoDB/Mongoose, JWT auth, and a
provider-pattern AI moderation layer (Gemini Vision API with automatic
mock-provider fallback).

---

## 1. Architecture Summary

- **Layered structure**: `routes -> controllers -> services -> models/providers`.
- **Provider pattern**: `IModerationProvider` is the contract. `GeminiModerationProvider`
  and `MockModerationProvider` both implement it. `providers/index.ts` picks one at
  runtime based on whether `GEMINI_API_KEY` is set — nothing else in the codebase
  knows or cares which provider is active. Swapping in Groq Vision, AWS Rekognition,
  Azure Content Safety, etc. only requires adding a new class that implements
  `IModerationProvider` and registering it in the factory.
- **Moderation engine** (`services/moderationService.ts`) is pure business logic:
  it takes a policy snapshot + provider output and computes the verdict. It has
  no knowledge of HTTP, Express, or the database beyond reading policies.
- **Policy snapshotting**: every moderated image stores its own copy of the
  policy configuration (`policySnapshot`) that was active at moderation time.
  Admin policy edits only affect new submissions going forward — old verdicts
  are immutable history.
- **Auth**: stateless JWT (`Authorization: Bearer <token>`), `bcryptjs` for
  password hashing, two roles (`USER`, `ADMIN`) enforced via middleware.
- **Uploads**: `multer` disk storage, images saved to `UPLOAD_DIR`, served
  statically at `/uploads/<filename>` for QA/Postman convenience.

---

## 2. Database / Schema Explanation

| Collection | Purpose |
|---|---|
| **users** | name, email, passwordHash, role (`USER`/`ADMIN`) |
| **policies** | one document per `ModerationCategory`, holds `enabled`, `confidenceThreshold`, `enforcementBehavior` (`AUTO_BLOCK` / `FLAG_FOR_REVIEW`) |
| **submissions** | one document per upload batch. Contains an embedded array `images[]`; each image has its own `verdict`, `categoryBreakdown[]` (per-category result), and `policySnapshot[]` (frozen policy state at moderation time) |
| **appeals** | references `submission` + `imageId` (subdocument id), `justification`, `status` (`PENDING`/`ACCEPTED`/`REJECTED`), optional `adminResponse` |

**Verdict logic** (implemented in `services/moderationService.ts`):
1. Disabled categories are skipped — never sent to the AI provider.
2. If confidence < category threshold → does not affect verdict.
3. If confidence ≥ threshold and enforcement is `AUTO_BLOCK` → image is `BLOCKED`.
4. If confidence ≥ threshold and enforcement is `FLAG_FOR_REVIEW` → image is `FLAGGED`.
5. `BLOCKED` always outranks `FLAGGED` if both occur on the same image.
6. If nothing crosses threshold → `APPROVED`.

---

## 3. Folder Structure

```
src/
  config/       env.ts, db.ts
  controllers/  auth, submission, policy, appeal, adminSubmission, analytics
  middleware/   authenticate, requireAdmin, upload (multer), errorHandler, validateBody
  models/       User, Policy, Submission, Appeal
  routes/       authRoutes, submissionRoutes, policyRoutes, appealRoutes,
                adminSubmissionRoutes, analyticsRoutes, index.ts (aggregator)
  services/     moderationService (verdict engine), policyService (seeding/snapshot),
                analyticsService (aggregation queries)
  providers/    IModerationProvider, GeminiModerationProvider, MockModerationProvider, index.ts (factory)
  utils/        errors.ts, asyncHandler.ts, jwt.ts, createAdmin.ts (CLI script)
  types/        shared enums + interfaces
  uploads/      uploaded image files (gitignored, created at runtime)
  app.ts        express app wiring
  server.ts     entrypoint: connect DB -> seed policies -> listen
```

---

## 4. Setup Instructions

### Prerequisites
- Node.js 20+
- Docker & docker-compose (recommended path)
- (Optional) a Gemini API key for real AI moderation

### Option A — Docker (recommended)

```bash
cp .env.example .env
# edit .env if you want to set GEMINI_API_KEY, JWT_SECRET, etc.

docker-compose up --build
```

The API will be available at `http://localhost:5000`. MongoDB runs in its own
container and the backend connects to it via the Docker service name `mongo`
(see `MONGO_URI=mongodb://mongo:27017/content_moderation` — **not** `localhost`).

### Option B — Local (without Docker)

```bash
npm install
cp .env.example .env
# set MONGO_URI to a local/Atlas Mongo instance, e.g.:
# MONGO_URI=mongodb://localhost:27017/content_moderation

npm run dev      # ts-node + nodemon, auto-restarts on changes
# or
npm run build && npm start
```

---

## 5. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` / `production` | `development` |
| `MONGO_URI` | Mongo connection string. Use `mongo` as host in docker-compose | `mongodb://mongo:27017/content_moderation` |
| `JWT_SECRET` | Secret used to sign JWTs — change in production | `dev_secret_change_me` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `GEMINI_API_KEY` | Google Gemini API key. **Leave empty to use the mock provider** | *(empty)* |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` |
| `MAX_UPLOAD_MB` | Max size per image | `8` |
| `UPLOAD_DIR` | Where uploaded images are stored | `uploads` |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Reserved for optional bootstrap scripting (see §7) | *(empty)* |

---

## 6. Docker Commands

```bash
# Build and start everything (backend + mongo)
docker-compose up --build

# Run in background
docker-compose up -d --build

# View backend logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Stop and wipe volumes (Mongo data + uploads)
docker-compose down -v

# Run a one-off command inside the running backend container
docker-compose exec backend sh
```

---

## 7. How to Create an Admin User

There is no public "become admin" endpoint (by design — admin escalation must
be deliberate). Use the included CLI script:

**Local:**
```bash
npm run create-admin -- admin@example.com StrongPass123 "Admin Name"
```

**Inside Docker:**
```bash
docker-compose exec backend node dist/utils/createAdmin.js admin@example.com StrongPass123 "Admin Name"
```

The script creates a new user with role `ADMIN`, or promotes an existing user
with that email to `ADMIN` if one already exists. Then log in normally via
`POST /api/auth/login` to get a JWT with `role: "ADMIN"`.

---

## 8. How the Gemini Fallback Works

- On every moderation call, `providers/index.ts` checks `process.env.GEMINI_API_KEY`.
- **If set**: `GeminiModerationProvider` is used. It sends the image (base64) plus
  a structured prompt to the Gemini Vision API, asking for a JSON verdict per
  enabled category, and parses the response.
- **If empty/missing**: `MockModerationProvider` is used automatically — no crash,
  no missing-key error. It deterministically derives a confidence score per
  (image, category) pair from a hash of the image bytes, so the same image always
  produces the same mock result. This lets you fully test verdicts, policies,
  appeals, and overrides without ever needing a real API key.
- Both providers implement the same `IModerationProvider` interface, so the rest
  of the app (verdict engine, controllers) is 100% provider-agnostic.

To switch to a different provider later (Groq Vision, AWS Rekognition, Azure
Content Safety, Google Cloud Vision, YOLO, etc.), implement `IModerationProvider`
in a new file under `src/providers/` and update the factory in `src/providers/index.ts`.

---

## 9. Postman Testing Flow

1. **Register a user**
   `POST /api/auth/register`
   ```json
   { "name": "Jane Doe", "email": "jane@example.com", "password": "password123" }
   ```
   → copy `data.token`.

2. **Login** (alternative to register)
   `POST /api/auth/login`
   ```json
   { "email": "jane@example.com", "password": "password123" }
   ```

3. **Check current user**
   `GET /api/auth/me`
   Header: `Authorization: Bearer <token>`

4. **View moderation policies** (any authenticated user)
   `GET /api/policies`

5. **Submit images for moderation**
   `POST /api/submissions`
   Header: `Authorization: Bearer <token>`
   Body: `form-data`, field name `images`, type `File`, attach 1+ image files.
   → Response includes a `submission` with per-image `verdict` and `categoryBreakdown`.

6. **View your submission history**
   `GET /api/submissions/my`
   Optional query params: `?outcome=BLOCKED&category=SELF_HARM&from=2026-01-01&to=2026-12-31&page=1&limit=20`

7. **View a single submission**
   `GET /api/submissions/:id`

8. **Appeal a FLAGGED/BLOCKED image**
   `POST /api/appeals`
   ```json
   {
     "submissionId": "<submission _id>",
     "imageId": "<image _id from submission.images[]>",
     "justification": "This image was misclassified, it is a cooking knife in a recipe context."
   }
   ```

9. **View your appeals**
   `GET /api/appeals/my`

---

### Admin flow (use a token from a user created via `npm run create-admin`)

10. **Update a policy**
    `PATCH /api/admin/policies/:policyId`
    ```json
    { "enabled": true, "confidenceThreshold": 0.8, "enforcementBehavior": "AUTO_BLOCK" }
    ```

11. **View all submissions (with filters)**
    `GET /api/admin/submissions?outcome=FLAGGED&category=WEAPONS_CONTRABAND`

12. **Manually override a submission's image verdict**
    `PATCH /api/admin/submissions/:submissionId/override`
    ```json
    { "imageId": "<image _id>", "verdict": "APPROVED", "reason": "Reviewed manually, false positive" }
    ```

13. **View all appeals**
    `GET /api/admin/appeals?status=PENDING`

14. **Resolve an appeal**
    `PATCH /api/admin/appeals/:appealId/resolve`
    ```json
    { "decision": "ACCEPTED", "adminResponse": "Agreed, this was a false positive." }
    ```
    Accepting automatically overrides the related image's verdict to `APPROVED`.

15. **Analytics overview**
    `GET /api/admin/analytics/overview`
    Returns total submissions, verdict distribution, category violation
    distribution, appeal stats, top users by submission count, and top users
    by violation count.

---

## 10. Notes

- `GET /health` — unauthenticated health check.
- All error responses follow `{ "success": false, "message": "..." }`.
- All success responses follow `{ "success": true, "data": { ... } }`.
- Default category policies are seeded automatically on server start if missing
  (idempotent — safe to restart repeatedly).
