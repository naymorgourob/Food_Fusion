// Prisma CLI config (generate/migrate). Kept as plain .js, not .ts — this is
// a JavaScript project everywhere else, so no TypeScript toolchain is added
// just for one config file.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
