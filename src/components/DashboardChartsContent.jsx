import React, { useState, useEffect } from 'react';
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

const mockViewsData = [
  { name: 'Mon', views: 400 },
  { name: 'Tue', views: 300 },
  { name: 'Wed', views: 550 },
  { name: 'Thu', views: 450 },
  { name: 'Fri', views: 700 },
  { name: 'Sat', views: 600 },
  { name: 'Sun', views: 800 },
];

const mockEarningsData = [
  { month: 'Jan', earnings: 1200 },
  { month: 'Feb', earnings: 1900 },
  { month: 'Mar', earnings: 1500 },
  { month: 'Apr', earnings: 2200 },
  { month: 'May', earnings: 2800 },
  { month: 'Jun', earnings: 3500 },
];

const mockSuccessRateData = [
  { month: 'Jan', rate: 75 },
  { month: 'Feb', rate: 82 },
  { month: 'Mar', rate: 80 },
  { month: 'Apr', rate: 88 },
  { month: 'May', rate: 92 },
  { month: 'Jun', rate: 95 },
];

export const DashboardChartsContent = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
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
              <AreaChart data={mockViewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <BarChart data={mockEarningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="month" tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: textColor}} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}€`} />
                <Tooltip 
                  contentStyle={tooltipStyle}
                  cursor={{fill: tooltipCursorColor}}
                  formatter={(value) => [`${value} €`, 'Gains']}
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
              <LineChart data={mockSuccessRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
    </div>
  );
};

export default DashboardChartsContent;
