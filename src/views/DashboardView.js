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
            <div class="max-w-7xl mx-auto mt-4 px-2">
                <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900 flex items-center">
                            <i data-lucide="layout-dashboard" class="mr-3 text-indigo-600 w-7 h-7"></i> 
                            Tableau de bord de ${userName}
                        </h2>
                        <p class="text-slate-500 mt-1">Suivez vos performances et statistiques en temps réel.</p>
                    </div>
                </div>

                <!-- Simple Stats Cards pour Freelance -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center">
                        <div class="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4">
                            <i data-lucide="eye" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Vues sur le profil</p>
                            <h3 class="text-2xl font-bold text-slate-900">1,245</h3>
                            <p class="text-xs text-emerald-600 font-medium mt-1 flex items-center"><i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> +12% ce mois</p>
                        </div>
                    </div>
                    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center">
                        <div class="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4">
                            <i data-lucide="check-circle-2" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Projets terminés</p>
                            <h3 class="text-2xl font-bold text-slate-900">34</h3>
                            <p class="text-xs text-emerald-600 font-medium mt-1 flex items-center"><i data-lucide="trending-up" class="w-3 h-3 mr-1"></i> +3 ce mois</p>
                        </div>
                    </div>
                    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center">
                        <div class="w-14 h-14 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mr-4">
                            <i data-lucide="star" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-slate-500">Note moyenne</p>
                            <h3 class="text-2xl font-bold text-slate-900">4.9/5</h3>
                            <p class="text-xs text-slate-500 font-medium mt-1 flex items-center">Basé sur 28 avis</p>
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
        <div class="max-w-7xl mx-auto mt-4 px-2">
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 flex items-center">
                        <i data-lucide="layout-dashboard" class="mr-3 text-indigo-600 w-7 h-7"></i> 
                        Tableau de bord de ${userName}
                    </h2>
                    <p class="text-slate-500 mt-1">Gérez vos projets en cours et suivez votre activité.</p>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button id="btn-download-pdf" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center shrink-0">
                        <i data-lucide="download" class="w-4 h-4 mr-2"></i> Télécharger PDF
                    </button>
                    <button data-route="publish" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center shrink-0">
                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Nouveau Projet
                    </button>
                </div>
            </div>

            <!-- Kanban Board -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start md:h-[calc(100vh-250px)] md:min-h-[500px]">
                
                <!-- Column: Pending -->
                <div class="bg-slate-100 rounded-2xl p-4 flex flex-col h-auto md:h-full border border-slate-200">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-slate-700 flex items-center text-xs uppercase tracking-wider">
                            <span class="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                            En Attente
                        </h3>
                        <span class="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">2</span>
                    </div>
                    <div class="space-y-3 overflow-y-auto pr-1 pb-2 flex-1 kanban-col md:h-auto" id="col-pending">
                        
                        <!-- Kanban Card -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-move hover:border-indigo-300 transition group" draggable="true">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Devis à valider</span>
                                <i data-lucide="more-horizontal" class="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 text-xs mb-1">Refonte site E-commerce</h4>
                            <p class="text-[10px] text-slate-500 mb-2">Client: Entreprise XYZ</p>
                            <div class="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2">
                                <span class="flex items-center text-slate-500"><i data-lucide="clock" class="w-3 h-3 mr-1"></i> 2 j restants</span>
                                <span class="font-bold text-slate-700">${AppState.formatPrice('1200 €')}</span>
                            </div>
                        </div>

                        <!-- Kanban Card -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-move hover:border-indigo-300 transition group" draggable="true">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Nouveau lead</span>
                                <i data-lucide="more-horizontal" class="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 text-xs mb-1">Création Logo</h4>
                            <p class="text-[10px] text-slate-500 mb-2">Client: Startup ABC</p>
                            <div class="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2">
                                <span class="flex items-center text-slate-500"><i data-lucide="clock" class="w-3 h-3 mr-1"></i> ---</span>
                                <span class="font-bold text-slate-700">${AppState.formatPrice('300 €')}</span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Column: In Progress -->
                <div class="bg-slate-100 rounded-2xl p-4 flex flex-col h-auto md:h-full border border-slate-200">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-slate-700 flex items-center text-xs uppercase tracking-wider">
                            <span class="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                            En Cours
                        </h3>
                        <span class="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">1</span>
                    </div>
                    <div class="space-y-3 overflow-y-auto pr-1 pb-2 flex-1 kanban-col md:h-auto" id="col-progress">
                        
                        <!-- Kanban Card -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-indigo-200 cursor-move hover:border-indigo-400 transition group ring-1 ring-indigo-50" draggable="true">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Développement</span>
                                <i data-lucide="more-horizontal" class="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 text-xs mb-1">Application SaaS</h4>
                            <p class="text-[10px] text-slate-500 mb-2">Client: Tech Corp</p>
                            
                            <!-- Progress bar -->
                            <div class="mb-2">
                                <div class="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                                    <span>Progression</span>
                                    <span>65%</span>
                                </div>
                                <div class="w-full bg-slate-100 rounded-full h-1">
                                    <div class="bg-indigo-600 h-1 rounded-full" style="width: 65%"></div>
                                </div>
                            </div>

                            <div class="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2">
                                <span class="flex items-center text-orange-500 font-medium"><i data-lucide="alert-circle" class="w-3 h-3 mr-1"></i> Échéance: Demain</span>
                                <span class="font-bold text-slate-700">${AppState.formatPrice('3500 €')}</span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Column: Completed -->
                <div class="bg-slate-100 rounded-2xl p-4 flex flex-col h-auto md:h-full border border-slate-200">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-slate-700 flex items-center text-xs uppercase tracking-wider">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                            Terminés
                        </h3>
                        <span class="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">1</span>
                    </div>
                    <div class="space-y-3 overflow-y-auto pr-1 pb-2 flex-1 kanban-col md:h-auto" id="col-completed">
                        
                        <!-- Kanban Card -->
                        <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-move transition group opacity-75 hover:opacity-100" draggable="true">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Livré & Payé</span>
                                <i data-lucide="check-circle" class="w-3 h-3 text-emerald-500"></i>
                            </div>
                            <h4 class="font-bold text-slate-900 text-xs mb-1">Audit SEO</h4>
                            <p class="text-[10px] text-slate-500 mb-2">Client: Boutique Mode</p>
                            <div class="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2">
                                <span class="flex items-center text-slate-500"><i data-lucide="calendar-check" class="w-3 h-3 mr-1"></i> Livré le 12 Mars</span>
                                <span class="font-bold text-emerald-600">${AppState.formatPrice('800 €')}</span>
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
                    draggedItem.classList.remove('opacity-50');
                    draggedItem = null;
                }, 0);
            });
        });

        columns.forEach(col => {
            col.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('bg-slate-200/50', 'rounded-xl');
            });

            col.addEventListener('dragenter', function(e) {
                e.preventDefault();
            });

            col.addEventListener('dragleave', function(e) {
                this.classList.remove('bg-slate-200/50', 'rounded-xl');
            });

            col.addEventListener('drop', function(e) {
                this.classList.remove('bg-slate-200/50', 'rounded-xl');
                if(draggedItem) {
                    this.appendChild(draggedItem);
                    // Update column counts realistically (Optional)
                    updateColumnCounts();
                }
            });
        });

        const updateColumnCounts = () => {
            columns.forEach(col => {
                const countBadge = col.parentElement.querySelector('span.bg-slate-200');
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
                    const amountEl = card.querySelector('.font-bold.text-slate-700') || card.querySelector('.font-bold.text-emerald-600');
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
