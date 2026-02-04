import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DB_URL as string,
  },
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  casing: "snake_case",
  verbose: true,
});
