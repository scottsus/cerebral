"use server";

import { getAllReceiptsByUserId, getReceiptsByDateRange } from "./receipts";

// Export receipts to CSV format
export async function exportReceiptsToCSV(
  userId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    let receipts;

    if (options?.startDate && options?.endDate) {
      receipts = await getReceiptsByDateRange(userId, options.startDate, options.endDate);
    } else {
      receipts = await getAllReceiptsByUserId(userId);
    }

    // CSV headers
    const headers = [
      "Order ID",
      "Buyer Name",
      "Phone Number",
      "Address",
      "Product Description",
      "Purchase Date",
      "Status",
      "Created At",
    ];

    // Convert receipts to CSV rows
    const rows = receipts.map((receipt) => [
      receipt.id,
      receipt.buyer || "N/A",
      receipt.phoneNumber || "N/A",
      receipt.address || "N/A",
      (receipt.productDescription || "N/A").replace(/"/g, '""'), // Escape quotes
      receipt.purchaseDate.toISOString(),
      receipt.status || "N/A",
      receipt.createdAt.toISOString(),
    ]);

    // Build CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell)}"`).join(",")
      ),
    ].join("\n");

    return {
      content: csvContent,
      filename: `orders_export_${new Date().toISOString().split("T")[0]}.csv`,
      mimeType: "text/csv",
    };
  } catch (error) {
    console.error("Error exporting receipts to CSV:", error);
    throw error;
  }
}

// Export customers to CSV format
export async function exportCustomersToCSV(customers: any[]) {
  try {
    const headers = [
      "Customer Name",
      "Phone Number",
      "Address",
      "Last Order Date",
    ];

    const rows = customers.map((customer) => [
      customer.buyer || "N/A",
      customer.phoneNumber || "N/A",
      customer.address || "N/A",
      customer.lastOrderDate?.toISOString() || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell)}"`).join(",")
      ),
    ].join("\n");

    return {
      content: csvContent,
      filename: `customers_export_${new Date().toISOString().split("T")[0]}.csv`,
      mimeType: "text/csv",
    };
  } catch (error) {
    console.error("Error exporting customers to CSV:", error);
    throw error;
  }
}
