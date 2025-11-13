# Server Actions

Server Actions are Next.js 14's approach to handling server-side logic, providing type-safe API endpoints without a separate backend layer.

## Overview

Server Actions in Indorder handle:
- User management
- Order/receipt operations
- WhatsApp integration
- Database queries

**Location**: `src/actions/`

## User Actions

User management operations including creation, retrieval, and status updates.

**Location**: `src/actions/user.ts`

### Create User

Create a new user account with business information.

```typescript
export async function createUser(
  name: string,
  businessName: string,
  email: string,
  phoneNumber: string,
  businessDescription: string,
  welcomeMessage: string
) {
  "use server";

  try {
    const newUser = await db
      .insert(users)
      .values({
        name,
        businessName,
        email,
        phoneNumber,
        businessDescription,
        welcomeMessage,
        listenerStatus: "INITIALIZING",
      })
      .returning();

    return newUser[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}
```

**Usage**:
```typescript
// In a form submission handler
const handleSubmit = async (formData: FormData) => {
  const user = await createUser(
    formData.get("name"),
    formData.get("businessName"),
    formData.get("email"),
    formData.get("phoneNumber"),
    formData.get("businessDescription"),
    formData.get("welcomeMessage")
  );

  redirect(`/connect/${user.id}`);
};
```

### Get User by Email

Retrieve user information by email address.

**Location**: `src/actions/user.ts:4`

```typescript
export async function getUserByEmail(email: string) {
  "use server";

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
```

**Usage**:
```typescript
// Check if user exists before sign-up
const { user } = await currentUser();
const existingUser = await getUserByEmail(user.emailAddress);

if (!existingUser) {
  redirect("/setup");
}
```

### Get Listener Status

Check the WhatsApp connection status for a user.

**Location**: `src/actions/user.ts:23`

```typescript
export async function getListenerStatus(userId: number) {
  "use server";

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user?.listenerStatus ?? "INITIALIZING";
  } catch (error) {
    console.error("Error fetching listener status:", error);
    return "EXITED";
  }
}
```

**Usage**:
```typescript
// Poll for connection status
useEffect(() => {
  const checkStatus = async () => {
    const status = await getListenerStatus(userId);

    if (status === "RUNNING") {
      setConnected(true);
    }
  };

  const interval = setInterval(checkStatus, 5000);
  return () => clearInterval(interval);
}, [userId]);
```

## Receipt Actions

Operations for managing order receipts.

**Location**: `src/actions/receipts.ts`

### Get Receipts for User

Retrieve all receipts/orders for a specific user.

**Location**: `src/actions/receipts.ts:4`

```typescript
export async function getReceiptsForUser(userId: number) {
  "use server";

  try {
    const userReceipts = await db.query.receipts.findMany({
      where: eq(receipts.userId, userId),
      orderBy: (receipts, { desc }) => [desc(receipts.purchaseDate)],
    });

    return userReceipts;
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return [];
  }
}
```

**Usage**:
```typescript
// Load orders in dashboard
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const orders = await getReceiptsForUser(user.id);

  return <DashboardClient initialReceipts={orders} />;
}
```

### Create Receipt

Create a new order receipt (typically called by backend after AI parsing).

```typescript
export async function createReceipt(data: {
  userId: number;
  buyerName: string;
  buyerPhoneNumber: string;
  buyerAddress: string;
  productDescription: string;
}) {
  "use server";

  try {
    const newReceipt = await db
      .insert(receipts)
      .values({
        ...data,
        purchaseDate: new Date(),
        orderStatus: "INPROGRESS",
      })
      .returning();

    revalidatePath("/dashboard");
    return newReceipt[0];
  } catch (error) {
    console.error("Error creating receipt:", error);
    throw new Error("Failed to create receipt");
  }
}
```

### Update Receipt Status

Update the status of an order.

```typescript
export async function updateReceiptStatus(
  receiptId: number,
  status: "INPROGRESS" | "COMPLETED" | "FLAGGED" | "CANCELLED"
) {
  "use server";

  try {
    await db
      .update(receipts)
      .set({ orderStatus: status })
      .where(eq(receipts.id, receiptId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating receipt:", error);
    throw new Error("Failed to update receipt status");
  }
}
```

**Usage**:
```typescript
// Mark order as completed
const handleComplete = async () => {
  await updateReceiptStatus(orderId, "COMPLETED");
  toast.success("Order marked as completed");
};
```

### Delete Receipt

Delete an order receipt.

```typescript
export async function deleteReceipt(receiptId: number) {
  "use server";

  try {
    await db
      .delete(receipts)
      .where(eq(receipts.id, receiptId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting receipt:", error);
    throw new Error("Failed to delete receipt");
  }
}
```

## WhatsApp Actions

WhatsApp integration operations.

**Location**: `src/actions/whatsapp.ts`

### Initialize WhatsApp Connection

Start the WhatsApp connection process.

