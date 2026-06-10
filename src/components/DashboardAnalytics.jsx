import React, { useState, useEffect, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';

const DashboardChartsContent = lazy(() => import('./DashboardChartsContent.jsx'));

const AnalyticsDashboard = () => {
  return (
    <Suspense fallback={
      <div className="mt-8 p-6 rounded-2xl shadow-sm border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 animate-pulse h-[500px] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-3 animate-spin border-4 border-slate-200 border-t-indigo-600"></div>
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    }>
      <DashboardChartsContent />
    </Suspense>
  );
};

let rootInstance = null;

export const renderAnalytics = (containerDiv) => {
  if (!rootInstance) {
    rootInstance = createRoot(containerDiv);
  }
  rootInstance.render(<AnalyticsDashboard />);
  
  setTimeout(() => {
     if (window.lucide) {
         window.lucide.createIcons({ root: containerDiv });
     }
  }, 300);
}
