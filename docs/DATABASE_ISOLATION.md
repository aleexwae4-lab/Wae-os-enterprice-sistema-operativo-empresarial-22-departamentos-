# WAE OS Enterprise 22 — Database Isolation Contract

## Objective

Connect WAE OS Enterprise 22 to the shared Supabase physical project without reading from, writing to, mutating, or coupling with the data models used by other WAE products.

## Dedicated namespace

This application may access only these tables:

- `wae_enterprise22_connection_probe`
- `wae_enterprise22_tenants`
- `wae_enterprise22_members`
- `wae_enterprise22_companies`
- `wae_enterprise22_department_state`

The frontend enforces this allow-list in `src/lib/enterprise22Db.ts`.

## Explicitly out of scope

The application must not directly access shared/generic tables such as:

- `organizations`
- `organization_members`
- `workspaces`
- `projects`
- `documents`
- `conversations`
- `wae_ecosystem_assets`
- any `wae_juriscan_*`, `wae_studio_*`, `chatwae_*`, engineering, crawler, billing, or unrelated WAE namespace

unless a future migration and security review explicitly authorize it.

## Authentication and RLS

- `auth.users` is the only shared identity dependency.
- All Enterprise 22 business tables have Row Level Security enabled.
- The initial policy is intentionally owner-only / fail-closed.
- No business tenant, company, member, or department state is seeded automatically.
- The anonymous role can read only the non-sensitive connection probe.

## Browser credentials

Only these browser-safe values may be provided to Vite:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never expose a `service_role`, secret key, database password, Vault secret, or privileged token through `VITE_*` variables or source control.

## Change discipline

Every future database feature for this application must:

1. use the `wae_enterprise22_` prefix;
2. be introduced through a named migration;
3. enable RLS before receiving production data;
4. remain tenant-scoped;
5. avoid destructive changes to pre-existing shared objects;
6. pass a security advisor review before frontend activation.
