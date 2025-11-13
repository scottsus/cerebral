"use client";

import { receipts } from "~/server/db/schema";
import { InferSelectModel } from "drizzle-orm";
import React, { useState, useMemo } from "react";
import { Search, Filter, Download, Menu } from "lucide-react";

import AnalyticsEnhanced from "./analyticsEnhanced";
import OrderInfo from "./orderinfo";
import Orders from "./orders";
import { OrderTimeline } from "~/components/order-timeline";

type Receipt = InferSelectModel<typeof receipts>;

export default function DashboardEnhanced({
  receipts,
}: {
  receipts: Receipt[];
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(
    receipts?.[0]?.id
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeView, setActiveView] = useState<"orders" | "analytics" | "details">("orders");

  // Filter receipts based on search and status
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        !searchQuery ||
        receipt.buyer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.address?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || receipt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchQuery, statusFilter]);

  const selectedOrder = receipts.find((r) => r.id === selectedOrderId);

  // Export to CSV
  const handleExport = () => {
    const headers = ["Order ID", "Buyer", "Phone", "Status", "Date"];
    const rows = filteredReceipts.map((r) => [
      r.id,
      r.buyer || "N/A",
      r.phoneNumber || "N/A",
      r.status || "N/A",
      new Date(r.purchaseDate).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* Mobile Navigation */}
      <div className="lg:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveView("orders")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeView === "orders"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveView("analytics")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeView === "analytics"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveView("details")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeView === "details"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8">
        {/* Orders Section - Left Side on Desktop */}
        <div
          className={`w-full lg:w-1/2 ${
            activeView === "orders" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by buyer, phone, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Filter:
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "INPROGRESS", "COMPLETED", "FLAGGED", "CANCELLED"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        statusFilter === status
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {status === "all"
                        ? "All"
                        : status === "INPROGRESS"
                        ? "In Progress"
                        : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredReceipts.length} of {receipts.length} orders
            </div>
          </div>

          <Orders receipts={filteredReceipts} onOrderSelect={setSelectedOrderId} />
        </div>

        {/* Right Side - Order Details and Analytics */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Order Details Section */}
          <div
            className={`${
              activeView === "details" ? "block" : "hidden lg:block"
            }`}
          >
            <OrderInfo receipts={receipts} orderId={selectedOrderId} />
            {selectedOrder && (
              <div className="mt-4">
                <OrderTimeline
                  status={selectedOrder.status}
                  createdAt={selectedOrder.createdAt}
                  updatedAt={selectedOrder.updatedAt}
                />
              </div>
            )}
          </div>

          {/* Analytics Section */}
          <div
            className={`${
              activeView === "analytics" ? "block" : "hidden lg:block"
            }`}
          >
            <AnalyticsEnhanced receipts={receipts} />
          </div>
        </div>
      </div>
    </div>
  );
}
