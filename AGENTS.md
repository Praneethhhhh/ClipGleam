# Working in Clipgleam

The project root is G:\Projects\Ai video generator. Verify the working directory before executing commands or writing files. Use the G: root explicitly if a session opens elsewhere.

Read README.md and docs/PROGRESS.md before working. Consult docs/PRD.md for product scope, docs/SYSTEM-DESIGN.md for system decisions, and PIPELINE.md for the local prototype.

For each meaningful work session, update docs/PROGRESS.md with the date, files or behavior changed, evidence from verification, unresolved issues, and the next action. Keep the current milestone summary up to date. Add a dated history entry for material decisions and corrections. Update the relevant requirements or architecture document when a decision changes it.

Treat planned features and verified behavior separately. A sample locally narrated render does not verify the Gemini and ElevenLabs pipeline. Review the live storyboard and first live video with the user before building the dashboard or publishing integration.

Read credentials from the local .secrets/.env file. Never print, copy into logs, or commit credentials. Preserve existing user work and avoid unnecessary files outside this project.

Before planning, narrating or rendering an explainer, read docs/VIDEO-QUALITY.md and apply its approval and verification checks.

## Feature delivery

Follow docs/DEVELOPMENT-PLAN.md. Work on one small feature branch at a time. After implementing a feature, obtain a subagent code review and resolve actionable findings. Run verification and manually exercise the running feature in a browser. Record the evidence in docs/PROGRESS.md, then commit to the feature branch. Wait for explicit creator approval of that feature before merging or pushing it to main. Before a commit, verify staged paths exclude credentials and local-only artifacts.
