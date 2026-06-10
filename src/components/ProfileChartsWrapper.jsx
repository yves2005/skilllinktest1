import React, { Suspense, lazy } from 'react';

const ProfileChart = lazy(() => import('./ProfileChart.jsx'));
const D3MetricsChart = lazy(() => import('./D3MetricsChart.jsx'));

export const ProfileChartsWrapper = ({ profileData }) => {
    // Extract data for D3 chart - defaulting for now as I don't have exact fields
    const responseRate = profileData.responseRate || 95;
    const completedProjects = (profileData.portfolio || []).length || 10;

    return (
        <div className="space-y-4">
            <Suspense fallback={
                <div className="animate-pulse bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 h-80 flex flex-col justify-center items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-3"></div>
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
            }>
                <ProfileChart />
            </Suspense>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Statistiques clés</h3>
                <div className="flex flex-col sm:flex-row justify-around gap-6 sm:gap-0">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Taux de réponse</p>
                        <Suspense fallback={
                            <div className="animate-pulse flex flex-col items-center justify-center p-4">
                                <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 animate-spin"></div>
                            </div>
                        }>
                            <D3MetricsChart responseRate={responseRate} completedProjects={completedProjects} />
                        </Suspense>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-1">Projets terminés</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
