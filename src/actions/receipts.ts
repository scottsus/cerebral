"use server";

import { db } from "~/server/db";
import { receipts, customers } from "~/server/db/schema";
import { eq, desc, and, or, gte, lte, ilike, sql, count } from "drizzle-orm";

// Fetch all receipts by user ID
export async function getAllReceiptsByUserId(userId: string) {
  try {
    return await db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId))
      .orderBy(desc(receipts.purchaseDate));
  } catch (error) {
    console.error("Error fetching all receipts:", error);
    throw error;
  }
}

// Fetch a receipt by ID
export async function getReceiptById(id: number) {
  try {
    return await db.select().from(receipts).where(eq(receipts.id, id));
  } catch (error) {
    console.error(`Error fetching receipt with id ${id}:`, error);
    throw error;
  }
}

// Fetch receipts with filters
export async function getFilteredReceipts(
  userId: string,
  filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    searchTerm?: string;
    minAmount?: number;
    maxAmount?: number;
  }
) {
  try {
    const conditions = [eq(receipts.userId, userId)];

    if (filters.status) {
      conditions.push(eq(receipts.status, filters.status as any));
    }

    if (filters.startDate) {
      conditions.push(gte(receipts.purchaseDate, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(receipts.purchaseDate, filters.endDate));
    }

    let query = db
      .select()
      .from(receipts)
      .where(and(...conditions));

    if (filters.searchTerm) {
      query = query.where(
        or(
          ilike(receipts.buyer, `%${filters.searchTerm}%`),
          ilike(receipts.phoneNumber, `%${filters.searchTerm}%`),
          ilike(receipts.productDescription, `%${filters.searchTerm}%`)
        )
      );
    }

    const results = await query.orderBy(desc(receipts.purchaseDate));

    // Filter by amount in JS since we're using text for amounts
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      return results.filter((receipt) => {
        const amount = parseFloat(receipt.totalAmount || "0");
        if (filters.minAmount !== undefined && amount < filters.minAmount)
          return false;
        if (filters.maxAmount !== undefined && amount > filters.maxAmount)
          return false;
        return true;
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching filtered receipts:", error);
    throw error;
  }
}

// Get analytics data
export async function getAnalytics(userId: string) {
  try {
    const allReceipts = await db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId));

    const totalRevenue = allReceipts.reduce(
      (sum, receipt) => sum + parseFloat(receipt.totalAmount || "0"),
      0
    );

    const totalOrders = allReceipts.length;

    const completedOrders = allReceipts.filter(
      (r) => r.status === "COMPLETED"
    ).length;

    const inProgressOrders = allReceipts.filter(
      (r) => r.status === "INPROGRESS"
    ).length;

    const flaggedOrders = allReceipts.filter(
      (r) => r.status === "FLAGGED"
    ).length;

    const cancelledOrders = allReceipts.filter(
      (r) => r.status === "CANCELLED"
    ).length;

    // Calculate growth (comparing last 30 days to previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentOrders = allReceipts.filter(
      (r) => new Date(r.purchaseDate) >= thirtyDaysAgo
    );

    const previousOrders = allReceipts.filter(
      (r) =>
        new Date(r.purchaseDate) >= sixtyDaysAgo &&
        new Date(r.purchaseDate) < thirtyDaysAgo
    );

    const recentRevenue = recentOrders.reduce(
      (sum, receipt) => sum + parseFloat(receipt.totalAmount || "0"),
      0
    );

    const previousRevenue = previousOrders.reduce(
      (sum, receipt) => sum + parseFloat(receipt.totalAmount || "0"),
      0
    );

    const salesGrowth =
      previousRevenue > 0
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      salesGrowth,
      completedOrders,
      inProgressOrders,
      flaggedOrders,
      cancelledOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
}

// Get revenue trend (daily for last 30 days)
export async function getRevenueTrend(userId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const ordersInRange = await db
      .select()
      .from(receipts)
      .where(
        and(eq(receipts.userId, userId), gte(receipts.purchaseDate, startDate))
      )
      .orderBy(receipts.purchaseDate);

    // Group by date
    const trendData: { [key: string]: number } = {};

    ordersInRange.forEach((order) => {
      const dateKey = new Date(order.purchaseDate).toISOString().split("T")[0];
      if (!trendData[dateKey]) {
        trendData[dateKey] = 0;
      }
      trendData[dateKey] += parseFloat(order.totalAmount || "0");
    });

    // Convert to array format
    return Object.entries(trendData).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  } catch (error) {
    console.error("Error fetching revenue trend:", error);
    throw error;
  }
}

// Update receipt status
export async function updateReceiptStatus(receiptId: number, status: string) {
  try {
    const updated = await db
      .update(receipts)
      .set({ status: status as any })
      .where(eq(receipts.id, receiptId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error("Error updating receipt status:", error);
    throw error;
  }
}

// Bulk update receipt statuses
export async function bulkUpdateReceiptStatus(
  receiptIds: number[],
  status: string
) {
  try {
    const updates = await Promise.all(
      receiptIds.map((id) =>
        db
          .update(receipts)
          .set({ status: status as any })
          .where(eq(receipts.id, id))
          .returning()
      )
    );

    return updates.flat();
  } catch (error) {
    console.error("Error bulk updating receipt status:", error);
    throw error;
  }
}

// Update receipt and link to customer
export async function updateReceiptCustomer(
  receiptId: number,
  customerId: number
) {
  try {
    const updated = await db
      .update(receipts)
      .set({ customerId })
      .where(eq(receipts.id, receiptId))
      .returning();

    // Update customer stats
    if (updated[0]) {
      const customerOrders = await db
        .select()
        .from(receipts)
        .where(eq(receipts.customerId, customerId));

      const totalSpent = customerOrders.reduce(
        (sum, order) => sum + parseFloat(order.totalAmount || "0"),
        0
      );

      const lastOrder = customerOrders.sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime()
      )[0];

      await db
        .update(customers)
        .set({
          totalOrders: customerOrders.length as any,
          totalSpent: totalSpent.toString(),
          lastOrderDate: lastOrder?.purchaseDate,
        })
        .where(eq(customers.id, customerId));
    }

    return updated[0];
  } catch (error) {
    console.error("Error updating receipt customer:", error);
    throw error;
  }
}
