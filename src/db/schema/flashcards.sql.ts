import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  uuid,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth.sql";
import { timestamps } from "./timestamps.helper";

export const deck = pgTable(
  "deck",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("#6366f1"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isPublic: boolean("is_public").default(false).notNull(),
    originalDeckId: uuid("original_deck_id").references((): any => deck.id, { onDelete: "set null" }),
    forkCount: integer("fork_count").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("deck_userId_idx").on(table.userId),
    index("deck_isPublic_idx").on(table.isPublic),
  ],
);

export const card = pgTable(
  "card",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deckId: uuid("deck_id")
      .notNull()
      .references(() => deck.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    color: text("color"),
    starred: integer("starred").default(0).notNull(),
    ...timestamps,
  },
  (table) => [index("card_deckId_idx").on(table.deckId)],
);

export const cardProgress = pgTable(
  "card_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" })
      .unique(),
    easeFactor: real("ease_factor").default(2.5).notNull(),
    interval: integer("interval").default(0).notNull(),
    repetitions: integer("repetitions").default(0).notNull(),
    nextReviewAt: timestamp("next_review_at").defaultNow().notNull(),
    lastReviewedAt: timestamp("last_reviewed_at"),
    ...timestamps,
  },
  (table) => [
    index("cardProgress_cardId_idx").on(table.cardId),
    index("cardProgress_nextReviewAt_idx").on(table.nextReviewAt),
  ],
);

export const deckRelations = relations(deck, ({ one, many }) => ({
  user: one(user, {
    fields: [deck.userId],
    references: [user.id],
  }),
  cards: many(card),
  originalDeck: one(deck, {
    fields: [deck.originalDeckId],
    references: [deck.id],
  }),
}));

export const cardRelations = relations(card, ({ one, one: progressOne }) => ({
  deck: one(deck, {
    fields: [card.deckId],
    references: [deck.id],
  }),
  progress: one(cardProgress, {
    fields: [card.id],
    references: [cardProgress.cardId],
  }),
}));

export const cardProgressRelations = relations(cardProgress, ({ one }) => ({
  card: one(card, {
    fields: [cardProgress.cardId],
    references: [card.id],
  }),
}));
