"use server";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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

export async function getUserByEmail({ email }: { email: string }) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  } catch (error) {
    logError("getUserByEmail", error, { email });
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  } catch (error) {
    logError("getUserById", error, { userId });
    throw error;
  }
}

export async function createUser(userInput: {
  name: string;
  email: string;
  phoneNumber: string;
  businessName?: string;
  businessDescription: string;
  welcomeMessage: string;
}) {
  try {
    const [user] = await db
      .insert(users)
      .values(userInput)
      .returning({ id: users.id });

    return user;
  } catch (error) {
    logError("createUser", error, { email: userInput.email });
    throw error;
  }
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    businessName?: string;
    phoneNumber?: string;
    businessDescription?: string;
    welcomeMessage?: string;
  }
) {
  try {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return user;
  } catch (error) {
    logError("updateUser", error, { userId, data });
    throw error;
  }
}

export async function updateListenerStatus(
  userId: string,
  status: "INITIALIZING" | "RUNNING" | "EXITED"
) {
  try {
    const [user] = await db
      .update(users)
      .set({ listenerStatus: status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return user;
  } catch (error) {
    logError("updateListenerStatus", error, { userId, status });
    throw error;
  }
}

export async function getListenerStatus({ userId }: { userId: string }) {
  try {
    const [user] = await db
      .select({ status: users.listenerStatus })
      .from(users)
      .where(eq(users.id, userId));

    return user?.status;
  } catch (error) {
    logError("getListenerStatus", error, { userId });
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    return user;
  } catch (error) {
    logError("deleteUser", error, { userId });
    throw error;
  }
}