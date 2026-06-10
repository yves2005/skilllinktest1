import { AppState } from '../state.js';

export const showPortfolioViewerModal = (project, isOwner, onEdit, onDelete) => {
    const imgSrc = project.imageUrl || project.image || 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80';
    
    const formattedDesc = (project.description || '')
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p class="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed mb-3.5 font-normal break-words [word-break:break-word]">${p}</p>`)
        .join('');

    const viewerHtml = `
    <div id="project-view-modal-common" class="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[400] flex items-center justify-center p-4 view-enter">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden w-full max-w-3xl shadow-[0_30px_70px_rgba(0,0,0,0.18)] dark:shadow-[0_40px_90px_rgba(0,0,0,0.6)] border border-slate-100/80 dark:border-slate-800/80 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] relative hover:border-indigo-500/10 dark:hover:border-indigo-500/10 transition-colors duration-500 scale-95 origin-center animate-in zoom-in-95 duration-200">
            <!-- Absolute Floating Close Button -->
            <button id="close-project-view-modal" class="absolute top-4 right-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 p-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-md transition-all hover:scale-110 hover:shadow-lg cursor-pointer flex items-center justify-center">
                <i data-lucide="x" class="w-4 h-4 sm:w-4.5 sm:h-4.5"></i>
            </button>

            <!-- Left: Beautiful cover graphic with 42% width on desktop -->
            <div class="w-full md:w-[42%] aspect-[4/3] md:aspect-auto md:self-stretch bg-slate-100 dark:bg-slate-950 relative max-h-[30vh] md:max-h-none overflow-hidden shrink-0 group min-h-[220px] md:min-h-full">
                <img src="${imgSrc}" alt="${project.title || 'Projet'}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-slate-900/10 dark:to-slate-950/20 mix-blend-multiply pointer-events-none"></div>
            </div>
            
            <!-- Right: Detailed dynamic documentation -->
            <div class="w-full md:w-[58%] p-6 md:p-8 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto">
                <div>
                    <div class="flex items-center mb-5 mt-1 sm:mt-0">
                        <span class="inline-flex items-center px-3 py-1 bg-indigo-50/85 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] tracking-wide uppercase rounded-lg shadow-sm">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                            ${project.category || 'Réalisation'}
                        </span>
                    </div>
                    <h3 class="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-snug mb-3.5 break-words [word-break:break-word]">${project.title || 'Projet'}</h3>
                    
                    <div class="prose prose-sm dark:prose-invert max-w-none mb-6">
                        ${formattedDesc || `<p class="text-slate-400 dark:text-slate-500 text-xs italic">Aucune description disponible pour ce projet.</p>`}
                    </div>
                    
                    ${project.skills && project.skills.length > 0 ? `
                    <div class="mb-6">
                        <span class="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">Compétences associées</span>
                        <div class="flex flex-wrap gap-1.5">
                            ${project.skills.map(skill => `<span class="bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/50 dark:border-slate-800 text-slate-655 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold cursor-pointer skill-tag transition-all duration-300 hover:border-indigo-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center shadow-xs" data-skill="${skill}"><i data-lucide="hash" class="w-2.5 h-2.5 mr-0.5 text-indigo-400 dark:text-indigo-500"></i>${skill}</span>`).join('')}
                        </div>
                    </div>
                    ` : '<div class="mb-4"></div>'}
                </div>

                <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-5 mt-auto">
                    ${isOwner ? `
                    <div class="flex gap-2.5 w-full sm:w-auto">
                        <button id="common-edit-project-btn" data-id="${project.id}" class="flex-1 sm:flex-none text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/40 px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-indigo-100/50 dark:border-indigo-900/30 hover:scale-[1.03] active:scale-[0.98]">
                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Modifier
                        </button>
                        <button id="common-delete-project-btn" data-id="${project.id}" class="flex-1 sm:flex-none text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-rose-100/50 dark:border-rose-900/30 hover:scale-[1.03] active:scale-[0.98]">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Supprimer
                        </button>
                    </div>
                    ` : `
                    <span class="text-[10px] bg-emerald-50/85 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/20 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Réalisation vérifiée
                    </span>
                    `}
                    <span class="text-[10px] font-mono text-slate-400 dark:text-slate-550 font-extrabold uppercase tracking-widest hidden sm:inline">PORTFOLIO</span>
                </div>
            </div>
        </div>
    </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = viewerHtml;
    const modalEl = tempDiv.firstElementChild;
    document.body.appendChild(modalEl);
    if (window.lucide) window.lucide.createIcons({ root: modalEl });
    
    const closeModal = () => modalEl.remove();
    document.getElementById('close-project-view-modal').addEventListener('click', closeModal);
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
    });

    // Event delegation for skills so they filter marketplace if clicked
    modalEl.querySelectorAll('.skill-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            const skill = e.target.getAttribute('data-skill');
            if (skill) {
                closeModal();
                const freelanceModal = document.getElementById('freelancer-modal');
                if (freelanceModal) freelanceModal.classList.add('hidden');
                
                AppState.preSelectedSearchQuery = skill;
                AppState.navigate('marketplace');
            }
        });
    });

    if (isOwner) {
        document.getElementById('common-edit-project-btn')?.addEventListener('click', () => {
            if (onEdit) onEdit(project, closeModal);
        });
        document.getElementById('common-delete-project-btn')?.addEventListener('click', () => {
            if (onDelete) onDelete(project, closeModal);
        });
    }
};
