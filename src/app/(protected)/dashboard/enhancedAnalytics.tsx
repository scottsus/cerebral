"use client";

import React, { useState, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { getAnalytics, getRevenueTrend } from "@/actions/receipts";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type AnalyticsData = {
  totalRevenue: number;
  totalOrders: number;
  salesGrowth: number;
  completedOrders: number;
  inProgressOrders: number;
  flaggedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
};

type TrendPoint = {
  date: string;
  revenue: number;
};

export function EnhancedAnalytics({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadTrend();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics(userId);
      setAnalytics(data as AnalyticsData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrend = async () => {
    try {
      const data = await getRevenueTrend(userId, 30);
      setTrendData(data as TrendPoint[]);
    } catch (error) {
      console.error("Error loading trend:", error);
    }
  };

  if (loading || !analytics) {
    return (
      <Card className="border-zinc-800 bg-zinc-900 p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-800 border-t-[#F6F930]" />
        </div>
      </Card>
    );
  }

  const pieChartData: ChartData<"pie"> = {
    labels: ["Completed", "In Progress", "Flagged", "Cancelled"],
    datasets: [
      {
        data: [
          analytics.completedOrders,
          analytics.inProgressOrders,
          analytics.flaggedOrders,
          analytics.cancelledOrders,
        ],
        backgroundColor: ["#10B981", "#F6F930", "#F59E0B", "#EF4444"],
        hoverBackgroundColor: ["#059669", "#E3E300", "#D97706", "#DC2626"],
      },
    ],
  };

  const lineChartData: ChartData<"line"> = {
    labels: trendData.map((point) => {
      const date = new Date(point.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: "Revenue",
        data: trendData.map((point) => point.revenue),
        borderColor: "#F6F930",
        backgroundColor: "rgba(246, 249, 48, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "white",
        },
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "white",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Card className="border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-2xl font-semibold text-white">Analytics</h2>
          <div className="flex gap-2">
            {["Overview", "Trends", "Status"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-[#F6F930] text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.totalOrders}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Sales Growth</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.salesGrowth > 0 ? "+" : ""}
                  {analytics.salesGrowth.toFixed(1)}%
                </p>
              </div>
              <TrendingUp
                className={`h-8 w-8 ${
                  analytics.salesGrowth > 0 ? "text-green-500" : "text-red-500"
                }`}
              />
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Avg Order Value</p>
                <p className="text-2xl font-bold text-white">
                  ${analytics.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[#F6F930]" />
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Completed</p>
                <p className="text-2xl font-bold text-green-500">
                  {analytics.completedOrders}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">In Progress</p>
                <p className="text-2xl font-bold text-[#F6F930]">
                  {analytics.inProgressOrders}
                </p>
              </div>
              <Clock className="h-8 w-8 text-[#F6F930]" />
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Flagged</p>
                <p className="text-2xl font-bold text-orange-500">
                  {analytics.flaggedOrders}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Cancelled</p>
                <p className="text-2xl font-bold text-red-500">
                  {analytics.cancelledOrders}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "Trends" && (
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Revenue Trend (Last 30 Days)
          </h3>
          <div className="h-[400px]">
            {trendData.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                No data available for the selected period
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Status Tab */}
      {activeTab === "Status" && (
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Order Status Distribution
          </h3>
          <div className="h-[400px]">
            <Pie data={pieChartData} options={pieOptions} />
          </div>
        </Card>
      )}
    </div>
  );
}
