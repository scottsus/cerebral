"use server";

import { eq, desc } from "drizzle-orm";
import { db } from "@/server/db";
import { orderNotes } from "@/server/db/schema";

export async function getOrderNotes(receiptId: number) {
  try {
    const notes = await db
      .select()
      .from(orderNotes)
      .where(eq(orderNotes.receiptId, receiptId))
      .orderBy(desc(orderNotes.createdAt));

    return notes;
  } catch (error) {
    console.error("Error fetching order notes:", error);
    return [];
  }
}

export async function createOrderNote(
  receiptId: number,
  userId: string,
  note: string
) {
  try {
    const newNote = await db
      .insert(orderNotes)
      .values({
        receiptId,
        userId,
        note,
      })
      .returning();

    return newNote[0];
  } catch (error) {
    console.error("Error creating order note:", error);
    return null;
  }
}

export async function deleteOrderNote(noteId: number) {
  try {
    await db.delete(orderNotes).where(eq(orderNotes.id, noteId));
    return true;
  } catch (error) {
    console.error("Error deleting order note:", error);
    return false;
  }
}
