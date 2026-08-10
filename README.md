# FoodFusion — Restaurant Management System

A full-stack restaurant management platform: menu, orders, tables & reservations, kitchen display, billing, inventory, staff, and reporting — built as a university Software Development sessional project, engineered to a production-quality standard.

**Status**: project foundation complete (this README describes what exists today). Authentication, dashboards, and feature modules are built in the parts that follow — see [Development Workflow](#development-workflow) below.

## Project overview

FoodFusion digitizes the day-to-day operation of a single restaurant: staff take and track orders from creation through the kitchen to billing, admins manage the menu/staff/inventory and see real sales data, and customers can browse the menu and place their own orders. The full requirements, database design, and UI/UX design system behind this build are in [`docs/`](./docs):

- [`docs/01-architecture-blueprint.md`](./docs/01-architecture-blueprint.md) — roles, modules, page flow, phase roadmap
- [`docs/02-database-design.md`](./docs/02-database-design.md) — entities, relationships, ER diagram
- [`docs/03-design-system.md`](./docs/03-design-system.md) — color/type/spacing tokens, component specs

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Tailwind CSS v4, Axios, Lucide React, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| ORM | Prisma ORM (driver-adapter mode, via `@prisma/adapter-pg`) |
| Auth | JWT + bcrypt (added in Part 6) |
| Tooling | ESLint, Prettier, nodemon |
| Deployment (planned) | Vercel (client), Render (server), Neon Postgres (database) |

## Folder structure

```
FoodFusion/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── assets/          # static images/icons
│       ├── components/      # reusable, presentation-only UI
│       ├── pages/           # one file per route (landing/, auth/, dashboard/)
│       ├── layouts/         # shared page chrome (Landing/Auth/Dashboard/Error)
│       ├── contexts/        # cross-cutting React state (theme; auth added in Part 6)
│       ├── hooks/           # reusable custom hooks
│       ├── services/        # the one Axios instance every API call goes through
│       ├── utils/           # pure helper functions (empty until one is actually needed)
│       ├── constants/       # roles, routes, theme keys
│       └── styles/          # global CSS + design tokens (Tailwind @theme)
│
├── server/                  # Express + Prisma backend
│   ├── src/
│   │   ├── controllers/     # request handlers (filled in starting Part 6)
│   │   ├── routes/          # one file per API group, mounted under /api/v1
│   │   ├── middlewares/     # notFound, errorHandler
│   │   ├── config/          # env loader, Prisma client singleton
│   │   └── utils/           # ApiError, ApiResponse
│   └── prisma/
│       └── schema.prisma    # datasource + generator only — no models yet
│
├── docs/                    # approved planning documents (architecture, DB, design system)
├── README.md
└── .gitignore
```

## Installation guide

**Prerequisites**: Node.js 20+, npm, a PostgreSQL database (local or hosted — [Neon](https://neon.tech) works well for this stack).

```bash
git clone <repository-url> FoodFusion
cd FoodFusion
```

### Server setup

```bash
cd server
npm install
cp .env.example .env       # then fill in DATABASE_URL and JWT_SECRET
npm run prisma:generate    # generates the Prisma Client from schema.prisma
```

> **macOS note**: the default `PORT` is `5001`, not `5000` — port 5000 is claimed by the AirPlay Receiver service on macOS, which silently swallows requests instead of erroring.

### Client setup

```bash
cd client
npm install
cp .env.example .env       # points VITE_API_BASE_URL at the server above
```

## Run client

```bash
cd client
npm run dev
```

Runs at `http://localhost:5173`.

## Run server

```bash
cd server
npm run dev
```

Runs at `http://localhost:5001` (or whatever `PORT` is set to in `.env`). Confirm it's up:

```bash
curl http://localhost:5001/health
# {"success":true,"message":"FoodFusion API is running","data":null}
```

## Development workflow

- **Linting/formatting**: run `npm run lint` and `npm run format` inside whichever of `client/` or `server/` you're working in before committing.
- **Database changes**: once models exist, run `npm run prisma:migrate` inside `server/` to create a migration, and `npm run prisma:generate` to regenerate the client.
- **API response shape**: every backend endpoint responds `{ success, message, data }` on success or `{ success: false, message, details }` on error (see `server/src/utils/ApiResponse.js` and `server/src/middlewares/errorHandler.js`) — the frontend Axios layer can rely on this shape everywhere.
- **Adding a route**: create the endpoint in the relevant `server/src/routes/*.routes.js` file (already mounted in `server/src/routes/index.js`), with logic in a matching `controllers/` file.
- **Project phases**: this repository is built part-by-part with explicit sign-off between each — Part 5 (this foundation) is complete; Part 6 (Authentication & Authorization) is next.

## Git workflow

Branch naming: `type/short-description` (e.g. `feature/menu-crud`, `fix/order-status-bug`). Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
