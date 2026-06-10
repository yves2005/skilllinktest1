export const ContactModal = () => `
    <div id="contact-modal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[110] flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
        <div class="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg shadow-2xl dark:shadow-black/40 border border-slate-150 dark:border-slate-800 transform scale-95 transition-all duration-300 relative overflow-hidden" id="contact-modal-content">
            
            <!-- Styled Top Gradient Accent Bar -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-500"></div>

            <!-- Modal Header -->
            <div class="px-6 sm:px-8 pt-8 pb-5 flex justify-between items-start">
                <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center shrink-0 shadow-sm">
                        <i data-lucide="headphones" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Support Client</h2>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-550 mt-1.5 block">Douala Support Tech &bull; 24h</span>
                    </div>
                </div>
                <button id="close-contact-modal" class="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-755 transition-all cursor-pointer" title="Fermer">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <!-- Form Container -->
            <div class="px-6 sm:px-8 pb-8">
                <form id="contact-form" class="space-y-5">
                    <p class="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 pl-0.5 leading-relaxed">
                        Une question ou un incident technique à signaler ? Précisez votre besoin et notre équipe basée au Cameroun vous répondra sous un délai maximal de 24h ouvrables.
                    </p>

                    <!-- Input Name -->
                    <div class="space-y-1.5 flex flex-col">
                        <label class="block text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-0.5">Votre nom complet</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                <i data-lucide="user" class="w-4 h-4"></i>
                            </span>
                            <input type="text" required placeholder="Ex. Jean Dupont" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] lg:hover:border-slate-350 dark:lg:hover:border-slate-700">
                        </div>
                    </div>

                    <!-- Input Email -->
                    <div class="space-y-1.5 flex flex-col">
                        <label class="block text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-0.5">Adresse e-mail de contact</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                <i data-lucide="mail" class="w-4 h-4"></i>
                            </span>
                            <input type="email" required placeholder="nom@entreprise.com" class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] lg:hover:border-slate-350 dark:lg:hover:border-slate-700">
                        </div>
                    </div>

                    <!-- Input Subject -->
                    <div class="space-y-1.5 flex flex-col">
                        <label class="block text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-0.5">Sujet de votre demande</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                <i data-lucide="help-circle" class="w-4 h-4"></i>
                            </span>
                            <select required class="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm text-slate-850 dark:text-slate-100 font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer lg:hover:border-slate-350 dark:lg:hover:border-slate-700">
                                <option value="">Choisir la thématique la plus adaptée...</option>
                                <option value="account">🔐 Problème d'accès ou de compte d'utilisateur</option>
                                <option value="billing">💳 Séquentiels de Paie / Séquestre / Facturation</option>
                                <option value="bug">🐛 Rapport de dysfonctionnement ou bug d'interface</option>
                                <option value="other">💬 Autre demande ou suggestions d'évolution</option>
                            </select>
                            <span class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-550">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                            </span>
                        </div>
                    </div>

                    <!-- Input Message -->
                    <div class="space-y-1.5 flex flex-col">
                        <label class="block text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-0.5">Votre message détaillé</label>
                        <div class="relative">
                            <span class="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500">
                                <i data-lucide="message-square" class="w-4 h-4"></i>
                            </span>
                            <textarea required rows="4" placeholder="Décrivez votre situation de façon claire pour un diagnostic accéléré par nos techniciens..." class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm text-slate-850 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] resize-none lg:hover:border-slate-350 dark:lg:hover:border-slate-700"></textarea>
                        </div>
                    </div>
                    
                    <!-- Submit -->
                    <div class="pt-2">
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-[0_4px_14px_0_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.18)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer">
                            <i data-lucide="send" class="w-4 h-4 shrink-0"></i> Transmettre le message
                        </button>
                    </div>
                </form>
                
                <!-- Success Message Display Card -->
                <div id="contact-success-msg" class="hidden flex-col items-center justify-center text-center py-8">
                    <div class="relative mb-6">
                        <div class="absolute inset-0 bg-emerald-400/10 dark:bg-emerald-500/20 rounded-full animate-ping scale-125 opacity-75"></div>
                        <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-full flex justify-center items-center shadow-sm relative">
                            <i data-lucide="check" class="w-10 h-10 text-emerald-500 dark:text-emerald-400 animate-fade-in"></i>
                        </div>
                    </div>
                    
                    <h3 class="font-black text-xl text-slate-900 dark:text-white mb-2 tracking-tight animate-fade-in">Message transmis !</h3>
                    <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed animate-fade-in">
                        Votre message est enregistré avec succès. Nos techniciens analysent la situation et vous recontacteront par e-mail ou messagerie interne dans un délai de 24 heures.
                    </p>
                    <button id="close-contact-success" class="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200/50 dark:border-slate-700 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm">
                        Fermer le guichet
                    </button>
                </div>
            </div>
        </div>
    </div>
`;
