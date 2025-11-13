"use client";

import { receipts } from "~/server/db/schema";
import { InferSelectModel } from "drizzle-orm";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import Analytics from "./analytics";
import OrderInfoEnhanced from "./orderinfoEnhanced";
import OrdersEnhanced from "./ordersEnhanced";
import {
  deleteReceipt,
  updateReceiptStatus,
  bulkUpdateReceiptStatus,
  bulkDeleteReceipts,
  exportReceiptsToCSV,
} from "~/actions/receipts";

type Receipt = InferSelectModel<typeof receipts>;

export default function DashboardClientEnhanced({
  receipts,
  userId,
}: {
  receipts: Receipt[];
  userId: string;
}) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(
    receipts?.[0]?.id,
  );

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteReceipt(orderId);
      toast.success("Order deleted successfully");
      router.refresh();

      // If we deleted the selected order, select the first remaining order
      if (selectedOrderId === orderId) {
        const remainingOrders = receipts.filter((r) => r.id !== orderId);
        setSelectedOrderId(remainingOrders?.[0]?.id);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const handleBulkDeleteOrders = async (orderIds: number[]) => {
    try {
      await bulkDeleteReceipts(orderIds);
      toast.success(`${orderIds.length} order(s) deleted successfully`);
      router.refresh();

      // Update selected order if it was deleted
      if (selectedOrderId && orderIds.includes(selectedOrderId)) {
        const remainingOrders = receipts.filter(
          (r) => !orderIds.includes(r.id),
        );
        setSelectedOrderId(remainingOrders?.[0]?.id);
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
      toast.error("Failed to delete orders");
    }
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await updateReceiptStatus(orderId, status as any);
      toast.success("Order status updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleBulkStatusUpdate = async (orderIds: number[], status: string) => {
    try {
      await bulkUpdateReceiptStatus(orderIds, status as any);
      toast.success(`${orderIds.length} order(s) updated successfully`);
      router.refresh();
    } catch (error) {
      console.error("Error updating orders:", error);
      toast.error("Failed to update orders");
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await exportReceiptsToCSV(userId);

      // Create a blob and download it
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Orders exported successfully");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    }
  };

  return (
    <div className="flex flex-col gap-y-3 p-6 px-4 pt-8 sm:px-8 md:w-[93%] md:gap-x-3 lg:w-full lg:flex-row lg:gap-x-6 lg:px-16 lg:pt-10 xl:gap-x-12 xl:px-32">
      <div className="w-full">
        <OrdersEnhanced
          receipts={receipts}
          onOrderSelect={setSelectedOrderId}
          onDeleteOrders={handleBulkDeleteOrders}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onExportCSV={handleExportCSV}
        />
      </div>
      <div className="mx-auto flex flex-col items-center gap-y-2 md:w-[100%] lg:w-[80%]">
        <div className="hidden w-full lg:block">
          <OrderInfoEnhanced
            receipts={receipts}
            orderId={selectedOrderId}
            onDelete={handleDeleteOrder}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
        <div className="w-full">
          <Analytics receipts={receipts} />
        </div>
      </div>
    </div>
  );
}
