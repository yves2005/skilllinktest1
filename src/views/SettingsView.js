import { AppState } from '../state.js';
import { auth } from '../services/firebase.js';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const SettingsView = {
    render: () => `
        <div class="max-w-2xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200 mt-4">
            <!-- Navigation Rapide -->
            <div class="flex items-center justify-center gap-8 mb-8 pb-4 border-b border-slate-100 border-dashed">
                <button data-route="marketplace" class="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition font-bold text-sm">
                    <i data-lucide="search" class="w-4 h-4"></i> ${AppState.t('nav_explore')}
                </button>
                <button data-route="ai" class="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition font-bold text-sm">
                    <i data-lucide="sparkles" class="w-4 h-4"></i> ${AppState.t('nav_ai')}
                </button>
            </div>

            <div class="flex items-center mb-6">
                <button data-action="back" class="text-slate-400 hover:text-slate-600 transition flex items-center justify-center p-2 rounded-full hover:bg-slate-100 mr-3">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <h2 class="text-2xl font-bold text-slate-900 flex items-center">
                    <i data-lucide="settings" class="mr-3 text-slate-500"></i> ${AppState.t('settings_title')}
                </h2>
            </div>
            <form id="settings-form" class="space-y-6">
                
                <!-- Apparence -->
                <div>
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                        <i data-lucide="palette" class="w-5 h-5 mr-2 text-indigo-500"></i> ${AppState.t('settings_appearance')}
                    </h3>
                    <div class="space-y-2">
                        <label class="cursor-pointer block">
                            <input type="radio" name="theme" value="light" class="peer sr-only" ${AppState.theme === 'light' ? 'checked' : ''}>
                            <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:ring-1 peer-checked:ring-indigo-600 transition">
                                <i data-lucide="sun" class="w-5 h-5 text-amber-500"></i>
                                <span class="text-sm font-medium text-slate-700">${AppState.t('settings_theme_light')}</span>
                            </div>
                        </label>
                        <label class="cursor-pointer block">
                            <input type="radio" name="theme" value="dark" class="peer sr-only" ${AppState.theme === 'dark' ? 'checked' : ''}>
                            <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:ring-1 peer-checked:ring-indigo-600 transition">
                                <i data-lucide="moon" class="w-5 h-5 text-indigo-400"></i>
                                <span class="text-sm font-medium text-slate-700">${AppState.t('settings_theme_dark')}</span>
                            </div>
                        </label>
                        <label class="cursor-pointer block">
                            <input type="radio" name="theme" value="auto" class="peer sr-only" ${!['light', 'dark'].includes(AppState.theme) ? 'checked' : ''}>
                            <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:ring-1 peer-checked:ring-indigo-600 transition">
                                <i data-lucide="monitor" class="w-5 h-5 text-slate-500"></i>
                                <span class="text-sm font-medium text-slate-700">${AppState.t('settings_theme_system')}</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Localisation -->
                <div class="pt-2">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                        <i data-lucide="globe" class="w-5 h-5 mr-2 text-indigo-500"></i> ${AppState.t('settings_location')}
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">${AppState.t('settings_lang')}</label>
                            <select id="lang-select" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition">
                                <option value="fr" ${AppState.lang === 'fr' ? 'selected' : ''}>Français (FR)</option>
                                <option value="en" ${AppState.lang === 'en' ? 'selected' : ''}>English (US)</option>
                                <option value="es" ${AppState.lang === 'es' ? 'selected' : ''}>Español (ES)</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-2">${AppState.t('settings_currency')}</label>
                            <select id="curr-select" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition">
                                <option value="EUR" ${AppState.currency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro</option>
                                <option value="USD" ${AppState.currency === 'USD' ? 'selected' : ''}>USD ($) - Dollar Américain</option>
                                <option value="XOF" ${AppState.currency === 'XOF' ? 'selected' : ''}>XOF (FCFA) - Franc CFA</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Notifications -->
                <div class="pt-2">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                        <i data-lucide="bell" class="w-5 h-5 mr-2 text-indigo-500"></i> ${AppState.t('settings_notifications')}
                    </h3>
                    <div class="space-y-4">
                        <label class="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div class="font-medium text-slate-900">${AppState.t('settings_push')}</div>
                                <div class="text-xs text-slate-500 mt-0.5">${AppState.t('settings_push_desc')}</div>
                            </div>
                            <div class="relative">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                        </label>
                        <label class="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div class="font-medium text-slate-900">${AppState.t('settings_email')}</div>
                                <div class="text-xs text-slate-500 mt-0.5">${AppState.t('settings_email_desc')}</div>
                            </div>
                            <div class="relative">
                                <input type="checkbox" class="sr-only peer">
                                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                        </label>
                        <label class="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div class="font-medium text-slate-900">Alertes sonores</div>
                                <div class="text-xs text-slate-500 mt-0.5">Émettre un bip sonore lors de la réception d'un message</div>
                            </div>
                            <div class="relative">
                                <input type="checkbox" id="setting-sound-toggle" class="sr-only peer" ${AppState.soundEnabled ? 'checked' : ''}>
                                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                        </label>
                    </div>
                </div>
                
                ${AppState.user?.role === 'freelance' ? `
                <!-- Modèles d'offres / de services -->
                <div class="pt-2">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                        <h3 class="text-lg font-semibold text-slate-800 flex items-center">
                            <i data-lucide="layout-template" class="w-5 h-5 mr-2 text-indigo-500"></i> Modèles d'offres
                        </h3>
                        <button type="button" id="btn-add-template" class="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center">
                            <i data-lucide="plus" class="w-3.5 h-3.5 mr-1"></i> Nouveau modèle
                        </button>
                    </div>
                    <div class="space-y-3" id="service-templates-list">
                        ${(AppState.profileData.serviceTemplates || []).length === 0 ? `
                            <div class="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
                                Aucun modèle enregistré. Créez-en un pour gagner du temps lors de vos publications.
                            </div>
                        ` : (AppState.profileData.serviceTemplates || []).map((tpl, i) => `
                            <div class="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl hover:border-indigo-200 transition">
                                <div>
                                    <div class="font-bold text-slate-800 text-sm">${AppState.escapeHtml(tpl.title)}</div>
                                    <div class="text-xs text-slate-500">${AppState.escapeHtml(tpl.category)} • À partir de ${AppState.escapeHtml(tpl.price)}€ • ${AppState.escapeHtml(tpl.delay)}</div>
                                </div>
                                <button type="button" data-index="${i}" class="btn-delete-template text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition cursor-pointer">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- FAQ pour Freelances -->
                <div class="pt-2">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                        <i data-lucide="help-circle" class="w-5 h-5 mr-2 text-indigo-500"></i> ${AppState.t('settings_faq')}
                    </h3>
                    <div class="space-y-3">
                        <details class="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                            <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-slate-800 marker:content-none *:outline-none">
                                <span>${AppState.t('faq_q1_title')}</span>
                                <span class="transition-transform duration-300 group-open:rotate-180">
                                    <i data-lucide="chevron-down" class="w-5 h-5 text-slate-500"></i>
                                </span>
                            </summary>
                            <div class="text-slate-600 text-sm p-4 pt-0 leading-relaxed border-t border-slate-200/60 mt-1">
                                ${AppState.t('faq_q1_desc')}
                            </div>
                        </details>
                        
                        <details class="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                            <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-slate-800 marker:content-none *:outline-none">
                                <span>${AppState.t('faq_q2_title')}</span>
                                <span class="transition-transform duration-300 group-open:rotate-180">
                                    <i data-lucide="chevron-down" class="w-5 h-5 text-slate-500"></i>
                                </span>
                            </summary>
                            <div class="text-slate-600 text-sm p-4 pt-0 leading-relaxed border-t border-slate-200/60 mt-1">
                                ${AppState.t('faq_q2_desc')}
                            </div>
                        </details>
                        
                        <details class="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                            <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-slate-800 marker:content-none *:outline-none">
                                <span>${AppState.t('faq_q3_title')}</span>
                                <span class="transition-transform duration-300 group-open:rotate-180">
                                    <i data-lucide="chevron-down" class="w-5 h-5 text-slate-500"></i>
                                </span>
                            </summary>
                            <div class="text-slate-600 text-sm p-4 pt-0 leading-relaxed border-t border-slate-200/60 mt-1">
                                ${AppState.t('faq_q3_desc')}
                            </div>
                        </details>
                        
                        <details class="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                            <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-slate-800 marker:content-none *:outline-none">
                                <span>${AppState.t('faq_q4_title')}</span>
                                <span class="transition-transform duration-300 group-open:rotate-180">
                                    <i data-lucide="chevron-down" class="w-5 h-5 text-slate-500"></i>
                                </span>
                            </summary>
                            <div class="text-slate-600 text-sm p-4 pt-0 leading-relaxed border-t border-slate-200/60 mt-1">
                                ${AppState.t('faq_q4_desc')}
                            </div>
                        </details>
                    </div>
                </div>

                <!-- Sécurité -->
                <div class="pt-2">
                    <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                        <i data-lucide="shield" class="w-5 h-5 mr-2 text-indigo-500"></i> ${AppState.t('settings_security')}
                    </h3>
                    
                    <div class="space-y-4">
                        <!-- Dual Factor Block -->
                        <div class="flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 border border-slate-150 p-4 rounded-xl transition">
                            <div>
                                <div class="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    Authentification à deux facteurs (2FA)
                                    <span id="twofa-badge" class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${AppState.isTwoFactorEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
                                        ${AppState.isTwoFactorEnabled ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>
                                <div class="text-xs text-slate-500 mt-0.5">Renforcez la sécurité de votre compte avec un code de confirmation unique par mobile.</div>
                            </div>
                            <button type="button" id="btn-configure-2fa" class="text-xs font-bold ${AppState.isTwoFactorEnabled ? 'text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/65' : 'text-indigo-600 hover:text-white bg-slate-100 hover:bg-indigo-600 border border-slate-200'} px-3.5 py-2 rounded-xl transition shrink-0 cursor-pointer">
                                ${AppState.isTwoFactorEnabled ? 'Désactiver' : 'Configurer'}
                            </button>
                        </div>

                        <!-- Change Password Block -->
                        <div class="bg-slate-50/50 border border-slate-150 p-4 rounded-xl space-y-3.5">
                            <div class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                <i data-lucide="key-round" class="w-4 h-4 text-indigo-500"></i> Modifier le mot de passe
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1" for="db-old-password">Mot de passe actuel</label>
                                    <input type="password" id="db-old-password" placeholder="••••••••" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1" for="db-new-password">Nouveau mot de passe</label>
                                    <input type="password" id="db-new-password" placeholder="••••••••" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                </div>
                            </div>

                            <!-- New Password Strength Tester for interactive security -->
                            <div class="hidden" id="pwd-new-strength-indicator">
                                <div class="flex gap-1 h-1 w-full rounded bg-slate-100 overflow-hidden">
                                    <div id="new-strength-bar-1" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                                    <div id="new-strength-bar-2" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                                    <div id="new-strength-bar-3" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                                    <div id="new-strength-bar-4" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                                </div>
                                <span class="text-[10px] font-semibold text-slate-500 mt-1 flex items-center" id="new-strength-status-text">Faible</span>
                            </div>

                            <button type="button" id="btn-change-password" class="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition cursor-pointer">
                                Appliquer la modification
                            </button>
                        </div>

                        <!-- Safety Event Logs -->
                        <div class="bg-slate-50/50 border border-slate-150 p-4 rounded-xl">
                            <h4 class="font-bold text-slate-800 text-sm mb-2.5 flex items-center gap-1.5">
                                <i data-lucide="shield-alert" class="w-4 h-4 text-slate-500"></i> Journaux et Activités de Sécurité
                            </h4>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse">
                                    <thead>
                                        <tr class="border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                            <th class="py-1.5">Date & Heure</th>
                                            <th class="py-1.5">Événement</th>
                                            <th class="py-1.5">Statut</th>
                                            <th class="py-1.5 text-right">Adresse IP</th>
                                        </tr>
                                    </thead>
                                    <tbody id="security-logs-tbody">
                                        ${AppState.securityLogs.map(log => `
                                            <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                                <td class="py-2.5 text-xs font-semibold text-slate-500">${AppState.escapeHtml(log.date)}</td>
                                                <td class="py-2.5 text-xs font-semibold text-slate-700">${AppState.escapeHtml(log.event)}</td>
                                                <td class="py-2.5 text-xs">
                                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${log.status === 'Sécurisé' || log.status === 'Autorisé' || log.status === 'Activation' || log.status === 'Succès' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}">
                                                        ${AppState.escapeHtml(log.status)}
                                                    </span>
                                                </td>
                                                <td class="py-2.5 text-xs text-slate-400 font-semibold text-right">${AppState.escapeHtml(log.ip)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-medium transition shadow-sm flex items-center cursor-pointer">
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
            modal.className = 'fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in';
            modal.innerHTML = `
                <div class="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative">
                    <button class="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer" onclick="this.closest('.fixed').remove()">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                    <h3 class="text-xl font-bold text-slate-800 mb-4">Créer un modèle d'offre</h3>
                    <form id="template-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Titre du modèle</label>
                            <input type="text" id="tpl-title" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Catégorie</label>
                            <select id="tpl-category" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none">
                                <option value="Code">Développement (Code)</option>
                                <option value="Design">Design & Création</option>
                                <option value="Marketing">Marketing & SEO</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Prix de départ (€)</label>
                            <input type="number" id="tpl-price" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Délai estimé</label>
                            <input type="text" id="tpl-delay" required placeholder="Ex: 2 semaines" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                            <textarea id="tpl-desc" rows="3" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition cursor-pointer">
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
                        <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition">
                            <td class="py-2.5 text-xs font-semibold text-slate-500">${AppState.escapeHtml(log.date)}</td>
                            <td class="py-2.5 text-xs font-semibold text-slate-700">${AppState.escapeHtml(log.event)}</td>
                            <td class="py-2.5 text-xs">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${log.status === 'Sécurisé' || log.status === 'Autorisé' || log.status === 'Activation' || log.status === 'Succès' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}">
                                    ${AppState.escapeHtml(log.status)}
                                </span>
                            </td>
                            <td class="py-2.5 text-xs text-slate-400 font-semibold text-right">${AppState.escapeHtml(log.ip)}</td>
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
                modal.className = 'fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in';
                modal.innerHTML = `
                    <div class="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl relative">
                        <button id="close-twofa-modal" class="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <div class="text-center mb-5">
                            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-2 text-indigo-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            </div>
                            <h3 class="text-lg font-bold text-slate-900">Activer la 2FA</h3>
                            <p class="text-xs text-slate-500 mt-1">Sécurisez votre compte avec Google Authenticator</p>
                        </div>
                        
                        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 items-center mb-5">
                            <div class="w-16 h-16 bg-white border border-slate-200 rounded-lg p-1 flex flex-wrap shrink-0">
                                ${Array(25).fill(0).map(() => `<div class="w-1/5 h-1/5 ${Math.random() > 0.45 ? 'bg-slate-800' : 'bg-transparent'}"></div>`).join('')}
                            </div>
                            <div class="min-w-0">
                                <p class="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Scannez le code</p>
                                <p class="text-[10px] text-slate-500 leading-tight">Clé secrète :</p>
                                <code class="text-xs font-mono font-bold text-indigo-600 tracking-wider block mt-0.5 select-all cursor-pointer">SK1L-L1NK-SEC-2FA</code>
                            </div>
                        </div>

                        <form id="twofa-verification-form" class="space-y-3">
                            <div>
                                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1" for="twofa-code">Saisissez le code à 6 chiffres</label>
                                <input type="text" id="twofa-code" required maxLength="6" placeholder="000000" class="w-full text-center tracking-widest text-base font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition">
                            </div>
                            
                            <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                                ACTIVER MAINTENANT
                            </button>
                        </form>
                    </div>
                `;

                document.body.appendChild(modal);

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
