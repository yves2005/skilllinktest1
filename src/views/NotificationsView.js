
import { AppState } from '../state.js';

export const NotificationsView = {
    render: () => {
        const notifications = AppState.notifications || [];
        
        return `
            <div class="max-w-2xl mx-auto p-3 sm:p-8 -mt-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                    ${notifications.length > 0 ? `
                        <button id="btn-clear-notifications" class="text-sm font-medium text-red-500 hover:text-red-700 transition flex items-center px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            <i data-lucide="trash-2" class="w-4 h-4 mr-1.5"></i> Vider le cache
                        </button>
                    ` : ''}
                </div>
                
                ${notifications.length > 0 ? `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 divide-y dark:divide-slate-700">
                        ${notifications.map(notif => `
                            <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                <p class="text-sm font-semibold text-slate-900 dark:text-white break-words">${notif.title}</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">${notif.message}</p>
                                <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-2">${new Date(notif.createdAt).toLocaleString('fr-FR')}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="text-center p-8 text-slate-500 dark:text-slate-400">
                        <p>Aucune notification</p>
                    </div>
                `}
            </div>
        `;
    },
    attachEvents: () => {
        // Mark notifications as read when visiting this view
        if (AppState.unreadCount > 0) {
            AppState.markNotificationsAsRead();
        }

        const btnClear = document.getElementById('btn-clear-notifications');
        if (btnClear) {
            // Save original styles/content
            const originalHTML = btnClear.innerHTML;
            const originalClasses = btnClear.className;

            btnClear.addEventListener('click', (e) => {
                if (e.target.closest('.btn-cancel-clear')) {
                    e.stopPropagation();
                    btnClear.dataset.confirming = "false";
                    btnClear.className = originalClasses;
                    btnClear.innerHTML = originalHTML;
                    if (window.lucide) window.lucide.createIcons({ root: btnClear });
                    return;
                }

                if (btnClear.dataset.confirming === "true") {
                    btnClear.disabled = true;
                    btnClear.innerHTML = `<span class="flex items-center gap-1.5 px-2 py-1"><div class="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div><span class="text-xs text-red-600 font-semibold uppercase tracking-wide">Suppression...</span></span>`;
                    AppState.clearNotifications();
                } else {
                    btnClear.dataset.confirming = "true";
                    btnClear.className = "text-sm font-medium flex items-center p-1 rounded-lg transition overflow-hidden gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30";
                    btnClear.innerHTML = `
                        <span class="text-xs text-red-600 dark:text-red-400 font-semibold tracking-wide uppercase pl-2">Confirmer :</span>
                        <div class="flex gap-1.5">
                            <span class="bg-red-500 text-white px-3 py-1 rounded-md shadow-sm text-xs hover:bg-red-600 transition font-medium">Oui, vider</span>
                            <span class="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-md shadow-sm text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium btn-cancel-clear">Non</span>
                        </div>
                    `;
                    
                    // Reset timeout if user doesn't confirm
                    const currentId = Date.now();
                    btnClear.dataset.timeoutId = currentId;
                    setTimeout(() => {
                        if (btnClear && btnClear.dataset.timeoutId == currentId && btnClear.dataset.confirming === "true") {
                            btnClear.dataset.confirming = "false";
                            btnClear.className = originalClasses;
                            btnClear.innerHTML = originalHTML;
                            if (window.lucide) window.lucide.createIcons({ root: btnClear });
                        }
                    }, 5000);
                }
            });
        }
    }
};
