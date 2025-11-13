'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js';
import { receipts } from '~/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import { Calendar } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

type Receipt = InferSelectModel<typeof receipts>;

const AnalyticsEnhanced = ({ receipts }: { receipts: Receipt[] }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [chartData, setChartData] = useState<ChartData<'pie'> | null>(null);
  const [lineChartData, setLineChartData] = useState<ChartData<'line'> | null>(null);
  const [barChartData, setBarChartData] = useState<ChartData<'bar'> | null>(null);

  // Filter receipts by date range
  const filteredReceipts = useMemo(() => {
    if (dateRange === 'all') return receipts;

    const now = new Date();
    const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return receipts.filter((receipt) => {
      const receiptDate = new Date(receipt.purchaseDate);
      return receiptDate >= cutoffDate;
    });
  }, [receipts, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredReceipts.length * (Math.random() * 150 + 50);
    const avgOrderValue = filteredReceipts.length > 0 ? totalRevenue / filteredReceipts.length : 0;

    const statusCounts = filteredReceipts.reduce<Record<string, number>>((acc, receipt) => {
      const status = receipt.status ?? 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const completionRate =
      filteredReceipts.length > 0
        ? ((statusCounts.COMPLETED || 0) / filteredReceipts.length) * 100
        : 0;

    return {
      totalRevenue,
      avgOrderValue,
      completionRate,
      totalOrders: filteredReceipts.length,
      statusCounts,
    };
  }, [filteredReceipts]);

  // Update pie chart data for status distribution
  useEffect(() => {
    if (activeTab === 'Status') {
      setChartData({
        labels: Object.keys(stats.statusCounts).map((key) => {
          return key === 'INPROGRESS' ? 'In Progress' :
                 key === 'COMPLETED' ? 'Completed' :
                 key === 'FLAGGED' ? 'Flagged' :
                 key === 'CANCELLED' ? 'Cancelled' : key;
        }),
        datasets: [
          {
            data: Object.values(stats.statusCounts),
            backgroundColor: ['#6d6d6d', '#FBFF8E', '#94FF8E', '#FF8E8E'],
            hoverBackgroundColor: ['#6d6d6d', '#FBFF8E', '#94FF8E', '#FF8E8E'],
          },
        ],
      });
    }
  }, [activeTab, stats.statusCounts]);

  // Update line chart data for orders over time
  useEffect(() => {
    if (activeTab === 'Trends') {
      const ordersByDate = filteredReceipts.reduce<Record<string, number>>((acc, receipt) => {
        const date = new Date(receipt.purchaseDate).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const sortedDates = Object.keys(ordersByDate).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      setLineChartData({
        labels: sortedDates,
        datasets: [
          {
            label: 'Orders',
            data: sortedDates.map((date) => ordersByDate[date]),
            borderColor: '#FBFF8E',
            backgroundColor: 'rgba(251, 255, 142, 0.1)',
            tension: 0.4,
          },
        ],
      });
    }
  }, [activeTab, filteredReceipts]);

  // Update bar chart data for status comparison
  useEffect(() => {
    if (activeTab === 'Comparison') {
      setBarChartData({
        labels: ['In Progress', 'Completed', 'Flagged', 'Cancelled'],
        datasets: [
          {
            label: 'Number of Orders',
            data: [
              stats.statusCounts.INPROGRESS || 0,
              stats.statusCounts.COMPLETED || 0,
              stats.statusCounts.FLAGGED || 0,
              stats.statusCounts.CANCELLED || 0,
            ],
            backgroundColor: ['#6d6d6d', '#FBFF8E', '#94FF8E', '#FF8E8E'],
          },
        ],
      });
    }
  }, [activeTab, stats.statusCounts]);

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          color: 'white',
        },
      },
    },
    maintainAspectRatio: false,
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="container text-white dark:text-gray-200 rounded-2xl">
      {/* Header with tabs and date range selector */}
      <div className="flex justify-between items-center px-5 py-3 font-semibold flex-wrap gap-4">
        <h2 className="text-[1.8rem] font-semibold">Analytics</h2>

        <div className="flex items-center gap-4">
          {/* Date range selector */}
          <div className="flex items-center gap-2 bg-[#484848] dark:bg-gray-800 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent text-sm outline-none cursor-pointer"
            >
              <option value="7d" className="bg-[#2F2F2F]">Last 7 days</option>
              <option value="30d" className="bg-[#2F2F2F]">Last 30 days</option>
              <option value="90d" className="bg-[#2F2F2F]">Last 90 days</option>
              <option value="all" className="bg-[#2F2F2F]">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 pb-4 flex-wrap text-sm font-medium">
        {['Overview', 'Status', 'Trends', 'Comparison'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-[#e3e300] text-black'
                : 'bg-[#484848] dark:bg-gray-800 hover:bg-[#5a5a5a] dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#484848] dark:bg-gray-800 rounded-lg p-6 hover:border-[#FFFFFF] hover:border">
              <div className="text-gray-400 text-sm mb-2">Total Orders</div>
              <div className="text-[#e3e300] text-3xl font-semibold">
                {stats.totalOrders}
              </div>
            </div>
            <div className="bg-[#484848] dark:bg-gray-800 rounded-lg p-6 hover:border-[#FFFFFF] hover:border">
              <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
              <div className="text-[#e3e300] text-3xl font-semibold">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#484848] dark:bg-gray-800 rounded-lg p-6 hover:border-[#FFFFFF] hover:border">
              <div className="text-gray-400 text-sm mb-2">Avg Order Value</div>
              <div className="text-[#e3e300] text-3xl font-semibold">
                ${stats.avgOrderValue.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#484848] dark:bg-gray-800 rounded-lg p-6 hover:border-[#FFFFFF] hover:border">
              <div className="text-gray-400 text-sm mb-2">Completion Rate</div>
              <div className="text-[#94FF8E] text-3xl font-semibold">
                {stats.completionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Status' && (
          <div className="bg-[#484848] dark:bg-gray-800 rounded-lg p-6 h-[400px]">
            {chartData ? (
              <Pie data={chartData} options={chartOptions} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        )}

        {activeTab === 'Trends' && (
          <div className="bg-[#484848] dark:bg-gray-800 rounded-lg p-6 h-[400px]">
            {lineChartData ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        )}

        {activeTab === 'Comparison' && (
          <div className="bg-[#484848] dark:bg-gray-800 rounded-lg p-6 h-[400px]">
            {barChartData ? (
              <Bar data={barChartData} options={lineChartOptions} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsEnhanced;
