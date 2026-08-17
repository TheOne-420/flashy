import { relations } from "drizzle-orm";
import { pgTable, text, integer, real, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { user } from "./auth.sql";
import { deck } from "./flashcards.sql";

export const studySession = pgTable(
  "study_session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    deckId: uuid("deck_id")
      .notNull()
      .references(() => deck.id, { onDelete: "cascade" }),
    cardsReviewed: integer("cards_reviewed").default(0).notNull(),
    xpEarned: integer("xp_earned").default(0).notNull(),
    accuracy: real("accuracy").default(0).notNull(),
    duration: integer("duration").default(0).notNull(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    index("studySession_userId_idx").on(table.userId),
    index("studySession_deckId_idx").on(table.deckId),
    index("studySession_completedAt_idx").on(table.completedAt),
  ],
);

export const studySessionRelations = relations(studySession, ({ one }) => ({
  user: one(user, {
    fields: [studySession.userId],
    references: [user.id],
  }),
  deck: one(deck, {
    fields: [studySession.deckId],
    references: [deck.id],
  }),
}));
