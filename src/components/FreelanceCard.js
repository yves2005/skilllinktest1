export const renderFreelanceBadges = (freelance) => {
    const rating = parseFloat(freelance.rating) || 0;
    const reviewsCount = parseInt(freelance.reviewsCount, 10) || 0;
    const portfolioCount = (freelance.portfolio || []).length;
    
    // Determine completed projects from profile stats if available, or fall back to portfolio/reviews
    let completedProjects = portfolioCount;
    if (freelance.stats) {
        const completedStat = freelance.stats.find(s => s.label === "Projets réussis" || s.label === "Projets");
        if (completedStat) {
            completedProjects = Math.max(completedProjects, parseInt(completedStat.value, 10) || 0);
        }
    }
    
    const badges = [];
    
    // Top Rated badge criteria: Rating >= 4.8 and at least some review or portfolio activity
    if (rating >= 4.8 && (reviewsCount >= 3 || completedProjects >= 1)) {
        badges.push({
            id: 'top-rated',
            label: 'Top Rated',
            icon: 'award',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700',
            borderColor: 'border-amber-200',
            title: "Expert d'exception avec des évaluations excellentes (> 4.8/5) et des livraisons certifiées"
        });
    } else if (rating >= 4.6) {
        badges.push({
            id: 'recommanded',
            label: 'Recommandé',
            icon: 'thumbs-up',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-700',
            borderColor: 'border-indigo-100',
            title: "Hautement recommandé par la communauté SkillLink"
        });
    }
    
    // Trusted member badge criteria: Completed projects / portfolio size or reviews count
    if (completedProjects >= 5 || reviewsCount >= 8) {
        badges.push({
            id: 'expert',
            label: 'Expert Confirmé',
            icon: 'shield-check',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-700',
            borderColor: 'border-emerald-200',
            title: "Professionnel ayant finalisé de nombreux projets d'envergure sur la plateforme"
        });
    } else if (completedProjects >= 1 || reviewsCount >= 3) {
        badges.push({
            id: 'trusted',
            label: 'Membre Vérifié',
            icon: 'check-circle',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-100',
            title: "Profil vérifié avec portfolio et projets livrés avec succès"
        });
    }
    
    if (badges.length === 0) return '';
    
    return `
        <div class="flex flex-wrap gap-1.5 justify-center mb-4">
            ${badges.map(b => `
                <span class="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl ${b.bgColor} ${b.textColor} border ${b.borderColor} transition-all duration-300 hover:scale-105 shadow-sm" title="${b.title}">
                    <i data-lucide="${b.icon}" class="w-3" style="height: 12px; width: 12px;"></i>
                    ${b.label}
                </span>
            `).join('')}
        </div>
    `;
};

