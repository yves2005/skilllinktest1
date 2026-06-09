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
        <div class="flex flex-wrap gap-1.5 justify-center mb-3">
            ${badges.map(b => `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full ${b.bgColor} ${b.textColor} border ${b.borderColor} transition hover:scale-105 shadow-[0_1px_2px_rgba(0,0,0,0.02)]" title="${b.title}">
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
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition group relative flex flex-col h-full" data-id="${freelance.id}">
        <!-- Bouton Favoris -->
        <button class="absolute top-3 right-3 ${favoriteClasses} dark:${favoriteClasses} hover:text-red-500 transition z-20 favorite-btn" data-id="${freelance.id}" title="Ajouter aux favoris">
            <i data-lucide="heart" class="w-5 h-5 transition-colors ${fillClass}"></i>
        </button>

        <div class="p-3 sm:p-5 flex flex-col flex-1 items-center">
            <div class="relative w-16 h-16 mb-3 inline-block">
                <div class="w-full h-full rounded-full overflow-hidden border-2 border-indigo-50 dark:border-slate-700 shadow-sm relative">
                    ${freelance.img ? 
                        `<img src="${freelance.img}" class="w-full h-full object-cover" alt="${freelance.name}">` : 
                        `<div class="w-full h-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">${freelance.name.charAt(0)}</div>`
                    }
                </div>
                ${freelance.isAvailable ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" title="Disponible"></div>' : '<div class="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" title="Indisponible"></div>'}
            </div>
            
            <h3 class="font-bold text-base text-slate-900 dark:text-slate-100 text-center">${freelance.name}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">${freelance.title}</p>
            
            <!-- Compétences (Maintenant visibles) -->
            <div class="flex flex-wrap justify-center gap-1.5 mb-3">
                ${freelance.skills.slice(0, 3).map(skill => `<span class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium">${skill}</span>`).join('')}
            </div>
            
            <!-- Choses utiles (Maintenant visibles) -->
            ${freelance.usefulInfo ? `<p class="text-[10px] text-indigo-800 dark:text-indigo-300 mb-3 italic px-2 bg-indigo-50 dark:bg-indigo-950/50 py-1 rounded text-center w-full">💡 ${freelance.usefulInfo}</p>` : ''}
            
            ${renderFreelanceBadges(freelance)}
            
            <div class="flex items-center mb-4 relative bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-full mt-auto">
                <div class="flex items-center mr-2 star-rating-container" data-id="${freelance.id}">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <button type="button" class="star-rating-btn p-0.5" data-id="${freelance.id}" data-rating="${star}" title="Donner ${star} étoiles">
                            <i data-lucide="star" class="w-3.5 h-3.5 ${freelance.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}"></i>
                        </button>
                    `).join('')}
                </div>
                <span class="font-bold text-slate-700 dark:text-slate-300 text-xs rating-text">${freelance.rating.toFixed(1)}</span>
            </div>
            
            <div class="w-full border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between items-center text-sm mt-auto">
                <div class="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1.5"></i> ${freelance.location || 'Remote'}
                </div>
                <div class="font-bold text-indigo-600 dark:text-indigo-400 text-base">
                    ${AppState.formatPrice(freelance.tjm + '€/j').replace('€', '')}<span class="font-bold text-xs">/j</span>
                </div>
            </div>
            
            <!-- Actions (Boutons Contact + Partager) -->
            <div class="w-full mt-4 flex gap-2 justify-center pt-2 border-t border-slate-100 dark:border-slate-700">
                <button class="flex-1 bg-indigo-50 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-600 border border-indigo-200 dark:border-slate-600 text-indigo-600 dark:text-slate-300 p-2 rounded-lg text-xs font-bold shadow-sm transition btn-share-profile flex items-center justify-center">
                    <i data-lucide="share-2" class="w-3.5 h-3.5 mr-1"></i> Partager
                </button>
                <button class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-xs font-bold shadow-sm transition btn-contact-freelance flex items-center justify-center" data-id="${freelance.id}">
                    <i data-lucide="mail" class="w-3.5 h-3.5 mr-1"></i> Contacter
                </button>
            </div>
        </div>
    </div>
    `;
};
