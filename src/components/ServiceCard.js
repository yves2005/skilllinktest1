export const ServiceCard = (service) => {
    const categoryDescriptions = {
        'Code': "Développement sur-mesure d'applications web, mobiles et de logiciels.",
        'Design': "Création d'identités visuelles, UI/UX, et supports graphiques.",
        'Marketing': "Stratégies d'acquisition, SEO, SEA et community management."
    };
    const tooltipText = categoryDescriptions[service.category] || "Expertise professionnelle";

    return `
    <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer flex flex-col h-full hover:-translate-y-1 relative" data-route="service-details" data-id="${service.id}">
        <div class="h-36 sm:h-48 shrink-0 overflow-hidden relative rounded-t-3xl border-b-[3px] border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <img src="${service.img}" loading="lazy" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt="Service">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            <div class="group/tooltip absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-[10px] sm:text-xs font-bold tracking-wide px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-slate-800 dark:text-slate-100 shadow-sm cursor-help flex items-center border border-slate-200/50 dark:border-slate-700">
                ${service.category}
                <i data-lucide="info" class="w-3.5 h-3.5 ml-1.5 text-indigo-400 dark:text-indigo-500"></i>
                <div class="opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible absolute top-full mt-2 w-56 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium p-3 rounded-xl shadow-xl z-20 transition-all duration-200 pointer-events-none text-left leading-relaxed -left-2 tracking-normal">
                    ${tooltipText}
                    <div class="absolute -top-1.5 left-6 w-3 h-3 bg-slate-900 dark:bg-slate-800 rotate-45 transform rounded-sm"></div>
                </div>
            </div>
            ${(window.AppState && AppState.user && AppState.user.uid === service.authorId) ? '' : `
            <button class="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 p-2 border border-slate-100/50 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 transition-all z-10 shadow-sm hover:scale-110" aria-label="Favoris" onclick="event.stopPropagation(); if (window.AppState) window.AppState.toggleServiceFavorite(this, '${service.id}', '${service.authorId}', \`${(service.title || '').replace(/`/g, '\\`').replace(/'/g, "\\'")}\`);">
                <i data-lucide="heart" class="w-4 h-4"></i>
            </button>
            `}
        </div>
        <div class="p-4 sm:p-5 flex flex-col flex-1 relative z-10">
            <div class="flex justify-between items-start mb-2 min-h-[3.5rem]">
                <h3 class="font-extrabold text-slate-900 dark:text-slate-100 leading-snug break-words line-clamp-2 text-base tracking-tight" title="${(service.title || '').replace(/"/g, '&quot;')}">${service.title}</h3>
            </div>
            <div class="flex items-center space-x-3 mt-2 mb-4 mt-auto group/author p-2 -ml-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onclick="event.stopPropagation(); window.openFreelancerProfileModal('${service.authorId}')">
                <div class="relative shadow-sm rounded-full bg-white dark:bg-slate-800 p-0.5 border border-slate-100 dark:border-slate-700 group-hover/author:scale-105 transition-transform">
                    ${service.authorImg ? `<img src="${service.authorImg}" loading="lazy" alt="${service.auteur}" class="w-8 h-8 rounded-full object-cover shrink-0" />` : `<div class="w-8 h-8 shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">${service.auteur.charAt(0)}</div>`}
                </div>
                <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-400 transition-colors">${service.auteur}</p>
                    <div class="flex items-center text-amber-500 text-[11px] mt-0.5">
                        <i data-lucide="star" class="w-3.5 h-3.5 fill-current shrink-0"></i>
                        <span class="ml-1 font-extrabold text-slate-700 dark:text-slate-300 whitespace-nowrap">${service.rating}</span>
                        <span class="ml-1 text-slate-400 dark:text-slate-500 font-medium">(42)</span>
                    </div>
                </div>
            </div>
            <div class="border-t border-slate-100/80 dark:border-slate-800/50 pt-4 flex flex-col gap-3.5 mt-auto text-sm text-slate-600 dark:text-slate-400">
                <div class="flex justify-between items-center w-full">
                    <span class="flex items-center whitespace-nowrap font-medium text-xs bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1.5 text-indigo-400 dark:text-indigo-500 shrink-0"></i> ${service.délai}</span>
                    <span class="font-bold text-indigo-600 dark:text-indigo-400 flex items-baseline whitespace-nowrap ml-2"><span class="text-lg tracking-tight mr-0.5">${AppState.formatPrice(service.price).replace('€', '').trim()}</span>€</span>
                </div>
                <button class="flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition w-max rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 py-2 px-3 -ml-3 z-10 relative cursor-pointer group/comment" onclick="event.preventDefault(); event.stopPropagation(); window.openCommentsModal('${service.id}', '${(service.title || '').replace(/'/g, "\\'")}')">
                    <div class="p-1 rounded-md group-hover/comment:bg-indigo-100 dark:group-hover/comment:bg-indigo-900/30 transition-colors mr-2">
                        <i data-lucide="message-square" class="w-3.5 h-3.5 text-indigo-400"></i>
                    </div>
                    <span class="font-semibold text-xs tracking-wide">Commentaires <span class="comment-count-badge bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded ml-1.5 font-bold text-[10px]" data-pub-id="${service.id}"></span></span>
                </button>
                ${(window.AppState && AppState.user && AppState.user.uid === service.authorId) ? `
                <div class="flex items-center justify-center w-full px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-xs select-none shadow-sm">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-1.5 text-indigo-500 shrink-0"></i> Ma publication
                </div>
                ` : `
                <button class="flex items-center justify-center w-full px-4 py-2 border-2 border-indigo-600/20 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white rounded-xl transition duration-300 z-10 relative cursor-pointer font-bold text-xs shadow-sm" onclick="event.preventDefault(); event.stopPropagation(); window.openFreelancerProfileModal('${service.authorId}')">
                    <i data-lucide="user" class="w-3.5 h-3.5 mr-1.5"></i> Voir le profil
                </button>
                `}
            </div>
        </div>
    </div>
    `;
};
