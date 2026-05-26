# CLAUDE.md

Project-specific coding guidelines for Repo Radar.

These instructions are for AI coding assistants working in this repository. Follow them together with the user's request. When in conflict, prefer the user's latest explicit instruction.

## 1. Think Before Coding

Before making changes:

- Read the relevant files first.
- State assumptions when the request is ambiguous.
- Ask a short clarification question if a wrong assumption could cause rework.
- Prefer the smallest useful implementation that solves the current task.
- Do not silently add extra features.

For multi-step work, define a concrete verification target such as:

```txt
frontend: npm run lint && npm run build
backend: ./mvnw -DskipTests package
```

## 2. Keep Changes Surgical

Touch only files related to the request.

- Do not refactor unrelated code.
- Do not reformat large files just because they look uneven.
- Do not remove existing code unless it is made obsolete by your change.
- Match the current style of the surrounding code.
- If you notice unrelated problems, mention them separately instead of fixing them silently.

Every changed line should be explainable from the user's request.

## 3. Frontend Rules

The frontend lives in `frontend/`.

Use the existing stack:

```txt
React
Vite
Ant Design
Axios
React Router
```

Design expectations:

- Keep the UI close to GitHub's visual language.
- Prefer practical product screens over marketing/landing pages.
- Use clear tool controls: buttons, switches, inputs, selects, and tabs.
- Do not put feature explanations as large visible help text unless the user asks.
- Make new pages responsive on desktop and mobile.
- Avoid decorative gradients/orbs or overly flashy layouts.

Routing:

- Protected pages should be wrapped with `RequireAuth`.
- New settings-style features should live under `/settings/...`.
- Keep frontend API calls inside the existing Axios setup when possible.

Verification after frontend changes:

```bash
cd frontend
npm run lint
npm run build
```

## 4. Backend Rules

The backend is Spring Boot at the repository root.

Use the existing structure:

```txt
controller
service
repository
entity
dto
config
security
scheduler
```

Backend principles:

- Controllers should stay thin.
- Business logic belongs in services.
- Database access belongs in repositories.
- API request/response shapes should use DTOs.
- Do not expose entities directly when the response is user-facing or likely to evolve.
- Prefer explicit endpoint names and predictable JSON shapes.

Verification after backend changes:

```bash
./mvnw -DskipTests package
```

Run full tests only when the local database/test profile is ready.

## 5. Configuration And Secrets

Never commit real secrets.

Do not hard-code:

```txt
API keys
JWT secrets
database passwords
OAuth client secrets
Resend keys
DeepSeek keys
Railway internal URLs
```

Production configuration must come from environment variables.

Important variables include:

```txt
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
REDIS_HOST
REDIS_PORT
REDIS_PASSWORD
JWT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
DEEPSEEK_API_KEY
RESEND_API_KEY
MAIL_FROM
MAIL_FROM_NAME
CORS_ALLOWED_ORIGINS
FRONTEND_OAUTH_REDIRECT_URL
```

`src/main/resources/application.properties` is local-only and ignored by Git. It may contain local development defaults.

`src/main/resources/application.yml` must stay safe to commit.

## 6. Deployment Rules

Current deployment:

```txt
Frontend: Cloudflare Pages
Backend: Railway
Database: Railway MySQL
Cache: Railway Redis
Domain: radar.qingshiyuu.com
```

Cloudflare Pages:

```txt
Build command: cd frontend && npm ci && npm run build
Build output directory: frontend/dist
```

Railway:

```txt
Build command: ./mvnw -DskipTests package
Start command: java -Dserver.port=$PORT -jar target/*.jar
```

Do not assume localhost works in production.

CORS must include:

```txt
https://radar.qingshiyuu.com
https://trending-radar-qingshiyuu.pages.dev
```

Frontend production API base URL must be set with:

```txt
VITE_API_BASE_URL
```

Always include `https://` in URL environment variables.

## 7. AI Summary Rules

AI calls cost money. Treat them as a production resource.

When changing AI summary behavior:

- Use Redis cache whenever possible.
- Do not call the AI provider on every page render.
- Prefer one shared repo brief per repository over per-user generation.
- Consider rate limiting for public or expensive endpoints.
- Return graceful fallback messages when AI summary is unavailable.

Current AI-related endpoint:

```txt
GET /api/repos/{owner}/{repo}/summary
```

## 8. Email Rules

Email uses Resend, not Gmail SMTP.

Do not require `RESEND_API_KEY` for local app startup unless the feature being tested sends mail.

Email features should be opt-in by default.

Subscription rules:

- New users should not be forced into daily emails.
- Users should be able to enable/disable daily digest.
- Future emails must include an unsubscribe path.
- Digest generation should reuse cached AI briefs.
- Do not generate one AI brief per user per email.

Current subscription endpoint:

```txt
GET /api/subscriptions
PUT /api/subscriptions
```

## 9. Database Rules

For new persisted features:

- Add an entity.
- Add a repository.
- Add service logic.
- Add DTOs for API responses/requests.
- Add controller endpoints.

For subscription-like tables:

- Use unique constraints where duplicate records would be invalid.
- Keep timestamps.
- Use stable enum strings.

Local development may use:

```txt
JPA_DDL_AUTO=update
```

Production should eventually move toward migrations with Flyway or Liquibase.

## 10. Git And Review Discipline

- Do not revert user changes unless explicitly asked.
- Do not commit generated secrets.
- Keep screenshots or README assets in `docs/`.
- After code changes, report exactly what changed and what was verified.
- If a command cannot be run, say why.

Good final summaries include:

```txt
changed files
verification commands
remaining caveats
```

## 11. Preferred Task Flow

For each non-trivial task:

1. Inspect relevant files.
2. Identify the smallest safe implementation.
3. Edit only needed files.
4. Run the relevant verification.
5. Summarize outcome clearly.

The goal is not to write the most impressive code. The goal is to keep Repo Radar understandable, deployable, and easy to continue improving.
