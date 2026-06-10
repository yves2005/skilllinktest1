import { AppState } from '../state.js';
import { PdfService } from '../services/pdfService.js';
import { renderAnalytics } from '../components/DashboardAnalytics.jsx';

export const DashboardView = {
    render: () => {
        // Obtenir le nom d'utilisateur
        const userName = AppState.user ? AppState.user.nom : 'Utilisateur';
        const isFreelance = AppState.user && (AppState.user.role === 'freelance' || AppState.user.role === 'artisan');
        
        if (isFreelance) {
            return `
            <div class="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 animate-fade-in view-enter">
                <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-6">
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 shrink-0">
                                <i data-lucide="layout-dashboard" class="text-indigo-600 dark:text-indigo-400 w-6 h-6"></i> 
                            </div>
                            Tableau de bord de ${userName}
                        </h2>
                        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 pl-1">Suivez vos performances et statistiques en temps réel.</p>
                    </div>
                </div>

                <!-- Simple Stats Cards pour Freelance -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.03)] flex items-center">
                        <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-850 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                            <i data-lucide="eye" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Vues sur le profil</p>
                            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">1,245</h3>
                            <p class="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center"><i data-lucide="trending-up" class="w-3.5 h-3.5 mr-1"></i> +12% ce mois</p>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.03)] flex items-center">
                        <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-850 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                            <i data-lucide="check-circle-2" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Projets terminés</p>
                            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">34</h3>
                            <p class="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center"><i data-lucide="trending-up" class="w-3.5 h-3.5 mr-1"></i> +3 ce mois</p>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-150 dark:border-slate-800 shadow-sm md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.03)] flex items-center">
                        <div class="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-850 flex items-center justify-center mr-4 shrink-0 shadow-sm">
                            <i data-lucide="star" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Note moyenne</p>
                            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">4.9/5</h3>
                            <p class="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1.5 flex items-center">Basé sur 28 avis</p>
                        </div>
                    </div>
                </div>

                <!-- Analytics Root -->
                <div id="analytics-root"></div>
            </div>
            `;
        }

        // Vue par défaut pour Clients ou autres
        return `
        <div class="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8 animate-fade-in view-enter">
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-6">
                <div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 shrink-0">
                            <i data-lucide="layout-dashboard" class="text-indigo-600 dark:text-indigo-400 w-6 h-6"></i> 
                        </div>
                        Tableau de bord de ${userName}
                    </h2>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 pl-1">Gérez vos projets en cours et suivez votre activité.</p>
                </div>
                <div class="flex flex-wrap gap-3 sm:items-center">
                    <button id="btn-download-pdf" class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center shrink-0 text-sm cursor-pointer hover:shadow-md">
                        <i data-lucide="download" class="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400"></i> Télécharger PDF
                    </button>
                    <button data-route="publish" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 flex items-center shrink-0 text-sm cursor-pointer animate-fade-in">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Nouveau Projet
                    </button>
                </div>
            </div>

            <!-- Kanban Board -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start md:h-[calc(100vh-250px)] md:min-h-[550px] mb-8">
                
                <!-- Column: Pending -->
                <div class="bg-slate-50/70 dark:bg-slate-900/40 rounded-[2rem] p-5 flex flex-col h-auto md:h-full border border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
                    <div class="flex items-center justify-between mb-5 px-1">
                        <h3 class="font-extrabold text-slate-800 dark:text-slate-200 flex items-center text-xs uppercase tracking-wider">
                            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2.5 ring-4 ring-amber-400/20"></span>
                            En Attente
                        </h3>
                        <span class="column-count-badge bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-lg border border-slate-300/20 dark:border-slate-700/50 shadow-sm">2</span>
                    </div>
                    <div class="space-y-4 overflow-y-auto pr-1 pb-2 flex-1 kanban-col md:h-auto" id="col-pending">
                        
                        <!-- Kanban Card -->
                        <div class="bg-white dark:bg-slate-900/90 p-4 rounded-2xl shadow-sm border border-slate-150 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:border-indigo-350 dark:hover:border-indigo-800/70 hover:shadow-md transition-all duration-300 group" draggable="true">
                            <div class="flex justify-between items-start mb-3">
                                <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg border border-amber-100/30 dark:border-amber-900/20">Devis à valider</span>
                                <i data-lucide="more-horizontal" class="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Refonte site E-commerce</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"></i> Client: Entreprise XYZ</p>
                            <div class="flex justify-between items-center text-[11px] border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-3">
                                <span class="flex items-center text-slate-500 dark:text-slate-400 font-medium"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1.5 text-slate-400"></i> 2 j restants</span>
                                <span class="font-extrabold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-150 dark:border-slate-700/60 shadow-sm">${AppState.formatPrice('1200 €')}</span>
                            </div>
                        </div>

                        <!-- Kanban Card -->
                        <div class="bg-white dark:bg-slate-900/90 p-4 rounded-2xl shadow-sm border border-slate-150 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:border-indigo-350 dark:hover:border-indigo-800/70 hover:shadow-md transition-all duration-300 group" draggable="true">
                            <div class="flex justify-between items-start mb-3">
                                <span class="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">Nouveau lead</span>
                                <i data-lucide="more-horizontal" class="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Création Logo</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"></i> Client: Startup ABC</p>
                            <div class="flex justify-between items-center text-[11px] border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-3">
                                <span class="flex items-center text-slate-500 dark:text-slate-400 font-medium"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1.5 text-slate-400"></i> ---</span>
                                <span class="font-extrabold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-150 dark:border-slate-700/60 shadow-sm">${AppState.formatPrice('300 €')}</span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Column: In Progress -->
                <div class="bg-slate-50/70 dark:bg-slate-900/40 rounded-[2rem] p-5 flex flex-col h-auto md:h-full border border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
                    <div class="flex items-center justify-between mb-5 px-1">
                        <h3 class="font-extrabold text-slate-800 dark:text-slate-200 flex items-center text-xs uppercase tracking-wider">
                            <span class="w-2.5 h-2.5 rounded-full bg-indigo-505 mr-2.5 bg-indigo-500 ring-4 ring-indigo-500/20"></span>
                            En Cours
                        </h3>
                        <span class="column-count-badge bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-lg border border-slate-300/20 dark:border-slate-700/50 shadow-sm">1</span>
                    </div>
                    <div class="space-y-4 overflow-y-auto pr-1 pb-2 flex-1 kanban-col md:h-auto" id="col-progress">
                        
                        <!-- Kanban Card -->
                        <div class="bg-white dark:bg-slate-900/90 p-4 rounded-2xl shadow-sm border border-indigo-150 dark:border-indigo-950 cursor-grab active:cursor-grabbing hover:border-indigo-400 dark:hover:border-indigo-750 hover:shadow-md transition-all duration-300 group ring-1 ring-indigo-50 dark:ring-indigo-950/20" draggable="true">
                            <div class="flex justify-between items-start mb-3">
                                <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-lg border border-indigo-105 dark:border-indigo-900/30">Développement</span>
                                <i data-lucide="more-horizontal" class="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Application SaaS</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3.5 flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"></i> Client: Tech Corp</p>
                            
                            <!-- Progress bar -->
                            <div class="mb-3 px-0.5">
                                <div class="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                                    <span>Progression</span>
                                    <span class="text-indigo-600 dark:text-indigo-400">65%</span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div class="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full" style="width: 65%"></div>
                                </div>
                            </div>

                            <div class="flex justify-between items-center text-[11px] border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-3">
                                <span class="flex items-center text-amber-600 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg border border-amber-100/30 dark:border-amber-900/20"><i data-lucide="alert-circle" class="w-3.5 h-3.5 mr-1.5 text-amber-500"></i> Écheance: Demain</span>
                                <span class="font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg border border-indigo-100/30 dark:border-indigo-900/30 shadow-sm">${AppState.formatPrice('3500 €')}</span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Column: Completed -->
                <div class="bg-slate-50/70 dark:bg-slate-900/40 rounded-[2rem] p-5 flex flex-col h-auto md:h-full border border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
                    <div class="flex items-center justify-between mb-5 px-1">
                        <h3 class="font-extrabold text-slate-800 dark:text-slate-200 flex items-center text-xs uppercase tracking-wider">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5 ring-4 ring-emerald-500/20"></span>
                            Terminés
                        </h3>
                        <span class="column-count-badge bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2 py-0.5 rounded-lg border border-slate-300/20 dark:border-slate-700/50 shadow-sm">1</span>
                    </div>
                    <div class="space-y-4 overflow-y-auto pr-1 pb-2 flex-1 kanban-col md:h-auto" id="col-completed">
                        
                        <!-- Kanban Card -->
                        <div class="bg-white dark:bg-slate-900/90 p-4 rounded-2xl shadow-sm border border-slate-150 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:border-indigo-350 dark:hover:border-indigo-800/70 hover:shadow-md transition-all duration-300 group opacity-85 hover:opacity-100" draggable="true">
                            <div class="flex justify-between items-start mb-3">
                                <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100/30 dark:border-emerald-900/20">Livré & Payé</span>
                                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors">Audit SEO</h4>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500"></i> Client: Boutique Mode</p>
                            <div class="flex justify-between items-center text-[11px] border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-3">
                                <span class="flex items-center text-slate-500 dark:text-slate-400 font-medium"><i data-lucide="calendar-check" class="w-3.5 h-3.5 mr-1.5 text-emerald-500"></i> Livré le 12 Mars</span>
                                <span class="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-100/30 dark:border-emerald-950/20 shadow-sm">${AppState.formatPrice('800 €')}</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <!-- Analytics Root -->
            <div id="analytics-root"></div>
        </div>
        `;
    },
    
    attachEvents: () => {
        // Drag and Drop Logic Minimal
        let draggedItem = null;

        const cards = document.querySelectorAll('[draggable="true"]');
        const columns = document.querySelectorAll('.kanban-col');

        cards.forEach(card => {
            card.addEventListener('dragstart', function(e) {
                draggedItem = this;
                setTimeout(() => {
                    this.classList.add('opacity-50');
                }, 0);
            });

            card.addEventListener('dragend', function() {
                setTimeout(() => {
                    if (draggedItem) {
                        draggedItem.classList.remove('opacity-50');
                        draggedItem = null;
                    }
                }, 0);
            });
        });

        columns.forEach(col => {
            col.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('bg-indigo-50/30', 'dark:bg-indigo-950/20', 'border-indigo-200/50', 'dark:border-indigo-800/60');
            });

            col.addEventListener('dragenter', function(e) {
                e.preventDefault();
            });

            col.addEventListener('dragleave', function(e) {
                this.classList.remove('bg-indigo-50/30', 'dark:bg-indigo-950/20', 'border-indigo-200/50', 'dark:border-indigo-800/60');
            });

            col.addEventListener('drop', function(e) {
                this.classList.remove('bg-indigo-50/30', 'dark:bg-indigo-950/20', 'border-indigo-200/50', 'dark:border-indigo-800/60');
                if(draggedItem) {
                    this.appendChild(draggedItem);
                    updateColumnCounts();
                }
            });
        });

        const updateColumnCounts = () => {
            columns.forEach(col => {
                const countBadge = col.parentElement.querySelector('.column-count-badge, span.bg-slate-200');
                if(countBadge) {
                    countBadge.textContent = col.children.length;
                }
            });
        };

        const btnDownloadPdf = document.getElementById('btn-download-pdf');
        if (btnDownloadPdf) {
            btnDownloadPdf.addEventListener('click', () => {
                const userName = AppState.user ? AppState.user.nom : 'Entrepreneur';
                
                const processCard = (card, defaultStatus) => {
                    const title = card.querySelector('h4')?.innerText || 'Inconnu';
                    let client = card.querySelector('p')?.innerText || '';
                    if (client.startsWith('Client: ')) {
                        client = client.substring(8);
                    }
                    const amountEl = card.querySelector('.font-bold.text-slate-700') || card.querySelector('.font-bold.text-emerald-600') || card.querySelector('.font-extrabold');
                    const amount = amountEl ? amountEl.innerText : '0 €';
                    
                    return [title, client, defaultStatus, amount];
                };

                const pendingCards = Array.from(document.querySelectorAll('#col-pending > div')).map(c => processCard(c, 'En attente'));
                const progressCards = Array.from(document.querySelectorAll('#col-progress > div')).map(c => processCard(c, 'En cours'));
                const completedCards = Array.from(document.querySelectorAll('#col-completed > div')).map(c => processCard(c, 'Terminé'));
                
                const allData = [...pendingCards, ...progressCards, ...completedCards];
                
                PdfService.generateProjectReport(userName, allData);
            });
        }

        // Render React Analytics component
        const analyticsRoot = document.getElementById('analytics-root');
        if (analyticsRoot) {
            renderAnalytics(analyticsRoot);
        }
    }
};
