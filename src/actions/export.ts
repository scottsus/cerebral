"use server";

import { getAllReceiptsByUserId } from "./receipts";

export async function exportOrdersToCSV(userId: string) {
  try {
    const orders = await getAllReceiptsByUserId(userId);

    if (orders.length === 0) {
      return null;
    }

    // CSV headers
    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Phone",
      "Address",
      "Product Description",
      "Amount",
      "Status",
    ];

    // CSV rows
    const rows = orders.map((order) => [
      order.id,
      new Date(order.purchaseDate).toLocaleString(),
      order.buyer || "",
      order.phoneNumber || "",
      order.address || "",
      (order.productDescription || "").replace(/"/g, '""'), // Escape quotes
      order.totalAmount || "0",
      order.status || "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  } catch (error) {
    console.error("Error exporting orders to CSV:", error);
    return null;
  }
}

export async function exportOrdersToJSON(userId: string) {
  try {
    const orders = await getAllReceiptsByUserId(userId);

    if (orders.length === 0) {
      return null;
    }

    const exportData = orders.map((order) => ({
      orderId: order.id,
      date: order.purchaseDate,
      customer: order.buyer,
      phone: order.phoneNumber,
      address: order.address,
      productDescription: order.productDescription,
      amount: order.totalAmount,
      status: order.status,
      additionalData: order.additionalData,
    }));

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error("Error exporting orders to JSON:", error);
    return null;
  }
}
