# WhatsApp Integration

Indorder integrates with WhatsApp to enable businesses to receive and process orders directly through WhatsApp messages. This document explains how the WhatsApp integration works.

## Overview

The WhatsApp integration allows business owners to:
1. Connect their WhatsApp account via QR code
2. Receive customer messages automatically
3. Have AI parse messages into structured orders
4. View and manage orders through the dashboard

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   WhatsApp      │         │   Backend        │         │  Indorder   │
│   Mobile App    │◄────────┤   Service        ├────────►│  Frontend   │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   PostgreSQL     │
                            │   Database       │
                            └──────────────────┘
```

## Connection Flow

### Step 1: Initial Setup

After completing the business setup form, users are redirected to the WhatsApp connection page:

**Location**: `src/app/connect/[userId]/page.tsx`

```typescript
export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <div>
      <QRCodeComponent userId={userId} />
      <StatusButton userId={userId} />
    </div>
  );
}
```

### Step 2: QR Code Generation

The QR code is fetched from the backend service and displayed to the user.

**Location**: `src/app/connect/[userId]/qr-code.tsx:24`

```typescript
useEffect(() => {
  const fetchQRCode = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/connect/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setQrCode(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchQRCode();
}, [userId]);
```

**Backend Endpoint**: `${BACKEND_URL}/connect/${userId}`
- **Method**: GET
- **Returns**: QR code image (PNG)
- **Headers**: `Content-Type: image/png`

### Step 3: User Scans QR Code

Users scan the QR code using their WhatsApp mobile app:

1. Open WhatsApp on mobile device
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Point camera at QR code

### Step 4: Connection Status Polling

While the user scans, the frontend polls the listener status.

**Location**: `src/app/connect/[userId]/status-button.tsx:15`

```typescript
useEffect(() => {
  const checkStatus = async () => {
    const status = await getListenerStatus(parseInt(userId));

    if (status === "RUNNING") {
      setIsConnected(true);
      setShowButton(true);
    } else if (status === "EXITED") {
      setError("Connection failed. Please try again.");
    }
  };

  const interval = setInterval(checkStatus, 5000); // Poll every 5 seconds
  checkStatus(); // Initial check

  return () => clearInterval(interval);
}, [userId]);
```

### Step 5: Status Verification

The status is checked via a server action:

**Location**: `src/actions/user.ts:23`

```typescript
export async function getListenerStatus(userId: number) {
  "use server";

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user?.listenerStatus ?? "INITIALIZING";
}
```

### Step 6: Redirect to Dashboard

Once status is "RUNNING", a button appears to navigate to the dashboard:

```typescript
{showButton && (
  <Link href="/dashboard">
    <Button>Go to Dashboard</Button>
  </Link>
)}
```

## Listener Status States

The `listener_status` field tracks the WhatsApp connection state:

| Status | Description | User Action |
|--------|-------------|-------------|
| `INITIALIZING` | QR code generated, waiting for scan | Scan QR code |
| `RUNNING` | WhatsApp connected and listening | Can proceed to dashboard |
| `EXITED` | Connection failed or terminated | Retry connection |

**Database Schema**: `src/server/db/schema.ts:13`

```typescript
export const listenerStatusEnum = pgEnum("listener_status", [
  "INITIALIZING",
  "RUNNING",
  "EXITED",
]);
```

## Backend Service Integration

The WhatsApp integration relies on an external backend service that handles:

### Connection Management
- QR code generation
- WhatsApp Web protocol handling
- Session persistence
- Device pairing

### Message Processing
- Webhook endpoints for incoming messages
- Message parsing and extraction
- AI integration for order parsing
- Database updates

### Configuration

Set the backend URL in your `.env` file:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.com
# or for local development
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## Server Actions

### Connect WhatsApp Device

**Location**: `src/actions/whatsapp.ts`

```typescript
"use server";

export async function connectWhatsApp(userId: number) {
  // Update user status to INITIALIZING
  await db.update(users)
    .set({ listenerStatus: "INITIALIZING" })
    .where(eq(users.id, userId));

  // Backend will update to RUNNING when connected
}
```

### Get Listener Status

**Location**: `src/actions/user.ts:23`

```typescript
"use server";

export async function getListenerStatus(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user?.listenerStatus ?? "INITIALIZING";
}
```

## Message Flow

Once WhatsApp is connected:

```
1. Customer sends message to business WhatsApp
        ↓
2. Backend service receives webhook
        ↓
3. Message sent to OpenAI for parsing
        ↓
4. Extracted order data structured
        ↓
5. Receipt created in database
        ↓
6. Dashboard updates with new order
```

## AI-Powered Order Parsing

The backend uses the business description and welcome message to provide context for AI parsing:

```typescript
// From setup form
const businessContext = {
  businessName: "Joe's Coffee Shop",
  businessDescription: "A cozy coffee shop serving artisan coffee",
  welcomeMessage: "Welcome! How can we help you today?"
};

// Used for AI context when parsing messages
const aiPrompt = `
You are processing orders for ${businessContext.businessName}.
Business description: ${businessContext.businessDescription}

Parse the following customer message and extract:
- Customer name
- Phone number
- Delivery address
- Product description

Customer message: "${customerMessage}"
`;
```

## Security Considerations

### Session Security
- WhatsApp sessions are stored securely on the backend
- QR codes expire after a short period
- Only authenticated users can generate QR codes

### Data Privacy
- Messages are processed server-side
- Customer data is encrypted in transit
- GDPR-compliant data handling

### Authentication
- User ID verification before QR code generation
- Clerk authentication required
- Protected API endpoints

## Troubleshooting

### QR Code Not Appearing

**Symptoms**: QR code fails to load

**Solutions**:
1. Check `NEXT_PUBLIC_BACKEND_URL` is correctly set
2. Verify backend service is running
3. Check network connectivity
4. Review browser console for errors

```typescript
// Add error handling
try {
  const response = await fetch(`${backendUrl}/connect/${userId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
} catch (error) {
  console.error("Failed to fetch QR code:", error);
}
```

### Status Stuck on "INITIALIZING"

**Symptoms**: Status never changes to "RUNNING"

**Solutions**:
1. Ensure QR code was scanned successfully
2. Check backend service logs
3. Verify database connection
4. Try disconnecting and reconnecting

```bash
# Check database status
psql -d indorder -c "SELECT id, email, listener_status FROM users;"
```

### Connection Drops

**Symptoms**: Status changes to "EXITED" unexpectedly

**Solutions**:
1. Check WhatsApp mobile app connection
2. Verify backend service stability
3. Review server logs for errors
4. Reconnect via QR code

## Best Practices

### 1. Handle Network Errors Gracefully

```typescript
const fetchWithRetry = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### 2. Provide Clear User Feedback

```typescript
<div className="status-indicator">
  {status === "INITIALIZING" && (
    <div className="animate-pulse">
      Waiting for WhatsApp connection...
    </div>
  )}
  {status === "RUNNING" && (
    <div className="text-green-600">
      ✓ WhatsApp connected successfully!
    </div>
  )}
  {status === "EXITED" && (
    <div className="text-red-600">
      ✗ Connection failed. Please try again.
    </div>
  )}
</div>
```

### 3. Implement Connection Health Checks

```typescript
// Periodically verify connection is still active
useEffect(() => {
  const healthCheck = setInterval(async () => {
    const status = await getListenerStatus(userId);
    if (status === "EXITED") {
      // Notify user and prompt reconnection
      toast.error("WhatsApp disconnected. Please reconnect.");
    }
  }, 60000); // Check every minute

  return () => clearInterval(healthCheck);
}, [userId]);
```

### 4. Log Connection Events

```typescript
// Track connection lifecycle for debugging
await logConnectionEvent({
  userId,
  event: "QR_CODE_GENERATED",
  timestamp: new Date(),
});

await logConnectionEvent({
  userId,
  event: "CONNECTION_ESTABLISHED",
  timestamp: new Date(),
});
```

## Testing WhatsApp Integration

### Local Testing

1. Start backend service locally
2. Configure `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`
3. Use a test WhatsApp account
4. Scan QR code and verify connection

### Test Scenarios

- ✅ QR code generation
- ✅ Successful connection
- ✅ Failed connection handling
- ✅ Status polling
- ✅ Network error recovery
- ✅ Multiple connection attempts

## Related Documentation

- [AI Order Processing](./ai-processing.md) - How messages are parsed
- [Dashboard](./dashboard.md) - Viewing received orders
- [System Overview](../architecture/overview.md) - Overall architecture
- [Server Actions](../development/server-actions.md) - Backend endpoints

---

The WhatsApp integration is the core feature that enables Indorder to receive and process orders seamlessly.
