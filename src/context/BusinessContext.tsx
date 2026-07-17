import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export const BusinessContext = createContext<any>(null);

export const BusinessProvider = ({ children }: { children: React.ReactNode }) => {
  const [businessData, setBusinessData] = useState<any>(null);
  const [customAnalytics, setCustomAnalytics] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (!customAnalytics && localStorage.getItem("partner_token")) {
      apiFetch("/api/analytics", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("partner_token")}`
        }
      })
      .then(res => res.json())
      .then(demoAnalytics => {
         // Map demo data to BizMind AI format
         const activeAnalytics = {
             businessCategory: "Demo Retail",
             performance: {
                totalRevenue: demoAnalytics.summary?.revenue || 0,
                grossProfitMargin: demoAnalytics.summary?.revenue > 0 ? ((demoAnalytics.summary.profit / demoAnalytics.summary.revenue)*100).toFixed(0) : 0,
                openOrders: 12,
             },
             persona: {
                ageGroup: "18-35",
                gender: "All Genders",
                customerType: "Trend Followers",
                region: "Urban Hubs",
                summary: "Digital-first buyers checking for fast delivery and trending products."
             },
             strategies: [
                "Utilize local influencers to drive organic product visibility.",
                "Create a bundler discount for slow inventory to increase AOV."
             ],
             fastSelling: demoAnalytics.topProducts?.slice(0,3) || [],
             slowSelling: demoAnalytics.deadStockAlerts?.slice(0,3) || [],
             forecast: {
                expectedGrowth: "Steady 15% WoW projected",
                bestMonths: "November, December"
             },
             trendData: demoAnalytics.trendData || [],
             categoryDistribution: demoAnalytics.categoryDistribution || []
          };
          setCustomAnalytics(activeAnalytics);
      }).catch(console.error);
    }
  }, [customAnalytics]);

  return (
    <BusinessContext.Provider value={{
      businessData,
      setBusinessData,
      customAnalytics,
      setCustomAnalytics,
      theme,
      setTheme
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);
