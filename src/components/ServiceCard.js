export const ServiceCard = (service) => {
    const categoryDescriptions = {
        'Code': "Développement sur-mesure d'applications web, mobiles et de logiciels.",
        'Design': "Création d'identités visuelles, UI/UX, et supports graphiques.",
        'Marketing': "Stratégies d'acquisition, SEO, SEA et community management."
    };
    const tooltipText = categoryDescriptions[service.category] || "Expertise professionnelle";

    return `
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition group cursor-pointer flex flex-col h-full" data-route="service-details" data-id="${service.id}">
        <div class="h-32 sm:h-48 shrink-0 overflow-hidden relative">
            <img src="${service.img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Service">
            <div class="group/tooltip absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md text-slate-800 dark:text-slate-100 shadow-sm cursor-help flex items-center">
                ${service.category}
                <i data-lucide="info" class="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 text-slate-400 dark:text-slate-500"></i>
                <div class="opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible absolute top-full mt-2 left-0 w-48 bg-slate-800 dark:bg-slate-700 text-white text-xs font-normal p-2.5 rounded-lg shadow-xl z-20 transition-all duration-200 pointer-events-none text-left leading-relaxed">
                    ${tooltipText}
                    <div class="absolute -top-1 left-4 w-2.5 h-2.5 bg-slate-800 dark:bg-slate-700 rotate-45 transform rounded-sm"></div>
                </div>
            </div>
            <button class="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 p-1 rounded-full sm:p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 transition z-10" aria-label="Favoris" onclick="event.stopPropagation(); if (window.AppState) window.AppState.toggleServiceFavorite(this, '${service.id}', '${service.authorId}', \`${(service.title || '').replace(/`/g, '\\`').replace(/'/g, "\\'")}\`);">
                <i data-lucide="heart" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
            </button>
        </div>
        <div class="p-3 sm:p-5 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-2 min-h-[3rem] sm:min-h-[3.5rem]">
                <h3 class="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight break-words line-clamp-2" title="${(service.title || '').replace(/"/g, '&quot;')}">${service.title}</h3>
            </div>
            <div class="flex items-center space-x-2 mt-3 mb-4 mt-auto">
                ${service.authorImg ? `<img src="${service.authorImg}" alt="${service.auteur}" class="w-8 h-8 rounded-full object-cover shrink-0" />` : `<div class="w-8 h-8 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">${service.auteur.charAt(0)}</div>`}
                <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">${service.auteur}</p>
                    <div class="flex items-center text-amber-500 text-xs">
                        <i data-lucide="star" class="w-3 h-3 fill-current shrink-0"></i>
                        <span class="ml-1 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">${service.rating} (42 avis)</span>
                    </div>
                </div>
            </div>
            <div class="border-t border-slate-100 dark:border-slate-700 pt-3 flex flex-col gap-3 mt-auto text-sm text-slate-600 dark:text-slate-400">
                <div class="flex justify-between items-center w-full">
                    <span class="flex items-center whitespace-nowrap"><i data-lucide="clock" class="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500 shrink-0"></i> ${service.délai}</span>
                    <span class="font-bold text-indigo-600 dark:text-indigo-400 text-base flex items-center whitespace-nowrap ml-2"><i data-lucide="wallet" class="w-4 h-4 mr-1 shrink-0"></i> ${AppState.formatPrice(service.price)}</span>
                </div>
                <button class="flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition w-max rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 py-1.5 px-3 -ml-3 z-10 relative cursor-pointer" onclick="event.preventDefault(); event.stopPropagation(); window.openCommentsModal('${service.id}', '${(service.title || '').replace(/'/g, "\\'")}')">
                    <i data-lucide="message-square" class="w-4 h-4 mr-1.5"></i>
                    <span class="font-medium text-xs">Commentaires <span class="comment-count-badge text-indigo-600 dark:text-indigo-400 ml-1 font-bold" data-pub-id="${service.id}"></span></span>
                </button>
            </div>
        </div>
    </div>
    `;
};
