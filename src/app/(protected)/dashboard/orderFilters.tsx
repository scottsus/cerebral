"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, X } from "lucide-react";
import { exportOrdersToCSV, exportOrdersToJSON } from "@/actions/export";
import { toast } from "sonner";

type FilterState = {
  status: string;
  searchTerm: string;
  startDate: string;
  endDate: string;
};

export function OrderFilters({
  userId,
  onFilterChange,
}: {
  userId: string;
  onFilterChange: (filters: FilterState) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    searchTerm: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: "",
      searchTerm: "",
      startDate: "",
      endDate: "",
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await exportOrdersToCSV(userId);
      if (csvData) {
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Orders exported to CSV");
      } else {
        toast.error("No orders to export");
      }
    } catch (error) {
      toast.error("Failed to export orders");
    }
  };

  const handleExportJSON = async () => {
    try {
      const jsonData = await exportOrdersToJSON(userId);
      if (jsonData) {
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Orders exported to JSON");
      } else {
        toast.error("No orders to export");
      }
    } catch (error) {
      toast.error("Failed to export orders");
    }
  };

  return (
    <Card className="mb-4 border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="border-zinc-800 text-white hover:bg-zinc-800"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          {(filters.status ||
            filters.searchTerm ||
            filters.startDate ||
            filters.endDate) && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-zinc-800 text-white hover:bg-zinc-800"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-zinc-800 text-white hover:bg-zinc-800"
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            onClick={handleExportJSON}
            variant="outline"
            className="border-zinc-800 text-white hover:bg-zinc-800"
          >
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Customer, phone..."
                value={filters.searchTerm}
                onChange={(e) =>
                  handleFilterChange("searchTerm", e.target.value)
                }
                className="border-zinc-800 bg-black pl-10 text-white placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-800 bg-black px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#F6F930]"
            >
              <option value="">All Statuses</option>
              <option value="INPROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="FLAGGED">Flagged</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Start Date
            </label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="border-zinc-800 bg-black text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">End Date</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="border-zinc-800 bg-black text-white"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
