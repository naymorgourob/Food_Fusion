# FoodFusion — Architecture & Planning Blueprint (Phase 1)

Status: **Draft for approval**. Nothing in Phases 2+ should begin until this document is signed off. Any change to scope after approval should come back to this file first, not straight into code.

---

## Step 1 — Project Analysis

**What kind of software this is**
FoodFusion is a role-based, single-restaurant operations platform: an internal admin/staff system (menu, orders, tables, kitchen, billing, inventory, reports) fused with a customer-facing ordering experience. Architecturally it's a modular monolith — one Express API, one Postgres database — deliberately structured so individual modules (orders, inventory, reporting) could later be extracted into services without a rewrite.

**Primary objectives**
- Replace manual/paper-based order-taking with a structured digital workflow.
- Give the kitchen a real-time, unambiguous queue of what to cook and in what order.
- Make billing a byproduct of the order (not a separate manual re-entry).
- Give the owner visibility (sales, popular items, stock levels) without spreadsheets.
- Let customers browse and order without relying on a staff member for every step.

**Target users**
- **Admin (owner/manager)** — runs the business: menu, staff, reports, settings.
- **Staff** — front-of-house (takes orders, manages tables) and kitchen (updates order status) operations.
- **Customer** — browses menu, places orders, tracks status, reviews.

**Problems being solved**
| Problem today | FoodFusion's answer |
|---|---|
| Orders scribbled on paper, lost/misread | Structured digital order with items, quantities, notes |
| Kitchen finds out about orders late or verbally | Kitchen display fed directly from order creation |
| Billing re-typed from the order slip | Bill generated from the order record, no re-entry |
| No idea what's low in stock until it runs out | Inventory ledger with reorder thresholds |
| No visibility into what sells / when it's busy | Reports module over real order data |
| Reservations tracked in a notebook | Reservation entity tied to tables and time slots |

**Business workflow (happy path)**
Customer/staff creates an order → order enters kitchen queue → kitchen updates status as it's prepared → staff serves it → bill is generated from the order → payment recorded → table freed → data rolls up into reports; inventory is adjusted where tracked manually.

**Functional requirements**
Auth + RBAC · Menu & category management · Table & reservation management · Order lifecycle (creation → kitchen → served → billed) · Kitchen display · Billing/invoicing · Inventory ledger · Staff management · Customer accounts · Reviews · Notifications · Reports/analytics · Activity audit log · Settings.

**Non-functional requirements**
- **Security** — JWT auth, bcrypt hashing, RBAC on every endpoint, server-side validation on every input, no secrets in client code.
- **Performance** — indexed foreign keys and status columns, pagination on all list endpoints, no N+1 query patterns.
- **Scalability** — modular backend (controllers/services/repositories separated) so modules can be split out later; stateless API (JWT, no server sessions) so it can run on multiple instances.
- **Maintainability** — SOLID boundaries, no business logic in controllers or React components, consistent naming.
- **Usability** — premium SaaS-grade UI, fully responsive, proper loading/empty/error states everywhere.
- **Reliability** — centralized error handling, meaningful API error shapes, no silent failures.
- **Auditability** — activity log for admin-sensitive actions (menu changes, staff changes, settings changes).
- **Deployability** — frontend on Vercel, backend on Render, DB on Neon; environment-driven config, no hardcoded URLs/secrets.

**Project scope (v1)**
Single restaurant, single location. Three roles: **Admin, Staff, Customer** (see Step 2 for how "Kitchen" fits without becoming a fourth role). Inventory is manually-adjusted in v1, not recipe-driven auto-deduction. No payment gateway integration in v1 — payment is *recorded* (cash/card/mobile marked by staff), not *processed* online; this is a scope call, flagged in Step 6.

