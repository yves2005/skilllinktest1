import React, { useState } from 'react';
import { marked } from 'marked';

export const AIAnalyticsSection = ({ isDark }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming we have access to profileData from AppState or similar.
      // Since DashboardChartsContent needs access to AppState, I'll assume that here too.
      // Wait, let me check how to get the profile data.
      // From src/state.js, I see AppState.profileData.
      const { AppState } = await import('../state.js');
      
      const response = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ portfolioData: AppState.profileData }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de l\'analyse');
      setAnalysis(data.analysis);
      
      // Re-trigger lucide icons
      setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
      }, 100);
      
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mt-8 p-8 rounded-3xl shadow-lg border transition-all duration-500 ease-in-out ${isDark ? 'bg-slate-900/50 border-indigo-900/50' : 'bg-white border-indigo-50 shadow-indigo-100/30'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-50'}`}>
              <i data-lucide="brain-circuit" className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}></i>
            </div>
            <h3 className={`ml-4 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>Analyse IA</h3>
        </div>
        <button 
          onClick={analyze}
          disabled={loading}
          className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md flex items-center gap-2 ${loading ? 'bg-slate-400 opacity-70' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'} text-white`}
        >
          {loading ? <i data-lucide="loader-2" className="w-5 h-5 animate-spin"></i> : <i data-lucide="sparkles" className="w-5 h-5"></i>}
          {loading ? 'Analyse en cours...' : 'Analyser le portfolio'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <i data-lucide="alert-circle" className="w-5 h-5"></i>
            {error}
        </div>
      )}
      
      {analysis && (
        <div className={`mt-6 p-6 sm:p-8 rounded-3xl text-sm ${isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-50 text-slate-700'} border ${isDark ? 'border-slate-700' : 'border-slate-100'} shadow-inner max-w-none transition-all duration-500`}>
          <div className="prose prose-slate prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(analysis) }} />
        </div>
      )}
    </div>
  );
};
