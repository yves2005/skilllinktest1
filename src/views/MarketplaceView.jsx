import React from 'react';
import { createRoot } from 'react-dom/client';
import { db } from '../services/firebase.js';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { DUMMY_SERVICES, DUMMY_FREELANCES, AppState } from '../state.js';
import { ServiceCard } from '../components/ServiceCard.js';
import { FreelanceCard } from '../components/FreelanceCard.js';
import { AiSkillSuggestions } from '../components/AiSkillSuggestions.jsx';

const SkeletonCard = () => `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
        <div class="h-48 bg-slate-200"></div>
        <div class="p-5">
            <div class="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div class="flex items-center space-x-3 mt-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-slate-200"></div>
                <div class="flex-1">
                    <div class="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div class="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
            </div>
            <div class="border-t border-slate-100 pt-4 flex justify-between items-center mt-2">
                <div class="h-4 bg-slate-200 rounded w-1/4"></div>
                <div class="h-5 bg-slate-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
`;

const FreelanceSkeletonCard = () => `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
        <div class="p-6 flex flex-col items-center">
            <div class="w-20 h-20 rounded-full bg-slate-200 mb-4"></div>
            <div class="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div class="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div class="w-24 h-8 bg-slate-200 rounded-full mb-4"></div>
            <div class="w-full border-t border-slate-100 pt-4 flex justify-between items-center mt-2">
                <div class="h-4 bg-slate-200 rounded w-1/3"></div>
                <div class="h-5 bg-slate-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
`;