```typescript
export async function initializeWhatsAppConnection(userId: number) {
  "use server";

  try {
    // Update user status to INITIALIZING
    await db
      .update(users)
      .set({ listenerStatus: "INITIALIZING" })
      .where(eq(users.id, userId));

    // Trigger backend to generate QR code
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/connect/${userId}`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error("Failed to initialize connection");
    }

    return { success: true };
  } catch (error) {
    console.error("Error initializing WhatsApp:", error);
    throw new Error("Failed to initialize WhatsApp connection");
  }
}
```

### Update Connection Status

Update the WhatsApp listener status (called by backend webhook).

```typescript
export async function updateConnectionStatus(
  userId: number,
  status: "INITIALIZING" | "RUNNING" | "EXITED"
) {
  "use server";

  try {
    await db
      .update(users)
      .set({ listenerStatus: status })
      .where(eq(users.id, userId));

    revalidatePath(`/connect/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating connection status:", error);
    throw new Error("Failed to update connection status");
  }
}
```

## Server Action Best Practices

### 1. Always Use "use server" Directive

```typescript
export async function myServerAction() {
  "use server";
  // Server-side code only
}
```

### 2. Validate Input Data

```typescript
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1).max(256),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\+?\d{10,15}$/),
});

export async function createUser(data: unknown) {
  "use server";

  // Validate input
  const validatedData = userSchema.parse(data);

  // Proceed with validated data
  return await db.insert(users).values(validatedData);
}
```

### 3. Handle Errors Gracefully

```typescript
export async function getUserByEmail(email: string) {
  "use server";

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: "Failed to fetch user",
    };
  }
}
```

### 4. Use Revalidation for Data Updates

```typescript
import { revalidatePath } from "next/cache";

export async function updateReceipt(id: number, data: Partial<Receipt>) {
  "use server";

  await db.update(receipts).set(data).where(eq(receipts.id, id));

  // Revalidate the dashboard page to show updated data
  revalidatePath("/dashboard");
}
```

### 5. Return Serializable Data

Server Actions can only return JSON-serializable data:

```typescript
// ✅ Good - Serializable
export async function getUser(id: number) {
  "use server";
  const user = await db.query.users.findFirst(...);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(), // Convert Date to string
  };
}

// ❌ Bad - Non-serializable
export async function getUser(id: number) {
  "use server";
  const user = await db.query.users.findFirst(...);

  return {
    ...user,
    createdAt: user.createdAt, // Date object not serializable
    complexFunction: () => {}, // Functions not serializable
  };
}
```

## Security Considerations

### 1. Authentication

Always verify user authentication:

```typescript
import { auth } from "@clerk/nextjs/server";

export async function deleteReceipt(receiptId: number) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify user owns the receipt
  const receipt = await db.query.receipts.findFirst({
    where: eq(receipts.id, receiptId),
  });

  const user = await getUserByClerkId(userId);

  if (receipt.userId !== user.id) {
    throw new Error("Forbidden");
  }

  await db.delete(receipts).where(eq(receipts.id, receiptId));
}
```

### 2. Rate Limiting

Implement rate limiting for sensitive operations:

```typescript
import { ratelimit } from "~/lib/ratelimit";

export async function createUser(data: UserData) {
  "use server";

  const { userId } = await auth();
  const { success } = await ratelimit.limit(userId);

  if (!success) {
    throw new Error("Rate limit exceeded");
  }

  // Proceed with creation
}
```

### 3. Input Sanitization

Sanitize user inputs to prevent injection:

```typescript
import { sanitize } from "~/lib/sanitize";

export async function createReceipt(data: ReceiptData) {
  "use server";

  const sanitizedData = {
    ...data,
    buyerName: sanitize(data.buyerName),
    productDescription: sanitize(data.productDescription),
  };

  return await db.insert(receipts).values(sanitizedData);
}
```

## Testing Server Actions

### Unit Testing

```typescript
import { describe, it, expect, vi } from "vitest";
import { getUserByEmail } from "~/actions/user";

describe("getUserByEmail", () => {
  it("should return user when email exists", async () => {
    const user = await getUserByEmail("test@example.com");
    expect(user).toBeDefined();
    expect(user.email).toBe("test@example.com");
  });

  it("should return null when email doesn't exist", async () => {
    const user = await getUserByEmail("nonexistent@example.com");
    expect(user).toBeNull();
  });
});
```

### Integration Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "~/app/(protected)/dashboard/page";

describe("Dashboard Integration", () => {
  it("should load and display user receipts", async () => {
    render(<DashboardPage />);

    // Wait for receipts to load
    await screen.findByText("Order #1");

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

## Performance Optimization

### 1. Parallel Data Fetching

```typescript
export async function getDashboardData(userId: number) {
  "use server";

  // Fetch data in parallel
  const [user, receipts, analytics] = await Promise.all([
    getUserById(userId),
    getReceiptsForUser(userId),
    getAnalytics(userId),
  ]);

  return { user, receipts, analytics };
}
```

### 2. Caching

```typescript
import { unstable_cache } from "next/cache";

export const getReceiptsForUser = unstable_cache(
  async (userId: number) => {
    return await db.query.receipts.findMany({
      where: eq(receipts.userId, userId),
    });
  },
  ["receipts"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["receipts"],
  }
);
```

### 3. Pagination

```typescript
export async function getReceiptsPaginated(
  userId: number,
  page: number = 1,
  limit: number = 20
) {
  "use server";

  const offset = (page - 1) * limit;

  const [receipts, total] = await Promise.all([
    db.query.receipts.findMany({
      where: eq(receipts.userId, userId),
      limit,
      offset,
      orderBy: (receipts, { desc }) => [desc(receipts.purchaseDate)],
    }),
    db
      .select({ count: sql`count(*)` })
      .from(receipts)
      .where(eq(receipts.userId, userId)),
  ]);

  return {
    receipts,
    total: total[0].count,
    pages: Math.ceil(total[0].count / limit),
  };
}
```

## Related Documentation

- [Database Schema](../architecture/database-schema.md) - Database structure
- [System Overview](../architecture/overview.md) - Architecture
- [Components](./components.md) - Frontend components
- [API Reference](../api/user-actions.md) - Detailed API docs

---

Server Actions provide a powerful, type-safe way to handle backend logic in Indorder without the complexity of a separate API layer.
