
import { AppState } from '../state.js';

export const NotificationsView = {
    render: () => {
        const notifications = AppState.notifications || [];
        
        return `
            <div class="max-w-2xl mx-auto p-3 sm:p-8 -mt-6">
                <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Notifications</h2>
                
                ${notifications.length > 0 ? `
                    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 divide-y dark:divide-slate-700">
                        ${notifications.map(notif => `
                            <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                <p class="text-sm font-semibold text-slate-900 dark:text-white">${notif.title}</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${notif.message}</p>
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
    }
};