export const FreelanceCard = (freelance) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorited = favorites.includes(freelance.id);
    const favoriteClasses = isFavorited ? 'text-red-500' : 'text-slate-300 dark:text-slate-600';
    const fillClass = isFavorited ? 'fill-current' : '';
    
    return `
    <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group relative flex flex-col h-full hover:-translate-y-1" data-id="${freelance.id}">
        <!-- Bouton Favoris -->
        <button class="absolute top-4 right-4 ${favoriteClasses} dark:${favoriteClasses} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-xl transition-all duration-300 z-20 favorite-btn" data-id="${freelance.id}" title="Ajouter aux favoris">
            <i data-lucide="heart" class="w-4 h-4 transition-colors ${fillClass}"></i>
        </button>

        <!-- Soft Header Background -->
        <div class="h-24 w-full bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-900/20 dark:to-transparent absolute top-0 left-0 z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div class="p-5 sm:p-6 flex flex-col flex-1 items-center z-10 pt-8">
            <div class="relative mb-5 group-hover:scale-105 transition-transform duration-500">
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-sm relative bg-white dark:bg-slate-800 p-1 border border-slate-100/80 dark:border-slate-700/50 rotate-3 group-hover:rotate-0 transition-all duration-500">
                    <div class="w-full h-full rounded-xl overflow-hidden bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        ${freelance.img ? 
                            `<img src="${freelance.img}" referrerpolicy="no-referrer" class="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" alt="${freelance.name}">` : 
                            `<span class="text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl sm:text-3xl">${freelance.name.charAt(0)}</span>`
                        }
                    </div>
                </div>
                <!-- Status icon -->
                ${freelance.isAvailable ? 
                    `<div class="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-50 border-[3px] border-white dark:border-slate-900 rounded-xl flex items-center justify-center shadow-sm" title="Disponible"><div class="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div></div>` : 
                    `<div class="absolute -bottom-2 -right-2 w-6 h-6 bg-slate-50 border-[3px] border-white dark:border-slate-900 rounded-xl flex items-center justify-center shadow-sm" title="Indisponible"><div class="w-2h h-2.5 bg-slate-400 rounded-full"></div></div>`
                }
            </div>
            
            <h3 class="font-extrabold text-lg text-slate-900 dark:text-white text-center tracking-tight mb-1">${freelance.name}</h3>
            <p class="text-[13px] text-slate-500 dark:text-slate-400 mb-4 text-center font-medium">${freelance.title}</p>
            
            <!-- Compétences -->
            <div class="flex flex-wrap justify-center gap-1.5 mb-4">
                ${freelance.skills.slice(0, 3).map(skill => `<span class="bg-indigo-50/50 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide">${skill}</span>`).join('')}
            </div>
            
            <!-- Choses utiles -->
            ${freelance.usefulInfo ? `<p class="text-[11px] text-indigo-700 dark:text-indigo-300 mb-4 italic px-3 bg-indigo-50/50 dark:bg-indigo-500/10 py-1.5 rounded-xl text-center w-full font-medium">💡 ${freelance.usefulInfo}</p>` : ''}
            
            ${renderFreelanceBadges(freelance)}
            
            <div class="flex items-center mb-5 relative bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2 rounded-xl mt-auto border border-slate-100 dark:border-slate-700/50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                <div class="flex items-center mr-2.5 star-rating-container" data-id="${freelance.id}">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <button type="button" class="star-rating-btn p-0.5 hover:scale-110 transition-transform" data-id="${freelance.id}" data-rating="${star}" title="Donner ${star} étoiles">
                            <i data-lucide="star" class="w-3.5 h-3.5 ${freelance.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}"></i>
                        </button>
                    `).join('')}
                </div>
                <span class="font-extrabold text-slate-800 dark:text-slate-200 text-[13px] rating-text">${freelance.rating.toFixed(1)}</span>
            </div>
            
            <div class="w-full border-t border-slate-100/80 dark:border-slate-800/50 pt-4 flex justify-between items-center text-sm mt-auto mb-4 px-1">
                <div class="flex items-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1.5 text-slate-400"></i> ${freelance.location || 'Remote'}
                </div>
                <div class="font-extrabold text-indigo-600 dark:text-indigo-400 text-base flex justify-center items-baseline gap-0.5">
                    ${AppState.formatPrice(freelance.tjm)}<span class="text-xs font-bold text-slate-400">/j</span>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="w-full mt-2 flex gap-2 justify-center pt-2">
                <button class="w-10 h-10 shrink-0 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all duration-300 btn-share-profile flex items-center justify-center hover:text-indigo-600 group-hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] cursor-pointer" title="Partager">
                    <i data-lucide="share-2" class="w-4 h-4"></i>
                </button>
                <button class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold shadow-sm transition-all duration-300 btn-contact-freelance flex items-center justify-center hover:shadow-md hover:-translate-y-0.5 cursor-pointer" data-id="${freelance.id}">
                    <i data-lucide="mail" class="w-4 h-4 mr-1.5"></i> Contacter
                </button>
            </div>
        </div>
    </div>
    `;
};
