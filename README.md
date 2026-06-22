# Vocdoni Integrator Portal

Standalone developer portal for **integrators** of the Vocdoni SaaS platform, intended to be deployed
at `developer.vocdoni.io`. An *integrator* is an organization enabled to provision and manage other
organizations on behalf of its customers, subject to a quota.

This app shares the SaaS backend (and login/accounts) with the main app but is a separate,
integrator-focused UX: no elections, no memberbase, no organization-creation step at signup — just
quota visibility and management of the organizations the integrator owns.

## Features

- **Auth**: sign in, sign up (no org-details step), email verification, password recovery/reset.
- **Self-serve org creation**: a signed-in user with no organization can create one (on-chain account
  provisioned server-side via `provisionAccount`); they become its admin.
- **Overview**: quota cards for managed organizations, voting processes and census size, each showing
  usage against its limit and flagging anything at/over the limit.
- **Managed organizations**: paginated list of the organizations the integrator manages.
- **Create managed organization**: admin-only modal; disabled when the managed-orgs quota is reached.
- **Org switcher**: if the signed-in user administers more than one organization.

## Backend

Consumes the integrator endpoints added in **[vocdoni/saas-backend#525](https://github.com/vocdoni/saas-backend/pull/525)**:

- `GET  /organizations/{address}/integrator` — quota + usage (admin or manager)
- `GET  /organizations/{address}/managed?page=&limit=` — paginated managed orgs (admin or manager)
- `POST /organizations/{address}/managed` — create a managed org (admin only)
- `POST /organizations` — self-serve org creation (`provisionAccount: true`)

Role gating mirrors the backend: viewing requires admin **or** manager; creating requires **admin**.

**Self-serve integrator enablement** (subscribe to an integrator plan → no manual step) depends on
**[vocdoni/saas-backend#531](https://github.com/vocdoni/saas-backend/pull/531)**, which derives
integrator status from the plan's integrator limits. The in-portal subscription/checkout UI is the
remaining piece; until then, manage the subscription from the main Vocdoni dashboard.

## Stack

React 18 + TypeScript + Vite + Chakra UI v3 + TanStack Query + React Router + React Hook Form.

## Getting started

```bash
pnpm install
cp .env.example .env   # set VITE_SAAS_URL
pnpm dev
```

### Environment

| Variable        | Description                                  | Example                              |
| --------------- | -------------------------------------------- | ------------------------------------ |
| `VITE_SAAS_URL` | Base URL of the Vocdoni SaaS backend (no trailing slash) | `https://saas-api-dev.vocdoni.net` |

## Scripts

- `pnpm dev` — start the dev server.
- `pnpm build` — type-check and build for production (output in `dist/`).
- `pnpm preview` — preview the production build.
- `pnpm lint` — type-check + Prettier check.
- `pnpm lint:fix` — apply Prettier formatting.

## Notes / follow-ups

- UI strings are English-only for now (no i18n framework). The main app uses i18next; this can be
  added later if the portal needs localization.
- Managed-org rows show the address only — there is no public org-detail page in this standalone app.
- The error model special-cases the backend quota codes `40154` (max managed orgs) and `40155`
  (integrator quota) on create; `40153` means the organization is not an integrator.
