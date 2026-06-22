# Vocdoni Integrator Portal

Standalone developer portal for **integrators** of the Vocdoni SaaS platform, intended to be deployed
at `developer.vocdoni.io`. An *integrator* is an organization enabled to provision and manage other
organizations on behalf of its customers, subject to a quota.

This app shares the SaaS backend (and login/accounts) with the main app but is a separate,
integrator-focused UX: no elections, no memberbase, no organization-creation step at signup — just
quota visibility and management of the organizations the integrator owns.

## Features

- **Auth**: sign in, sign up (no org-details step), email verification, password recovery/reset.
- **Automatic org provisioning**: the first time a signed-in user has no organization (e.g. right
  after sign-up), one is created automatically on the free integrator tier with type `others`
  (on-chain account provisioned server-side via `provisionAccount`); they become its admin. There is
  no empty dashboard or manual create step — remaining org fields are optional and editable later in
  Configuration.
- **Overview**: quota cards for managed organizations, voting processes and census size, each showing
  usage against its limit and flagging anything at/over the limit.
- **Managed organizations**: paginated list of the organizations the integrator manages.
- **Configuration**: a tabbed settings area for the active organization — **Org Details** (edit
  website/subdomain/color/size/country/timezone via `PUT /organizations/{address}`), **Team** (list
  members and pending invites, invite by email + role, change role, remove/cancel/resend), **Subscription**
  (current plan, usage, upgrade, Stripe billing portal) and **Support** (submit a support ticket). Write
  actions are admin-gated.
- **Org switcher**: if the signed-in user administers more than one organization.

## Backend

Consumes the integrator endpoints added in **[vocdoni/saas-backend#525](https://github.com/vocdoni/saas-backend/pull/525)**:

- `GET  /organizations/{address}/integrator` — quota + usage (admin or manager)
- `GET  /organizations/{address}/managed?page=&limit=` — paginated managed orgs (admin or manager)
- `POST /organizations` — self-serve org creation (`provisionAccount: true`)

The **Configuration** area additionally consumes the standard organization endpoints:
`GET|PUT /organizations/{address}`, `GET /organizations/{address}/users`,
`GET /organizations/{address}/users/pending`, `POST|PUT|DELETE` on those user/invite routes,
`GET /organizations/{address}/subscription`, `POST /subscriptions/{address}/portal`,
`POST /organizations/{address}/ticket`, plus the public `GET /organizations/roles`.

Role gating mirrors the backend: viewing requires admin **or** manager; org/team/subscription writes
require **admin**.

**Self-serve integrator enablement** is plan-driven (integrator status derives from a plan's
integrator limits, [vocdoni/saas-backend#531](https://github.com/vocdoni/saas-backend/pull/531)):
- **Free tier** — creating an org here subscribes it to the free integrator plan automatically, no
  checkout ([saas-backend#532](https://github.com/vocdoni/saas-backend/pull/532)).
- **Paid tiers** — admins upgrade via Stripe checkout, listing integrator plans from `GET /plans`
  ([saas-backend#532](https://github.com/vocdoni/saas-backend/pull/532) exposes their limits) and
  paying through the embedded Stripe Custom Checkout (`POST /subscriptions/checkout`). Requires
  `VITE_STRIPE_PUBLISHABLE_KEY` and the Stripe integrator products to be configured; without the key
  the upgrade UI shows a "payments unavailable" message.

## Stack

React 18 + TypeScript + Vite + Chakra UI v3 + TanStack Query + React Router + React Hook Form + Stripe.

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
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for plan-upgrade checkout (optional) | `pk_test_…` |

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
- The integrator quota codes `40153` (not an integrator), `40154` (max managed orgs) and `40155`
  (integrator quota) are defined in `src/api/endpoints.ts` for surfacing backend quota errors.
- **API Keys**: not yet implemented — the SaaS backend has no API key/token endpoints (auth is
  JWT-only). The Configuration area is ready to gain an "API Keys" tab once the backend exists.
