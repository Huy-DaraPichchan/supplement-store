# PaceUI Design Reference

## Purpose

This file captures the visual language, component catalog, and layout conventions of
[PaceUI](https://paceui.com/) (an interactive shadcn components, blocks, and templates
marketplace). Use it as a reference to generate admin dashboards with shadcn.

PaceUI's tagline: *"Craft Beautifully, Ship Faster with the Shadcn Ecosystem."* Its
positioning is "interactive components, modular layout blocks, and production starters.
Engineered for React, Next.js, and TanStack Start — ready to copy and customize."

When generating UI from this file, combine:

- shadcn primitives (installed via `npx shadcn add`)
- Aceternity UI and MagicUI components for motion/AI (also npx-installed)
- framer-motion / motion for animation
- lucide-react for icons
- TanStack Charts (or shadcn charts) for data visualizations

This repository's own `DESIGN.md` remains the source of truth for brand, color, and UX
decisions. This file is a component/style reference, not a replacement for `DESIGN.md`.

---

## 1. Design language

PaceUI ships a consistent, modern, "enterprise SaaS" visual style across all blocks and
templates. The recurring characteristics:

- **Clean and modular** — every page is composed of self-contained, reusable blocks.
- **Card-based** — most content sits inside bordered cards with soft shadows and rounded
  corners.
- **Light + dark themes** — every block ships light and dark variants, toggled by a theme
  switch (`next-themes`), with `dark` class variant.
- **Generous whitespace** — comfortable padding between sections; content is scannable,
  not dense or chaotic.
- **Restrained accents** — neutral surfaces dominate; the accent color is used
  intentionally for primary actions, active nav states, selected rows, charts, and
  brand moments — never as a full-page wash.
- **Border-first separation** — subtle `border-border` lines separate sections and rows;
  shadows are reserved for cards, dropdowns, and dialogs.
- **Semantic tokens** — colors come from CSS variables (`--card`, `--muted`,
  `--primary`, `--border`, etc.), never raw Tailwind palette colors.
- **Responsive-first** — desktop grid collapses to stacked layouts; secondary controls
  move into sheets/drawers on mobile.
- **Motion is meaningful** — small micro-interactions on hover/focus, larger transitions
  for dialogs and theme changes; nothing is decorative or bouncy for its own sake.

---

## 2. Theme conventions

PaceUI themes are token-driven shadcn CSS variables. The exact hex values vary by
template, so this file documents the *structure*, not fixed PaceUI colors. Use the
existing semantic tokens already defined in `frontend/app/globals.css`.

### Core token roles used by every PaceUI surface

| Token | Purpose |
| --- | --- |
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` / `--card-foreground` | Card, table, form surfaces |
| `--popover` / `--popover-foreground` | Menus, dropdowns, dialogs, command palette |
| `--primary` / `--primary-foreground` | Primary buttons, active nav, selected states, accent |
| `--secondary` | Secondary button/control backgrounds |
| `--muted` / `--muted-foreground` | Quiet surfaces, metadata text, placeholders |
| `--accent` / `--accent-foreground` | Hover/selected menu or sidebar items |
| `--destructive` | Errors, destructive actions, badge backgrounds |
| `--border` | Default separators |
| `--input` | Input field borders |
| `--ring` | Focus rings |
| `--sidebar`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` | Sidebar shell |
| `--chart-1` … `--chart-5` | Chart series palette |

### Theme rules

- Use `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`,
  `bg-primary text-primary-foreground`, `border-border` — never raw color utilities.
- Active navigation item: `bg-accent`/`bg-primary-soft` background with `text-foreground`
  or `text-primary`, not color alone.
- Status badges: tinted backgrounds using opacity (e.g. `bg-destructive/10 text-destructive`,
  `bg-success/15 text-success`, `bg-primary-soft text-primary`) — color is never the only
  signal, always pair with text.
- Dark mode must preserve the brand identity and must not introduce blue or green tones.
- `dark:` class variant under the `.dark` root is used for all dark-mode styling.

---

## 3. Component catalog (PaceUI inventory)

### 3.1 Dashboard blocks

The core building blocks for an admin dashboard. These are the highest-value patterns.

**Stats** — metric cards ("stat cards"):
- KPI value (large number), delta vs. previous period (positive/negative), optional sparkline,
  label, and icon.
- Layout: responsive grid of 2 → 4 columns.
- Deltas: green/red only where semantically accurate; otherwise use brand tokens.

