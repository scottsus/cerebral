"use client";

import { receipts } from "~/server/db/schema";
import { InferSelectModel } from "drizzle-orm";
import React, { useState, useMemo } from "react";
import { Trash2, Filter, Download, CheckSquare, Square } from "lucide-react";

type Receipt = InferSelectModel<typeof receipts>;

interface OrdersEnhancedProps {
  receipts: Receipt[];
  onOrderSelect: (orderId: number) => void;
  onDeleteOrders: (orderIds: number[]) => Promise<void>;
  onBulkStatusUpdate: (orderIds: number[], status: string) => Promise<void>;
  onExportCSV: () => Promise<void>;
}

export default function OrdersEnhanced({
  receipts,
  onOrderSelect,
  onDeleteOrders,
  onBulkStatusUpdate,
  onExportCSV,
}: OrdersEnhancedProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "status" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort receipts
  const filteredAndSortedReceipts = useMemo(() => {
    let filtered = receipts;

    // Apply status filter
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = a.purchaseDate.getTime() - b.purchaseDate.getTime();
          break;
        case "status":
          comparison = (a.status ?? "").localeCompare(b.status ?? "");
          break;
        case "name":
          comparison = (a.buyer ?? "").localeCompare(b.buyer ?? "");
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [receipts, filterStatus, sortBy, sortOrder]);

  const displayReceipts = Array(Math.max(7, filteredAndSortedReceipts.length))
    .fill(null)
    .map(
      (_, index) =>
        filteredAndSortedReceipts[index] || {
          id: -1,
          purchaseDate: new Date(0),
          buyer: "---",
          status: "---",
        },
    );

  const toggleSelectOrder = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredAndSortedReceipts.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(
        new Set(filteredAndSortedReceipts.map((r) => r.id)),
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedOrders.size} order(s)?`,
      )
    ) {
      return;
    }

    await onDeleteOrders(Array.from(selectedOrders));
    setSelectedOrders(new Set());
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedOrders.size === 0) return;
    await onBulkStatusUpdate(Array.from(selectedOrders), status);
    setSelectedOrders(new Set());
  };

  const toggleSort = (field: "date" | "status" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-[#575757] bg-[#2f2f2f] p-3 text-white shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center text-xl font-semibold md:text-3xl lg:text-4xl">
          Orders
          <span className="ml-3 inline-flex items-center rounded-xl bg-[#f6f930] px-3 py-1 text-sm font-bold text-black md:text-lg lg:text-2xl">
            {filteredAndSortedReceipts.length}
          </span>
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border-2 border-[#f6f930] bg-[#2f2f2f] px-3 py-1 text-sm text-white md:text-base"
          >
            <option value="ALL">All Status</option>
            <option value="INPROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="FLAGGED">Flagged</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 rounded-lg border-2 border-[#f6f930] bg-[#2f2f2f] px-3 py-1 text-sm text-white hover:bg-[#3f3f3f] md:text-base"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          {/* Bulk Actions */}
          {selectedOrders.size > 0 && (
            <>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusChange(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="rounded-lg border-2 border-[#f6f930] bg-[#2f2f2f] px-3 py-1 text-sm text-white md:text-base"
              >
                <option value="">Update Status ({selectedOrders.size})</option>
                <option value="INPROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FLAGGED">Flagged</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 rounded-lg border-2 border-red-500 bg-[#2f2f2f] px-3 py-1 text-sm text-red-500 hover:bg-red-500 hover:text-white md:text-base"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedOrders.size})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="h-[450px] overflow-auto sm:h-[300px] md:h-[580px] lg:h-[620px]">
        <table className="w-full table-auto">
          <thead>
            <tr className="relative text-xs sm:text-md md:text-lg lg:text-xl">
              <th className="sticky top-0 bg-[#2f2f2f] pl-3 text-left font-medium sm:pl-6 lg:pl-10">
                <button
                  onClick={toggleSelectAll}
                  className="text-[#f6f930] hover:text-white"
                >
                  {selectedOrders.size === filteredAndSortedReceipts.length &&
                  filteredAndSortedReceipts.length > 0 ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>
              </th>
              <th className="sticky top-0 bg-[#2f2f2f] text-left font-medium">
                Order#
              </th>
              <th
                className="sticky top-0 cursor-pointer bg-[#2f2f2f] text-left font-medium hover:text-[#f6f930]"
                onClick={() => toggleSort("date")}
              >
                Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sticky top-0 cursor-pointer bg-[#2f2f2f] text-left font-medium hover:text-[#f6f930]"
                onClick={() => toggleSort("name")}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="sticky top-0 cursor-pointer bg-[#2f2f2f] py-2 text-left font-medium hover:text-[#f6f930] sm:py-3 lg:py-5"
                onClick={() => toggleSort("status")}
              >
                Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayReceipts.map((order, index) => (
              <tr
                key={order.id !== -1 ? order.id : `empty-${index}`}
                className={`overflow-hidden text-xs sm:text-md md:text-lg lg:text-xl ${order.id !== -1 ? "cursor-pointer hover:bg-[#5a5a5a]" : ""}`}
              >
                <td
                  className="py-[1rem] pl-3 text-left sm:pl-6 lg:py-7 lg:pl-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (order.id !== -1) {
                      toggleSelectOrder(order.id);
                    }
                  }}
                >
                  {order.id !== -1 ? (
                    <button className="text-[#f6f930] hover:text-white">
                      {selectedOrders.has(order.id) ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  ) : (
                    <span className="text-[#5a5a5a]">---</span>
                  )}
                </td>
                <td
                  className="py-[1rem] text-left text-[#f6f930] lg:py-7"
                  onClick={() => order.id !== -1 && onOrderSelect(order.id)}
                >
                  {order.id !== -1
                    ? `#${order.id.toString().padStart(4, "0")}`
                    : "---"}
                </td>
                <td
                  className="py-[1rem] text-left text-[#c4c4c4] lg:py-7"
                  onClick={() => order.id !== -1 && onOrderSelect(order.id)}
                >
                  {order.id !== -1
                    ? order.purchaseDate.toLocaleDateString()
                    : "---"}
                </td>
                <td
                  className="py-[1rem] text-left font-extralight"
                  onClick={() => order.id !== -1 && onOrderSelect(order.id)}
                >
                  {order.buyer}
                </td>
                <td
                  className="py-[1rem] text-left font-extralight md:font-normal"
                  onClick={() => order.id !== -1 && onOrderSelect(order.id)}
                >
                  <span
                    className="rounded-full px-5 py-2"
                    style={{
                      backgroundColor:
                        order.status === "COMPLETED"
                          ? "#426142"
                          : order.status === "INPROGRESS"
                            ? "#615D42"
                            : order.status === "CANCELLED"
                              ? "#614242"
                              : order.status === "FLAGGED"
                                ? "#6d6d6d"
                                : "#2f2f2f",
                      color:
                        order.status === "COMPLETED"
                          ? "#94FF8E"
                          : order.status === "INPROGRESS"
                            ? "#FBFF8E"
                            : order.status === "CANCELLED"
                              ? "#FF8E8E"
                              : order.status === "FLAGGED"
                                ? "#FFFFFF"
                                : "#FFFFFF",
                    }}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
