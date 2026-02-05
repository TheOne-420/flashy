import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  dialect: "postgresql",
  schema: ["./src/**/*.sql.ts"],
  out: "./src/db/migrations",
  casing: "snake_case",
  verbose: true,
  strict: true,
});
