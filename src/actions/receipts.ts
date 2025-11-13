"use server";

import { db } from "~/server/db";
import { receipts, statusEnum } from "~/server/db/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

// Error logging utility
function logError(operation: string, error: unknown, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${timestamp}] Error in ${operation}:`, {
    error: errorMessage,
    context,
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// Fetch all receipts by user ID with optional filters
export async function getAllReceiptsByUserId(
  userId: string,
  filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    sortBy?: "purchaseDate" | "createdAt" | "status";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }
) {
  try {
    let query = db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId));

    // Apply filters
    const conditions = [eq(receipts.userId, userId)];

    if (filters?.status) {
      conditions.push(eq(receipts.status, filters.status as any));
    }

    if (filters?.startDate) {
      conditions.push(gte(receipts.purchaseDate, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(receipts.purchaseDate, filters.endDate));
    }

    query = db
      .select()
      .from(receipts)
      .where(and(...conditions));

    // Apply sorting
    if (filters?.sortBy) {
      const sortColumn = receipts[filters.sortBy];
      query = query.orderBy(
        filters.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn)
      ) as any;
    } else {
      query = query.orderBy(desc(receipts.createdAt)) as any;
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query;
  } catch (error) {
    logError("getAllReceiptsByUserId", error, { userId, filters });
    throw error;
  }
}

// Fetch a receipt by ID
export async function getReceiptById(id: number) {
  try {
    const result = await db.select().from(receipts).where(eq(receipts.id, id));
    return result[0] ?? null;
  } catch (error) {
    logError("getReceiptById", error, { id });
    throw error;
  }
}

// Update receipt status
export async function updateReceiptStatus(
  id: number,
  status: "INPROGRESS" | "COMPLETED" | "FLAGGED" | "CANCELLED"
) {
  try {
    const result = await db
      .update(receipts)
      .set({ status, updatedAt: new Date() })
      .where(eq(receipts.id, id))
      .returning();

    return result[0] ?? null;
  } catch (error) {
    logError("updateReceiptStatus", error, { id, status });
    throw error;
  }
}

// Update full receipt
export async function updateReceipt(
  id: number,
  data: {
    buyer?: string;
    phoneNumber?: string;
    address?: string;
    productDescription?: string;
    additionalData?: string;
    status?: "INPROGRESS" | "COMPLETED" | "FLAGGED" | "CANCELLED";
  }
) {
  try {
    const result = await db
      .update(receipts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(receipts.id, id))
      .returning();

    return result[0] ?? null;
  } catch (error) {
    logError("updateReceipt", error, { id, data });
    throw error;
  }
}

// Delete receipt by ID
export async function deleteReceipt(id: number) {
  try {
    const result = await db
      .delete(receipts)
      .where(eq(receipts.id, id))
      .returning();

    return result[0] ?? null;
  } catch (error) {
    logError("deleteReceipt", error, { id });
    throw error;
  }
}

// Bulk update receipt statuses
export async function bulkUpdateReceiptStatus(
  ids: number[],
  status: "INPROGRESS" | "COMPLETED" | "FLAGGED" | "CANCELLED"
) {
  try {
    const results = await Promise.all(
      ids.map((id) => updateReceiptStatus(id, status))
    );
    return results.filter((r) => r !== null);
  } catch (error) {
    logError("bulkUpdateReceiptStatus", error, { ids, status });
    throw error;
  }
}

// Bulk delete receipts
export async function bulkDeleteReceipts(ids: number[]) {
  try {
    const results = await Promise.all(
      ids.map((id) => deleteReceipt(id))
    );
    return results.filter((r) => r !== null);
  } catch (error) {
    logError("bulkDeleteReceipts", error, { ids });
    throw error;
  }
}

// Get receipts count by status for a user
export async function getReceiptsCountByStatus(userId: string) {
  try {
    const result = await db
      .select({
        status: receipts.status,
        count: sql<number>`count(*)::int`,
      })
      .from(receipts)
      .where(eq(receipts.userId, userId))
      .groupBy(receipts.status);

    return result;
  } catch (error) {
    logError("getReceiptsCountByStatus", error, { userId });
    throw error;
  }
}

// Calculate total revenue from receipts
export async function calculateTotalRevenue(userId: string) {
  try {
    const allReceipts = await getAllReceiptsByUserId(userId);

    let totalRevenue = 0;

    for (const receipt of allReceipts) {
      if (receipt.productDescription) {
        const revenue = parseProductDescriptionForRevenue(receipt.productDescription);
        totalRevenue += revenue;
      }
    }

    return totalRevenue;
  } catch (error) {
    logError("calculateTotalRevenue", error, { userId });
    throw error;
  }
}

// Parse product description to extract prices and quantities
function parseProductDescriptionForRevenue(description: string): number {
  let total = 0;

  // Try to parse JSON format first
  try {
    const products = JSON.parse(description);
    if (Array.isArray(products)) {
      products.forEach((product: any) => {
        const quantity = parseInt(product.quantity) || 0;
        const price = parseFloat(product.price) || 0;
        total += quantity * price;
      });
      return total;
    }
  } catch {
    // Not JSON, try to parse text format
  }

  // Parse text format like "2 x Product ($50)" or "Product x 2 - $50"
  const patterns = [
    /(\d+)\s*x\s*[^$]*\$(\d+\.?\d*)/gi,  // "2 x Product ($50)"
    /\$(\d+\.?\d*)\s*x\s*(\d+)/gi,        // "$50 x 2"
    /(\d+)\s*[^$]*\$(\d+\.?\d*)/gi,       // "2 Product $50"
  ];

  for (const pattern of patterns) {
    const matches = description.matchAll(pattern);
    for (const match of matches) {
      const quantity = parseInt(match[1]) || 1;
      const price = parseFloat(match[2]) || 0;
      total += quantity * price;
    }
  }

  // If no pattern matched, try to find any dollar amounts
  if (total === 0) {
    const dollarMatches = description.matchAll(/\$(\d+\.?\d*)/g);
    for (const match of dollarMatches) {
      total += parseFloat(match[1]) || 0;
    }
  }

  return total;
}

// Get analytics data for dashboard
export async function getAnalyticsData(userId: string) {
  try {
    const [allReceipts, statusCounts, totalRevenue] = await Promise.all([
      getAllReceiptsByUserId(userId),
      getReceiptsCountByStatus(userId),
      calculateTotalRevenue(userId),
    ]);

    const totalOrders = allReceipts.length;

    // Calculate growth (compare this month to last month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthOrders = allReceipts.filter(
      (r) => r.createdAt >= thisMonthStart
    ).length;
    const lastMonthOrders = allReceipts.filter(
      (r) => r.createdAt >= lastMonthStart && r.createdAt < thisMonthStart
    ).length;

    const growthPercentage =
      lastMonthOrders > 0
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      growthPercentage: Math.round(growthPercentage * 10) / 10,
      statusCounts: statusCounts.reduce((acc, { status, count }) => {
        acc[status ?? "unknown"] = count;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    logError("getAnalyticsData", error, { userId });
    throw error;
  }
}

// Export receipts to CSV format
export async function exportReceiptsToCSV(userId: string) {
  try {
    const allReceipts = await getAllReceiptsByUserId(userId);

    // CSV header
    const headers = [
      "ID",
      "Buyer",
      "Phone Number",
      "Address",
      "Purchase Date",
      "Status",
      "Product Description",
      "Revenue",
      "Created At",
    ];

    // CSV rows
    const rows = allReceipts.map((receipt) => {
      const revenue = receipt.productDescription
        ? parseProductDescriptionForRevenue(receipt.productDescription)
        : 0;

      return [
        receipt.id,
        receipt.buyer || "",
        receipt.phoneNumber || "",
        receipt.address || "",
        receipt.purchaseDate.toISOString(),
        receipt.status || "",
        (receipt.productDescription || "").replace(/"/g, '""'), // Escape quotes
        revenue.toFixed(2),
        receipt.createdAt.toISOString(),
      ];
    });

    // Build CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  } catch (error) {
    logError("exportReceiptsToCSV", error, { userId });
    throw error;
  }
}
