import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps.helper";

export const roleEnum = t.pgEnum("role", ["admin", "member"]);
export const users = t.pgTable("users_tbl", {
  id: t.uuid().defaultRandom().primaryKey(),
  name: t.text(),
  bio: t.text(),
  avatar: t.text(),
  username: t.text().unique().notNull(),
  email: t.text().unique().notNull(),
  emailVerifiedAt: t.timestamp(),
  password: t.text(),
  role: roleEnum("role").notNull().default("member"),
  ...timestamps,
});

export type User = typeof users.$inferSelect;