"use server";

import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { customers } from "@/server/db/schema";

export async function getAllCustomersByUserId(userId: string) {
  try {
    const allCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId))
      .orderBy(desc(customers.lastOrderDate));

    return allCustomers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export async function getCustomerById(customerId: number) {
  try {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    return customer[0] || null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

export async function createCustomer(data: {
  userId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const newCustomer = await db
      .insert(customers)
      .values({
        userId: data.userId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        notes: data.notes,
      })
      .returning();

    return newCustomer[0];
  } catch (error) {
    console.error("Error creating customer:", error);
    return null;
  }
}

export async function updateCustomer(
  customerId: number,
  data: Partial<{
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
    notes: string;
  }>
) {
  try {
    const updatedCustomer = await db
      .update(customers)
      .set(data)
      .where(eq(customers.id, customerId))
      .returning();

    return updatedCustomer[0];
  } catch (error) {
    console.error("Error updating customer:", error);
    return null;
  }
}

export async function searchCustomers(userId: string, searchTerm: string) {
  try {
    const results = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.userId, userId),
          or(
            ilike(customers.name, `%${searchTerm}%`),
            ilike(customers.phoneNumber, `%${searchTerm}%`),
            ilike(customers.email, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(desc(customers.lastOrderDate));

    return results;
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
}

export async function getTopCustomers(userId: string, limit: number = 10) {
  try {
    const topCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId))
      .orderBy(desc(sql`CAST(${customers.totalSpent} AS DECIMAL)`))
      .limit(limit);

    return topCustomers;
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return [];
  }
}

export async function getCustomerStats(userId: string) {
  try {
    const stats = await db
      .select({
        totalCustomers: sql<number>`COUNT(*)`,
        totalRevenue: sql<string>`SUM(CAST(${customers.totalSpent} AS DECIMAL))`,
        averageOrderValue: sql<string>`AVG(CAST(${customers.totalSpent} AS DECIMAL))`,
        repeatCustomers: sql<number>`COUNT(CASE WHEN ${customers.totalOrders} > 1 THEN 1 END)`,
      })
      .from(customers)
      .where(eq(customers.userId, userId));

    return stats[0] || null;
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return null;
  }
}

export async function findOrCreateCustomerByPhone(
  userId: string,
  phoneNumber: string,
  name?: string,
  address?: string
) {
  try {
    // First, try to find existing customer
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.userId, userId),
          eq(customers.phoneNumber, phoneNumber)
        )
      )
      .limit(1);

    if (existingCustomer.length > 0) {
      return existingCustomer[0];
    }

    // If not found, create new customer
    const newCustomer = await db
      .insert(customers)
      .values({
        userId,
        phoneNumber,
        name: name || "Unknown Customer",
        address,
      })
      .returning();

    return newCustomer[0];
  } catch (error) {
    console.error("Error finding or creating customer:", error);
    return null;
  }
}
