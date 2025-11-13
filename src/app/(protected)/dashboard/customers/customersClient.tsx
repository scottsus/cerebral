"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Phone, MapPin, Calendar, ShoppingBag } from "lucide-react";

interface Customer {
  buyer: string | null;
  phoneNumber: string | null;
  address: string | null;
  lastOrderDate: Date;
}

export default function CustomersClient({
  customers,
  userId,
}: {
  customers: Customer[];
  userId: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.buyer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customers</h1>
        <p className="text-gray-600">
          Manage and view all your customers in one place
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers by name, phone, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Customer stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-bold">{customers.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Customers list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">
                  {customer.buyer || "Unknown Customer"}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {customer.phoneNumber || "No phone"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm line-clamp-2">
                    {customer.address || "No address"}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Last order:{" "}
                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                View Order History
              </button>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? "No customers found matching your search"
                : "No customers yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
