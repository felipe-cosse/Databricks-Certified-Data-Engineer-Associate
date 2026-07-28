# DEA Study Lab Design System

This specification was extracted from the generated concepts in `docs/design/concepts/`.

## Product surfaces

- Desktop course reader: `course-desktop.png` — 1536 × 1024
- Desktop exam simulator: `mock-exam-desktop.png` — 1536 × 1024
- Mobile course reader: `course-mobile.png` — 864 × 1856

## Design idea

A precise technical workbook inside a calm learning application. The content surface is true white; pale cool-gray rails organize the workflow; coral marks the current decision; teal marks verified completion.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--white` | `#ffffff` | Reading surface |
| `--rail` | `#f7f9fb` | Sidebar and progress rail |
| `--ink` | `#0c1b2e` | Headings and primary text |
| `--muted` | `#617087` | Supporting text |
| `--line` | `#d8e0e9` | Rules and controls |
| `--line-strong` | `#b9c5d3` | Active control outline |
| `--coral` | `#ff392b` | Current/primary action |
| `--coral-soft` | `#fff5f3` | Current row and answer fill |
| `--teal` | `#087177` | Completion and success |
| `--teal-soft` | `#edf8f7` | Success callout |
| `--danger` | `#b42318` | Incorrect result |

Typography uses a deliberate UI sans-serif stack: Inter when installed, then the system sans-serif. Heading weights are 700–760; body is 400–500; labels use 650 with modest tracking. Controls never depend on browser-default typography.

Spacing uses a 4px base with primary steps at 8, 12, 16, 24, 32, and 48px. Borders are 1px. Radii are 8–12px. Shadows are avoided except for the mobile drawer overlay.

## Desktop container model

- 62px quiet top bar
- 324px left navigation rail
- Flexible main reader/question workspace
- 336px right progress/status rail
- Full-width 72px bottom objective/question strip on course and exam surfaces

The main area uses open white space and horizontal rules, not nested card grids.

## Mobile model

- 68px top bar
- One-column content
- Course rail becomes an overlay drawer
- Right rail content appears inline after the primary content
- Wide tables scroll horizontally
- Sticky 68px bottom navigation
- Primary actions use at least 48px height

## Component families

- Header navigation with one coral underline
- Section row with number, name, weight, completion bar, and state marker
- Objective spine with current/completed/future nodes
- Open lesson typography, code blocks, and data tables
- Radio-choice rows with selected/correct/incorrect variants
- Progress and exam-status rails
- Flat secondary button and coral primary button
- Compact number navigator for 45-question exams
- Inline callouts using a left rule, never decorative badges

## Icon inventory

All icons are code-native SVG with rounded line caps and 1.8–2px strokes:

- Stacked-layers brand mark
- Reset/rotate
- Menu
- Book/course
- Pencil/practice
- Clipboard/exams
- Calendar/plan
- Check
- Flag
- Clock
- Chevron and arrows

## Copy lock and accuracy adjustment

The concept showed `12 of 42 objectives`. The official May 2026 guide contains 33 bullet objectives, so implementation uses `x of 33 objectives`. This is an intentional accuracy correction. The four top-level navigation labels, seven section labels, main course titles, exam title, timing, and primary actions remain aligned with the concepts.

## Motion

- 160–220ms color/border transitions
- Short drawer slide
- Progress-width interpolation
- No continuous decorative motion
- Disable nonessential transition motion under `prefers-reduced-motion`
