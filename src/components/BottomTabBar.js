import { AppState } from '../state.js';

export const BottomTabBar = () => {
    if (!AppState.user) return '';

    const currentPath = AppState.currentPath;

    const isActive = (path) => currentPath === path;
    const activeClass = "text-indigo-600";
    const inactiveClass = "text-slate-500 hover:text-indigo-500";

    const isFreelance = AppState.user.role === 'freelance' || AppState.user.role === 'entrepreneur';
    const dashboardOrTrackingRoute = isFreelance ? 'tracking' : 'dashboard';
    const dashboardOrTrackingIcon = isFreelance ? 'kanban-square' : 'layout-dashboard';
    const dashboardOrTrackingLabel = isFreelance ? AppState.t('tab_tracking') : AppState.t('tab_dashboard');

    return `
        <div class="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pt-1 pb-1">
            <div class="flex justify-around items-center h-14">
                <!-- Home -->
                <button data-route="home" class="flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('home') ? activeClass : inactiveClass}">
                    <i data-lucide="home" class="w-6 h-6 mb-1 ${isActive('home') ? 'fill-indigo-100' : ''}"></i>
                    <span class="text-[10px] font-semibold">${AppState.t('tab_home')}</span>
                </button>
                
                <!-- Marketplace -->
                <button data-route="marketplace" class="flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('marketplace') ? activeClass : inactiveClass}">
                    <i data-lucide="search" class="w-6 h-6 mb-1 ${isActive('marketplace') ? 'text-indigo-600' : ''}"></i>
                    <span class="text-[10px] font-semibold">${AppState.t('tab_explore')}</span>
                </button>
                
                <!-- Manual -->
                <button onclick="openManualMenu()" class="flex flex-col items-center justify-center w-full h-full transition-colors text-slate-500 hover:text-indigo-500">
                    <i data-lucide="book-open" class="w-6 h-6 mb-1"></i>
                    <span class="text-[10px] font-semibold">Manuel</span>
                </button>

                <!-- Messages -->
                <button data-route="messaging" class="flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('messaging') ? activeClass : inactiveClass}">
                    <i data-lucide="message-square" class="w-6 h-6 mb-1 ${isActive('messaging') ? 'text-indigo-600' : ''}"></i>
                    <span class="text-[10px] font-semibold">${AppState.t('nav_messages')}</span>
                </button>

                <!-- Notifications -->
                <button data-route="notifications" class="flex flex-col items-center justify-center w-full h-full transition-colors ${isActive('notifications') ? activeClass : inactiveClass}">
                    <i data-lucide="bell" class="w-6 h-6 mb-1 ${isActive('notifications') ? 'text-indigo-600' : ''}"></i>
                    <span class="text-[10px] font-semibold">Notifs</span>
                </button>

            </div>
        </div>
    `;
};
