'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { receipts } from '~/server/db/schema';
import { InferSelectModel } from 'drizzle-orm';

ChartJS.register(ArcElement, Tooltip, Legend);
type Receipt = InferSelectModel<typeof receipts>;

const AnalyticsEnhanced = ({ receipts }: { receipts: Receipt[] }) => {
  const [activeTab, setActiveTab] = useState('Orders');
  const [chartData, setChartData] = useState<ChartData<'pie'> | null>(null);

  // Calculate real revenue from product descriptions
  const calculateRevenue = (productDescription: string | null): number => {
    if (!productDescription) return 0;

    let total = 0;

    // Try to parse JSON format first
    try {
      const products = JSON.parse(productDescription);
      if (Array.isArray(products)) {
        products.forEach((product: any) => {
          const quantity = parseInt(product.quantity) || 0;
          const price = parseFloat(product.price) || 0;
          total += quantity * price;
        });
        return total;
      }
    } catch {
      // Not JSON, continue to text parsing
    }

    // Parse text format like "2 x Product ($50)" or "Product x 2 - $50"
    const patterns = [
      /(\d+)\s*x\s*[^$]*\$(\d+\.?\d*)/gi,  // "2 x Product ($50)"
      /\$(\d+\.?\d*)\s*x\s*(\d+)/gi,        // "$50 x 2"
      /(\d+)\s*[^$]*\$(\d+\.?\d*)/gi,       // "2 Product $50"
    ];

    for (const pattern of patterns) {
      const matches = productDescription.matchAll(pattern);
      for (const match of matches) {
        const quantity = parseInt(match[1]) || 1;
        const price = parseFloat(match[2]) || 0;
        total += quantity * price;
      }
    }

    // If no pattern matched, try to find any dollar amounts
    if (total === 0) {
      const dollarMatches = productDescription.matchAll(/\$(\d+\.?\d*)/g);
      for (const match of dollarMatches) {
        total += parseFloat(match[1]) || 0;
      }
    }

    return total;
  };

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const totalRevenue = receipts.reduce((sum, receipt) => {
      return sum + calculateRevenue(receipt.productDescription);
    }, 0);

    const totalOrders = receipts.length;

    // Calculate growth (compare this month to last month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthOrders = receipts.filter(
      (r) => r.createdAt >= thisMonthStart
    ).length;
    const lastMonthOrders = receipts.filter(
      (r) => r.createdAt >= lastMonthStart && r.createdAt < thisMonthStart
    ).length;

    const salesGrowth =
      lastMonthOrders > 0
        ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : thisMonthOrders > 0 ? 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      salesGrowth,
    };
  }, [receipts]);

  useEffect(() => {
    if (activeTab === 'Completion') {
      const statusCounts = receipts.reduce<Record<string, number>>((acc, receipt) => {
        const status = receipt.status ?? 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setChartData({
        labels: Object.keys(statusCounts),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: ['#6d6d6d','#FBFF8E', '#94FF8E','#FF8E8E'],
            hoverBackgroundColor: ['#6d6d6d','#FBFF8E', '#94FF8E','#FF8E8E'],
          },
        ],
      });
    }
  }, [activeTab, receipts]);

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

  return (
    <div className="container h-[100px] lg:h-[300px] text-white border-[#c4c4c4] rounded-2xl">
      <div className="flex justify-between items-center px-3 py-3 sm:px-3 sm:py-3 md:px-3 md:py-3 lg:px-5 lg:py-3 font-semibold">
        <h2 className="text-[1.2rem] font-semibold sm:text-[1.2rem] md:text-[1.3rem] lg:text-[1.8rem]">Analytics</h2>

        <div className="flex lg:space-x-4 text-[0.8rem] font-medium sm:text-[0.8rem] md:text-[1.0rem] lg:text-[1.3rem]">
          <button
            className={`pr-7 cursor-pointer ${activeTab === 'Orders' ? 'text-[#e3e300] underline' : 'text-white hover:underline'}`}
            onClick={() => setActiveTab('Orders')}
          >
            Orders
          </button>
          <button
            className={`pr-7 cursor-pointer ${activeTab === 'Completion' ? 'text-[#e3e300] underline' : 'text-white hover:underline'}`}
            onClick={() => setActiveTab('Completion')}
          >
            Completion
          </button>
        </div>
      </div>

      {activeTab === 'Orders' ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 bg-[#484848] h-[100px] lg:h-[150px] rounded-lg p-4 hover:border-[#FFFFFF] hover:border text-center flex flex-col justify-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-white lg:text-2xl pr-2">$</span>
              <span className="text-[#e3e300] text-lg sm:text-2xl md:text-2xl lg:text-3xl font-semibold">
                {analyticsData.totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="text-gray-400 text-lg sm:text-2xl md:text-2xl lg:text-3xl">Total Revenue</div>
          </div>
          <div className="col-span-1 bg-[#484848] rounded-lg p-4 hover:border-[#FFFFFF] hover:border flex flex-col justify-center h-[100px] lg:h-[150px]">
            <div className="flex items-center justify-center mb-2">
              <span className="text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 lg:h-9 lg:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <span className="text-[#e3e300] text-lg sm:text-2xl md:text-2xl lg:text-3xl font-semibold">
                {analyticsData.totalOrders}
              </span>
            </div>
            <div className="text-gray-400 text-lg sm:text-2xl md:text-2xl lg:text-3xl text-center">Total Orders</div>
          </div>
          <div className="col-span-2 bg-[#484848] rounded-lg lg:p-5 hover:border-[#FFFFFF] hover:border">
            <div className="flex flex-col items-center justify-center lg:py-4 text-center">
              <div className="flex items-center mb-2">
                <span className="text-white mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-9 lg:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
                <span className={`text-lg sm:text-2xl md:text-2xl lg:text-3xl font-semibold ${analyticsData.salesGrowth >= 0 ? 'text-[#94FF8E]' : 'text-[#FF8E8E]'}`}>
                  {analyticsData.salesGrowth >= 0 ? '+' : ''}{analyticsData.salesGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="text-gray-400 text-lg sm:text-2xl md:text-2xl lg:text-3xl">
                Sales Growth (This Month)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          {chartData && (
            <div className="w-full h-full px-4">
              <Pie data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsEnhanced;