**Future scalability**
Multi-branch/multi-tenant (each restaurant as a `Restaurant` root entity — the schema in Step 11 is designed so this is an additive change, not a rewrite), real online payment gateway, delivery-partner integration, recipe-based inventory auto-deduction, loyalty/coupons, native mobile app, WebSocket-based live order push (v1 can use polling; the architecture doesn't block adding sockets later), POS hardware/printer integration.

---

## Step 2 — User Roles

FoodFusion supports exactly **three roles** at the authentication/authorization level: `ADMIN`, `STAFF`, `CUSTOMER`. This is a deliberate simplification — see the note on Kitchen below.

| | **Admin** | **Staff** | **Customer** |
|---|---|---|---|
| **Responsibilities** | Owns the business config: menu, staff accounts, reports, settings, inventory oversight | Day-to-day floor operations: taking orders, managing tables/reservations, kitchen execution, generating bills | Browsing menu, placing orders, tracking them, managing own profile, leaving reviews |
| **Permissions** | Full CRUD on all modules | CRUD on orders/tables/reservations/bills; read-only on menu/inventory; update inventory stock levels | CRUD on own orders/profile/reviews only |
| **Restrictions** | None (within the app) | Cannot edit menu items, cannot manage other staff accounts, cannot view financial reports or settings | Cannot see any other customer's data, cannot access any dashboard route |
| **Dashboard access** | Full sidebar: Dashboard, Menu, Orders, Tables/Reservations, Kitchen, Billing, Inventory, Employees, Customers, Reports, Settings, Activity Log | Operational subset: Orders, Tables/Reservations, Kitchen, Billing (create only) | No admin dashboard — a separate customer-facing app shell (menu, cart, my orders, profile) |
| **Future extensibility** | Could split into `OWNER` (billing/subscription-level) vs `MANAGER` (operational) if the business grows | Could split by department (see below) if kitchen and front-of-house staff need visibly different UIs | Could add loyalty tiers, guest checkout vs registered accounts |

**Design note on "Kitchen"** — your module list includes Kitchen Display as a screen, but earlier framing floated it as a role. I'm keeping it as a **Staff permission scope**, not a fourth role, via a `department` field on the staff profile (`FRONT_OF_HOUSE` or `KITCHEN`). Reasoning:
- A 4th role multiplies every RBAC check across the backend for a distinction that's really "which screen does this employee mostly use," not "what are they allowed to do." Both front-of-house and kitchen staff should be able to view orders and update status — they just default to different screens.
- `department` lets the UI route a kitchen employee straight to the Kitchen Display on login while keeping the permission model simple (one `STAFF` role, one set of endpoint guards).
- If your proposal document specifically names Kitchen as a fourth role, say so now and I'll adjust the schema before Phase 2 — this is cheap to change today, expensive after auth is built.

---

## Step 3 — System Modules

Priority: **P0** = required for v1, **P1** = important but can trail P0 slightly, **P2** = documented for later, not built now.

| Module | Purpose | Main Features | Dependencies | Priority |
|---|---|---|---|---|
| Landing Website | Public marketing surface, first impression | Hero, features, how-it-works, preview, testimonials, FAQ, footer | none | P0 |
| Authentication | Identity + access control | Register/login, JWT issue/refresh, RBAC guard, password reset | Users table | P0 |
| Dashboard Shell | Common layout for Admin/Staff | Sidebar, topbar, role-aware nav, breadcrumbs | Auth | P0 |
| Menu & Categories | Source of truth for what's sellable | CRUD categories/items, availability toggle, images, pricing | Auth | P0 |
| Orders | Core transactional entity | Create/update order, order items, status lifecycle | Menu, Tables, Auth | P0 |
| Tables & Reservations | Physical floor management | Table CRUD, status (free/occupied/reserved), reservation booking | Auth | P0 |
| Kitchen Display | Real-time cook queue | List of active orders by status, one-tap status update | Orders | P0 |
| Billing / Invoicing | Turn an order into a payable bill | Generate bill from order, discount/tax calc, mark paid, receipt view | Orders | P0 |
| Employees (Staff mgmt) | Manage the workforce | Staff CRUD, department assignment, activate/deactivate | Auth | P1 |
| Customers | Admin visibility into customer accounts | List/search customers, view order history per customer | Auth, Orders | P1 |
| Inventory | Stock visibility | Item list, manual stock adjustment, low-stock flag | Auth | P1 |
| Reports / Analytics | Business intelligence | Sales over time, top items, order volume, revenue by category | Orders, Billing | P1 |
| Notifications | Keep users informed | In-app notification list, read/unread, order-status pushes | Orders | P1 |
| Profile | Self-service account management | View/edit own profile, change password | Auth | P1 |
| Activity Log | Audit trail | Record of sensitive admin actions with actor/timestamp | Auth | P1 |
| Reviews | Customer feedback loop | Rate/comment on completed orders/items | Orders | P2 |
| Help Center | Self-serve support content | FAQ/docs page | none | P2 |
| Coupons / Loyalty | Retention mechanics | Discount codes, points | Orders | P2 (future roadmap only) |

---

## Step 4 — Project Structure

```
FoodFusion/
├── frontend/                      # React + Tailwind SPA
│   ├── src/
│   │   ├── assets/                # static images, logos, illustrations
│   │   ├── components/            # reusable, presentation-only UI (Button, Card, Modal, DataTable...)
│   │   │   ├── ui/                # generic design-system primitives
│   │   │   └── shared/            # composite components reused across modules (StatCard, EmptyState...)
│   │   ├── layouts/                # AdminLayout, CustomerLayout, PublicLayout, AuthLayout
│   │   ├── pages/                  # route-level components, one folder per module
│   │   │   ├── landing/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── staff/
│   │   │   └── customer/
│   │   ├── features/                # module-scoped logic: e.g. features/orders/{api, hooks, components}
│   │   ├── hooks/                   # cross-cutting hooks (useAuth, useDebounce, usePagination)
│   │   ├── contexts/                 # AuthContext, ThemeContext, CartContext
│   │   ├── services/                  # axios instance, API client wrappers per domain
│   │   ├── utils/                     # formatters, validators, helpers (pure functions)
│   │   ├── constants/                  # enums mirrored from backend (order status, roles)
│   │   ├── types/                       # shared TS types/interfaces (or JSDoc if plain JS)
│   │   ├── routes/                       # route definitions, ProtectedRoute, RoleRoute
│   │   └── App.jsx / main.jsx
│   └── tailwind.config.js
│
├── backend/                        # Node + Express API
│   ├── src/
│   │   ├── config/                  # env loader, db client, cors, constants
│   │   ├── routes/                   # thin route files per module, mount controllers
│   │   ├── controllers/              # HTTP layer only: parse request, call service, shape response
│   │   ├── services/                  # business logic — the actual "what happens" layer
│   │   ├── repositories/               # Prisma queries isolated here, so services never import Prisma directly
│   │   ├── middleware/                  # authenticate, authorize(role), errorHandler, validateRequest
│   │   ├── validation/                   # request schemas (e.g. zod/joi) per module
│   │   ├── utils/                         # token signing, password hashing, response helpers
│   │   └── app.js / server.js
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.js
│
├── docs/                            # this blueprint and future phase docs
└── postman/                          # exported Postman collections per module
```

**Why this shape**
- **`components` vs `pages` vs `features`** — this is the single most important separation for avoiding "student CRUD" sprawl. `components/ui` never knows about orders or menus; `features/orders` owns its API calls, hooks, and order-specific components; `pages` just assembles layout + features for a route. This means an Order card component isn't duplicated between the Admin dashboard and the Customer order-tracking screen — it lives once in `features/orders/components` and both pages import it.
- **`controllers → services → repositories`** on the backend is a strict one-way dependency: controllers never touch Prisma, services never touch `req`/`res`. This is what makes business logic unit-testable without spinning up Express, and what lets us swap Prisma for something else later without touching a single controller.
- **`validation/` as its own layer** keeps Zod/Joi schemas out of controllers, so the same schema can validate both a create and an update path without duplication.
- **Future scalability** — because modules are folder-isolated on both sides (`features/inventory`, `services/inventory`), a module can be lifted into its own package or microservice later by moving a folder, not by disentangling logic scattered across the codebase.

---

## Step 5 — Page Flow

```
Landing Page (public)
 ├─ Login
 ├─ Register (Customer self-signup)
 └─ [role-based redirect after auth]

Login
 ├─→ Admin Dashboard
 ├─→ Staff Dashboard
 └─→ Customer App

ADMIN DASHBOARD
 ├─ Overview (stats, charts, quick actions)
 ├─ Menu
 │   ├─ Categories
 │   └─ Items → Item Detail/Edit
 ├─ Orders
 │   ├─ Active Orders
 │   └─ Order Detail
 ├─ Tables & Reservations
 │   ├─ Floor View
 │   └─ Reservation List → Reservation Detail
 ├─ Kitchen Display
 ├─ Billing
 │   ├─ Bill List
 │   └─ Bill Detail / Receipt
 ├─ Inventory
 │   ├─ Stock List
 │   └─ Item Detail (adjust stock)
 ├─ Employees
 │   ├─ Staff List
 │   └─ Staff Detail/Edit
 ├─ Customers
 │   └─ Customer Detail (order history)
 ├─ Reports
 │   ├─ Sales
 │   ├─ Top Items
 │   └─ Revenue Trends
 ├─ Activity Log
 ├─ Settings
 │   ├─ Restaurant Profile
 │   └─ Tax/Currency Config
 └─ Profile

STAFF DASHBOARD
 ├─ Overview (today's tables/orders at a glance)
 ├─ Orders (create/manage)
 ├─ Tables & Reservations
 ├─ Kitchen Display (if department = KITCHEN, this is the landing screen)
 ├─ Billing (create/mark paid)
 └─ Profile

CUSTOMER APP
 ├─ Browse Menu (by category)
 │   └─ Food Detail
 ├─ Cart
 ├─ Checkout
 ├─ Order Tracking (live status)
 ├─ Order History
 │   └─ Order Detail → Leave Review
 └─ Profile

GLOBAL
 ├─ 404 Not Found
 └─ 401 / Unauthorized
```

---

## Step 6 — Feature Roadmap

| Phase | Goal | Deliverables | Complexity | Dependencies |
|---|---|---|---|---|
| 1. Architecture | Blueprint & shared understanding | This document, approved | Low | — |
| 2. Database | Normalized schema, Prisma models, migrations, seed data | `schema.prisma`, ERD, seed script | Medium | Phase 1 |
| 3. Authentication | Secure identity + RBAC | Register/login endpoints, JWT middleware, role guards, password reset | Medium | Phase 2 |
| 4. Landing Page | Public marketing site | Hero → Footer, fully responsive | Medium (design-heavy) | Phase 1 (design system) |
| 5. Admin | Full admin dashboard + backend modules (Menu, Tables, Billing, Employees, Reports, Settings, Activity Log) | CRUD UI + API per module | High (largest phase — will be sub-split) | Phase 3 |
| 6. Customer | Customer-facing ordering app | Browse/cart/checkout/tracking/history/reviews | High | Phase 3, Phase 5 (menu/orders APIs) |
| 7. Staff | Staff operational dashboard | Orders, tables, billing UI scoped to staff permissions | Medium | Phase 5 (shared APIs) |
| 8. Kitchen | Kitchen display screen | Real-time-feeling order queue, status transitions | Medium | Phase 5 (orders) |
| 9. Inventory | Stock ledger | Item CRUD, adjustment log, low-stock indicator | Medium | Phase 2 |
| 10. Reports | Analytics | Charts over real order/billing data | Medium | Phase 5, Phase 6 (need real order data) |
| 11. Testing | Verification | Postman collections per module, critical-path manual QA | Medium | All feature phases |
| 12. Deployment | Ship it | Vercel (frontend), Render (backend), Neon (DB), env config, CI sanity checks | Medium | Phase 11 |

Note: Phase 5 ("Admin") is intentionally large because it's where most backend modules live. When we reach it, I'll split it into sub-phases per module (5a Menu, 5b Tables/Reservations, 5c Billing, 5d Employees, 5e Reports, 5f Settings) rather than building it as one monolithic chunk — same phase-gate discipline, finer grain.

---

## Step 7 — Landing Page Planning

| Section | Why it exists |
|---|---|
| **Hero** | First 3 seconds decide whether this looks like a real product. Clear value proposition + primary CTA (e.g. "See it in action" / "Get Started"), supported by a product screenshot/mockup — not stock photography. |
| **Features** | Translates modules (ordering, kitchen sync, billing, reports) into customer-facing benefits, not a feature dump — each tied to a concrete pain point from Step 1. |
| **How It Works** | 3–4 step visual walkthrough (Order → Kitchen → Serve → Bill) — builds trust by showing the workflow is simple, mirrors Step 10's staff workflow. |
| **System Preview** | Real dashboard/kitchen-display screenshots in a browser-chrome frame — this is what separates a SaaS landing page from a brochure; proof over promises. |
| **Statistics** | Credibility signals (e.g. "Orders processed," "Avg. order time reduced") — even placeholder-realistic numbers in a demo context establish scale/maturity. |
| **Testimonials** | Social proof — reduces perceived risk for a prospective restaurant owner evaluating the system. |
| **FAQ** | Pre-empts objections (pricing, setup time, hardware needs) before they become a support request. |
| **Footer** | Navigation, legal, contact — signals a finished, maintained product rather than a demo. |

---

## Step 8 — Admin Dashboard Planning

**Sidebar** (grouped, not flat — flat 15-item sidebars read as unplanned): Overview · Menu (Categories, Items) · Orders · Tables & Reservations · Kitchen · Billing · Inventory · Employees · Customers · Reports · Activity Log · Settings.

**Overview page widgets**
- Stat cards (4 across, responsive to 2/1): Today's Revenue, Active Orders, Occupied Tables, Low-Stock Items — each with a trend indicator (vs. yesterday), not just a bare number.
- Charts: Revenue trend (line, last 7/30 days), Order volume by hour (bar, today), Top-selling items (horizontal bar/donut).
- Quick actions: "New Order," "Add Menu Item," "View Kitchen Queue" — one-click access to the 3 most frequent admin tasks, not buried in nav.
- Recent activity table: latest orders or activity-log entries, with status badges.
- Reservations-today list: compact widget, not a full table, linking out to the full Reservations page.

**Interaction pattern**: every list-heavy page (Orders, Employees, Customers, Inventory) follows the same shape — filter/search bar, data table with sort, pagination, row-click → detail drawer or page, bulk/quick actions in a toolbar. Consistency here is what makes the dashboard feel like one product instead of fifteen separately-built screens.

---

## Step 9 — Customer Experience

```
Landing
  ↓
Browse Menu (filter by category, search)
  ↓
Food Detail (image, description, price, customization notes)
  ↓
Cart (persisted client-side + synced on auth, quantity edit)
  ↓
Checkout (order type: dine-in table# / takeaway, review items, notes)
  ↓
Payment (v1: choose method — cash/card at counter — recorded, not processed online)
  ↓
Order Tracking (live-feeling status: Confirmed → Preparing → Ready → Served)
  ↓
Order History (past orders, reorder shortcut)
  ↓
Review (rate completed order/items)
```

Every step needs its own loading, empty, and error state (e.g., empty cart isn't a blank page — it's a designed empty state with a CTA back to the menu). This is called out explicitly because it's the detail that most separates "premium SaaS" from "CRUD demo."

---

## Step 10 — Staff / Kitchen Workflow

```
Order Created (by Staff or Customer)
        ↓  status = PENDING
Order Confirmed (staff verifies, sends to kitchen)
        ↓  status = CONFIRMED
Kitchen picks it up
        ↓  status = PREPARING
Kitchen marks done
        ↓  status = READY
Staff serves to table / hands over for takeaway
        ↓  status = SERVED
Bill generated & paid
        ↓  status = COMPLETED

Alternate path at any pre-SERVED state: status = CANCELLED (requires a reason, logged to Activity Log)
```

Each transition is a distinct, guarded state change (not a free-text status field) — this is what makes the Kitchen Display reliable: it only ever needs to query `status IN (CONFIRMED, PREPARING)` and doesn't need to interpret ambiguous states.

---

## Step 11 — Database Planning (Entities Only — No Prisma Yet)

| Entity | Purpose | Key Relationships |
|---|---|---|
| **User** | Single identity table for all roles (`role` enum: ADMIN/STAFF/CUSTOMER); avoids premature splitting since Admin/Customer need almost no divergent fields | Has one `StaffProfile` if role = STAFF; referenced by Orders, Reservations, Reviews, Notifications, ActivityLog |
| **StaffProfile** | Staff-only attributes that don't belong on every user (employee ID, department, hire date) | Belongs to one `User` |
| **Category** | Groups menu items for browsing/organization | Has many `Food` |
| **Food** | A sellable menu item | Belongs to one `Category`; referenced by `OrderItem`, `Review` |
| **Table** | A physical dine-in table | Has many `Reservation`, referenced by `Order` |
| **Reservation** | A booked table slot for a customer | Belongs to one `Table`, one `User` (customer) |
| **Order** | Core transactional record — one customer visit/purchase | Belongs to one `Table` (nullable, for takeaway), one `User` (customer, nullable for walk-in/staff-entered), one `User` (staff who handled it); has many `OrderItem`; has one `Bill` |
| **OrderItem** | Line item within an order, snapshots price at time of order | Belongs to one `Order`, one `Food` |
| **Bill** | Financial close-out of an order | Belongs to one `Order` (1:1) |
| **InventoryItem** | A trackable stock item (ingredient/supply) | Has many `InventoryTransaction` |
| **InventoryTransaction** | Append-only ledger entry (restock/usage/adjustment) — chosen over directly mutating a stock number so every change is auditable and reversible | Belongs to one `InventoryItem`, one `User` (who made the change) |
| **Review** | Customer feedback on a completed order/item | Belongs to one `User` (customer), one `Order` or `Food` |
| **Notification** | In-app message to a user | Belongs to one `User` |
| **ActivityLog** | Audit trail of sensitive actions | Belongs to one `User` (actor) |
| **RestaurantSettings** | Singleton config row (name, address, tax rate, currency, opening hours) | Standalone, no FK — v1 is single-restaurant so this is one row, not a `Restaurant` table; becomes the natural seam if multi-tenant is added later |

Deliberately **excluded from v1** (documented for later, not built): `Coupon`, `LoyaltyPoint`, `Supplier` as its own entity (kept as a plain text field on `InventoryItem` for now — a full Supplier table with purchase orders is real scope, not a field), `Restaurant` (multi-tenant root).

---

## Step 12 — API Planning (Groups Only)

| API Group | Why it exists as its own group |
|---|---|
| **Auth** | Identity is cross-cutting — every other group depends on it, so it's versioned and secured independently |
| **Menu** (categories + foods) | Read-heavy, publicly exposed to Customer app as well as Admin — needs different auth rules per verb (public GET, protected POST/PUT/DELETE) |
| **Orders** | The busiest, most stateful group — shared by Staff (create/manage) and Customer (create own, view own) with different scoping |
| **Tables & Reservations** | Grouped together since a reservation always resolves to a table; kept out of Orders since a table can exist with no active order |
| **Kitchen** | Thin, read-mostly slice over Orders filtered by status — separated so kitchen polling doesn't share rate/caching characteristics with general order CRUD |
| **Billing** | Financial data warrants its own access boundary (Staff can create, only Admin can see aggregate financial reports) |
| **Inventory** | Independent lifecycle from orders in v1 (manual), so it doesn't entangle with Orders |
| **Employees** | Admin-only; distinct from Auth because it's managing *other* users' records, not the caller's own session |
| **Customers** | Admin-only read access into customer data/order history — kept separate from Employees since permissions and shape differ completely |
| **Reports** | Read-only, aggregate/derived data — never mutates anything, so it's cleanly separable and cacheable |
| **Settings** | Singleton config, Admin-only — isolated so it can have stricter rate limiting/audit than regular CRUD |
| **Profile** | "My own account" operations, available to every authenticated role — separated from Employees/Customers which are *admin acting on others* |
| **Notifications** | Cross-cutting but user-scoped; separated so it can later become event-driven without touching other groups |
| **Activity Log** | Read-only audit surface, Admin-only |

---

## Step 13 — Design System

**Palette philosophy**: one dark neutral for structure/text (Linear/Vercel-style restraint), one warm accent that signals "food" without becoming garish, and strict, boring, correct semantic colors for status. No secondary "brand blue" competing with the accent — that's how dashboards end up looking like every Bootstrap admin template.

| Token | Role | Direction |
|---|---|---|
| `neutral-950` → `neutral-50` | Text, backgrounds, borders, surfaces | Near-black slate scale (not pure gray) for depth; dark mode simply inverts the scale |
| `accent` (single hue, e.g. warm amber/terracotta) | Primary buttons, active nav state, links, focus rings | One accent only — used sparingly, never as a background flood |
| `success` (green) | Paid, completed, available, in-stock | Muted, not neon |
| `warning` (amber) | Low stock, pending, reserved | Distinct from accent hue to avoid confusion |
| `danger` (red) | Cancelled, unpaid overdue, destructive actions | Reserved strictly for genuinely negative states |

**Typography**: one geometric/humanist sans (e.g. Inter or similar) for all UI — headings via weight/size scale, not a second display font, to keep the dashboard calm; landing page may use a slightly larger hero weight from the same family for consistency.

**Spacing & radius**: 4px base spacing scale (4/8/12/16/24/32/48/64). Radius scale: `sm` (inputs, badges), `md` (cards, buttons), `lg` (modals, panels) — consistent radius per component *type*, never mixed within one screen.

**Component inventory** (each needs default/hover/active/disabled/loading/error states designed up front, not improvised per page): Button (primary/secondary/ghost/destructive), Card, Input/Select/Textarea, Badge (status-colored), Table (with sort/pagination), Modal/Drawer, Toast, Skeleton loader, Chart wrapper (consistent axis/legend/tooltip styling — see the dataviz approach when we build these), Empty State, Icon set (one consistent icon library throughout, e.g. Lucide — never mixing icon sets).

**Dark mode**: CSS-variable-driven (Tailwind `dark:` class strategy), not a separate stylesheet — every color token above has a dark-mode counterpart defined once at the token layer, so components never hardcode light-only colors.

---

## Step 14 — Coding Standards

| Category | Convention |
|---|---|
| Folders | `kebab-case` (e.g. `order-details/`) |
| React component files | `PascalCase.jsx` (e.g. `OrderCard.jsx`) |
| Non-component files (hooks, utils, services) | `camelCase.js` (e.g. `useOrders.js`, `formatCurrency.js`) |
| React components/functions | `PascalCase` for components, `camelCase` for functions/variables |
| Backend files (controllers/services/repositories) | `camelCase` with suffix (e.g. `order.controller.js`, `order.service.js`, `order.repository.js`) |
| Database tables/columns (Prisma models) | `PascalCase` model names (e.g. `Order`), `camelCase` fields — Prisma maps to `snake_case` table/columns via `@@map`/`@map` for idiomatic Postgres naming underneath |
| API routes | `kebab-case`, plural nouns, versioned (e.g. `/api/v1/order-items`) |
| Git branches | `type/short-description` (e.g. `feature/menu-crud`, `fix/order-status-bug`) |
| Git commits | Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`) — keeps history scannable and could drive a changelog later |
| Formatting | Prettier + ESLint enforced, no manual style debates |

---

## Open Decisions Needing Your Sign-Off

1. **Kitchen as department, not role** (Step 2) — confirm this matches your proposal, or tell me if it must be a distinct role.
2. **Payment in v1 is "recorded," not "processed"** (Step 1/9) — no real payment gateway integration unless you want it pulled into scope now (it adds real complexity: PCI concerns, gateway SDK, webhook handling).
3. **Inventory is manual in v1**, not recipe-linked auto-deduction (Step 1/11) — confirm this is acceptable scope, since recipe-based deduction is a meaningfully larger feature.
4. **Single-restaurant** for v1, with the schema shaped so multi-tenant is an additive future change, not assumed now (Step 1/11).

This blueprint is the reference point for every phase from here on. Once you approve it (as-is or with corrections), Phase 2 (Database Design — ERD + Prisma schema) begins.
