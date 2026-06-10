import React, { useState, useEffect } from 'react';
import { AppState, DUMMY_PROJECTS } from '../state.js';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AIAnalyticsSection } from './AIAnalyticsSection.jsx';

export const DashboardChartsContent = () => {
  const [isDark, setIsDark] = useState(false);
  const [data, setData] = useState({ views: [], earnings: [], successRate: [] });

  useEffect(() => {
    const update = () => {
        setIsDark(document.documentElement.classList.contains('dark'));
        
        // Compute real data from DUMMY_PROJECTS
        // This is a simplified computation for demonstration
        const projects = DUMMY_PROJECTS.filter(p => p.freelanceId === AppState.user?.uid || p.clientId === AppState.user?.uid);
        
        const earningsByMonth = projects.reduce((acc, p) => {
            if (p.status === 'in-progress' || p.status === 'completed') {
                const month = new Date(p.date || Date.now()).toLocaleString('fr-FR', { month: 'short' });
                acc[month] = (acc[month] || 0) + parseInt(p.price);
            }
            return acc;
        }, {});

        const earningsData = Object.entries(earningsByMonth).map(([month, earnings]) => ({ month, earnings }));

        setData({
            views: [
              { name: 'Mon', views: Math.floor(Math.random() * 500) },
              { name: 'Tue', views: Math.floor(Math.random() * 500) },
              { name: 'Wed', views: Math.floor(Math.random() * 500) },
              { name: 'Thu', views: projects.length * 100 },
              { name: 'Fri', views: Math.floor(Math.random() * 500) },
              { name: 'Sat', views: Math.floor(Math.random() * 500) },
              { name: 'Sun', views: Math.floor(Math.random() * 500) },
            ],
            earnings: earningsData.length ? earningsData : [{ month: 'Jan', earnings: 0 }],
            successRate: [
              { month: 'Jan', rate: 75 },
              { month: 'Feb', rate: 82 },
              { month: 'Mar', rate: (projects.filter(p => p.status === 'completed').length / (projects.length || 1) * 100) },
            ]
        });
    };
    
    update();
    const unsub = AppState.subscribe(update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
        unsub();
        observer.disconnect();
    };
  }, []);

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#0f172a',
    borderRadius: '8px', 
    border: isDark ? '1px solid #334155' : 'none', 
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  };
  const tooltipCursorColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className={`mt-8 p-6 rounded-2xl shadow-sm border transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center mb-6">
        <i data-lucide="bar-chart-2" className={`w-6 h-6 mr-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}></i>
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Analytics & Statistiques</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Views Chart (Area Chart) */}
        <div className={`p-5 rounded-xl border transition-colors ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Vues du Profil (Semaine)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.views} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  itemStyle={{color: '#4f46e5', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="views" name="Vues" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Earnings Over Time (Bar Chart) */}
        <div className={`p-5 rounded-xl border transition-colors ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Gains Mensuels</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.earnings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="month" tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} tickFormatter={(value) => AppState.formatPrice(value)} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  cursor={{fill: tooltipCursorColor}}
                  formatter={(value) => [AppState.formatPrice(value), 'Gains']}
                />
                <Bar dataKey="earnings" name="Gains" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success Rates (Line Chart) */}
        <div className={`p-5 rounded-xl border lg:col-span-2 transition-colors ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Taux de Succès des Projets (%)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.successRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="month" tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value} %`, 'Taux de succès']}
                />
                <Line type="monotone" dataKey="rate" name="Taux de succès" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <AIAnalyticsSection isDark={isDark} />
    </div>
  );
};

export default DashboardChartsContent;
