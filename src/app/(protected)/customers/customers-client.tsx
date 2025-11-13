"use client";

import { useEffect, useState } from "react";
import {
  getAllCustomersByUserId,
  searchCustomers,
  getCustomerStats,
} from "@/actions/customers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Mail, Phone, DollarSign, Package } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  phoneNumber: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  totalOrders: number;
  totalSpent: string;
  lastOrderDate: Date | null;
  createdAt: Date;
};

type CustomerStats = {
  totalCustomers: number;
  totalRevenue: string;
  averageOrderValue: string;
  repeatCustomers: number;
};

export function CustomersClient({ userId }: { userId: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [userId]);

  const loadCustomers = async () => {
    setLoading(true);
    const data = await getAllCustomersByUserId(userId);
    setCustomers(data as Customer[]);
    setLoading(false);
  };

  const loadStats = async () => {
    const statsData = await getCustomerStats(userId);
    setStats(statsData as CustomerStats);
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      loadCustomers();
      return;
    }
    setLoading(true);
    const results = await searchCustomers(userId, searchTerm);
    setCustomers(results as Customer[]);
    setLoading(false);
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount || "0").toFixed(2)}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Customers</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Customers</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalCustomers}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-[#F6F930]" />
              </div>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Avg Order Value</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(stats.averageOrderValue)}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Repeat Customers</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.repeatCustomers}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search customers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-400"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-[#F6F930] text-black hover:bg-[#F6F930]/90"
          >
            Search
          </Button>
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-[#F6F930]" />
          </div>
        ) : customers.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900 p-12 text-center">
            <p className="text-zinc-400">No customers found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="cursor-pointer border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-[#F6F930]"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {customer.totalOrders}{" "}
                      {customer.totalOrders === 1 ? "order" : "orders"}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#F6F930] px-3 py-1 text-xs font-semibold text-black">
                    {formatCurrency(customer.totalSpent)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <Phone className="h-4 w-4 text-zinc-500" />
                    {customer.phoneNumber}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Mail className="h-4 w-4 text-zinc-500" />
                      {customer.email}
                    </div>
                  )}
                  <div className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                    Last order: {formatDate(customer.lastOrderDate)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <Card
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-zinc-800 bg-zinc-900 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Customer since {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedCustomer(null)}
                  variant="outline"
                  className="border-zinc-800 text-white hover:bg-zinc-800"
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">Total Orders</p>
                    <p className="text-xl font-bold text-white">
                      {selectedCustomer.totalOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Spent</p>
                    <p className="text-xl font-bold text-[#F6F930]">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-zinc-400">Contact</p>
                  <div className="space-y-2 rounded-lg bg-black p-4">
                    <div className="flex items-center gap-2 text-white">
                      <Phone className="h-4 w-4 text-zinc-500" />
                      {selectedCustomer.phoneNumber}
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2 text-white">
                        <Mail className="h-4 w-4 text-zinc-500" />
                        {selectedCustomer.email}
                      </div>
                    )}
                  </div>
                </div>

                {selectedCustomer.address && (
                  <div>
                    <p className="mb-2 text-sm text-zinc-400">Address</p>
                    <div className="rounded-lg bg-black p-4 text-white">
                      {selectedCustomer.address}
                    </div>
                  </div>
                )}

                {selectedCustomer.notes && (
                  <div>
                    <p className="mb-2 text-sm text-zinc-400">Notes</p>
                    <div className="rounded-lg bg-black p-4 text-white">
                      {selectedCustomer.notes}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm text-zinc-400">Last Order</p>
                  <div className="rounded-lg bg-black p-4 text-white">
                    {formatDate(selectedCustomer.lastOrderDate)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
