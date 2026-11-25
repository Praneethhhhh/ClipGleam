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
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck` or `npm run build` from the same directory to verify the web app.