export const MarketplaceView = {
    render: () => `
        <div class="mb-8 relative overflow-hidden rounded-[2rem] bg-slate-900 dark:bg-slate-950 border border-slate-800 shadow-2xl group">
            <!-- Decorative Background Elements -->
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-purple-600/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div class="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse"></div>
            <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30 animate-pulse" style="animation-delay: 2s;"></div>
            <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
            
            <div class="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-8">
                <div class="max-w-xl">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 group-hover:bg-white/15 transition-colors">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span class="text-xs font-bold text-white tracking-wide uppercase">Plus de 500 experts</span>
                    </div>
                    <h2 class="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
                        Trouvez le <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">talent idéal</span>.
                    </h2>
                    <p class="text-slate-300 text-sm sm:text-lg font-medium leading-relaxed max-w-lg">
                        Parcourez notre catalogue d'experts triés sur le volet et donnez vie à vos projets ambitieux avec les meilleurs freelances.
                    </p>
                </div>
                <div class="flex-shrink-0 relative group/btn">
                    <div class="absolute inset-0 bg-white/20 rounded-2xl blur-md group-hover/btn:blur-xl transition-all duration-300 opacity-0 group-hover/btn:opacity-100"></div>
                    <button id="ai-recommendation-btn" class="relative bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex items-center text-sm hover:-translate-y-1 overflow-hidden">
                        <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                        <div class="p-2 bg-white/10 rounded-xl mr-3 border border-white/10">
                            <i data-lucide="sparkles" class="w-5 h-5 text-indigo-300"></i>
                        </div>
                        <span class="tracking-wide">Recommandation IA</span>
                    </button>
                </div>
            </div>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Sidebar -->
            <aside class="w-full lg:w-1/4 space-y-6 self-start">
                <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800/60 sticky top-24">
                    <h3 class="font-extrabold text-slate-900 dark:text-white mb-5 flex items-center text-sm tracking-wide">
                        <div class="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg mr-2.5">
                            <i data-lucide="search" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        Recherche d'Expert
                    </h3>
                    <div class="space-y-4">
                        <div class="relative w-full group">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 absolute left-3.5 top-3 transition-colors"></i>
                            <input type="text" id="freelanceSearchInput" placeholder="Compétence ou job..." class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all dark:text-white placeholder-slate-400">
                            <div id="ai-skill-suggestions-freelance"></div>
                        </div>
                        <div class="relative w-full group">
                            <select id="freelanceCategorySelect" class="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer dark:text-white">
                                <option value="">Toutes les catégories</option>
                                <option value="Développement">Développement</option>
                                <option value="Design">Design</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Rédaction">Rédaction</option>
                            </select>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 absolute right-3.5 top-3 pointer-events-none transition-colors"></i>
                        </div>
                        <div class="relative w-full group">
                            <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 absolute left-3.5 top-3 transition-colors"></i>
                            <input type="text" id="freelanceLocationInput" placeholder="Localisation" class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all dark:text-white placeholder-slate-400">
                        </div>
                        <div class="flex gap-3">
                            <div class="relative w-1/2 group">
                                <input type="number" id="freelanceTjmMinInput" placeholder="TJM Min" min="0" step="50" class="w-full pl-3 pr-2 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all dark:text-white placeholder-slate-400">
                            </div>
                            <div class="relative w-1/2 group">
                                <input type="number" id="freelanceTjmMaxInput" placeholder="TJM Max" min="0" step="50" class="w-full pl-3 pr-2 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all dark:text-white placeholder-slate-400">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800/60 sticky top-[420px]">
                    <h3 class="font-extrabold text-slate-900 dark:text-white mb-5 flex items-center text-sm tracking-wide">
                        <div class="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg mr-2.5">
                            <i data-lucide="filter" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
                        </div>
                        Filtres Services
                    </h3>
                    
                    <div class="mb-5">
                        <h4 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Catégories</h4>
                        <div class="space-y-2.5">
                            <label class="flex items-center space-x-3 cursor-pointer group p-1 -ml-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <input type="checkbox" value="Code" class="category-filter w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 flex-shrink-0 cursor-pointer transition-colors">
                                <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Développement Web</span>
                            </label>
                            <label class="flex items-center space-x-3 cursor-pointer group p-1 -ml-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <input type="checkbox" value="Design" class="category-filter w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 flex-shrink-0 cursor-pointer transition-colors">
                                <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Design & Graphisme</span>
                            </label>
                            <label class="flex items-center space-x-3 cursor-pointer group p-1 -ml-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <input type="checkbox" value="Marketing" class="category-filter w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 flex-shrink-0 cursor-pointer transition-colors">
                                <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Marketing & SEO</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="mb-5">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Budget Max</h4>
                            <span id="budgetValue" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">5000€</span>
                        </div>
                        <input type="range" id="budgetRange" min="0" max="5000" step="100" value="5000" class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600">
                        <div class="flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">
                            <span>0€</span>
                            <span>5000€</span>
                        </div>
                    </div>
                    
                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <button id="reset-filters" class="w-full px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center group cursor-pointer border border-slate-200/50 dark:border-slate-700">
                            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 mr-2 group-hover:-rotate-90 transition-transform duration-300"></i> Réinitialiser
                        </button>
                    </div>
                </div>
            </aside>
            
            <!-- Grid -->
            <div class="w-full lg:w-3/4">

                <!-- Témoignages Vidéo Section -->
                <div class="mb-12 px-4">
                    <!-- Title & Controller Wrapper -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-150/40 dark:border-slate-800/80">
                        <div>
                            <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                <span class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150/30 dark:border-indigo-900/10 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                                    <i data-lucide="clapperboard" class="w-5 h-5"></i>
                                </span>
                                <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Studio Vidéos & Recommandations</h2>
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/10 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-100/10 dark:border-emerald-900/20 shadow-sm">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Avis Vérifiés HD
                                </span>
                            </div>
                            <p class="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium pl-0.5 max-w-xl leading-relaxed">
                                Explorez de manière immersive les retours d'expérience partagés par nos clients après réception conforme de leurs projets.
                            </p>
                        </div>
                        
                        <!-- Toggle and Count Block -->
                        <div class="flex items-center gap-3 self-start md:self-auto shrink-0 mb-0.5">
                            <!-- Style Toggle Buttons -->
                            <div class="flex items-center gap-1 bg-slate-105 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm">
                                <button id="toggle-vview-studio" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-205/10 dark:border-slate-800">
                                    <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i> Playliste
                                </button>
                                <button id="toggle-vview-immersive" class="px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                                    <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Galerie
                                </button>
                            </div>

                            <span class="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all hidden sm:inline-flex">
                                <span class="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                                <span class="font-extrabold text-indigo-600 dark:text-indigo-400" id="vtestimonials-badge-count">0</span> actifs
                            </span>
                        </div>
                    </div>
                    
                    <!-- Layout A: Main Studio Center (Bento Grid split) -->
                    <div id="video-testimonials-studio" class="hidden grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 rounded-[2.2rem] border border-slate-150 dark:border-slate-800/80 shadow-[inset_0_2px_12px_rgba(0,0,0,0.01),0_20px_40px_-15px_rgba(0,0,0,0.04)] backdrop-blur-sm">
                        <!-- Left Big Player Section (7-col) -->
                        <div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                            <!-- Movie screen -->
                            <div id="studio-active-theater" class="w-full aspect-video bg-slate-950 rounded-[1.75rem] border border-slate-200/40 dark:border-slate-800 shadow-2xl relative overflow-hidden group/theater">
                                <!-- Populated dynamically -->
                            </div>
                            
                            <!-- Large active descriptive info & feedback box -->
                            <div id="studio-active-meta" class="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-150/80 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] transition-all duration-300">
                                <!-- Populated dynamically -->
                            </div>
                        </div>
                        
                        <!-- Right Playlist Column (5-col) -->
                        <div class="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
                            <div class="flex items-center justify-between px-1 mb-1">
                                <span class="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                    <i data-lucide="play-circle" class="w-4 h-4 text-indigo-500"></i> PLAYLIST DU STUDIO
                                </span>
                                <span class="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-lg border border-indigo-500/10">
                                    CLIQUEZ POUR CHARGER
                                </span>
                            </div>
                            
                            <!-- Playlist item track -->
                            <div id="studio-playlist-items" class="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:max-h-[460px] pb-3 lg:pb-0 pr-1 select-none hide-scrollbar scroll-smooth snap-x">
                                <!-- Populated dynamically -->
                            </div>
                        </div>
                    </div>

                    <!-- Layout B: Immersive Grid/Gallery cards (Hidden by default) -->
                    <div id="video-testimonials-immersive" class="hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50/20 dark:bg-slate-950/20 p-5 rounded-[2.2rem] border border-slate-150/80 dark:border-slate-800/80">
                        <!-- Populated dynamically with high-fidelity story cards -->
                    </div>

                    <!-- Backup Carousel Skeleton layout for fallback -->
                    <div id="video-testimonials-grid" class="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        <!-- Skeletons while loading -->
                        <div class="min-w-[300px] max-w-[340px] bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-150 dark:border-slate-800/80 shadow-sm overflow-hidden animate-pulse snap-center flex-shrink-0 p-4 space-y-4">
                            <div class="aspect-video bg-slate-100 dark:bg-slate-850 rounded-2xl"></div>
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 bg-slate-100 dark:bg-slate-850 rounded-full"></div>
                                    <div class="space-y-1.5 flex-1">
                                        <div class="h-3.5 bg-slate-100 dark:bg-slate-850 rounded w-2/3"></div>
                                        <div class="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div class="h-3 bg-slate-100 dark:bg-slate-850 rounded w-full"></div>
                                <div class="h-3 bg-slate-100 dark:bg-slate-850 rounded w-4/5"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Empty State -->
                    <div id="no-video-testimonials" class="hidden text-center py-10 px-6 bg-slate-50/50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                        <div class="w-14 h-14 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-slate-150 dark:border-slate-800 text-slate-400">
                            <i data-lucide="video-off" class="w-6 h-6 text-slate-400 dark:text-slate-500"></i>
                        </div>
                        <h4 class="text-sm font-black text-slate-800 dark:text-slate-250 mb-1 leading-none">Aucun témoignage vidéo</h4>
                        <p class="text-slate-400 dark:text-slate-500 text-xs max-w-sm mx-auto">Devenez le premier à publier un avis vidéo immersif après l'approbation de votre projet avec un freelance.</p>
                    </div>
                </div>

                <!-- Freelances Section -->
                <div class="mb-10 px-4">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-bold text-slate-900">Freelances Disponibles</h2>
                        <div class="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                            <span id="freelance-result-count" class="text-indigo-600 font-bold">${DUMMY_FREELANCES.length}</span> experts
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4" id="freelance-grid">
                        ${DUMMY_FREELANCES.map(f => FreelanceCard(f)).join('')}
                    </div>
                    
                    <div id="no-freelances" class="hidden text-center py-8 bg-white rounded-xl border border-slate-200 shadow-sm mt-2">
                        <p class="text-slate-500 text-sm">Aucun expert trouvé.</p>
                    </div>
                </div>
                
                <!-- Services Section -->
                <div class="px-4">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-bold text-slate-900">Services</h2>
                        <div class="flex items-center gap-2">
                            <div class="relative w-40 sm:w-48">
                                <i data-lucide="search" class="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5"></i>
                                <input type="text" id="searchInput" placeholder="Rechercher..." class="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none shadow-sm">
                            </div>
                        </div>
                    </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4" id="marketplace-grid">
                    ${Array(6).fill(0).map(() => SkeletonCard()).join('')}
                </div>
                
                <div id="load-more-container" class="hidden mt-12 mb-4 flex justify-center">
                    <button id="load-more-btn" class="px-8 py-3 bg-white border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 font-bold rounded-2xl transition-all duration-300 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] inline-flex items-center hover:-translate-y-0.5 group cursor-pointer">
                        Charger plus <i data-lucide="chevron-down" class="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-y-1 text-slate-400 group-hover:text-indigo-500"></i>
                    </button>
                </div>
                
                <div id="no-results" class="hidden text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900">Aucun résultat trouvé</h3>
                    <p class="text-slate-500 mt-2 max-w-sm mx-auto text-sm">Nous n'avons pas trouvé de services correspondant à vos critères. Essayez d'élargir votre recherche.</p>
                    <button id="reset-action-btn" class="mt-6 text-indigo-600 hover:text-indigo-700 font-semibold text-sm hover:underline">Effacer tous les filtres</button>
                </div>
            </div>
        </div>
    `,
    attachEvents: () => {
        let isLoaded = false;
        let displayedCount = 6;
        const ITEMS_PER_PAGE = 6;
        let currentFiltered = [...DUMMY_SERVICES];

        // Load Video Testimonials
        const loadVideoTestimonials = async () => {
            const vGrid = document.getElementById('video-testimonials-grid');
            const noVTest = document.getElementById('no-video-testimonials');
            
            if (!vGrid) return;
            
            try {
                let fetchedVideos = [];
                
                // Add dummy video testimonials if they exist on DUMMY_FREELANCES
                DUMMY_FREELANCES.forEach(f => {
                    if (f.reviews && f.reviews.length > 0) {
                        f.reviews.forEach(r => {
                            if (r.videoUrl) {
                                fetchedVideos.push({...r, freelanceName: f.name, freelanceId: f.id});
                            }
                        });
                    }
                });

                // Get active real users to query their reviews
                let realUserIds = [];
                try {
                    const realUsersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
                    realUserIds = realUsersSnap.docs.map(i => i.id);
                } catch(usersErr) {
                    console.warn("Could not fetch real users:", usersErr);
                }
                
                const allFids = Array.from(new Set([...DUMMY_FREELANCES.map(f => f.id), ...realUserIds]));
                
                const promises = allFids.map(async (fid) => {
                    try {
                        const rq = query(collection(db, `users/${fid}/reviews`), limit(15));
                        const rs = await getDocs(rq);
                        rs.forEach(docSnap => {
                            const d = docSnap.data();
                            if (d.videoUrl && d.videoUrl.trim() !== '') {
                                // Match freelanceName
                                const fName = DUMMY_FREELANCES.find(f => f.id === fid)?.name || d.freelanceName || 'Expert';
                                fetchedVideos.push({...d, freelanceId: fid, freelanceName: fName});
                            }
                        });
                    } catch(e) {
                         console.warn("Failed fetching reviews for", fid, e);
                    }
                });
                
                await Promise.all(promises);
                
                // Deduplicate
                const uniqueVideosMap = new Map();
                fetchedVideos.forEach(v => {
                    uniqueVideosMap.set(`${v.videoUrl}_${v.freelanceId}`, v);
                });
                
                let uniqueVideos = Array.from(uniqueVideosMap.values());
                uniqueVideos.sort((a,b) => {
                    const timeA = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                    const timeB = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                    return timeB - timeA;
                });
                
                const finalDocs = uniqueVideos.slice(0, 10);
                
                const badgeCount = document.getElementById('vtestimonials-badge-count');
                const studioEl = document.getElementById('video-testimonials-studio');
                
                if (finalDocs.length === 0) {
                    if (vGrid) vGrid.classList.add('hidden');
                    if (studioEl) studioEl.classList.add('hidden');
                    if (noVTest) noVTest.classList.remove('hidden');
                    return;
                }
                
                if (vGrid) vGrid.classList.add('hidden');
                if (noVTest) noVTest.classList.add('hidden');
                if (studioEl) {
                    studioEl.classList.remove('hidden');
                    studioEl.classList.add('grid');
                }
                if (badgeCount) badgeCount.textContent = finalDocs.length;
                
                let activeIndex = 0;
                
                const updateStudioView = () => {
                    const d = finalDocs[activeIndex];
                    if (!d) return;
                    
                    const theaterEl = document.getElementById('studio-active-theater');
                    const metaEl = document.getElementById('studio-active-meta');
                    const playlistEl = document.getElementById('studio-playlist-items');
                    
                    if (!theaterEl || !metaEl || !playlistEl) return;
                    
                    const vUrl = d.videoUrl || '';
                    const isYt = vUrl.includes('youtube.com/watch?v=') || vUrl.includes('youtu.be/');
                    const youtubeId = isYt ? (vUrl.includes('youtube.com/watch?v=') ? vUrl.split('v=')[1].split('&')[0] : vUrl.split('youtu.be/')[1].split('?')[0]) : '';
                    const iframeSrc = isYt ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3` : '';
                    
                    // 1. Render Theater Player Screen
                    theaterEl.innerHTML = isYt ? `
                        <div class="w-full h-full relative group">
                            <iframe width="100%" height="100%" src="${iframeSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full h-full rounded-[1.75rem] border-none"></iframe>
                            <!-- HD Floating Badge -->
                            <span class="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md text-[9px] font-black tracking-wider text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 uppercase shadow-sm pointer-events-none">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Lecteur HD
                            </span>
                        </div>
                    ` : `
                        <div class="w-full h-full relative group/video bg-slate-950 flex items-center justify-center">
                            <video id="studio-real-video" src="${AppState.escapeHtml(vUrl)}" class="w-full h-full object-cover rounded-[1.75rem]" preload="metadata" playsinline></video>
                            
                            <span class="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-[9px] font-black tracking-wider text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 uppercase shadow-sm pointer-events-none z-10">
                                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Lecteur Local
                            </span>

                            <!-- Play/Pause Centered Big Button -->
                            <button id="studio-btn-play-pause" class="absolute inset-0 m-auto w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md rounded-full text-white pointer-events-auto transition-all shadow-2xl border border-white/20 hover:scale-105 cursor-pointer z-10">
                                <i data-lucide="play" class="w-6 h-6 ml-0.5" id="studio-icon-play"></i>
                                <i data-lucide="pause" class="w-6 h-6 hidden" id="studio-icon-pause"></i>
                            </button>

                            <!-- Custom Controls Panel -->
                            <div class="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3 transition-opacity duration-300 opacity-90 group-hover/video:opacity-100 z-10 select-none">
                                <!-- Timestamp -->
                                <span class="text-[9px] font-mono font-bold text-slate-300 shrink-0 tracking-wider" id="studio-time-counter">0:00</span>
                                
                                <!-- Timeline -->
                                <div id="studio-progress-container" class="flex-1 h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer relative transition-all overflow-hidden">
                                    <div id="studio-progress-bar" class="absolute top-0 left-0 h-full bg-indigo-500 rounded-full w-0 transition-all duration-100"></div>
                                </div>

                                <!-- Mute -->
                                <button id="studio-btn-mute" class="text-slate-200 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" title="Couper le son">
                                    <i data-lucide="volume-2" class="w-4 h-4" id="studio-icon-volume"></i>
                                    <i data-lucide="volume-x" class="w-4 h-4 hidden" id="studio-icon-mute"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // 2. Render Active Metadata Info
                    metaEl.innerHTML = `
                        <div class="flex flex-col md:flex-row gap-5 items-start justify-between w-full">
                            <div class="flex-grow space-y-3.5 min-w-0 w-full md:w-auto">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-950 text-white dark:text-indigo-400 border border-indigo-400 dark:border-indigo-900/45 flex items-center justify-center font-black text-sm shadow-md shrink-0">
                                        ${(d.author || 'C').charAt(0)}
                                    </div>
                                    <div class="min-w-0">
                                        <div class="flex items-center gap-1.5">
                                            <h4 class="text-sm font-black text-slate-900 dark:text-white truncate">${AppState.escapeHtml(d.author) || 'Client vérifié'}</h4>
                                            <span class="inline-flex items-center justify-center p-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0" title="Identité confirmée">
                                                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                                            </span>
                                        </div>
                                        <p class="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">Acheteur Vérifié • Commande Réussie</p>
                                    </div>
                                </div>

                                <!-- Quote container -->
                                <div class="relative bg-slate-50/70 dark:bg-slate-950/20 p-4 sm:p-5 rounded-2xl border border-slate-150/60 dark:border-slate-800/60 shadow-inner">
                                    <span class="absolute right-4 bottom-3 text-slate-200 dark:text-slate-800/80 pointer-events-none select-none">
                                        <i data-lucide="quote" class="w-7 h-7 opacity-30"></i>
                                    </span>
                                    <p class="text-xs sm:text-[13px] text-slate-600 dark:text-slate-350 italic font-semibold leading-relaxed relative z-10 whitespace-pre-line">
                                        "${AppState.escapeHtml(d.text)}"
                                    </p>
                                </div>
                            </div>

                            <!-- Floating Provider/Partner Box -->
                            <div class="w-full md:w-56 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/40 dark:to-slate-950/10 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between gap-3 shrink-0">
                                <div>
                                    <span class="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Expert Partenaire</span>
                                    <div class="flex items-center gap-2.5 mt-2">
                                        <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black shrink-0 uppercase">
                                            ${(d.freelanceName || 'P').charAt(0)}
                                        </div>
                                        <div class="min-w-0">
                                            <p class="text-xs font-black text-slate-950 dark:text-white truncate leading-none">${AppState.escapeHtml(d.freelanceName || 'Prestataire')}</p>
                                            <div class="flex items-center gap-0.5 mt-1 select-none">
                                                <i data-lucide="star" class="w-2.5 h-2.5 text-amber-500 fill-amber-500"></i>
                                                <span class="text-[9px] font-bold text-slate-500 dark:text-slate-400">Collaboration approuvée (${Number(d.rating || 5).toFixed(1)}/5)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button onclick="event.stopPropagation(); window.openFreelancerProfileModal('${d.freelanceId}')" class="w-full text-[9px] font-extrabold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-550 border border-transparent hover:border-indigo-500/20 py-2.5 px-3 rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 duration-300">
                                    Voir profil <i data-lucide="arrow-right-circle" class="w-3.5 h-3.5"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // 3. Render Playlist Items
                    playlistEl.innerHTML = finalDocs.map((doc, idx) => {
                        const isCurrent = idx === activeIndex;
                        return `
                            <div data-playlist-idx="${idx}" class="min-w-[270px] sm:min-w-[310px] lg:min-w-0 w-full flex-shrink-0 lg:flex-shrink p-3 rounded-2xl border transition-all duration-300 cursor-pointer snap-center select-none flex items-center gap-3 ${isCurrent ? 'bg-indigo-600/5 dark:bg-indigo-550/10 border-indigo-300 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850 hover:-translate-y-0.5 active:scale-[0.99]'}">
                                <!-- Mini Visual State Thumbnail -->
                                <div class="w-16 h-11 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-200/5 dark:border-white/10 shrink-0 shadow-inner flex items-center justify-center">
                                    <div class="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950/70 to-slate-900 opacity-90 z-0"></div>
                                    <div class="relative z-10 w-6 h-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white transition-transform ${isCurrent ? 'scale-105 bg-indigo-600 text-white' : 'group-hover:scale-110'}">
                                        <i data-lucide="${isCurrent ? 'radio' : 'play'}" class="w-3 h-3 ${isCurrent ? 'animate-pulse' : ''}"></i>
                                    </div>
                                </div>

                                <!-- Text Snippets -->
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center justify-between gap-1">
                                        <span class="text-xs font-black text-slate-950 dark:text-white truncate max-w-[140px]">${AppState.escapeHtml(doc.author) || 'Client'}</span>
                                        <div class="flex items-center gap-0.5 shrink-0 select-none">
                                            <i data-lucide="star" class="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0"></i>
                                            <span class="text-[9px] font-bold text-amber-600 dark:text-amber-400">${Number(doc.rating || 5).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-tight">"${AppState.escapeHtml(doc.text)}"</p>
                                    <p class="text-[9px] font-semibold text-slate-400 dark:text-slate-500 truncate mt-1">Par ${AppState.escapeHtml(doc.freelanceName)}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                    
                    // 4. Update Lucide Icons in the newly updated block
                    if (window.lucide) {
                        window.lucide.createIcons({
                            root: theaterEl
                        });
                        window.lucide.createIcons({
                            root: metaEl
                        });
                        window.lucide.createIcons({
                            root: playlistEl
                        });
                    }
                    
                    // 5. Hook custom local video listeners (if direct MP4)
                    if (!isYt) {
                        const video = document.getElementById('studio-real-video');
                        const playPauseBtn = document.getElementById('studio-btn-play-pause');
                        const muteBtn = document.getElementById('studio-btn-mute');
                        const progressContainer = document.getElementById('studio-progress-container');
                        const progressBar = document.getElementById('studio-progress-bar');
                        const timeCounter = document.getElementById('studio-time-counter');
                        
                        const iconPlay = document.getElementById('studio-icon-play');
                        const iconPause = document.getElementById('studio-icon-pause');
                        const iconVolume = document.getElementById('studio-icon-volume');
                        const iconMute = document.getElementById('studio-icon-mute');
                        
                        if (video) {
                            video.muted = true;
                            if (iconVolume) iconVolume.classList.add('hidden');
                            if (iconMute) iconMute.classList.remove('hidden');
                        }
                        
                        if (playPauseBtn && video) {
                            playPauseBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (video.paused) {
                                    video.play().catch(err => console.warn('Play restricted:', err));
                                } else {
                                    video.pause();
                                }
                            });
                        }
                        
                        if (muteBtn && video) {
                            muteBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                video.muted = !video.muted;
                                if (video.muted) {
                                    iconVolume?.classList.add('hidden');
                                    iconMute?.classList.remove('hidden');
                                } else {
                                    iconVolume?.classList.remove('hidden');
                                    iconMute?.classList.add('hidden');
                                }
                            });
                        }
                        
                        if (progressContainer && video) {
                            progressContainer.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const rect = progressContainer.getBoundingClientRect();
                                const pos = (e.clientX - rect.left) / rect.width;
                                if (video.duration) {
                                    video.currentTime = pos * video.duration;
                                }
                            });
                        }
                        
                        if (video) {
                            video.addEventListener('play', () => {
                                iconPlay?.classList.add('hidden');
                                iconPause?.classList.remove('hidden');
                            });
                            video.addEventListener('pause', () => {
                                iconPlay?.classList.remove('hidden');
                                iconPause?.classList.add('hidden');
                            });
                            video.addEventListener('timeupdate', () => {
                                if (progressBar && video.duration) {
                                    const percent = (video.currentTime / video.duration) * 100;
                                    progressBar.style.width = `${percent}%`;
                                }
                                if (timeCounter) {
                                    const mins = Math.floor(video.currentTime / 60);
                                    const secs = Math.floor(video.currentTime % 60);
                                    timeCounter.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                                }
                            });
                            video.addEventListener('ended', () => {
                                iconPlay?.classList.remove('hidden');
                                iconPause?.classList.add('hidden');
                                if (progressBar) progressBar.style.width = '0%';
                                if (timeCounter) timeCounter.textContent = '0:00';
                            });
                        }
                    }
                    
                    // 6. Hook Playlist Click events
                    const items = playlistEl.querySelectorAll('[data-playlist-idx]');
                    items.forEach(item => {
                        item.addEventListener('click', (e) => {
                            e.stopPropagation();
                            activeIndex = parseInt(item.getAttribute('data-playlist-idx'));
                            updateStudioView();
                        });
                    });
                };
                
                // Initial draw call
                updateStudioView();
            } catch (err) {
                console.warn("Could not load video testimonials:", err);
                if (studioEl) studioEl.classList.add('hidden');
                if (noVTest) noVTest.classList.remove('hidden');
            }
        };

        loadVideoTestimonials();

        // Services DOM
        const grid = document.getElementById('marketplace-grid');
        const noResults = document.getElementById('no-results');
        const count = document.getElementById('result-count');
        
        // Freelances DOM
        const freelanceGrid = document.getElementById('freelance-grid');
        const noFreelances = document.getElementById('no-freelances');
        const freelanceCount = document.getElementById('freelance-result-count');
        const freelanceSearchInput = document.getElementById('freelanceSearchInput');
        const freelanceCategorySelect = document.getElementById('freelanceCategorySelect');
        const freelanceLocationInput = document.getElementById('freelanceLocationInput');
        const freelanceTjmMinInput = document.getElementById('freelanceTjmMinInput');
        const freelanceTjmMaxInput = document.getElementById('freelanceTjmMaxInput');

        if (AppState.preSelectedSearchQuery && freelanceSearchInput) {
            freelanceSearchInput.value = AppState.preSelectedSearchQuery;
            delete AppState.preSelectedSearchQuery;
        }

        const loadMoreCont = document.getElementById('load-more-container');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        const categoryFilters = document.querySelectorAll('.category-filter');
        const budgetRange = document.getElementById('budgetRange');
        const budgetValue = document.getElementById('budgetValue');
        const resetBtn = document.getElementById('reset-filters');
        const resetActionBtn = document.getElementById('reset-action-btn');
        const searchInput = document.getElementById('searchInput');
        const voiceSearchBtn = document.getElementById('voice-search-btn');
        const aiRecBtn = document.getElementById('ai-recommendation-btn');
        
        if (aiRecBtn) {
            aiRecBtn.addEventListener('click', () => {
                if (freelanceSearchInput) {
                    freelanceSearchInput.focus();
                    freelanceSearchInput.placeholder = "IA: Quel expert recherchez-vous ?";
                }
            });
        }

        // ==== FREELANCES FILTERING ====
        let typingTimer;
        const updateFreelanceGrid = () => {
            clearTimeout(typingTimer);
            
            if (freelanceGrid) {
                freelanceGrid.innerHTML = Array(6).fill(0).map(() => FreelanceSkeletonCard()).join('');
                freelanceGrid.classList.remove('hidden');
            }
            if (noFreelances) noFreelances.classList.add('hidden');

            typingTimer = setTimeout(() => {
                const query = freelanceSearchInput ? freelanceSearchInput.value.toLowerCase().trim() : '';
                const categorySelectValue = freelanceCategorySelect ? freelanceCategorySelect.value : '';
                const locationQuery = freelanceLocationInput ? freelanceLocationInput.value.toLowerCase().trim() : '';
                const tjmMin = freelanceTjmMinInput && freelanceTjmMinInput.value ? parseInt(freelanceTjmMinInput.value, 10) : 0;
                const tjmMax = freelanceTjmMaxInput && freelanceTjmMaxInput.value ? parseInt(freelanceTjmMaxInput.value, 10) : Infinity;
    
                const filtered = DUMMY_FREELANCES.filter(f => {
                    const matchName = f.name && f.name.toLowerCase().includes(query);
                    const matchTitle = f.title && f.title.toLowerCase().includes(query);
                    const matchSkills = f.skills && f.skills.some(s => s.toLowerCase().includes(query));
                    const textMatch = matchName || matchTitle || matchSkills;
                    
                    const matchLocation = locationQuery === '' || (f.location && f.location.toLowerCase().includes(locationQuery));
                    const currentTjm = f.tjm || 0;
                    const matchTjm = currentTjm >= tjmMin && currentTjm <= tjmMax;
    
                    // Simple category fallback parsing based on dummy data categories, mapping to the defined options
                    let matchCategory = true;
                    if (categorySelectValue) {
                        const lCategory = categorySelectValue.toLowerCase();
                        // Map dummy titles to our dropdown categories:
                        let fCats = "Aucune";
                        const tl = (f.title || '').toLowerCase() + " " + (f.skills || []).join(" ").toLowerCase();
                        if (tl.includes('développeur') || tl.includes('react') || tl.includes('python')) fCats = 'développement';
                        else if (tl.includes('design') || tl.includes('ui/ux')) fCats = 'design';
                        else if (tl.includes('marketing') || tl.includes('seo') || tl.includes('growth')) fCats = 'marketing';
                        else if (tl.includes('rédaction') || tl.includes('copy')) fCats = 'rédaction';
    
                        matchCategory = fCats === lCategory;
                    }
    
                    return textMatch && matchCategory && matchLocation && matchTjm;
                });
    
                if (freelanceCount) freelanceCount.innerText = filtered.length;
    
                if (freelanceGrid) {
                    if (filtered.length > 0) {
                        freelanceGrid.innerHTML = filtered.map(f => FreelanceCard(f)).join('');
                        freelanceGrid.classList.remove('hidden');
                        if (noFreelances) noFreelances.classList.add('hidden');
                    } else {
                        freelanceGrid.innerHTML = '';
                        freelanceGrid.classList.add('hidden');
                        if (noFreelances) noFreelances.classList.remove('hidden');
                    }
                }
    
                if (window.lucide) window.lucide.createIcons();
            }, 600); // Animation feeling
        };

        if (freelanceSearchInput) {
            freelanceSearchInput.addEventListener('input', updateFreelanceGrid);
        }
        if (freelanceCategorySelect) {
            freelanceCategorySelect.addEventListener('change', updateFreelanceGrid);
        }
        if (freelanceLocationInput) {
            freelanceLocationInput.addEventListener('input', updateFreelanceGrid);
        }
        if (freelanceTjmMinInput) {
            freelanceTjmMinInput.addEventListener('input', updateFreelanceGrid);
        }
        if (freelanceTjmMaxInput) {
            freelanceTjmMaxInput.addEventListener('input', updateFreelanceGrid);
        }
        
        if (freelanceGrid) {
            freelanceGrid.addEventListener('click', (e) => {
                const skillBtn = e.target.closest('.skill-filter-tag');
                if (skillBtn) {
                    e.stopPropagation();
                    const skill = skillBtn.getAttribute('data-skill');
                    if (freelanceSearchInput) {
                        freelanceSearchInput.value = skill;
                        updateFreelanceGrid();
                        // Scroll top smoothly up to the search bar so they see the result of their click
                        freelanceSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
        }
        // ==============================

        // Configuration de la recherche vocale
        if (voiceSearchBtn) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'fr-FR';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onstart = () => {
                    voiceSearchBtn.classList.remove('text-slate-400', 'hover:text-indigo-600');
                    voiceSearchBtn.classList.add('text-red-500', 'animate-pulse');
                };

                recognition.onresult = (event) => {
                    if (event.results && event.results[0] && event.results[0][0]) {
                        searchInput.value = event.results[0][0].transcript;
                        updateGrid();
                    }
                };

                recognition.onend = () => {
                    voiceSearchBtn.classList.remove('text-red-500', 'animate-pulse');
                    voiceSearchBtn.classList.add('text-slate-400', 'hover:text-indigo-600');
                };

                recognition.onerror = (event) => {
                    console.warn('Information de reconnaissance vocale (Micro externe potentiellement requis):', event.error);
                    voiceSearchBtn.classList.remove('text-red-500', 'animate-pulse');
                    voiceSearchBtn.classList.add('text-slate-400', 'hover:text-indigo-600');
                };

                voiceSearchBtn.addEventListener('click', () => {
                    try {
                        recognition.start();
                    } catch(e) {
                        console.error('Erreur au démarrage de la reconnaissance vocale', e);
                    }
                });
            } else {
                voiceSearchBtn.style.display = 'none';
            }
        }
        
        const renderGrid = () => {
            if (currentFiltered.length > 0) {
                if (grid) {
                    grid.innerHTML = currentFiltered.slice(0, displayedCount).map(s => {
                        let authorImg = null;
                        if (AppState.user && s.authorId === AppState.user.uid && AppState.profileData?.avatarImage) {
                            authorImg = AppState.profileData.avatarImage;
                        } else {
                            const authorInfo = DUMMY_FREELANCES.find(f => f.uid === s.authorId);
                            if (authorInfo && authorInfo.img) {
                                authorImg = authorInfo.img;
                            }
                        }
                        if (authorImg) {
                            return ServiceCard({ ...s, authorImg });
                        }
                        return ServiceCard(s);
                    }).join('');
                    grid.classList.remove('hidden');
                }
                if (noResults) noResults.classList.add('hidden');
                
                if (loadMoreCont) {
                    if (displayedCount < currentFiltered.length) {
                        loadMoreCont.classList.remove('hidden');
                    } else {
                        loadMoreCont.classList.add('hidden');
                    }
                }
                setTimeout(() => { if(window.loadCommentCounts) window.loadCommentCounts() }, 50);
            } else {
                if (grid) {
                    grid.innerHTML = '';
                    grid.classList.add('hidden');
                }
                if (noResults) noResults.classList.remove('hidden');
                if (loadMoreCont) loadMoreCont.classList.add('hidden');
            }
            
            if (count) count.innerText = currentFiltered.length;
            if (window.lucide) window.lucide.createIcons();
        };

        const updateGrid = () => {
            if (!isLoaded) return;
            
            const selectedCategories = Array.from(categoryFilters)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            const maxBudget = parseInt(budgetRange.value, 10);
            const searchQuery = searchInput.value.toLowerCase().trim();
            
            currentFiltered = DUMMY_SERVICES.filter(service => {
                if (selectedCategories.length > 0 && !selectedCategories.includes(service.category)) {
                    return false;
                }
                
                const priceMatch = service.price.match(/(\d+)/);
                const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;
                
                if (price > maxBudget) return false;
                
                if (searchQuery && !service.title.toLowerCase().includes(searchQuery) && !service.auteur.toLowerCase().includes(searchQuery)) {
                    return false;
                }
                
                return true;
            });
            
            displayedCount = ITEMS_PER_PAGE;
            renderGrid();
        };

        categoryFilters.forEach(cb => cb.addEventListener('change', updateGrid));
        
        budgetRange?.addEventListener('input', (e) => {
            budgetValue.innerText = e.target.value + '€';
            updateGrid();
        });
        
        searchInput?.addEventListener('input', updateGrid);
        
        const performReset = () => {
            categoryFilters.forEach(cb => cb.checked = false);
            budgetRange.value = 5000;
            budgetValue.innerText = '5000€';
            searchInput.value = '';
            updateGrid();
        };

        resetBtn?.addEventListener('click', performReset);
        resetActionBtn?.addEventListener('click', performReset);
        
        loadMoreBtn?.addEventListener('click', () => {
            loadMoreBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';
            if (window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                displayedCount += ITEMS_PER_PAGE;
                renderGrid();
                loadMoreBtn.innerHTML = 'Charger plus <i data-lucide="chevron-down" class="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-y-1 text-slate-400 group-hover:text-indigo-500"></i>';
                if (window.lucide) window.lucide.createIcons();
            }, 50);
        });
        
        // Render AiSkillSuggestions
        const aiSuggestionsContainer = document.getElementById('ai-skill-suggestions-freelance');
        if (aiSuggestionsContainer) {
            const root = createRoot(aiSuggestionsContainer);
            root.render(<AiSkillSuggestions inputId="freelanceSearchInput" />);
            aiSuggestionsContainer.__reactRoot = root;
        }

        // Initialiser la grid directement sans délai artificiel
        isLoaded = true;
        updateGrid();
    }
};
