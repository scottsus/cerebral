# Dashboard

The Indorder dashboard is the central interface for managing orders, viewing analytics, and monitoring business performance.

## Overview

The dashboard provides two main views:
1. **Orders Tab** - View and manage all orders
2. **Analytics Tab** - Business metrics and insights

**Location**: `src/app/(protected)/dashboard/page.tsx`

## Architecture

```
Dashboard Page (Server Component)
    ↓
DashboardClient (Client Component)
    ├─ Orders Component
    │   └─ OrderInfo Component
    └─ Analytics Component
```

## Dashboard Layout

### Main Components

**Location**: `src/app/(protected)/dashboard/dashboardClient.tsx`

```typescript
export default function DashboardClient({
  initialReceipts,
  userName
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "completion">("orders");

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={userName} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Orders receipts={initialReceipts} />
          </TabsContent>

          <TabsContent value="completion">
            <Analytics receipts={initialReceipts} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
```

## Orders Tab

The Orders tab displays all orders in a table format with filtering and search capabilities.

**Location**: `src/app/(protected)/dashboard/orders.tsx`

### Features

#### Order Table

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Customer Name</TableHead>
      <TableHead>Phone Number</TableHead>
      <TableHead>Product</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredReceipts.map((receipt) => (
      <TableRow key={receipt.id}>
        <TableCell>{receipt.id}</TableCell>
        <TableCell>{receipt.buyerName}</TableCell>
        <TableCell>{receipt.buyerPhoneNumber}</TableCell>
        <TableCell>{truncate(receipt.productDescription)}</TableCell>
        <TableCell>
          <StatusBadge status={receipt.orderStatus} />
        </TableCell>
        <TableCell>
          {format(receipt.purchaseDate, "PPp")}
        </TableCell>
        <TableCell>
          <Button onClick={() => viewDetails(receipt.id)}>
            View Details
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Status Badges

Orders are displayed with color-coded status badges:

```typescript
function StatusBadge({ status }: { status: OrderStatus }) {
  const colors = {
    INPROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    FLAGGED: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <Badge className={colors[status]}>
      {status}
    </Badge>
  );
}
```

#### Filtering

Filter orders by status:

```typescript
const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

const filteredReceipts = receipts.filter((receipt) => {
  if (statusFilter === "ALL") return true;
  return receipt.orderStatus === statusFilter;
});
```

#### Search

Search orders by customer name, phone, or product:

```typescript
const [searchQuery, setSearchQuery] = useState("");

const searchedReceipts = filteredReceipts.filter((receipt) => {
  const query = searchQuery.toLowerCase();
  return (
    receipt.buyerName.toLowerCase().includes(query) ||
    receipt.buyerPhoneNumber.includes(query) ||
    receipt.productDescription.toLowerCase().includes(query)
  );
});
```

#### Sorting

Sort orders by date, status, or customer name:

```typescript
const [sortField, setSortField] = useState<"date" | "status" | "name">("date");
const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

const sortedReceipts = [...searchedReceipts].sort((a, b) => {
  if (sortField === "date") {
    return sortDirection === "desc"
      ? b.purchaseDate.getTime() - a.purchaseDate.getTime()
      : a.purchaseDate.getTime() - b.purchaseDate.getTime();
  }
  // ... other sort logic
});
```

## Order Details

View detailed information about a specific order.

**Location**: `src/app/(protected)/dashboard/orderinfo.tsx`

```typescript
export default function OrderInfo({ receipt }: { receipt: Receipt }) {
  return (
    <Dialog>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order #{receipt.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Section title="Customer Information">
            <Field label="Name" value={receipt.buyerName} />
            <Field label="Phone" value={receipt.buyerPhoneNumber} />
            <Field label="Address" value={receipt.buyerAddress} />
          </Section>

          <Section title="Order Details">
            <Field label="Product" value={receipt.productDescription} />
            <Field label="Status" value={receipt.orderStatus} />
            <Field
              label="Date"
              value={format(receipt.purchaseDate, "PPPppp")}
            />
          </Section>

          <Section title="Actions">
            <Button onClick={() => updateStatus("COMPLETED")}>
              Mark as Completed
            </Button>
            <Button variant="destructive" onClick={() => updateStatus("CANCELLED")}>
              Cancel Order
            </Button>
            <Button variant="outline" onClick={() => updateStatus("FLAGGED")}>
              Flag for Review
            </Button>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Update Order Status

```typescript
async function updateOrderStatus(orderId: number, newStatus: OrderStatus) {
  "use server";

  await db.update(receipts)
    .set({ orderStatus: newStatus })
    .where(eq(receipts.id, orderId));

  revalidatePath("/dashboard");
}
```

## Analytics Tab

View business metrics and order completion statistics.

**Location**: `src/app/(protected)/dashboard/analytics.tsx`

### Metrics Cards

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <MetricCard
    title="Total Revenue"
    value={`$${totalRevenue.toLocaleString()}`}
    icon={<DollarSign />}
  />
  <MetricCard
    title="Total Orders"
    value={totalOrders.toString()}
    icon={<ShoppingCart />}
  />
  <MetricCard
    title="Growth"
    value={`${growthPercentage}%`}
    icon={<TrendingUp />}
    trend={growthPercentage > 0 ? "up" : "down"}
  />
</div>
```

### Order Completion Chart

Pie chart showing order status distribution:

```typescript
import { Pie } from "react-chartjs-2";

const chartData = {
  labels: ["In Progress", "Completed", "Flagged", "Cancelled"],
  datasets: [{
    data: [
      receipts.filter(r => r.orderStatus === "INPROGRESS").length,
      receipts.filter(r => r.orderStatus === "COMPLETED").length,
      receipts.filter(r => r.orderStatus === "FLAGGED").length,
      receipts.filter(r => r.orderStatus === "CANCELLED").length,
    ],
    backgroundColor: [
      "rgba(59, 130, 246, 0.8)",  // Blue - In Progress
      "rgba(34, 197, 94, 0.8)",   // Green - Completed
      "rgba(234, 179, 8, 0.8)",   // Yellow - Flagged
      "rgba(239, 68, 68, 0.8)",   // Red - Cancelled
    ],
  }],
};

<Pie data={chartData} options={chartOptions} />
```

### Completion Rate

```typescript
const completionRate = (
  (receipts.filter(r => r.orderStatus === "COMPLETED").length / totalOrders) * 100
).toFixed(1);

<div className="text-center">
  <p className="text-5xl font-bold text-green-600">{completionRate}%</p>
  <p className="text-gray-600 mt-2">Order Completion Rate</p>
</div>
```

## Real-Time Updates

The dashboard automatically refreshes when new orders arrive:

```typescript
// Polling for new orders
useEffect(() => {
  const refreshData = async () => {
    const newReceipts = await getReceiptsForUser(userId);
    setReceipts(newReceipts);
  };

  const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds

  return () => clearInterval(interval);
}, [userId]);
```

### Server-Sent Events (Optional Enhancement)

For real-time updates without polling:

```typescript
// Create an EventSource connection
const eventSource = new EventSource(`/api/orders/stream?userId=${userId}`);

eventSource.onmessage = (event) => {
  const newOrder = JSON.parse(event.data);
  setReceipts(prev => [newOrder, ...prev]);
  toast.success("New order received!");
};

return () => eventSource.close();
```

## Protected Route

The dashboard is protected by Clerk authentication middleware.

**Location**: `src/middleware.ts`

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

## Data Loading

Orders are loaded server-side for optimal performance:

**Location**: `src/app/(protected)/dashboard/page.tsx:8`

```typescript
export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user from database
  const user = await getUserByClerkId(userId);

  if (!user) {
    redirect("/setup");
  }

  // Load orders
  const receipts = await getReceiptsForUser(user.id);

  return (
    <DashboardClient
      initialReceipts={receipts}
      userName={user.name}
    />
  );
}
```

## Responsive Design

The dashboard is fully responsive:

```typescript
<div className="container mx-auto px-4 py-8">
  {/* Mobile: Stack vertically */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <MetricCard />
    <MetricCard />
    <MetricCard />
  </div>

  {/* Tablet/Desktop: Side by side */}
  <div className="mt-8 overflow-x-auto">
    <Table />
  </div>
</div>
```

## Keyboard Shortcuts

Add keyboard shortcuts for power users:

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch(e.key) {
        case 'o':
          setActiveTab("orders");
          break;
        case 'a':
          setActiveTab("completion");
          break;
        case 'k':
          focusSearch();
          break;
      }
    }
  };

  window.addEventListener("keydown", handleKeyPress);
  return () => window.removeEventListener("keydown", handleKeyPress);
}, []);
```

## Export Functionality

Export orders to CSV:

```typescript
function exportToCSV(receipts: Receipt[]) {
  const headers = ["ID", "Customer", "Phone", "Product", "Status", "Date"];
  const rows = receipts.map(r => [
    r.id,
    r.buyerName,
    r.buyerPhoneNumber,
    r.productDescription,
    r.orderStatus,
    format(r.purchaseDate, "yyyy-MM-dd HH:mm:ss"),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
}
```

## Performance Optimization

### Virtualization for Large Lists

For displaying hundreds of orders:

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: receipts.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});

<div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
  <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
    {rowVirtualizer.getVirtualItems().map((virtualRow) => (
      <OrderRow key={virtualRow.key} receipt={receipts[virtualRow.index]} />
    ))}
  </div>
</div>
```

### Memoization

Prevent unnecessary re-renders:

```typescript
const filteredReceipts = useMemo(() => {
  return receipts.filter(/* filter logic */);
}, [receipts, statusFilter, searchQuery]);

const MemoizedOrderRow = memo(OrderRow);
```

## Related Documentation

- [Analytics](./analytics.md) - Detailed analytics features
- [WhatsApp Integration](./whatsapp-integration.md) - How orders arrive
- [Server Actions](../development/server-actions.md) - Backend operations
- [Components](../development/components.md) - UI component details

---

The dashboard is the heart of Indorder, providing a powerful yet intuitive interface for order management.