**Charts** — interactive data visualizations:
- Line/area, bar, donut/pie, and mixed charts with tooltips, legends, and date ranges.
- Backed by TanStack Charts (PaceUI's default) or a shadcn/Recharts wrapper.
- Use `--chart-1 … --chart-5` for series; a toggle for raw vs. chart bars.
- Always include a chart card header (title, subtitle, period selector).

**Widgets** — dynamic real-time widgets:
- Usage quotas, storage meters, system events, progress bars, activity feeds.
- Progress bars use `bg-primary`, thin track uses `bg-muted`.

**Tables** — data tables:
- Styled with shadcn `Table`: header row `bg-muted/50`, `divide-y divide-border`,
  hover row highlight (`hover:bg-muted/50`).
- First column often includes an avatar + name; trailing column holds row actions
  (edit/delete menu, status toggle).
- Row-level actions from a dropdown menu with icon buttons.
- Optional: search input, status filter chips, pagination controls.

### 3.2 Marketing blocks

Full-page and landing sections:

- **Hero** — headline, subline, primary + secondary CTA buttons, product/app preview or
  logo grid.
- **Feature** — 3–4 column feature grid with icon, title, description; alternate rows with
  screenshots.
- **Pricing** — 3-tier pricing cards, middle tier highlighted (`bg-card`, ring/border
  emphasis, "Popular" badge).
- **Testimonials** — quote cards with reviewer avatar, name, handle; marquee or grid layout.
- **FAQs** — stacked `Accordion` items with title + answer.
- **Topbar** — announcement bar above the navbar (dismissible, small text).
- **Footer** — multi-column footer with brand, product/resource links, social icons,
  copyright.
- **Cookie Consent** — bottom banner/sheet with accept/decline actions.
- **Auth flows** — login, register, forgot password, reset password, verify email, 2FA
  (two-factor). Pattern: centered `Card` on `bg-background` with brand logo, heading,
  labeled inputs, primary submit button, and muted "already have an account?" links.

### 3.3 App blocks

Vertical application sections:

- **Analytics** — dashboard analytics with stat cards, charts, and leaderboard tables.
- **Education / Courses** — course cards with progress bars and lesson lists.
- **File Manager** — file/folder grid with type icons, size, modified date, context menus.
- **Projects** — project cards with avatars, status badges, progress bars.
- **Finance** — transaction tables, balance/budget cards, income/expense charts.
- **Health** — metric cards, activity rings/bars, goals progress.
- **Chats** — chat UI: sidebar contact list + message thread + input.
- **Forms** — full form blocks (profile, contact, checkout): labeled inputs, textareas,
  selects, switches, radio groups, submit actions.

### 3.4 Layout blocks

Shell-level components:

- **Notifications** — `Popover`/`Sheet` panel with unread badge on the bell icon; grouped
  (Today / Earlier) notification rows with unread dot, icon, title, timestamp.
- **Profile Menu** — avatar button → `DropdownMenu` with user info header, menu items,
  divider, sign-out.
- **Widgets** — reusable layout widgets (mini lists, stat rows, quick actions).
- **Promos** — promotional banners/cards with CTA.

### 3.5 Motion components (framer-motion / motion)

PaceUI lists these interactive variants. Use *sparingly* in an admin dashboard and only
where Motion already adds clarity:

- **Text**: Reveal Text, Scramble Text, Squash Text, Bouncing Text, Mouse Wave Text
- **Buttons**: Text Fall Button, Spring Button, Fillable Button
- **Stacks**: Animated Stack, Layered Stack
- **Effects**: Gradient Shadow, Profile Peek, Flip Reveal, Reveal on Scroll, Tilt Card
- **Layout**: Infinite Scroller (marquee, uses `animate-marquee`), Swap

### 3.6 GSAP components

GSAP-driven variants of the above (PaceUI offers the same catalog under GSAP) plus
scroll & effects:

- **Text**: Distort Text, Draw Line Text (plus the shared text effects)
- **Scroll & effects**: Liquid Cursor, Liquid Glass, Overlay Effect, Reveal on Scroll,
  Stagger on Scroll
- **Utilities & counters**: GitHub Star Counter, **Rolling Number** (animated count-up —
  useful for KPI stat cards)

### 3.7 Native AI components

AI-assistant UI built with the Web AI / built-in browser model APIs:

- **Chat surface**: Chat Header, Chat Messages, Chat Suggestions, Chat Input,
  Response Renderer
- **Use cases**: Quick Chat, Follow Ups
- **Hooks**: `useBrowserSupport`, `useNativeAI`
- **Browser Support** — banner marking that the browser supports native model inference.

### 3.8 AI model components (shared across Motion / GSAP)

- AI Model Selector, AI Model Ability Selector, AI Response Writer, AI Suggestions,
  AI Token Counter.

---

## 4. Ultimate Admin Dashboard template anatomy

PaceUI's flagship template is the reference for what a "good admin dashboard" looks like:

### Included features

- **10 dashboard views**: overview, customers, orders, education, finance/crypto,
  analytics, AI, logs, database, CRM-style lists.
- **7+ layout variants**: sidebar shells with different sidebars (icon rail, labeled,
  collapsible compact/expanded), topbar heights, and content widths.
- **Integrated app suite**: chat, email, calendar.
- **Admin user management**: user tables with avatars, roles, status badges, bulk actions.
- **Global search function**: a command-menu / command palette (`⌘K`) that searches
  routes and records.
- **Advanced settings panel**: notifications, profile, security, appearance.
- **Authentication variants**: login + register (centered card flows).
- **Interactive data charts**: stats, trend lines, distributions, mixed charts.
- **Responsive web design**: sidebar collapses to an overlay drawer on mobile.

### Recommended page skeleton (from this template)

```
Sidebar (collapsible, icon + label per item, active state via accent)
└── Main column
    ├── Topbar (breadcrumb/page title · crumbs · global search ⌘K · theme toggle ·
    │        notification bell · profile menu)
    ├── Content
    │   ├── Stat cards row (2–4 cards: label, value, delta, sparkline)
    │   ├── Charts row (primary chart card + secondary chart/side card)
    │   ├── Data table card (search, filter chips, Table, pagination)
    │   └── Secondary sections (activity feed, widgets, recent items)
    └── (Optional) detail drawer / dialog
```

---

## 5. Styling standards

### Typography

- Functional UI in the native system sans-serif stack (this repo: `--font-sans`).
- Page/section titles use the heading stack (`--font-heading`) for major labels only —
  matches the existing admin panel (`font-heading text-2xl font-semibold`).
- Sizes (admin context):
  - Page title: `text-2xl` – `text-3xl`
  - Card title: `font-semibold text-base`
  - Section label / metadata: `text-sm` or `text-xs` with `text-muted-foreground`
  - Stat value: `text-2xl` – `text-4xl` with `font-semibold`/`font-bold`
- Avoid excessive uppercase and letter-spacing. Keep tabular numbers for currency/stat
  alignment where useful.

### Spacing

- Consistent Tailwind spacing scale; prefer `gap-*` on parents over margins.
- Page padding: `px-4 sm:px-6 lg:px-8`; content max width ~`max-w-7xl`.
- Card padding: `p-4 sm:p-5`; card gaps in grids: `gap-4`.
- Stacked card content: `gap-4`…`gap-6`; section spacing: `py-8` with grid `gap-8`.
- Touch targets: `min-h-11` for buttons/inputs per existing conventions.

### Shape

- Use the shared theme radius tokens (`rounded-md`/`rounded-lg` via `--radius`).
- Cards, dropdowns, inputs, buttons: default radius.
- Avatars and status badges: `rounded-md`/`rounded-full` as appropriate.
- Restrained radii; no excessive pills except where the intent is pill-shaped controls.

### Elevation

- Base separation via `border-border`; cards use a soft resting shadow
  (`shadow-card`) and optional hover `shadow-raised`.
- Menus, dropdowns, dialogs, and the command palette use `shadow-raised`/`shadow-panel`.
- No glassmorphism, neon glow, or floating decorative panels.

### Tables

- Header: `bg-muted/50 text-xs font-medium text-muted-foreground`.
- Rows: `border-border divide-y`, `hover:bg-muted/50`, last row no border.
- Cells: `px-4 py-3`; right-align numeric/currency columns.
- Badges in cells use tinted token classes.
- Responsive: horizontal scroll container on small screens.

### Interactive states

- Focus-visible ring: the global `outline-ring` behavior in `app/globals.css`.
- Hover: light `bg-muted`/`bg-muted/50` or `hover:underline`, `transition-colors`.
- Disabled: `disabled:opacity-50` with `cursor-not-allowed`.
- Ensure color is never the only status/selection indicator.

---

## 6. Charts

- Recommended: **TanStack Charts** (PaceUI's own chart library) or the shadcn chart
  wrapper. Keep it framework-agnostic in prompts; prefer whichever is already in the
  project before adding a new dependency.
- Chart series colors come from `--chart-1` … `--chart-5`.
- All charts get a card header: title, short description, and a period/series control.
- Include tooltips, readable axes, and interactive states; never chart the brand accent
  for every series.

---

## 7. Motion guidelines

- Use meaningful motion: dialog/drawer open-close, theme switch, full-page/route
  transitions, and major state changes.
- Subtle transitions (150–200ms): hover, focus, color/border changes, expanding controls.
- Larger transitions (200–350ms): dialogs, pages, theme.
- Admin-appropriate motion: count-up stat values (Rolling Number), skeleton loading,
  subtle card hover elevation, marquee only for infinite scrollers.
- Respect `prefers-reduced-motion` (already handled globally in `app/globals.css`).
- Do not animate every card on scroll, do not stagger lists, avoid bouncy/exaggerated
  hover scaling and continuous decorative motion.

---

## 8. Mapping to this repository

### Available dependencies
- Next.js 16.3.1, React 19, TypeScript, Tailwind v4
- shadcn (`npx shadcn add …`), Aceternity UI, MagicUI CLI
- framer-motion + motion
- lucide-react
- next-themes (theme toggle)

### Existing admin context (`frontend/components/AdminDashboard.tsx`)
Current dashboard shell already follows many PaceUI conventions; reuse these patterns:

- `bg-card` header with brand logo, page title/subtitle on a `border-l border-border`, logout.
- Content grid `lg:grid-cols-[minmax(18rem,24rem)_1fr]` for a settings rail + main area.
- Sticky settings rail: `lg:sticky lg:top-8`.
- Cards: `rounded-lg border border-border bg-card p-5 shadow-card`.
- Status badges with tinted token classes (`bg-primary-soft text-primary`,
  `bg-success/15 text-success`, `bg-destructive/10 text-destructive`,
  `bg-warm-accent-soft text-warning`) — keep extending this exact pattern.
- Buttons: `min-h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover`,
  secondary `border-border hover:bg-muted`.
- Empty state: dashed border card with icon + title + muted description.
- Forms: labeled inputs `h-11 rounded-md border border-input bg-background px-3`,
  switches/checkboxes with `accent-primary`.

### When generating admin UI for this project

1. Install any needed primitive via `npx shadcn add <component>` (e.g. `table`, `select`,
   `dropdown-menu`, `popover`, `command`, `dialog`, `sheet`, `tabs`, `badge`).
2. Keep shadcn components in `frontend/components/ui/` (npx-generated) — never hand-write them.
3. Build new screens in `frontend/components/` alongside `AdminDashboard.tsx`.
4. Consume semantic tokens (`bg-card`, `text-muted-foreground`, `border-border`, …).
5. Use the PaceUI block recipes above: stat cards → charts → data table → widget/actions.
6. Follow `DESIGN.md` brand rules: primary `#bc1a8d`, no blue/green, warm accents from the
   palette, restrained motion, WCAG AA contrast, keyboard/focus support.
7. Prefer shadcn and existing project components; use Aceternity/MagicUI only when a
   component clearly supports the intended experience.

### Quick component cheat-sheet (PaceUI pattern → shadcn component)

| PaceUI pattern | shadcn primitive |
| --- | --- |
| Sidebar shell | `sidebar` + `collapsible` + `tooltip` |
| Topbar profile menu | `dropdown-menu` (avatar trigger) |
| Notifications | `popover` or `sheet` + `badge` (unread) |
| Global search | `command` (⌘K palette, dialog `content`) |
| Stat cards | plain `card` + `badge` (delta) |
| Data table | `table` + `select` (filter) + `dropdown-menu` (row actions) |
| Status badge | `badge` with tinted token classes |
| Filters | `select`, `checkbox`, `switch` |
| Settings panels | `tabs` or stacked cards with forms |
| Auth flows | centered `card` with form fields |
| Empty / loading | dashed-border empty state, `skeleton` |
| Toasts / feedback | concise text status (existing pattern) or `sonner` if added |

---

## 9. Generation checklist (AI prompt guardrails)

When building a section, verify:

- [ ] Uses shadcn primitives first, project components second
- [ ] Semantic color tokens only; no blue/green
- [ ] Light + dark both handled via `dark:` variant
- [ ] `prefers-reduced-motion` respected; motion is meaningful, not decorative
- [ ] Focus-visible states on all interactive elements
- [ ] Color is never the only status/selection indicator
- [ ] Tables have headers, hover states, and responsive scroll
- [ ] Stat/chart cards share the consistent header pattern (title, subtitle, control)
- [ ] Buttons use existing tokenized variants (`bg-primary`, `hover:bg-primary-hover`)
- [ ] Touch targets ≥ `min-h-11`; page padding `px-4 sm:px-6 lg:px-8`, max `max-w-7xl`
- [ ] No raw colors, no glassmorphism, no neon glow, no excessive pill containers