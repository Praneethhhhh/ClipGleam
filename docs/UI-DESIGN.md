# Clipgleam homepage and visual foundation

**Status** Proposed for creator review · **Date** 24 November 2026  
**Scope** Public, signed-out homepage and its interaction states. Build later product screens from the approved direction.

## Reference study

| Reference | Observation | Clipgleam application |
| --- | --- | --- |
| [Apple homepage](https://www.apple.com/) | Each flagship section establishes a headline, a concise promise, a short action row and a dominant product image. Distinct lighter and darker art directions can coexist across campaigns. | Give the homepage one promise and one recognizable sample video. Keep the site theme independently selectable. Avoid stacking unrelated calls to action. |
| [iPhone lineup](https://www.apple.com/iphone/) | High-level browsing and detailed comparison live at different levels. Repeated summaries scan because they follow a consistent content order. | Keep navigation limited to Examples, How it works and Sign in. Sample entries show title and preview affordance with optional verified duration. |
| [MacBook Air](https://www.apple.com/macbook-air/) | A focused hero leads into highlights and only later more detailed sections. Product photography shows the feature being discussed. Media has an explicit viewing action. | Lead with actual explainer artwork. Keep the workflow to four short steps. Open the sample on demand with accessible player controls. |
| [iPhone Pro](https://www.apple.com/iphone-18-pro/) | Strong contrast and tightly framed imagery establish a more cinematic direction for a flagship story. | Test a charcoal screening-room concept with one bright film poster. Preserve the same information hierarchy and navigation as light mode. |
| [Apple Accessibility](https://www.apple.com/accessibility/) | The overview presents clear entry points, with more detailed descriptions available through focused interactions. | Let viewers discover film controls and explanations where needed. Keep accessible names, keyboard operation, focus indication and captions in the homepage. |
| [Color](https://developer.apple.com/design/human-interface-guidelines/color), [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode), [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Icons](https://developer.apple.com/design/human-interface-guidelines/icons) | Consistent semantic roles, independently readable appearances, restrained typography and recognizable symbols. These are platform guidelines. | Translate the principles to web tokens, responsive type, original Clipgleam artwork and a consistent icon family. Use the theme switch for System, Light and Dark. |

Clipgleam signature is a white and charcoal interface with blue actions and original explainer artwork. Use the approved folded-pebble mark and a consistent geometric outline family. Use no Apple product imagery, branding, trademarks, SF font files or SF Symbols in the implementation. Apple campaign compositions inform hierarchy, not asset or layout reproduction.

## Palette

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| Canvas | #FFFFFF | #111113 | Page background |
| Surface | #F5F5F7 | #1C1C1E | Player details, sign-in and cards |
| Text | #1D1D1F | #F5F5F7 | Main content |
| Secondary text | #59595E | #B8B8BF | Supporting copy |
| Divider | #D2D2D7 | #3A3A3C | Decorative boundaries |
| Control border | #76767B | #86868B | Input and interactive outlines |
| Primary and links | #0066CC | #2997FF | Primary action and inline links |
| On primary | #FFFFFF | #111113 | Filled action labels |
| Primary hover | #0055AE | #5AAFFF | Hover and active feedback |
| Focus | #0066CC | #2997FF | 2 px external ring with 2 px offset |
| Error | #B4232D | #FFA4A9 | Validation or failed action, with text |
| Warning | #855706 | #F6CA79 | Review or attention, with text |
| Success | #0066CC | #2997FF | Completed action, with icon and text |

Sample artwork may use cobalt and warm sunlight freely inside media. Use the main accent for navigational and interactive meaning. Use icon and text as well as color for status. Blue is reserved for actions and focus. Verify text and control contrast against each final surface. Validate rendered components, overlays and focus indicators during implementation. [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## Typography and component rules

- **DM Sans** for headings, controls and body. Bundle the font locally. System fallback is system-ui, Segoe UI, sans-serif. Use 600–700 weight for headings, 400–500 for body and 600 for button labels.
- Display 64–80 px desktop, 38–48 px mobile, line height 1.0–1.08 and tracking down to −0.045 em; section heading 36–44 px desktop or 28–32 px mobile; body 16–18 px at 1.45–1.6; labels 14–16 px.
- Use 4, 8, 12, 16, 24, 32, 48, 64 and 96 px spacing; an approximately 1160 px maximum content width and at least 20 px mobile gutters. Avoid fixed copy heights. Reflow with text enlargement. Use 12 px control corners and 24 px media/dialog corners. Keep shadows subtle.
- Use the folded-pebble brand silhouette, familiar play/pause, captions, volume, close, chevron, sun/moon and alert symbol shapes. Review all stroke weights and optical alignment at 20–24 px. Give icon-only actions accessible names and 48 px hit areas. Treat symbol artwork as a design reference until a consistent production family is approved.
- The homepage preview opens in light mode. The dark-mode control persists the user choice where browser storage is available. Both appearances use the same layout. Use visible keyboard focus. Under reduced motion drop decorative transitions and preserve manual video playback.

## Homepage concepts

| Concept | Reason to consider it |
| --- | --- |
| A. Editorial | Light split hero. One direct promise alongside a large, vertical sample. Best starting choice if users should understand the product in one glance. |
| B. Screening Room | Dark stage centers the video. Strongest if seeing the motion quality is the main reason a creator will sign in. |
| C. Storyboard to Screen | Shows the relationship between editable storyboard and video. Strongest if visibility and control before rendering are the main differentiators. |

Each concept serves a visitor coming to inspect Clipgleam or an invited creator who wants to sign in. Homepage content is a concise hero, sample examples, four workflow steps and footer. Direct sign-in links to the invite-only entry. Use no sign-up form or pricing. Design mockups reference original sample art. A shipped player should use verified Clipgleam exports and measured lengths.

## Homepage interaction states

| Trigger | Appearance and behavior |
| --- | --- |
| Initial visit / mobile | Header, hero, samples and workflow. Mobile stacks in the same reading order and collapses nav into a labelled menu. |
| Light, dark or system | Keep brand, copy, controls and hierarchy consistent. Evoke different ambience through tokens. |
| Watch sample | Dialog shows poster while awaiting media. Bind Escape and Close, keep focus inside, return it to the initiating control. Pause on dismissal. Player exposes play/pause, seek, captions and volume, with labels. |
| Media loading or unavailable | Announce loading, retain Close. On failure show “The sample couldn’t load.” and Retry. Preserve homepage navigation and avoid an infinite spinner. |
| Sign-in idle and invalid input | Email and password labelled with password-manager support. Inline invalid email guidance retained until corrected. No account eligibility disclosure. |
| Submitting / failed / signed in | Render “Signing in…” and suppress duplicate submits. Give generic failure feedback with retry path, including network failure. On success announce “Opening your workspace…” while navigating. No public registration state. |

## Review

The current direction is one homepage on the private Stitch canvas. The hero pairs the product explanation with one 9:16 still from the approved seasons cut. The fixed header uses a 70% light or dark fill and backdrop blur so it picks up the surface behind it. The wordmark is paired with the approved folded-pebble silhouette. The mark is solid black in light mode, with a light version for dark mode. The same contour is used for the favicon. Four outline icons support the workflow explanation. Earlier concepts are superseded. Open **Clipgleam · Homepage** from the Stitch dashboard, or open the [local homepage preview](../output/Clipgleam-Homepage.html). Check the hierarchy, sample artwork and CTA before extending the UI.
References for scope and behavior are the [PRD](PRD.md), [system design](SYSTEM-DESIGN.md), [API design](API-DESIGN.md) and [video quality standard](VIDEO-QUALITY.md).

