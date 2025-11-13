// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const listenerStatusEnum = pgEnum("listener_status", [
  "INITIALIZING",
  "RUNNING",
  "EXITED",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey()
      .notNull(),
    businessName: text("business_name"),
    name: text("name"),
    email: text("email"),
    phoneNumber: varchar("phone_number", { length: 15 }),
    businessDescription: text("business_description"),
    welcomeMessage: text("welcome_message"),
    listenerStatus:
      listenerStatusEnum("listener_status").default("INITIALIZING"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    idIdx: index("user_id_idx").on(table.id),
    emailIdx: index("user_email_idx").on(table.email),
  }),
);

export const statusEnum = pgEnum("status", [
  "INPROGRESS",
  "COMPLETED",
  "FLAGGED",
  "CANCELLED",
]);

export const receipts = pgTable(
  "receipts",
  {
    id: serial("id")
      .primaryKey()
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    buyer: varchar("buyer", { length: 256 }),
    phoneNumber: varchar("phone_number", { length: 15 }),
    address: varchar("address", { length: 256 }),
    purchaseDate: timestamp("purchase_date", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    productDescription: text("product_description"),
    additionalData: text("additional_data"),
    status: statusEnum("status").default("INPROGRESS"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    buyerIdx: index("receipt_buyer_idx").on(table.buyer),
    userIdIdx: index("receipt_user_id_idx").on(table.userId),
    statusIdx: index("receipt_status_idx").on(table.status),
    purchaseDateIdx: index("receipt_purchase_date_idx").on(table.purchaseDate),
    createdAtIdx: index("receipt_created_at_idx").on(table.createdAt),
  }),
);
