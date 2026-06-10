import React, { useState, useEffect } from 'react';

// Elegant messages reflecting the high-end connection nature of SkillLink
const CONFIG_PHASES = [
    "Initialisation de la session...",
    "Connexion sécurisée aux serveurs...",
    "Synchronisation des profils de talents...",
    "Préparation de l'espace SkillLink..."
];

export const LoadingOverlay = ({ show = true, customMessage = null }) => {
    const [render, setRender] = useState(show);
    const [phaseIndex, setPhaseIndex] = useState(0);

    // Keep the element in the DOM until fade-out transition finishes
    useEffect(() => {
        if (show) {
            setRender(true);
        } else {
            const timer = setTimeout(() => setRender(false), 550);
            return () => clearTimeout(timer);
        }
    }, [show]);

    // Fast and elegant phase rotation to show active background work
    useEffect(() => {
        if (!show || customMessage) return;
        const interval = setInterval(() => {
            setPhaseIndex((prev) => (prev + 1) % CONFIG_PHASES.length);
        }, 850);
        return () => clearInterval(interval);
    }, [show, customMessage]);

    if (!render) return null;

    return (
        <div id="skilllink-global-loader" className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xl transition-all duration-500 ease-out ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            
            {/* Glowing background ambient orbs for premium modern look */}
            <div className={`absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full filter blur-[100px] transition-transform duration-1000 ${show ? 'scale-110' : 'scale-90'}`}></div>
            <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 dark:bg-violet-500/15 rounded-full filter blur-[100px] transition-transform duration-1000 ${show ? 'scale-110' : 'scale-90'}`}></div>

            {/* Main Premium Card */}
            <div className={`bg-white/90 dark:bg-slate-900/90 border border-slate-150/40 dark:border-slate-800/80 p-10 rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col items-center max-w-sm w-full mx-4 backdrop-blur-md transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                
                {/* Logo Container / Orbital Skills Connector Spinner */}
                <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                    {/* Pulsing outer glow */}
                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 animate-ping duration-[3000ms]"></div>
                    
                    {/* Ring 1 - Outer Slow Clockwise Spinner */}
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-100 dark:border-slate-800/60"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 border-r-indigo-600/40 animate-spin" style={{ animationDuration: '3s' }}></div>
                    
                    {/* Ring 2 - Inner Fast Counter-Clockwise Spinner */}
                    <div className="absolute inset-3 rounded-full border border-violet-100/50 dark:border-slate-850"></div>
                    <div className="absolute inset-3 rounded-full border border-transparent border-b-violet-500 dark:border-b-violet-400 border-l-violet-500/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

                    {/* Ring 3 - Innermost Orbit Center */}
                    <div className="absolute inset-6 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                        {/* Elegant custom linked nodes icon instead of generic SVGs */}
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <circle cx="4" cy="5" r="2" />
                            <polyline points="14 4 20 4 20 10" />
                            <path d="m14 10 6-6" />
                            <circle cx="20" cy="19" r="2" />
                            <path d="m4 19 6-6" />
                        </svg>
                    </div>
                </div>

                {/* SkillLink Typography Branding */}
                <span className="text-[10px] font-extrabold tracking-[0.3em] uppercase text-indigo-500 dark:text-indigo-400 mb-1">Plateforme</span>
                <h3 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
                    Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300">Link</span>
                </h3>
                
                {/* Custom Slogan */}
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                    <span>Talent</span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400/60"></span>
                    <span>Liaison</span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400/60"></span>
                    <span>Succès</span>
                </div>

                {/* Progress Loading Track */}
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-[4px] rounded-full overflow-hidden mb-5 relative">
                    <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 h-full w-4/5 rounded-full animate-pulse transition-all duration-300"></div>
                </div>

                {/* Dynamic Onboarding Message */}
                <div className="h-6 flex items-center justify-center">
                    <p className="text-xs text-center font-semibold text-indigo-600 dark:text-indigo-400/90 tracking-wide select-none animate-pulse transition-all duration-200">
                        {customMessage ? customMessage : CONFIG_PHASES[phaseIndex]}
                    </p>
                </div>

                {/* Footnote */}
                <p className="text-[10px] text-slate-400 dark:text-slate-500/80 text-center mt-3 select-none">
                    Espace de travail crypté et synchronisé en temps réel
                </p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
