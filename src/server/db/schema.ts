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
  }),
);

export const statusEnum = pgEnum("status", [
  "INPROGRESS",
  "COMPLETED",
  "FLAGGED",
  "CANCELLED",
]);

export const customers = pgTable(
  "customers",
  {
    id: serial("id")
      .primaryKey()
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
    email: varchar("email", { length: 256 }),
    address: text("address"),
    notes: text("notes"),
    totalOrders: serial("total_orders").default(0).notNull(),
    totalSpent: text("total_spent").default("0"),
    lastOrderDate: timestamp("last_order_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    phoneIdx: index("customer_phone_idx").on(table.phoneNumber),
    userIdIdx: index("customer_user_id_idx").on(table.userId),
  }),
);

export const receipts = pgTable(
  "receipts",
  {
    id: serial("id")
      .primaryKey()
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    customerId: serial("customer_id")
      .references(() => customers.id, { onDelete: "set null", onUpdate: "cascade" }),
    buyer: varchar("buyer", { length: 256 }),
    phoneNumber: varchar("phone_number", { length: 15 }),
    address: varchar("address", { length: 256 }),
    purchaseDate: timestamp("purchase_date", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    productDescription: text("product_description"),
    additionalData: text("additional_data"),
    totalAmount: text("total_amount").default("0"),
    status: statusEnum("status").default("INPROGRESS"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    idIdx: index("receipt_buyer_idx").on(table.buyer),
    customerIdIdx: index("receipt_customer_id_idx").on(table.customerId),
    userIdIdx: index("receipt_user_id_idx").on(table.userId),
    statusIdx: index("receipt_status_idx").on(table.status),
  }),
);

export const orderNotes = pgTable(
  "order_notes",
  {
    id: serial("id")
      .primaryKey()
      .notNull(),
    receiptId: serial("receipt_id")
      .references(() => receipts.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    receiptIdIdx: index("order_note_receipt_id_idx").on(table.receiptId),
  }),
);
