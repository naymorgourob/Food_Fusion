# FoodFusion — Design System (Phase 3)

Status: **Draft for approval**. This is the token reference every Tailwind config, component, and page in Phases 5+ must draw from. The living, interactive version of this document — real rendered swatches, real hover/focus states, a working light/dark toggle — is published here:

**→ [FoodFusion Design System (interactive)](https://claude.ai/code/artifact/4012c1d2-1fd6-4ce5-8110-a98e16c782bd)**

This file holds the same specification in plain tables so it's diffable in git and readable without opening a browser. Treat the artifact as the visual proof, this file as the source of truth for exact values.

---

## Design direction

One warm-graphite neutral scale (hue-biased toward the accent, not a generic cool gray) + one rust/terracotta accent used sparingly + four semantic colors kept clearly separated in hue from the accent and each other. One system-native sans for all UI text, one monospace reserved strictly for numbers/codes/identifiers. This reaffirms the Phase 1 design philosophy (Stripe/Linear/Vercel-inspired restraint) with concrete, implementable values.

---

## Color tokens

### Neutral scale (`stone`)

| Token | Hex | Typical use |
|---|---|---|
| `stone-50` | `#FAF8F6` | Page background (light) |
| `stone-100` | `#F3EFEB` | Sidebar / table header / hover overlay (light) |
| `stone-200` | `#E7E0D9` | Default border (light) |
| `stone-300` | `#D3C7BB` | Emphasis border, input border (light) |
| `stone-400` | `#A99C8E` | Placeholder / disabled text |
| `stone-500` | `#8A7D70` | — |
| `stone-600` | `#6B5F54` | Secondary text (light) |
| `stone-700` | `#4F453C` | — |
| `stone-800` | `#362E27` | Sidebar / table header / hover overlay (dark) |
| `stone-900` | `#211B16` | Primary text (light) / card surface (dark) |
| `stone-950` | `#14100D` | Page background (dark) |

### Accent (`ember`)

| Token | Hex | Use |
|---|---|---|
| `ember-50` | `#FCEEE7` | Active nav item background (light) |
| `ember-100` | `#F8D5C4` | Hover tint on accent-soft surfaces |
| `ember-300` | `#E28654` | Accent on dark surfaces (text/icon, dark mode) |
| `ember-500` | `#A6431A` | **Base brand accent** — links, focus ring, brand mark |
| `ember-600` | `#8A3614` | Primary button background (light) — darker for AA contrast with white text |
| `ember-700` | `#6E2B10` | Primary button hover (light) |

### Semantic

| Color | Base | Soft (bg tint) | Line (border) | Use |
|---|---|---|---|---|
| Success | `#325736` | `#EEF4EC` | `#B7D2B9` | Paid, served, in-stock, active |
| Warning | `#93600F` | `#FBF3E3` | `#E7CA8C` | Preparing, pending, low stock |
| Danger | `#8F1E17` | `#FBEAEA` | `#E9B4B0` | Cancelled, failed, out-of-stock, suspended |
| Info | `#204A85` | `#EAF0F7` | `#B7CBE6` | Neutral informational banners/badges only |

Dark-mode semantic bases lighten for contrast against dark surfaces: success `#8FC198`, warning `#E4B65C`, danger `#E48A83`, info `#8FB4E0` (soft/line values in the artifact's CSS custom properties).

### Surface role mapping

| Role | Token | Light | Dark |
|---|---|---|---|
| Page background | `--paper` | `#FAF8F6` | `#14100D` |
| Card / panel | `--surface` | `#FFFFFF` | `#1D1712` |
| Sidebar / table header / code bg | `--surface-2` | `#F3EFEB` | `#241C16` |
| Border (default) | `--border` | `#E7E0D9` | `#362C23` |
| Border (emphasis / inputs) | `--border-strong` | `#D3C7BB` | `#4A3C30` |
| Primary text | `--ink` | `#211B16` | `#F3EEE8` |
| Secondary text | `--ink-muted` | `#6B5F54` | `#B7A995` |
| Disabled / placeholder text | `--ink-faint` | `#A99C8E` | `#7C6F60` |

**Rules**: sidebar and navbar are theme-consistent (`surface-2`), not permanently dark regardless of theme. Active nav/tab state is always `accent-soft` background + `ember-600`/`ember-300` text — never a solid accent fill at rest, that's reserved for primary buttons. Disabled state is always 50% opacity of the control, never a separate gray token. Contrast targets: body text vs. background aims for WCAG AA (4.5:1 normal text, 3:1 large text/icons) — re-verify with a contrast checker against the final Tailwind palette before shipping, this spec sets intent, not a certified measurement.

---

## Typography

**Typeface**: system-native sans stack (`-apple-system, "Segoe UI", Inter, Roboto, sans-serif`) for every UI surface — self-hosted **Inter** variable font when the real app ships, per the Phase 1 decision. One monospace (`ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace`) reserved strictly for numbers, currency, hex codes, and IDs — with `font-variant-numeric: tabular-nums` so figures align in columns.

| Style | Size / Line-height | Weight | Use |
|---|---|---|---|
| Display | 44 / 52 | 700 | Landing hero only |
| H1 | 32 / 40 | 700 | Page titles |
| H2 | 24 / 32 | 600 | Section headings |
| H3 | 19 / 28 | 600 | Card/panel headings |
| H4 | 16 / 24 | 600 | Sub-headings, card titles |
| Body Large | 16 / 26 | 400 | Lede paragraphs, empty-state copy |
| Body | 14 / 22 | 400 | Default UI text |
| Small | 13 / 20 | 400 | Table cells, metadata, hints |
| Caption | 11.5 / 16 | 600, uppercase, 0.07em tracking | Eyebrows, column headers |
| Button | 14 / 20 | 600 | All button labels |
| Label | 13 / 18 | 500 | Form field labels |
| Data/mono | 13, tabular-nums | 400–600 | Currency, IDs, hex, timestamps |

Exactly four weights are used anywhere — **400 / 500 / 600 / 700** — never 300 or 800/900. Running text caps near 60–65 characters per line; headings use `text-wrap: balance`.

---

## Spacing (8pt grid, 4px half-step)

| Value | Usage |
|---|---|
| 4px | Icon-to-label gaps, tight inline spacing |
| 8px | Internal padding of chips/badges |
| 12px | Form field padding, gaps between related items |
| 16px | Default card padding, standard element gap |
| 20px | Comfortable padding on larger cards |
| 24px | Gap between cards in a grid, section-internal spacing |
| 32px | Spacing between major sections on a page |
| 40px | Large section breaks |
| 48px | Page-level top padding on dashboard pages |
| 64px | Landing page section vertical padding (mobile) |
| 80px | Landing page section vertical padding (desktop) |
| 96px | Hero top/bottom padding — largest breathing room |

## Radius

| Token | Value | Use |
|---|---|---|
| `sm` | 6px | Badges, chips, small buttons |
| `md` | 10px | Inputs, buttons, standard cards |
| `lg` | 16px | Large cards, panels, table containers |
| `xl` | 24px | Modals, hero media, feature panels |
| `pill` | 999px | Avatars, status pills, toggles |

## Shadow

| Token | Value (light) | Use |
|---|---|---|
| `sm` | `0 1px 2px rgb(20 16 13 / 0.06)` | Resting card |
| `md` | `0 4px 12px rgb(20 16 13 / 0.08)` | Hovered card, dropdown trigger |
| `lg` | `0 12px 24px rgb(20 16 13 / 0.12)` | Dropdown, popover |
| `xl` | `0 24px 48px rgb(20 16 13 / 0.20)` | Modal, dialog |
| `floating` | `0 8px 30px rgb(20 16 13 / 0.16)` | Floating action elements |

Shadows are tinted toward `ink`, never pure black, to feel native to the palette. In dark mode, alphas increase (0.24–0.5) and `--border-strong` carries more of the depth signal — dark-on-dark shadows read poorly on their own.

---

## Iconography

**Library**: Lucide — outline-only, consistent geometry, strong coverage of restaurant-domain concepts (utensils, receipt, table). Stroke width fixed at **1.75–2px** at every size. Sizes: **16px** inline/table rows, **20px** nav items and buttons (default), **24px** section headers and empty states. Never mix filled and outline icons. Never use an icon as the sole carrier of meaning — always pair with text or, for status, with color + a badge label.

---

## Component specifications

### Buttons

| Variant | Background | Text | Use |
|---|---|---|---|
| Primary | `ember-600` (hover `ember-700`) | white | One per view — the single most important action |
| Secondary | `ink` (stone-900/950) | paper | Secondary emphasis actions |
| Outline | transparent, `border-strong` | `ink` | Tertiary actions, toolbars |
| Ghost | transparent | `ink-muted` | Low-emphasis, icon-adjacent actions |
| Success | `success` base | white | Confirm positive actions (mark paid) |
| Danger | `danger` base | white | Destructive actions — always behind a confirmation modal |
| Disabled | 50% opacity of any variant | — | Never a separate gray token |

States: hover (background shift), active (1px translate), focus (2px accent ring, `outline-offset:2px`), loading (inline spinner + label change, e.g. "Saving…"), disabled (opacity + `pointer-events:none`).

### Forms

Inputs, textareas, selects share one visual contract: `border-strong` border, `md` radius, `9px 12px` padding, focus = `ember-500` border + 3px `ember-soft` ring. Error state = `danger` border + `danger` message row with icon. Success state = `success` border + `success` message row with icon. Disabled = `surface-2` background + `ink-faint` text, no pointer events. Checkbox/radio use `accent-color: ember-500`. Toggle is a 38×22px pill, thumb slides right and fills `ember-500` when on.

### Cards

Nine shapes, one shared rhythm (16–20px padding, `lg` radius, `sm` shadow, `border` outline): **StatCard** (label + tabular-nums value + trend pill), **FeatureCard**, **FoodCard** (image block + name/price/availability badge), **DashboardCard** (generic container), **AnalyticsCard** (chart + label), **ProfileCard** (avatar + name/role), **OrderCard** (header + item list + total), **ReservationCard** (table/guest + status badge), **InventoryCard** (item + stock badge).

### Tables

One pattern for every module: toolbar (search + bulk actions + primary action) → sticky header (uppercase caption labels, sort affordance) → rows (hover = `surface-2`) → pagination footer. Row actions live in a trailing overflow menu (`⋯`). Bulk actions appear in the toolbar only once ≥1 row is selected. Below 640px, the table scrolls horizontally inside its own container — never the page — with the identity column (e.g., order #) optionally sticky. Empty/filtered-to-nothing state replaces the table body with the module's Empty State component, never a bare "No results" row.

### Modals

| Size | Width | Use |
|---|---|---|
| Small | 360px | Confirm / delete prompts |
| Medium | 480px | Create/edit forms |
| Large | 720px | Order detail, invoice preview, image gallery |

All sizes: `xl` radius, `xl` shadow, backdrop blur + 45% ink-tinted overlay, trap focus while open, close on Escape or backdrop click, return focus to the trigger on close. Destructive actions (delete, cancel order) always route through the Small confirmation variant — never fire directly from a table row action.

### Badges

Fixed color-to-meaning mapping across every domain — a user who learns green="good state" in Orders already knows it in Inventory:

| Domain | Success (green) | Warning (amber) | Danger (red) | Neutral |
|---|---|---|---|---|
| Order | Served | Preparing | Cancelled | Completed |
| Reservation | Seated | Pending | No-show | Cancelled |
| Payment | Paid | Partial | Failed | Refunded |
| Inventory | In stock | Low stock | Out of stock | — |
| User | Active | — | Suspended | Inactive |

Every badge = colored dot + colored text on a soft-tint background + a word. Never color alone.

### Loading states

Skeletons are shaped like the content they replace (card skeleton ≠ table-row skeleton) and cross-fade into real content over 150ms — never a hard swap, never a bare "Loading…" string. Inline spinner for small async actions, determinate progress bar for uploads, button-embedded spinner + relabeled text ("Saving…") for form submits.

### Empty states

Every list module gets: an icon (outline, `surface-2` tile), a specific one-sentence message (never "No data"), and one primary action that resolves it.

| Module | Message | Primary action |
|---|---|---|
| Orders | "New dine-in and takeaway orders will show up here the moment they're placed." | New order |
| Menu | "Add your first dish to start building this category out." | Add menu item |
| Reservations | "Once a table is booked for today, it'll appear on this list." | New reservation |
| Customers | "Customer accounts appear here once someone registers or orders." | Invite customers |
| Reports | "Reports need at least a few completed orders — check back after service." | View orders |
| Inventory | "Add stock items to start tracking levels and reorder thresholds." | Add inventory item |

### Toasts

Bottom-right, stacked, `lg` shadow. Auto-dismiss after ~3.6s except errors, which persist until manually dismissed (6s minimum, then lingers). Five kinds: success, error, warning, info, undo (carries an inline "Undo" action button, no separate icon needed).

---

## Layout patterns

**Sidebar**: grouped sections with caption labels (never a flat 15-item list), active item = `ember-soft` background + `ember` text, collapses to a 64px icon-only rail under 1000px or on demand, user profile + logout pinned at the bottom.

**Top navbar**: breadcrumb (context, not navigation) on the left; search, notifications (with unread dot), theme toggle, and avatar on the right. Never duplicates sidebar navigation.

**Dashboard**: stat-card row (4-up, 2-up on tablet, 1-up on mobile) → chart + recent-activity split → recent-items table. Every admin/staff overview page follows this same vertical rhythm so switching between them costs no relearning.

**Charts**: used for exactly five purposes — revenue, orders, reservations, customers, inventory trend — never decoratively. Single accent hue for magnitude (this is ranking/trend data, not multi-category comparison, so no categorical palette is needed), 2px lines, rounded data-ends, faint grid, one direct label on the value that matters, hover tooltip on every point/bar. One chart answers one question; a screen needing a ninth chart needs a dedicated Reports page instead.

---

## Responsive breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | <640px | Single column; sidebar → slide-over drawer; tables scroll horizontally; stat cards 1-up |
| Tablet | 640–1024px | Sidebar collapses to icon-only by default; stat cards 2-up |
| Laptop | 1024–1440px | Full sidebar + content; stat cards 4-up; two-column dashboard split |
| Desktop | 1440–1920px | Content max-width caps (~1180px) |
| Ultra-wide | >1920px | Page centers within max-width; margins grow, content doesn't stretch |

---

## Motion (Framer Motion)

| Context | Duration | Easing | Rule |
|---|---|---|---|
| Page transition | 180ms | ease-out | Fade + 4px rise, never a full-viewport slide |
| Hover (card/button) | 120ms | ease | Color/shadow only — never scale a button on hover |
| List item enter | 150ms | ease-out | Stagger ≤30ms/item, cap at 6 items |
| Modal | 200ms | ease-out | Scale 0.97→1 + backdrop fade, reversed on close |
| Sidebar collapse | 200ms | ease-in-out | Width transition; labels fade slightly before width settles |
| Dropdown/menu | 120ms | ease-out | Fade + 4px rise from the trigger, never from screen edge |
| Loading → content | 150ms | ease | Cross-fade, never a hard swap |

All motion respects `prefers-reduced-motion` globally — no per-component opt-out.

---

## Accessibility checklist

- Full keyboard operability, logical tab order, visible focus ring everywhere (2px accent outline).
- Icon-only buttons carry `aria-label`; decorative icons get `aria-hidden`.
- Text/background pairs target WCAG AA (4.5:1 body, 3:1 large text/icons) — verify against final palette in Phase 5.
- Status is never color-only — every badge/trend pairs color with a dot/arrow and a word.
- Modals trap focus while open, return focus to the trigger on close.

---

## Dark mode

Token-level, not a naive inversion: every color above is a CSS custom property redefined under both `prefers-color-scheme: dark` and an explicit `data-theme="dark"` override (so an in-app theme switch always wins over OS preference). Components style through tokens only — never a color literal inside a dark-mode-specific rule. See the interactive artifact's live toggle for a working proof of this pattern.

---

## Component inventory (build once, import everywhere)

Button · IconButton · Input · Textarea · Select · Checkbox · Radio · Toggle · FileUpload · Card · StatCard · FoodCard · OrderCard · ReservationCard · InventoryCard · ProfileCard · Table · Pagination · Badge · Avatar · Modal · Drawer · Toast · Skeleton · Spinner · ProgressBar · EmptyState · Sidebar · Navbar · Breadcrumb · Tooltip · Tabs · Accordion · ChartWrapper · Calendar

This is the checklist Phase 5 (frontend implementation) builds against — every one of these gets exactly one implementation, reused across every module that needs it.

---

Waiting for your approval (as-is, or with corrections) before Phase 4.
