# ClipGleam

ClipGleam is a video creation platform. V1 helps teachers, creators and brands turn an idea into an animated educational or product explainer.

The engine prototype has produced the creator-approved seasons video. The creator approved the V1 design review. Development proceeds one feature branch at a time.

| Document | Use it for |
| --- | --- |
| [Product requirements](docs/PRD.md) | V1 scope, creator flows, acceptance criteria and edge cases |
| [System design](docs/SYSTEM-DESIGN.md) | Application architecture, media pipeline, privacy, workflows and deployment gates |
| [API design](docs/API-DESIGN.md) | Creator and internal contracts, approvals, retries, private media and publishing |
| [Database design](docs/DATABASE-DESIGN.md) | MongoDB collections, indexes, transactions, media references and recovery |
| [Homepage UI design](docs/UI-DESIGN.md) | Apple reference study, theme tokens and Stitch homepage review |
| [V1 product design review](docs/PRODUCT-DESIGN.md) | Screen inventory, Stitch artboards, state coverage and motion decisions |
| [Screen review index](docs/SCREEN-REVIEW-INDEX.md) | All 35 numbered artboards and preview links |
| [Design QA notes](docs/DESIGN-QA-NOTES.md) | Confirmed checks, open findings and review criteria |
| [Pipeline technical design](PIPELINE.md) | Local prototype and first video review |
| [Progress log](docs/PROGRESS.md) | Completed work, current milestone, blockers and next actions |
| [Feature delivery plan](docs/DEVELOPMENT-PLAN.md) | Branch workflow, approval gates and implementation sequence |
| [Agent instructions](AGENTS.md) | Workspace and change tracking instructions |

[Video quality standard](docs/VIDEO-QUALITY.md) records the approved benchmark and the review checklist for every explainer.

## Run the web app

Use Node.js 24 and npm. The public homepage lives in the separate web package. The original local video prototype still runs from the project root.

```sh
cd apps/web
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3015
```

Open http://127.0.0.1:3015. Run `npm run typecheck` or `npm run build` from the same directory to verify the web app.

## Pilot access setup

Keep the local review server at http://127.0.0.1:3015. Copy apps/web/.env.example to apps/web/.env.local and set a MongoDB connection string, a dedicated database name, and a random Better Auth secret of at least 32 characters. Set BETTER_AUTH_URL to the exact review origin locally and the HTTPS application origin in a hosted environment.

From apps/web, provision a pilot account with Node.js 24 and a MongoDB replica set or sharded cluster. Provisioning uses a transaction for the user and credential records. Set CLIPGLEAM_PILOT_PASSWORD in the current process from a masked prompt or approved secret manager before invoking the command. Clear it afterward.

    node --env-file=.env.local scripts/provision-pilot.ts creator@example.com "Pilot Creator"

There is no public registration. Operators disable access and revoke existing sessions with this command.

    node --env-file=.env.local scripts/disable-pilot.ts creator@example.com

The app checks current admission on every private request. Contact the operator for account recovery.

Before hosted rollout, verify that the reverse proxy overwrites forwarded client IP headers and that sign-in throttling works end to end.

## Owner invitations

Set CLIPGLEAM_ADMIN_USER_ID in the web application's ignored environment file to the immutable Better Auth user ID of the sole owner. The account must also have active pilot admission. Leaving the setting blank disables the owner invitation interface.

The owner can open **Manage invitations** from Projects, create a one-use invitation for a specific email, copy its link, and revoke a pending invitation. The recipient sets their password. The app does not send email. Links use the configured application origin, so local preview links work on the computer running the preview. To invite people elsewhere, use an HTTPS deployment and its matching BETTER_AUTH_URL.

Retest invitation redemption and Better Auth sign-in when upgrading the Better Auth MongoDB adapter because the redemption transaction writes the adapter's user and credential records together with the invitation and admission.
