# Database Schema

Indorder uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema is defined in `src/server/db/schema.ts`.

## Schema Overview

The database consists of two main tables:
1. **users** - Stores business and user information
2. **receipts** - Stores order/receipt data

## Tables

### Users Table

The `users` table stores information about businesses using Indorder.

**Location**: `src/server/db/schema.ts:18`

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  businessName: varchar("business_name", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
  businessDescription: text("business_description").notNull(),
  welcomeMessage: text("welcome_message").notNull(),
  listenerStatus: listenerStatusEnum("listener_status")
    .default("INITIALIZING")
    .notNull(),
});
```

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Auto-incrementing unique identifier |
| `businessName` | `varchar(256)` | NOT NULL | Name of the business |
| `name` | `varchar(256)` | NOT NULL | Owner/contact name |
| `email` | `varchar(256)` | UNIQUE, NOT NULL | User email address (unique) |
| `phoneNumber` | `varchar(15)` | NOT NULL | Contact phone number |
| `businessDescription` | `text` | NOT NULL | Description of business for AI context |
| `welcomeMessage` | `text` | NOT NULL | Automated welcome message for customers |
| `listenerStatus` | `enum` | NOT NULL, DEFAULT='INITIALIZING' | WhatsApp listener connection status |

#### Listener Status Enum

```typescript
export const listenerStatusEnum = pgEnum("listener_status", [
  "INITIALIZING",
  "RUNNING",
  "EXITED",
]);
```

**Status Values**:
- `INITIALIZING`: WhatsApp connection in progress
- `RUNNING`: WhatsApp successfully connected and listening
- `EXITED`: WhatsApp connection terminated or failed

**Usage Example**:
```typescript
// Query user with their listener status
const user = await db.query.users.findFirst({
  where: eq(users.email, "business@example.com")
});

if (user?.listenerStatus === "RUNNING") {
  console.log("WhatsApp is connected");
}
```

### Receipts Table

The `receipts` table stores order information parsed from WhatsApp messages.

**Location**: `src/server/db/schema.ts:32`

```typescript
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  buyerName: varchar("buyer_name", { length: 256 }).notNull(),
  buyerPhoneNumber: varchar("buyer_phone_number", { length: 15 }).notNull(),
  buyerAddress: text("buyer_address").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  productDescription: text("product_description").notNull(),
  orderStatus: orderStatusEnum("order_status")
    .default("INPROGRESS")
    .notNull(),
});
```

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `serial` | PRIMARY KEY | Auto-incrementing unique identifier |
| `userId` | `integer` | FOREIGN KEY, NOT NULL | References `users.id` (CASCADE DELETE) |
| `buyerName` | `varchar(256)` | NOT NULL | Customer name |
| `buyerPhoneNumber` | `varchar(15)` | NOT NULL | Customer phone number |
| `buyerAddress` | `text` | NOT NULL | Delivery/customer address |
| `purchaseDate` | `timestamp` | NOT NULL | Order timestamp |
| `productDescription` | `text` | NOT NULL | Full description of ordered products |
| `orderStatus` | `enum` | NOT NULL, DEFAULT='INPROGRESS' | Current order status |

#### Order Status Enum

```typescript
export const orderStatusEnum = pgEnum("order_status", [
  "INPROGRESS",
  "COMPLETED",
  "FLAGGED",
  "CANCELLED",
]);
```

**Status Values**:
- `INPROGRESS`: Order received, being processed
- `COMPLETED`: Order fulfilled and delivered
- `FLAGGED`: Order requires attention/review
- `CANCELLED`: Order cancelled by customer or business

**Status Workflow**:
```
INPROGRESS → COMPLETED
    ↓
  FLAGGED → COMPLETED/CANCELLED
    ↓
 CANCELLED
```

### Foreign Key Relationships

```
users (1) ────< (N) receipts
  id              userId
```

- Each user can have many receipts
- Each receipt belongs to exactly one user
- When a user is deleted, all their receipts are deleted (CASCADE)

## Indexes

### Automatic Indexes
- **Primary Keys**: Automatically indexed
  - `users.id`
  - `receipts.id`
- **Unique Constraints**: Automatically indexed
  - `users.email`

### Recommended Indexes (for performance)

For production deployments, consider adding these indexes:

```sql
-- Index on userId for faster receipt queries
CREATE INDEX idx_receipts_user_id ON receipts(user_id);

-- Index on orderStatus for status filtering
CREATE INDEX idx_receipts_order_status ON receipts(order_status);

