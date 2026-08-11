# Migration Reset — Full Wipeout & Fresh Baseline

Use this when:
- Switching to a **new/different database** server
- The schema has been **completely rewritten** (old migrations no longer match)
- Migrations are **stuck** after a failed rollback
- You need a clean slate: one baseline migration that matches the current `schema.prisma`

## Why This Is Needed

Our PostgreSQL is hosted on **SumoBase** (managed), which does **not** grant the `CREATEDB` privilege.  
Prisma's `migrate dev` needs to create a temporary _shadow database_ to diff schemas — it can't on this setup.

This means the normal `prisma migrate dev` workflow is **unavailable**. We use `prisma db push` + `prisma migrate diff` instead.

---

## Full Reset Procedure

### Step 1 — Delete all existing migrations

```bash
# Keep only migration_lock.toml
rm -rf prisma/migrations/20*
```

### Step 2 — Drop all tables from the database

Connect via `psql` (strip `?pgbouncer=true` — psql doesn't understand it):

```bash
DB_URL="postgresql://user:pass@host:port/dbname"

psql "$DB_URL" -c "
  DROP TABLE IF EXISTS
    messages, chats, documents,
    \"Account\", \"Session\", \"User\",
    \"Chat\", \"Message\", \"Document\", \"DocumentChunk\",
    \"Collection\", \"CollectionMember\", \"CollectionDocument\",
    _prisma_migrations
  CASCADE;
"
```

> **Tip:** Get the current table list first with:
> ```bash
> psql "$DB_URL" -c "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';"
> ```

Also drop any leftover custom types:

```bash
psql "$DB_URL" -c "DROP TYPE IF EXISTS \"Role\" CASCADE;"
```

### Step 3 — Push the current schema

```bash
npx prisma db push
```

This creates all tables/constraints from `schema.prisma` directly on the database.  
No shadow database needed.

### Step 4 — Generate the migration SQL file

```bash
MIGRATION_NAME=20260811_init_v2   # use current date + descriptive name

mkdir -p prisma/migrations/$MIGRATION_NAME

npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/$MIGRATION_NAME/migration.sql
```

### Step 5 — Mark the migration as applied

`db push` doesn't create a `_prisma_migrations` table, so create it first:

```bash
psql "$DB_URL" -c "
  CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id                      VARCHAR(36) PRIMARY KEY NOT NULL,
      checksum                VARCHAR(64) NOT NULL,
      finished_at             TIMESTAMPTZ,
      migration_name          VARCHAR(255) NOT NULL,
      logs                    TEXT,
      rolled_back_at          TIMESTAMPTZ,
      started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
      applied_steps_count     INTEGER NOT NULL DEFAULT 0
  );
"
```

Then mark it:

```bash
npx prisma migrate resolve --applied $MIGRATION_NAME
```

### Step 6 — Verify

```bash
npx prisma migrate status
# Should say: "Database schema is up to date!"

# Optionally check tables:
psql "$DB_URL" -c "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';"
```

---

## Day-to-Day Schema Changes

When you **modify** `schema.prisma` (add a column, add a model, etc.):

```bash
# 1. Push the change to your dev DB
npx prisma db push

# 2. Generate the migration file from the diff
npx prisma migrate diff \
  --from-url "$DIRECT_URL" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/$(date +%Y%m%d%H%M%S)_descriptive_name/migration.sql

# 3. Mark it applied
npx prisma migrate resolve --applied <migration_folder_name>
```

> **Production deploys:** The generated `migration.sql` files can be applied with `prisma migrate deploy` in CI/CD (that command doesn't need a shadow DB).

---

## If You Get `CREATEDB` Access Later

Ask SumoBase to provision a second empty database (e.g. `db6067d5f294072b6a_shadow`).  
Then add to `schema.prisma`:

```prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  directUrl         = env("DIRECT_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  extensions        = [vector]
}
```

And add to `.env.local`:

```env
SHADOW_DATABASE_URL=postgresql://user:pass@host:port/shadow_db_name?pgbouncer=true
```

Then `npx prisma migrate dev` works normally — no more manual diff steps.

---

## Related Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Source of truth for the data model |
| `prisma/migrations/` | Generated migration SQL files |
| `.env.local` | `DATABASE_URL` and `DIRECT_URL` |
| This doc | Reset procedure reference |
