"use server";

import { db } from "~/server/db";
import { notifications } from "~/server/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Create a notification
export async function createNotification(
  userId: string,
  type: "NEW_ORDER" | "ORDER_COMPLETED" | "ORDER_CANCELLED" | "ORDER_FLAGGED" | "SYSTEM",
  title: string,
  message?: string,
  receiptId?: number
) {
  try {
    return await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      receiptId,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Get all notifications for a user
export async function getUserNotifications(userId: string, limit?: number) {
  try {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    if (limit) {
      query = query.limit(limit) as any;
    }

    return await query;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
}

// Get unread notifications count
export async function getUnreadNotificationsCount(userId: string) {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return userNotifications.length;
  } catch (error) {
    console.error("Error getting unread notifications count:", error);
    throw error;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: number) {
  try {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

// Delete a notification
export async function deleteNotification(notificationId: number) {
  try {
    return await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

// Delete all read notifications for a user
export async function deleteReadNotifications(userId: string) {
  try {
    return await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, true)
        )
      );
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    throw error;
  }
}
