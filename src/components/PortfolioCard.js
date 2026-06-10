import { AppState } from '../state.js';

export const renderPortfolioCard = (project, isEditable) => {
    const imgUrl = project.imageUrl || project.image || 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80';
    const title = project.title || 'Projet';
    const category = project.category || 'Réalisation';
    const description = project.description || '';
    const skills = project.skills || [];
    
    return `
        <div class="group relative bg-white/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-700/80 shadow-sm overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-full portfolio-item freelance-portfolio-item" data-id="${project.id}">
            <!-- Image Area with beautiful cover ratio -->
            <div class="relative aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-950">
                <img src="${imgUrl}" loading="lazy" alt="${title}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80'">
                
                <!-- Category tag on the top left -->
                <span class="absolute top-3 left-3 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md border border-slate-100/55 dark:border-slate-850 text-slate-700 dark:text-slate-300 px-2.5 py-1 text-[9px] tracking-wider uppercase font-bold rounded-lg shadow-sm">
                    ${category}
                </span>

                <!-- Edit/Delete Actions inside image area on hover -->
                ${isEditable ? `
                <div class="absolute top-3 right-3 flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-20">
                    <button class="btn-edit-portfolio bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-800 backdrop-blur-sm p-1.5 rounded-full text-indigo-600 hover:text-indigo-805 dark:text-indigo-400 dark:hover:text-indigo-300 shadow-md transition-all cursor-pointer flex items-center justify-center border border-slate-100/40 dark:border-slate-700/40" data-id="${project.id}" title="Modifier ce projet">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5 pointer-events-none"></i>
                    </button>
                    <button class="btn-delete-portfolio bg-white/95 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-800 backdrop-blur-sm p-1.5 rounded-full text-red-500 hover:text-red-750 dark:text-red-405 dark:hover:text-red-300 shadow-md transition-all cursor-pointer flex items-center justify-center border border-slate-100/40 dark:border-slate-700/40" data-id="${project.id}" title="Supprimer ce projet">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5 pointer-events-none"></i>
                    </button>
                </div>
                ` : ''}

                <!-- Soft glass highlight overlay -->
                <div class="absolute inset-0 bg-indigo-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            <!-- Soft Info Area at bottom of Card -->
            <div class="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3 bg-white dark:bg-slate-900 border-t border-slate-100/50 dark:border-slate-850">
                <div>
                    <h4 class="text-slate-850 dark:text-slate-100 font-extrabold text-sm sm:text-base tracking-tight mb-1 group-hover:text-indigo-600 transition-colors duration-250 line-clamp-2 break-words [word-break:break-word]">${title}</h4>
                    ${description ? `<p class="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3 font-medium break-words [word-break:break-word]">${description}</p>` : ''}
                    
                    ${skills && skills.length > 0 ? `
                    <div class="flex flex-wrap gap-1 mb-1">
                        ${skills.slice(0, 3).map(skill => `<span class="bg-slate-50 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/45 text-slate-550 dark:text-slate-400 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider font-semibold">${skill}</span>`).join('')}
                        ${skills.length > 3 ? `<span class="bg-slate-50 dark:bg-slate-800 border border-slate-200/30 text-slate-400 px-1.5 py-0.5 rounded-lg text-[9px] font-bold">+${skills.length - 3}</span>` : ''}
                    </div>
                    ` : ''}
                </div>
                <div class="flex items-center justify-between border-t border-slate-100/80 dark:border-slate-800 pt-3 mt-auto">
                    <span class="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center group-hover:translate-x-1 transition-transform duration-300">
                        Voir le projet <i data-lucide="arrow-right" class="w-3.5 h-3.5 ml-1"></i>
                    </span>
                </div>
            </div>
        </div>
    `;
};
