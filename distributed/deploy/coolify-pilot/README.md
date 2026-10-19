# Cognee standalone pilot (ONE-207)

Persistent API + Postgres on Coolify; Next.js UI on Vercel (`cognee-frontend`).

## Coolify

1. Project: `cognee-pilot` (or create via API).
2. Application: GitHub `OneWeb-LLC/cognee`, branch `main` (or pilot PR branch), build pack **dockercompose**.
3. **Base directory:** `distributed/deploy/coolify-pilot`
4. **Compose file:** `docker-compose.yml`
5. **Expose service:** `cognee` port `8000`
6. **Domain:** HTTPS FQDN for the API (e.g. `https://cognee-api.example.com`).

### Required environment variables

| Variable | Description |
|----------|-------------|
| `LLM_API_KEY` | OpenAI (or provider) key for cognify/search |
| `POSTGRES_PASSWORD` | Postgres password (also used by API) |
| `DEFAULT_USER_PASSWORD` | Strong password for `default_user@example.com` (not `default_password`) |
| `CORS_ALLOWED_ORIGINS` | Exact Vercel UI URL(s), comma-separated, e.g. `https://cognee.vercel.app` |

Optional: `LLM_MODEL`, `LLM_PROVIDER`, `COGNEE_SKIP_CONNECTION_TEST=true` for dry runs without LLM.

## Vercel (UI)

Root directory: `cognee-frontend`. Use `npm ci` / `npm run build`.

| Variable | Value |
|----------|--------|
| `COGNEE_BACKEND_URL` | Coolify API URL (no trailing slash) |
| `COGNEE_REQUIRE_BACKEND_URL` | `true` |
| `NEXT_PUBLIC_IS_CLOUD_ENVIRONMENT` | `false` |
| `DEFAULT_USER_PASSWORD` | Same as backend (server routes that proxy auth) |

Do not set `NEXT_PUBLIC_LOCAL_API_URL` on Vercel unless you intentionally bake a URL into the client bundle.

## Smoke test

```bash
curl -fsS "$COGNEE_BACKEND_URL/health"
```

After UI deploy, sign in at `/local-login` with `default_user@example.com` and the configured password.

### Coolify environment pitfalls

- Do **not** add env rows whose value is `set VARIABLE_NAME` (a mistaken bulk import). Remove duplicates so each key appears once with a real secret.
- If login fails after fixing env, bump the `postgres_data_*` / `cognee_system_*` volume suffixes in `docker-compose.yml` and redeploy so Postgres and the default user are re-initialized with the current `DEFAULT_USER_PASSWORD`.
