import { AppState, DUMMY_SERVICES, DUMMY_FREELANCES } from '../state.js';
import { ServiceCard } from '../components/ServiceCard.js';
import { FreelanceCard } from '../components/FreelanceCard.js';

export const HomeView = {
    render: () => `
        <div class="space-y-10">
            <!-- Hero Search -->
            <div class="text-center max-w-3xl mx-auto pt-6 px-4">
                <h1 class="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">${AppState.t('home_title1')}<span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">${AppState.t('home_title2')}</span></h1>
                <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6">${AppState.t('home_subtitle')}</p>
                
                <div class="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8">
                    <button data-route="publish" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-bold transition flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i> ${AppState.t('home_add_project')}
                    </button>
                </div>
                
                <div class="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center relative">
                    <div class="flex items-center flex-1 px-3 w-full">
                        <i data-lucide="search" class="w-5 h-5 text-slate-400 dark:text-slate-500"></i>
                        <input type="text" id="hero-search-input" placeholder="${AppState.t('home_search_placeholder1')}" class="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 px-3 py-2.5 outline-none text-sm">
                    </div>
                    <div class="h-px w-full sm:h-8 sm:w-px bg-slate-200 dark:bg-slate-700"></div>
                    <div class="flex items-center flex-1 px-3 w-full">
                        <i data-lucide="map-pin" class="w-5 h-5 text-slate-400 dark:text-slate-500"></i>
                        <input type="text" placeholder="${AppState.t('home_search_placeholder2')}" class="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 px-3 py-2.5 outline-none text-sm">
                    </div>
                    <button id="search-btn" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition mt-1.5 sm:mt-0 sm:ml-2 flex items-center justify-center text-sm">
                        <i data-lucide="zap" class="w-4 h-4 mr-2"></i> ${AppState.t('home_search_btn')}
                    </button>
                </div>
                
                <div class="flex justify-center space-x-2 mt-5 overflow-x-auto pb-2 px-2" id="category-filters">
                    <span class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition whitespace-nowrap" data-filter="Code">${AppState.t('home_filter_code')}</span>
                    <span class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition whitespace-nowrap" data-filter="Design">${AppState.t('home_filter_design')}</span>
                    <span class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition whitespace-nowrap" data-filter="Marketing">${AppState.t('home_filter_marketing')}</span>
                </div>
            </div>

            <!-- Marketplace Grid -->
            <div class="px-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-slate-900 flex items-center">
                       <i data-lucide="trending-up" class="mr-2 text-indigo-500 w-5 h-5"></i> ${AppState.t('home_services')}
                    </h2>
                    <button data-route="marketplace" class="text-indigo-600 hover:text-indigo-700 font-medium text-xs flex items-center">
                        ${AppState.t('home_see_all')} <i data-lucide="arrow-right" class="w-3 h-3 ml-1"></i>
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
            <div class="mt-16 border-t border-slate-100 pt-16 px-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 class="text-2xl font-bold text-slate-900 flex items-center">
                       <i data-lucide="users" class="mr-3 text-indigo-500"></i> ${AppState.t('home_freelancers')}
                    </h2>
                    <div class="flex items-center gap-3 flex-1 max-w-sm w-full md:ml-auto">
                        <div class="relative w-full">
                            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
                            <input type="text" id="freelance-search-home" placeholder="Rechercher par compétence, métier..." class="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition shadow-sm text-slate-850">
                        </div>
                    </div>
                    <button data-route="marketplace" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center shrink-0">
                        ${AppState.t('home_see_profiles')} <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-6" id="freelances-grid">
                    ${DUMMY_FREELANCES.slice(0, 4).map(f => FreelanceCard(f)).join('')}
                </div>
            </div>

            <!-- Comment ça marche -->
            <div class="py-12 bg-indigo-50 rounded-3xl px-8 mt-16 text-center border border-indigo-100">
                <h2 class="text-2xl font-bold text-slate-900 mb-10">${AppState.t('home_how_title')}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="flex flex-col items-center">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
                            <i data-lucide="search" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">${AppState.t('home_how_1_title')}</h3>
                        <p class="text-slate-600 text-sm">${AppState.t('home_how_1_desc')}</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
                            <i data-lucide="message-square" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">${AppState.t('home_how_2_title')}</h3>
                        <p class="text-slate-600 text-sm">${AppState.t('home_how_2_desc')}</p>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
                            <i data-lucide="shield-check" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">${AppState.t('home_how_3_title')}</h3>
                        <p class="text-slate-600 text-sm">${AppState.t('home_how_3_desc')}</p>
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
