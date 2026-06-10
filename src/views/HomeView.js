import { AppState, DUMMY_SERVICES, DUMMY_FREELANCES } from '../state.js';
import { ServiceCard } from '../components/ServiceCard.js';
import { FreelanceCard } from '../components/FreelanceCard.js';

export const HomeView = {
    render: () => `
        <div class="space-y-10">
            <!-- Hero Search -->
            <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-slate-950 border border-slate-800 shadow-2xl mb-12 mt-4 px-6 py-16 sm:py-20 group">
                <!-- Decorative Background Elements -->
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 opacity-80 z-0"></div>
                <div class="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse z-0"></div>
                <div class="absolute top-1/2 -left-32 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[80px] animate-pulse z-0" style="animation-delay: 2s;"></div>
                
                <div class="relative z-10 text-center max-w-4xl mx-auto">
                    <div class="inline-flex justify-center items-center mb-8">
                        <button data-route="publish" class="group/btn relative bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex items-center text-sm hover:-translate-y-1 overflow-hidden cursor-pointer">
                            <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                            <i data-lucide="plus" class="w-4 h-4 mr-2 text-indigo-300"></i> ${AppState.t('home_add_project')}
                        </button>
                    </div>

                    <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 drop-shadow-md leading-tight">
                        ${AppState.t('home_title1')}<span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 under-glow">${AppState.t('home_title2')}</span>
                    </h1>
                    <p class="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                        ${AppState.t('home_subtitle')}
                    </p>
                    
                    <div class="bg-white/10 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-white/20 flex flex-col sm:flex-row items-center relative max-w-3xl mx-auto transition-all focus-within:bg-white/15 focus-within:border-white/30">
                        <div class="flex items-center flex-1 px-4 py-2 w-full group/input">
                            <i data-lucide="search" class="w-5 h-5 text-indigo-300 group-focus-within/input:text-white transition-colors"></i>
                            <input type="text" id="hero-search-input" placeholder="${AppState.t('home_search_placeholder1')}" class="w-full bg-transparent border-none focus:ring-0 text-white placeholder-indigo-200/50 px-4 py-2 outline-none text-base">
                        </div>
                        <div class="h-px w-full sm:h-10 sm:w-px bg-white/20 my-2 sm:my-0"></div>
                        <div class="flex items-center flex-1 px-4 py-2 w-full group/input">
                            <i data-lucide="map-pin" class="w-5 h-5 text-indigo-300 group-focus-within/input:text-white transition-colors"></i>
                            <input type="text" placeholder="${AppState.t('home_search_placeholder2')}" class="w-full bg-transparent border-none focus:ring-0 text-white placeholder-indigo-200/50 px-4 py-2 outline-none text-base">
                        </div>
                        <button id="search-btn" class="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-8 py-3.5 font-bold transition-all mt-2 sm:mt-0 sm:ml-2 flex items-center justify-center text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] cursor-pointer">
                            <i data-lucide="zap" class="w-4 h-4 mr-2"></i> ${AppState.t('home_search_btn')}
                        </button>
                    </div>
                    
                    <div class="flex justify-center flex-wrap gap-3 mt-8 max-w-2xl mx-auto" id="category-filters">
                        <span class="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/15 hover:text-white cursor-pointer transition-all hover:scale-105" data-filter="Code">${AppState.t('home_filter_code')}</span>
                        <span class="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/15 hover:text-white cursor-pointer transition-all hover:scale-105" data-filter="Design">${AppState.t('home_filter_design')}</span>
                        <span class="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/15 hover:text-white cursor-pointer transition-all hover:scale-105" data-filter="Marketing">${AppState.t('home_filter_marketing')}</span>
                    </div>
                </div>
            </div>

            <!-- Marketplace Grid -->
            <div class="px-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-0.5 tracking-tight flex items-center">
                       <i data-lucide="trending-up" class="mr-2 text-indigo-500 w-5 h-5"></i> ${AppState.t('home_services')}
                    </h2>
                    <button id="home-see-all-btn" data-route="marketplace" class="group inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/45 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white rounded-full transition-all duration-300 border border-indigo-100 dark:border-indigo-900/40 hover:scale-105 active:scale-95 shadow-sm hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/10 cursor-pointer">
                        <span>${AppState.t('home_see_all')}</span>
                        <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4" id="services-grid">
                    ${DUMMY_SERVICES.slice(0, 3).map(s => {
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
                    }).join('')}
                </div>
            </div>

            <!-- Freelances Grid -->
            <div class="mt-16 border-t border-slate-100 dark:border-slate-800/60 pt-16 px-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                       <i data-lucide="users" class="mr-3 text-indigo-500"></i> ${AppState.t('home_freelancers')}
                    </h2>
                    <div class="flex items-center gap-3 flex-1 max-w-sm w-full md:ml-auto">
                        <div class="relative w-full">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"></i>
                            <input type="text" id="freelance-search-home" placeholder="Rechercher par compétence, métier..." class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition shadow-sm text-slate-850 dark:text-slate-100">
                        </div>
                    </div>
                    <button id="home-see-profiles-btn" data-route="marketplace" class="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/45 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white rounded-full transition-all duration-300 border border-indigo-100 dark:border-indigo-900/40 hover:scale-105 active:scale-95 shadow-sm hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/10 cursor-pointer shrink-0">
                        <span>${AppState.t('home_see_profiles')}</span>
                        <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-6" id="freelances-grid">
                    ${DUMMY_FREELANCES.slice(0, 4).map(f => FreelanceCard(f)).join('')}
                </div>
            </div>

            <!-- Comment ça marche -->
            <div class="py-12 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-3xl px-8 mt-16 text-center border border-indigo-100/60 dark:border-indigo-900/40">
                <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-10 tracking-tight">${AppState.t('home_how_title')}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="flex flex-col items-center">
                        <div class="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                            <i data-lucide="search" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">${AppState.t('home_how_1_title')}</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm">${AppState.t('home_how_1_desc')}</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                            <i data-lucide="message-square" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">${AppState.t('home_how_2_title')}</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm">${AppState.t('home_how_2_desc')}</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                            <i data-lucide="shield-check" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">${AppState.t('home_how_3_title')}</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm">${AppState.t('home_how_3_desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    attachEvents: () => {
        setTimeout(() => { if (window.loadCommentCounts) window.loadCommentCounts(); }, 100);
        document.getElementById('search-btn')?.addEventListener('click', () => {
            const hSearch = document.getElementById('hero-search-input');
            const q = hSearch ? hSearch.value.trim() : '';
            import('../state.js').then(({ AppState }) => {
                if (q) {
                    AppState.preSelectedSearchQuery = q;
                }
                AppState.navigate('marketplace');
            });
        });

        // Instant Freelance Search filtering on main interface (Keywords / Skills / Professions)
        const fSearch = document.getElementById('freelance-search-home');
        const fGrid = document.getElementById('freelances-grid');
        if (fSearch && fGrid) {
            fSearch.addEventListener('input', (e) => {
                const queryVal = e.target.value.toLowerCase().trim();
                const filtered = DUMMY_FREELANCES.filter(f => {
                    const matchesName = f.name?.toLowerCase().includes(queryVal);
                    const matchesTitle = f.title?.toLowerCase().includes(queryVal);
                    const matchesSkills = f.skills?.some(s => s.toLowerCase().includes(queryVal));
                    return matchesName || matchesTitle || matchesSkills;
                });
                
                if (filtered.length > 0) {
                    const limit = queryVal ? 8 : 4;
                    fGrid.innerHTML = filtered.slice(0, limit).map(f => FreelanceCard(f)).join('');
                } else {
                    fGrid.innerHTML = `
                        <div class="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-slate-150/80">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                                <i data-lucide="users" class="w-6 h-6"></i>
                            </div>
                            <p class="text-slate-500 text-sm font-medium">Aucun freelance trouvé avec ces critères.</p>
                            <p class="text-xs text-slate-400 mt-1">Essayez une autre compétence comme React, Design, ou Marketing.</p>
                        </div>
                    `;
                }
                if (window.lucide) window.lucide.createIcons();
            });
        }

        const filters = document.querySelectorAll('#category-filters span');
        filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // UI feedback
                filters.forEach(f => {
                    f.classList.remove('bg-indigo-600', 'text-white');
                    f.classList.add('bg-slate-100', 'text-slate-600');
                });
                
                e.target.classList.remove('bg-slate-100', 'text-slate-600');
                e.target.classList.add('bg-indigo-600', 'text-white');

                const filter = e.target.getAttribute('data-filter');
                const filteredServices = DUMMY_SERVICES.filter(s => s.category.includes(filter));
                
                const grid = document.getElementById('services-grid');
                if(grid) {
                    if (filteredServices.length > 0) {
                        grid.innerHTML = filteredServices.map(s => {
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
                    } else {
                        grid.innerHTML = '<div class="col-span-3 text-center py-10 text-slate-500">Aucun service trouvé pour cette catégorie.</div>';
                    }
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        });
    }
};
