# ClipGleam V1 Design QA Notes

**Updated** 25 November 2026  
**Review set** [Screen review index](SCREEN-REVIEW-INDEX.md) · [Product design map](PRODUCT-DESIGN.md) · [Chrome measurements](../output/v1-design-review/qa-captures/review-audit.json)

## Results

| Check | Evidence |
| --- | --- |
| Artboard coverage | Reviewed 35 numbered Stitch exports. Matched each capture and local preview to its existing Stitch screen ID. Updated the HTML and capture in Stitch without creating duplicate screens. |
| Header while scrolling | Chrome reported the header at 0 px from the top before and after scrolling on all 34 scrollable artboards. Sign-in fit within its review viewport. The computed fill was 70% opaque on all 35, with backdrop blur applied in both appearances. |
| Layout and alignment | Captured all 26 desktop artboards at 1440 px and all nine mobile artboards at 390 px. All 35 loaded and had no page-level horizontal overflow. Inspected representative viewport captures for every board, then recaptured the corrected boards and saved full-page images in the index. |
| Brand and navigation | Standardized the approved folded-pebble mark, the shared top bar, and the workspace and project tabs. Homepage desktop, mobile, and dark treatments use the same hero, sample still, workflow and restrained Spotlight. |
| Scope and content | Removed auxiliary export controls from Preview, reduced Settings to account, appearance and Instagram needs, and corrected the targeted 4K, 60 fps, ProRes, token and compliance labels found in generated mockups. The published video profile remains 1080 × 1920, 30 fps, H.264/AAC MP4. |

## Review by flow

| Screens | Corrections and review considerations |
| --- | --- |
| 01–05, 23, 26, 28 | Preserved the standalone vertical sample and matched the mobile and dark homepage to it. Aligned sign-in and access headers. The invited account setup form remains a proposal for operator-provisioned pilot access. |
| 06–10, 29–30, 34 | Standardized workspace and Plan navigation. Keep project unavailable messaging generic. Preserve draft recovery, exact prompt review, and the distinction between empty projects and a failed load. |
| 11–13, 24, 35 | Kept storyboard steps visible during scroll and removed duplicated mobile project navigation where applicable. Review whether the scene picker, inspector, validation issues and version history remain clear during a real editing task. |
| 14–16, 31 | Kept the generation stages and previous-output recovery. The ready video view shows measured duration, format and MP4 as the export. It offers a separate handoff to Publish. |
| 17–22, 25, 32–33 | Simplified provider terminology and preserved account identity, vertical download, schedule timing and recovery. The unknown-outcome board still disallows a resend. Verify account reconnection and schedule recovery in integration. |
| 27 | Retained the Spotlight, focus, selection and reduced-motion review board. The shared shell disables decorative animations for reduced-motion users. |

## Open before implementation

- Confirm the invite/setup flow on 04, 05 and 28. The current API contract assumes operator-provisioned pilot access.
- Confirm the owner-scoped read contract for the cross-project Publishing queue on 19 and its mobile recovery views. Existing API reads are project-scoped.
- During implementation, verify keyboard and screen-reader behavior, focus and dialog handling, video playback, form and autosave state transitions, viewport coverage beyond the design widths, and reduced motion. Fixed-header behavior and viewport overflow were measured on the design exports. Authentication, signing, provider calls and scheduling remain untested by this visual review.
- Run publishing integration tests for an eligible Instagram account, explicit local time and offset, missed schedules, cancel versus dispatch, and safe reconciliation after an uncertain result.

Creator approval of the reviewed artboards is pending.