-- Index on purchaseDate for date-based queries
CREATE INDEX idx_receipts_purchase_date ON receipts(purchase_date DESC);

-- Composite index for user's orders by status
CREATE INDEX idx_receipts_user_status ON receipts(user_id, order_status);
```

## Database Operations

### Creating a User

```typescript
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

const newUser = await db.insert(users).values({
  businessName: "Joe's Coffee Shop",
  name: "Joe Smith",
  email: "joe@coffeeshop.com",
  phoneNumber: "+1234567890",
  businessDescription: "A cozy coffee shop serving artisan coffee",
  welcomeMessage: "Welcome to Joe's Coffee Shop! How can we help you today?",
  listenerStatus: "INITIALIZING",
}).returning();
```

### Creating a Receipt

```typescript
import { db } from "~/server/db";
import { receipts } from "~/server/db/schema";

const newReceipt = await db.insert(receipts).values({
  userId: 1,
  buyerName: "Jane Doe",
  buyerPhoneNumber: "+1987654321",
  buyerAddress: "123 Main St, City, State 12345",
  purchaseDate: new Date(),
  productDescription: "2x Cappuccino, 1x Croissant",
  orderStatus: "INPROGRESS",
}).returning();
```

### Querying Receipts for a User

```typescript
import { db } from "~/server/db";
import { receipts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const userReceipts = await db.query.receipts.findMany({
  where: eq(receipts.userId, 1),
  orderBy: (receipts, { desc }) => [desc(receipts.purchaseDate)],
});
```

### Updating Order Status

```typescript
import { db } from "~/server/db";
import { receipts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

await db.update(receipts)
  .set({ orderStatus: "COMPLETED" })
  .where(eq(receipts.id, 42));
```

## Schema Migrations

### Push Schema Changes

For development, push schema changes directly:

```bash
npm run db:push
```

### Generate Migrations

For production, generate migration files:

```bash
npm run db:generate
```

This creates migration files in the `drizzle` directory.

### Run Migrations

Apply migrations to database:

```bash
npm run db:migrate
```

## Drizzle Studio

Explore your database visually:

```bash
npm run db:studio
```

This opens Drizzle Studio in your browser, allowing you to:
- View all tables and data
- Run queries
- Edit records
- Inspect relationships

## Type Safety

Drizzle ORM provides full TypeScript types:

```typescript
// Inferred types from schema
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

type Receipt = typeof receipts.$inferSelect;
type NewReceipt = typeof receipts.$inferInsert;

// Usage
const user: User = await db.query.users.findFirst(...);
const newReceipt: NewReceipt = {
  userId: user.id,
  buyerName: "Customer Name",
  // ... TypeScript ensures all required fields are present
};
```

## Data Validation

### Server-Side Validation

Always validate data before insertion:

```typescript
import { z } from "zod";

const receiptSchema = z.object({
  buyerName: z.string().min(1).max(256),
  buyerPhoneNumber: z.string().regex(/^\+?\d{10,15}$/),
  buyerAddress: z.string().min(1),
  productDescription: z.string().min(1),
});

// Validate before inserting
const validatedData = receiptSchema.parse(formData);
await db.insert(receipts).values({
  ...validatedData,
  userId: currentUserId,
  purchaseDate: new Date(),
  orderStatus: "INPROGRESS",
});
```

## Database Configuration

Database connection is configured in `src/server/db/index.ts`:

```typescript
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "~/env";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
```

## Connection Pooling

For production, consider using connection pooling:

```typescript
const conn = postgres(env.DATABASE_URL, {
  max: 10, // Maximum connections
  idle_timeout: 20,
  connect_timeout: 10,
});
```

## Backup and Recovery

### Manual Backup

```bash
pg_dump -h localhost -U user -d indorder > backup.sql
```

### Restore from Backup

```bash
psql -h localhost -U user -d indorder < backup.sql
```

### Automated Backups

For production, set up automated backups using:
- Cron jobs with `pg_dump`
- Cloud provider backup services (AWS RDS, Supabase, etc.)
- Continuous archiving with WAL

## Related Documentation

- [System Overview](./overview.md) - High-level architecture
- [Tech Stack](./tech-stack.md) - Database technology details
- [Server Actions](../development/server-actions.md) - Database operations
- [Deployment](../deployment/production.md) - Production database setup

---

This schema provides a solid foundation for order management while maintaining simplicity and performance.
