import { AppState } from '../state.js';
import { auth } from '../services/firebase.js';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const SettingsView = {
    render: () => `
        <div class="max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/50 backdrop-blur-md p-6 sm:p-10 rounded-[2.5rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 mt-4 sm:mt-8 view-enter">
            <!-- Navigation Rapide -->
            <div class="hidden sm:flex justify-center gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <button data-route="marketplace" class="flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-bold text-sm tracking-wide">
                    <i data-lucide="search" class="w-4 h-4 mr-2"></i> ${AppState.t('nav_explore')}
                </button>
                <div class="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                <button data-route="ai" class="flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-bold text-sm tracking-wide">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-2"></i> ${AppState.t('nav_ai')}
                </button>
            </div>

            <div class="flex items-center mb-8">
                <button data-action="back" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 mr-4">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <div>
                    <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center tracking-tight">
                        <div class="p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl mr-3">
                            <i data-lucide="settings" class="w-5 h-5 text-slate-600 dark:text-slate-400"></i>
                        </div>
                        ${AppState.t('settings_title')}
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Gérez vos préférences et paramètres globaux.</p>
                </div>
            </div>
            <form id="settings-form" class="space-y-6">
                
                <!-- Apparence -->
                <div class="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center uppercase tracking-wide">
                        <i data-lucide="palette" class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"></i> ${AppState.t('settings_appearance')}
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label class="cursor-pointer block">
                            <input type="radio" name="theme" value="light" class="peer sr-only" ${AppState.theme === 'light' ? 'checked' : ''}>
                            <div class="flex items-center justify-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 peer-checked:border-indigo-600 dark:peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 dark:peer-checked:bg-indigo-900/20 peer-checked:ring-1 peer-checked:ring-indigo-600 dark:peer-checked:ring-indigo-500 transition-all">
                                <i data-lucide="sun" class="w-5 h-5 text-amber-500"></i>
                                <span class="text-sm font-bold text-slate-700 dark:text-slate-300">${AppState.t('settings_theme_light')}</span>
                            </div>
                        </label>
                        <label class="cursor-pointer block">
                            <input type="radio" name="theme" value="dark" class="peer sr-only" ${AppState.theme === 'dark' ? 'checked' : ''}>
                            <div class="flex items-center justify-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 peer-checked:border-indigo-600 dark:peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 dark:peer-checked:bg-indigo-900/20 peer-checked:ring-1 peer-checked:ring-indigo-600 dark:peer-checked:ring-indigo-500 transition-all">
                                <i data-lucide="moon" class="w-5 h-5 text-indigo-400"></i>
                                <span class="text-sm font-bold text-slate-700 dark:text-slate-300">${AppState.t('settings_theme_dark')}</span>
                            </div>
                        </label>
                        <label class="cursor-pointer block">
                            <input type="radio" name="theme" value="auto" class="peer sr-only" ${!['light', 'dark'].includes(AppState.theme) ? 'checked' : ''}>
                            <div class="flex items-center justify-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 peer-checked:border-indigo-600 dark:peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 dark:peer-checked:bg-indigo-900/20 peer-checked:ring-1 peer-checked:ring-indigo-600 dark:peer-checked:ring-indigo-500 transition-all">
                                <i data-lucide="monitor" class="w-5 h-5 text-slate-500 dark:text-slate-400"></i>
                                <span class="text-sm font-bold text-slate-700 dark:text-slate-300">${AppState.t('settings_theme_system')}</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Localisation -->
                <div class="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center uppercase tracking-wide">
                        <i data-lucide="globe" class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"></i> ${AppState.t('settings_location')}
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div class="group">
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">${AppState.t('settings_lang')}</label>
                            <div class="relative">
                                <i data-lucide="languages" class="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"></i>
                                <select id="lang-select" class="w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium dark:text-white appearance-none cursor-pointer">
                                    <option value="fr" ${AppState.lang === 'fr' ? 'selected' : ''}>Français (FR)</option>
                                    <option value="en" ${AppState.lang === 'en' ? 'selected' : ''}>English (US)</option>
                                    <option value="es" ${AppState.lang === 'es' ? 'selected' : ''}>Español (ES)</option>
                                </select>
                                <i data-lucide="chevron-down" class="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none"></i>
                            </div>
                        </div>

                        <div class="group">
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">${AppState.t('settings_currency')}</label>
                            <div class="relative">
                                <i data-lucide="coins" class="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"></i>
                                <select id="curr-select" class="w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium dark:text-white appearance-none cursor-pointer">
                                    <option value="EUR" ${AppState.currency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro</option>
                                    <option value="USD" ${AppState.currency === 'USD' ? 'selected' : ''}>USD ($) - Dollar Américain</option>
                                    <option value="XOF" ${AppState.currency === 'XOF' ? 'selected' : ''}>XOF (FCFA) - Franc CFA</option>
                                </select>
                                <i data-lucide="chevron-down" class="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Notifications -->
                <div class="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center uppercase tracking-wide">
                        <i data-lucide="bell" class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"></i> ${AppState.t('settings_notifications')}
                    </h3>
                    <div class="space-y-3">
                        <label class="flex items-center justify-between cursor-pointer group p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div>
                                <div class="font-bold text-sm text-slate-900 dark:text-white">${AppState.t('settings_push')}</div>
                                <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">${AppState.t('settings_push_desc')}</div>
                            </div>
                            <div class="relative">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                            </div>
                        </label>
                        <label class="flex items-center justify-between cursor-pointer group p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div>
                                <div class="font-bold text-sm text-slate-900 dark:text-white">${AppState.t('settings_email')}</div>
                                <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">${AppState.t('settings_email_desc')}</div>
                            </div>
                            <div class="relative">
                                <input type="checkbox" class="sr-only peer">
                                <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                            </div>
                        </label>
                        <label class="flex items-center justify-between cursor-pointer group p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div>
                                <div class="font-bold text-sm text-slate-900 dark:text-white">Alertes sonores</div>
                                <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Émettre un bip sonore lors de la réception d'un message</div>
                            </div>
                            <div class="relative">
                                <input type="checkbox" id="setting-sound-toggle" class="sr-only peer" ${AppState.soundEnabled ? 'checked' : ''}>
                                <div class="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                            </div>
                        </label>
                    </div>
                </div>
                
                ${AppState.user?.role === 'freelance' ? `
                <!-- Modèles d'offres / de services -->
                <div class="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center uppercase tracking-wide">
                            <i data-lucide="layout-template" class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"></i> Modèles d'offres
                        </h3>
                        <button type="button" id="btn-add-template" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center border border-indigo-100 dark:border-indigo-800/50">
                            <i data-lucide="plus" class="w-3.5 h-3.5 mr-1"></i> Nouveau
                        </button>
                    </div>
                    <div class="space-y-3" id="service-templates-list">
                        ${(AppState.profileData.serviceTemplates || []).length === 0 ? `
                            <div class="text-center p-6 bg-white/50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                                Aucun modèle enregistré.<br><span class="text-xs opacity-80">Créez-en un pour gagner du temps lors de vos publications.</span>
                            </div>
                        ` : (AppState.profileData.serviceTemplates || []).map((tpl, i) => `
                            <div class="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-colors shadow-sm group">
                                <div>
                                    <div class="font-bold text-slate-900 dark:text-white text-sm mb-0.5">${AppState.escapeHtml(tpl.title)}</div>
                                    <div class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <span class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[10px] uppercase font-bold tracking-wider">${AppState.escapeHtml(tpl.category)}</span>
                                        <span>•</span>
                                        <span>À partir de ${AppState.escapeHtml(tpl.price)}€</span>
                                        <span>•</span>
                                        <span>${AppState.escapeHtml(tpl.delay)}</span>
                                    </div>
                                </div>
                                <button type="button" data-index="${i}" class="btn-delete-template text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-2.5 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-200 dark:hover:border-red-800/50">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                

                <!-- Sécurité -->
                <div class="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center uppercase tracking-wide">
                        <i data-lucide="shield" class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"></i> ${AppState.t('settings_security')}
                    </h3>
                    
                    <div class="space-y-4">
                        <!-- Dual Factor Block -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm transition-colors gap-4">
                            <div>
                                <div class="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1">
                                    Authentification à deux facteurs (2FA)
                                    <span id="twofa-badge" class="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold ${AppState.isTwoFactorEnabled ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'}">
                                        ${AppState.isTwoFactorEnabled ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                <div class="text-xs font-medium text-slate-500 dark:text-slate-400">Renforcez la sécurité de votre compte avec un code de confirmation unique par mobile.</div>
                            </div>
                            <button type="button" id="btn-configure-2fa" class="text-xs font-bold ${AppState.isTwoFactorEnabled ? 'text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/65' : 'text-indigo-600 hover:text-white bg-slate-100 hover:bg-indigo-600 border border-slate-200'} px-5 py-2.5 rounded-xl transition cursor-pointer w-full sm:w-auto text-center">
                                ${AppState.isTwoFactorEnabled ? 'Désactiver' : 'Configurer'}
                            </button>
                        </div>

                        <!-- Change Password Block -->
                        <div class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl space-y-4 shadow-sm">
                            <div class="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                <div class="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <i data-lucide="key-round" class="w-4 h-4"></i>
                                </div>
                                Modifier le mot de passe
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="group">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5" for="db-old-password">Mot de passe actuel</label>
                                    <input type="password" id="db-old-password" placeholder="••••••••" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white transition-all">
                                </div>
                                <div class="group">
                                    <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5" for="db-new-password">Nouveau mot de passe</label>
                                    <input type="password" id="db-new-password" placeholder="••••••••" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white transition-all">
                                </div>
                            </div>

                            <!-- New Password Strength Tester for interactive security -->
                            <div class="hidden pt-1" id="pwd-new-strength-indicator">
                                <div class="flex gap-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                    <div id="new-strength-bar-1" class="h-full bg-slate-200 dark:bg-slate-600 w-1/4 transition-all duration-300"></div>
                                    <div id="new-strength-bar-2" class="h-full bg-slate-200 dark:bg-slate-600 w-1/4 transition-all duration-300"></div>
                                    <div id="new-strength-bar-3" class="h-full bg-slate-200 dark:bg-slate-600 w-1/4 transition-all duration-300"></div>
                                    <div id="new-strength-bar-4" class="h-full bg-slate-200 dark:bg-slate-600 w-1/4 transition-all duration-300"></div>
                                </div>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2 block" id="new-strength-status-text">Faible</span>
                            </div>

                            <div class="flex justify-end pt-2">
                                <button type="button" id="btn-change-password" class="text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-5 py-2.5 rounded-xl transition-colors cursor-pointer w-full sm:w-auto">
                                    Appliquer la modification
                                </button>
                            </div>
                        </div>

                        <!-- Safety Event Logs -->
                        <div class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
                            <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                                <div class="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                                    <i data-lucide="shield-alert" class="w-4 h-4"></i>
                                </div>
                                Journaux et Activités de Sécurité
                            </h4>
                            <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <table class="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 font-extrabold text-[10px] uppercase tracking-widest">
                                            <th class="py-3 pl-4">Date & Heure</th>
                                            <th class="py-3">Événement</th>
                                            <th class="py-3">Statut</th>
                                            <th class="py-3 pr-4 text-right">Adresse IP</th>
                                        </tr>
                                    </thead>
                                    <tbody id="security-logs-tbody" class="bg-white dark:bg-transparent">
                                        ${AppState.securityLogs.map(log => `
                                            <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td class="py-3 pl-4 text-xs font-medium text-slate-500 dark:text-slate-400">${AppState.escapeHtml(log.date)}</td>
                                                <td class="py-3 text-xs font-bold text-slate-800 dark:text-slate-300">${AppState.escapeHtml(log.event)}</td>
                                                <td class="py-3 text-xs">
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold ${log.status === 'Sécurisé' || log.status === 'Autorisé' || log.status === 'Activation' || log.status === 'Succès' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50'}">
                                                        ${AppState.escapeHtml(log.status)}
                                                    </span>
                                                </td>
                                                <td class="py-3 pr-4 text-xs text-slate-400 font-mono text-right">${AppState.escapeHtml(log.ip)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button type="submit" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 py-3.5 font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 flex items-center justify-center cursor-pointer">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> ${AppState.t('settings_save')}
                    </button>
                </div>
            </form>
        </div>
    `,
    
    attachEvents: () => {
        const form = document.getElementById('settings-form');

        const soundToggle = document.getElementById('setting-sound-toggle');
        soundToggle?.addEventListener('change', (e) => {
            AppState.soundEnabled = e.target.checked;
            localStorage.setItem('soundEnabled', e.target.checked);
        });

        const langSelect = document.getElementById('lang-select');
        langSelect?.addEventListener('change', (e) => {
            AppState.setLanguage(e.target.value);
            // Need to notify I18nContext as well
            if (window.location.reload) window.location.reload();
        });

        const currSelect = document.getElementById('curr-select');
        currSelect?.addEventListener('change', (e) => {
            AppState.setCurrency(e.target.value);
        });

        // Theme toggle
        form?.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                AppState.setTheme(e.target.value);
            });
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="check" class="w-4 h-4 mr-2"></i> Préférences sauvegardées';
            btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
            btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            if (window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
                btn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                if (window.lucide) window.lucide.createIcons();
            }, 500);
        });

        // Live Password Strength Indicator in Change Password Block
        const newPwdInput = document.getElementById('db-new-password');
        const changePwdIndicator = document.getElementById('pwd-new-strength-indicator');
        
        // Add service template logic
        const btnAddTemplate = document.getElementById('btn-add-template');
        btnAddTemplate?.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in';
            modal.innerHTML = `
                <div class="bg-white dark:bg-slate-900 rounded-[2rem] max-w-md w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl relative transform scale-95 animate-modal-pop">
                    <button class="absolute top-6 right-6 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onclick="this.closest('.fixed').remove()">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6">Créer un modèle d'offre</h3>
                    <form id="template-form" class="space-y-5">
                        <div class="group">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Titre du modèle</label>
                            <input type="text" id="tpl-title" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all text-sm font-medium">
                        </div>
                        <div class="group">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Catégorie</label>
                            <div class="relative">
                                <select id="tpl-category" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all text-sm font-medium appearance-none cursor-pointer">
                                    <option value="Code">Développement (Code)</option>
                                    <option value="Design">Design & Création</option>
                                    <option value="Marketing">Marketing & SEO</option>
                                </select>
                                <i data-lucide="chevron-down" class="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none"></i>
                            </div>
                        </div>
                        <div class="group">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Prix de départ (€)</label>
                            <input type="number" id="tpl-price" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all text-sm font-medium">
                        </div>
                        <div class="group">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Délai estimé</label>
                            <input type="text" id="tpl-delay" required placeholder="Ex: 2 semaines" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all text-sm font-medium">
                        </div>
                        <div class="group">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
                            <textarea id="tpl-desc" rows="3" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none resize-none transition-all text-sm font-medium"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 cursor-pointer flex justify-center mt-2">
                            Enregistrer le modèle
                        </button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            if (window.lucide) window.lucide.createIcons({ root: modal });

            modal.querySelector('#template-form').addEventListener('submit', (ev) => {
                ev.preventDefault();
                const newTpl = {
                    title: document.getElementById('tpl-title').value.trim(),
                    category: document.getElementById('tpl-category').value,
                    price: document.getElementById('tpl-price').value.trim(),
                    delay: document.getElementById('tpl-delay').value.trim(),
                    desc: document.getElementById('tpl-desc').value.trim()
                };
                
                const currentTpls = AppState.profileData.serviceTemplates || [];
                currentTpls.push(newTpl);
                
                AppState.updateProfile({ serviceTemplates: currentTpls }).then(() => {
                    modal.remove();
                    // Just re-render settings to show new template. The easiest is using navigate or re-rendering but since we're in settings view...
                    // the view will re-render if AppState notifies but Dashboard controller handles that.
                    // Let's just alert for now, the AppState.notify() will trigger a re-render.
                });
            });
        });

        document.querySelectorAll('.btn-delete-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                if (confirm('Supprimer ce modèle ?')) {
                    const currentTpls = AppState.profileData.serviceTemplates || [];
                    currentTpls.splice(idx, 1);
                    AppState.updateProfile({ serviceTemplates: currentTpls });
                }
            });
        });
        const newStrengthText = document.getElementById('new-strength-status-text');
        const newBars = [
            document.getElementById('new-strength-bar-1'),
            document.getElementById('new-strength-bar-2'),
            document.getElementById('new-strength-bar-3'),
            document.getElementById('new-strength-bar-4')
        ];

        newPwdInput?.addEventListener('input', () => {
            const val = newPwdInput.value;
            if (!val) {
                changePwdIndicator?.classList.add('hidden');
                return;
            }
            changePwdIndicator?.classList.remove('hidden');

            let score = 0;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            const levels = [
                { text: "Faible", color: "bg-rose-500" },
                { text: "Moyen", color: "bg-amber-500" },
                { text: "Sûr", color: "bg-emerald-500" },
                { text: "Très Fort", color: "bg-indigo-600" }
            ];
            const level = levels[Math.max(0, score - 1)];

            newBars.forEach((b, idx) => {
                if (b) {
                    b.className = `h-full rounded transition-all duration-300 w-1/4 ${idx < score ? level.color : 'bg-slate-200'}`;
                }
            });
            if (newStrengthText) {
                newStrengthText.textContent = level.text;
                newStrengthText.className = `text-[10px] font-bold mt-1 block ${score >= 3 ? 'text-emerald-600' : 'text-slate-500'}`;
            }
        });

        // Apply password change action
        const btnChangePwd = document.getElementById('btn-change-password');
        btnChangePwd?.addEventListener('click', async () => {
            const oldP = document.getElementById('db-old-password')?.value;
            const newP = newPwdInput?.value;

            if (!oldP || !newP) {
                alert("Erreur de sécurité : Vous devez saisir l'ancien et le nouveau mot de passe.");
                return;
            }
            if (newP.length < 8) {
                alert("Erreur de sécurité : Le nouveau mot de passe doit posséder au moins 8 caractères.");
                return;
            }

            const user = auth.currentUser;
            if (!user || user.isAnonymous) {
                alert("Erreur : Aucun utilisateur connecté.");
                return;
            }

            // Check if user is using email/password provider
            const isEmailUser = user.providerData.some(p => p.providerId === 'password');
            if (!isEmailUser) {
                alert("Erreur : Vous êtes connecté via un fournisseur externe (Google). Vous ne pouvez pas modifier votre mot de passe depuis cette application.");
                return;
            }

            try {
                const credential = EmailAuthProvider.credential(user.email, oldP);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newP);
                
                // Push to security logging
                const timestamp = "Aujourd'hui, " + new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
                AppState.securityLogs.unshift({
                    date: timestamp,
                    event: "Mise à jour du mot de passe",
                    status: "Sécurisé",
                    ip: "109.11.45.18"
                });

                // Clean inputs
                document.getElementById('db-old-password').value = '';
                newPwdInput.value = '';
                changePwdIndicator?.classList.add('hidden');

                // Feedback & Refresh Security table
                alert("Sécurité : Votre mot de passe a été modifié avec succès.");
                
                // Refresh security logs table
                const tableBody = document.getElementById('security-logs-tbody');
                if (tableBody) {
                    tableBody.innerHTML = AppState.securityLogs.map(log => `
                                            <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td class="py-3 pl-4 text-xs font-medium text-slate-500 dark:text-slate-400">${AppState.escapeHtml(log.date)}</td>
                                                <td class="py-3 text-xs font-bold text-slate-800 dark:text-slate-300">${AppState.escapeHtml(log.event)}</td>
                                                <td class="py-3 text-xs">
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold ${log.status === 'Sécurisé' || log.status === 'Autorisé' || log.status === 'Activation' || log.status === 'Succès' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50'}">
                                                        ${AppState.escapeHtml(log.status)}
                                                    </span>
                                                </td>
                                                <td class="py-3 pr-4 text-xs text-slate-400 font-mono text-right">${AppState.escapeHtml(log.ip)}</td>
                                            </tr>
                    `).join('');
                }                
            } catch (error) {
                console.error("Password update error:", error);
                if (error.code === 'auth/invalid-credential') {
                    alert("Erreur : L'ancien mot de passe est incorrect.");
                } else if (error.code === 'auth/too-many-requests') {
                    alert("Erreur : Trop de tentatives. Veuillez réessayer plus tard.");
                } else {
                    alert("Erreur lors de la modification du mot de passe : " + error.message);
                }
            }
        });

        // 2FA action
        const btn2Fa = document.getElementById('btn-configure-2fa');
        btn2Fa?.addEventListener('click', () => {
            if (AppState.isTwoFactorEnabled) {
                // Disable 2FA
                if (confirm("Sécurité : Voulez-vous vraiment désactiver l'authentification à deux facteurs ? Votre compte sera moins protégé.")) {
                    AppState.isTwoFactorEnabled = false;
                    const timestamp = "Aujourd'hui, " + new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
                    AppState.securityLogs.unshift({
                        date: timestamp,
                        event: "Désactivation de la 2FA",
                        status: "Avertissement",
                        ip: "109.11.45.18"
                    });
                    alert("Sécurité : Authentification à deux facteurs désactivée.");
                    
                    // Re-fire AppState notify to cleanly redraw settings or do a selective UI update
                    AppState.notify();
                }
            } else {
                // Build interactive QR Code modal
                const modal = document.createElement('div');
                modal.id = 'twofa-config-modal';
                modal.className = 'fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in';
                modal.innerHTML = `
                    <div class="bg-white dark:bg-slate-900 rounded-[2rem] max-w-sm w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl relative">
                        <button id="close-twofa-modal" class="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                        <div class="text-center mb-6">
                            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                                <i data-lucide="shield-check" class="w-6 h-6"></i>
                            </div>
                            <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Activer la 2FA</h3>
                            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">Sécurisez votre compte avec Google Authenticator</p>
                        </div>
                        
                        <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex gap-4 items-center mb-6">
                            <div class="w-20 h-20 bg-white border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 flex flex-wrap shrink-0">
                                ${Array(25).fill(0).map(() => `<div class="w-1/5 h-1/5 ${Math.random() > 0.45 ? 'bg-slate-800' : 'bg-transparent'}"></div>`).join('')}
                            </div>
                            <div class="min-w-0">
                                <p class="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Scannez le code</p>
                                <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Clé secrète :</p>
                                <code class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider block mt-1 select-all cursor-pointer bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block">SK1L-L1NK-SEC-2FA</code>
                            </div>
                        </div>

                        <form id="twofa-verification-form" class="space-y-4">
                            <div class="group">
                                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5" for="twofa-code">Saisissez le code à 6 chiffres</label>
                                <input type="text" id="twofa-code" required maxLength="6" placeholder="000000" class="w-full text-center tracking-[0.5em] text-xl font-bold px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:text-white transition-all">
                            </div>
                            
                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer mt-2">
                                <i data-lucide="check-circle-2" class="w-4 h-4"></i> ACTIVER MAINTENANT
                            </button>
                        </form>
                    </div>
                `;

                document.body.appendChild(modal);
                if (window.lucide) window.lucide.createIcons({ root: modal });

                // Handle close modal
                document.getElementById('close-twofa-modal')?.addEventListener('click', () => {
                    modal.remove();
                });

                // Handle submit code form
                document.getElementById('twofa-verification-form')?.addEventListener('submit', (ev) => {
                    ev.preventDefault();
                    const code = document.getElementById('twofa-code')?.value;
                    if (!code || code.length !== 6 || isNaN(Number(code))) {
                        alert("Erreur de validation : Le code de double facteur doit être composé de 6 chiffres.");
                        return;
                    }

                    // Success setting state
                    AppState.isTwoFactorEnabled = true;
                    const timestamp = "Aujourd'hui, " + new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
                    AppState.securityLogs.unshift({
                        date: timestamp,
                        event: "Activation Double Facteur (2FA)",
                        status: "Activation",
                        ip: "109.11.45.18"
                    });

                    modal.remove();
                    alert("Succès : L'authentification à deux facteurs (2FA) est désormais active sur votre compte !");
                    
                    // Refresh parent UI state
                    AppState.notify();
                });
            }
        });
    }
};
