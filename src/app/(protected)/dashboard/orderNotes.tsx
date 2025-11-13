"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import {
  getOrderNotes,
  createOrderNote,
  deleteOrderNote,
} from "@/actions/orderNotes";
import { toast } from "sonner";

type OrderNote = {
  id: number;
  receiptId: number;
  userId: string;
  note: string;
  createdAt: Date;
};

export function OrderNotes({
  receiptId,
  userId,
}: {
  receiptId: number;
  userId: string;
}) {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [receiptId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await getOrderNotes(receiptId);
      setNotes(data as OrderNote[]);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const note = await createOrderNote(receiptId, userId, newNote);
      if (note) {
        setNotes([note as OrderNote, ...notes]);
        setNewNote("");
        toast.success("Note added");
      } else {
        toast.error("Failed to add note");
      }
    } catch (error) {
      toast.error("Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const success = await deleteOrderNote(noteId);
      if (success) {
        setNotes(notes.filter((n) => n.id !== noteId));
        toast.success("Note deleted");
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#F6F930]" />
        <h3 className="text-lg font-semibold text-white">Order Notes</h3>
      </div>

      {/* Add Note Input */}
      <div className="mb-4 flex gap-2">
        <Input
          type="text"
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
          className="border-zinc-800 bg-black text-white placeholder:text-zinc-400"
        />
        <Button
          onClick={handleAddNote}
          disabled={submitting || !newNote.trim()}
          className="bg-[#F6F930] text-black hover:bg-[#F6F930]/90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-[#F6F930]" />
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-lg bg-black p-8 text-center text-sm text-zinc-400">
          No notes yet. Add a note to keep track of important information.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg bg-black p-3 transition-all hover:bg-zinc-800"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="flex-1 text-sm text-white">{note.note}</p>
                <Button
                  onClick={() => handleDeleteNote(note.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-zinc-500">{formatDate(note.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
