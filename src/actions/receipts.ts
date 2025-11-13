"use server";

import { db } from "~/server/db";
import { receipts } from "~/server/db/schema";
import { eq, and, or, like, gte, lte, inArray, desc, asc, sql } from "drizzle-orm";

// Fetch all receipts by email
export async function getAllReceiptsByUserId(userId: string) {
  try {
    return await db.select().from(receipts).where(eq(receipts.userId, userId));
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

// Advanced search and filter receipts
export async function searchAndFilterReceipts(
  userId: string,
  filters: {
    searchQuery?: string;
    status?: string[];
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: "date" | "buyer" | "status";
    sortOrder?: "asc" | "desc";
  }
) {
  try {
    const conditions = [eq(receipts.userId, userId)];

    // Search by buyer name, phone, or address
    if (filters.searchQuery) {
      conditions.push(
        or(
          like(receipts.buyer, `%${filters.searchQuery}%`),
          like(receipts.phoneNumber, `%${filters.searchQuery}%`),
          like(receipts.address, `%${filters.searchQuery}%`),
          like(receipts.productDescription, `%${filters.searchQuery}%`)
        )!
      );
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      conditions.push(inArray(receipts.status, filters.status as any));
    }

    // Filter by date range
    if (filters.startDate) {
      conditions.push(gte(receipts.purchaseDate, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(receipts.purchaseDate, filters.endDate));
    }

    // Build the query
    let query = db.select().from(receipts).where(and(...conditions));

    // Apply sorting
    const sortField = filters.sortBy === "buyer" ? receipts.buyer :
                      filters.sortBy === "status" ? receipts.status :
                      receipts.purchaseDate;

    query = filters.sortOrder === "asc"
      ? query.orderBy(asc(sortField))
      : query.orderBy(desc(sortField));

    return await query;
  } catch (error) {
    console.error("Error searching and filtering receipts:", error);
    throw error;
  }
}

// Fetch receipts within a date range
export async function getReceiptsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    return await db
      .select()
      .from(receipts)
      .where(
        and(
          eq(receipts.userId, userId),
          gte(receipts.purchaseDate, startDate),
          lte(receipts.purchaseDate, endDate)
        )
      );
  } catch (error) {
    console.error(`Error fetching receipts between ${startDate} and ${endDate}:`, error);
    throw error;
  }
}

// Bulk update receipt status
export async function bulkUpdateReceiptStatus(
  receiptIds: number[],
  status: "INPROGRESS" | "COMPLETED" | "FLAGGED" | "CANCELLED"
) {
  try {
    return await db
      .update(receipts)
      .set({ status, updatedAt: new Date() })
      .where(inArray(receipts.id, receiptIds));
  } catch (error) {
    console.error("Error bulk updating receipt status:", error);
    throw error;
  }
}

// Bulk delete receipts
export async function bulkDeleteReceipts(receiptIds: number[]) {
  try {
    return await db
      .delete(receipts)
      .where(inArray(receipts.id, receiptIds));
  } catch (error) {
    console.error("Error bulk deleting receipts:", error);
    throw error;
  }
}

// Update receipt status
export async function updateReceiptStatus(
  receiptId: number,
  status: "INPROGRESS" | "COMPLETED" | "FLAGGED" | "CANCELLED"
) {
  try {
    return await db
      .update(receipts)
      .set({ status, updatedAt: new Date() })
      .where(eq(receipts.id, receiptId));
  } catch (error) {
    console.error("Error updating receipt status:", error);
    throw error;
  }
}

// Get receipt statistics
export async function getReceiptStatistics(userId: string) {
  try {
    const allReceipts = await db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId));

    const stats = {
      total: allReceipts.length,
      inProgress: allReceipts.filter((r) => r.status === "INPROGRESS").length,
      completed: allReceipts.filter((r) => r.status === "COMPLETED").length,
      flagged: allReceipts.filter((r) => r.status === "FLAGGED").length,
      cancelled: allReceipts.filter((r) => r.status === "CANCELLED").length,
    };

    return stats;
  } catch (error) {
    console.error("Error getting receipt statistics:", error);
    throw error;
  }
}

// Get customer order history
export async function getCustomerOrderHistory(userId: string, phoneNumber: string) {
  try {
    return await db
      .select()
      .from(receipts)
      .where(
        and(
          eq(receipts.userId, userId),
          eq(receipts.phoneNumber, phoneNumber)
        )
      )
      .orderBy(desc(receipts.purchaseDate));
  } catch (error) {
    console.error("Error fetching customer order history:", error);
    throw error;
  }
}

// Get all unique customers for a user
export async function getAllCustomers(userId: string) {
  try {
    const allReceipts = await db
      .select({
        buyer: receipts.buyer,
        phoneNumber: receipts.phoneNumber,
        address: receipts.address,
        lastOrderDate: receipts.purchaseDate,
      })
      .from(receipts)
      .where(eq(receipts.userId, userId))
      .orderBy(desc(receipts.purchaseDate));

    // Group by phone number to get unique customers
    const customerMap = new Map();
    allReceipts.forEach((receipt) => {
      if (receipt.phoneNumber && !customerMap.has(receipt.phoneNumber)) {
        customerMap.set(receipt.phoneNumber, receipt);
      }
    });

    return Array.from(customerMap.values());
  } catch (error) {
    console.error("Error fetching all customers:", error);
    throw error;
  }
}

// Get customer statistics
export async function getCustomerStatistics(userId: string, phoneNumber: string) {
  try {
    const orders = await getCustomerOrderHistory(userId, phoneNumber);

    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === "COMPLETED").length,
      cancelledOrders: orders.filter((o) => o.status === "CANCELLED").length,
      totalSpent: 0, // Would need to parse productDescription or add amount field
      lastOrderDate: orders[0]?.purchaseDate,
      firstOrderDate: orders[orders.length - 1]?.purchaseDate,
    };

    return stats;
  } catch (error) {
    console.error("Error getting customer statistics:", error);
    throw error;
  }
}
