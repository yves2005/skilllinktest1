import React, { useEffect, useRef, useState } from 'react';
import { I18nProvider, useI18n } from './contexts/I18nContext';
import { Navbar } from './components/Navbar.jsx';

import { AppState } from './state.js';
import { Footer } from './components/Footer.js';
import { BottomTabBar } from './components/BottomTabBar.js';
import { ContactModal } from './components/ContactModal.js';
import { CommentsModal } from './components/CommentsModal.js';
import { ServiceInfoModal } from './components/ServiceInfoModal.js';
import { startTutorialIfNeeded } from './components/Tutorial.js';
import { initToastContainer } from './components/Toast.js';
import { animate } from 'motion';

import { HomeView } from './views/HomeView.js';
import { LoginView } from './views/LoginView.js';
import { RegisterView } from './views/RegisterView.js';
import { ProfileView } from './views/ProfileView.jsx';
import { ProfileEditView } from './views/ProfileEditView.js';
import { MessagingView } from './views/MessagingView.js';
import { TrackingView } from './views/TrackingView.js';
import { DashboardView } from './views/DashboardView.js';
import { AIAssistantView } from './views/AIAssistantView.js';
import { SettingsView } from './views/SettingsView.js';
import { MarketplaceView } from './views/MarketplaceView.jsx';
import { PublishServiceView } from './views/PublishServiceView.js';
import { NotificationsView } from './views/NotificationsView.js';

const VanillaViewWrapper = ({ path, updater }) => {
    const { lang, t } = useI18n(); // trigger re-render on lang change
    const containerRef = useRef(null);
    const mainRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        
        let currentViewObj = HomeView;
        switch (path) {
            case 'home': currentViewObj = HomeView; break;
            case 'marketplace': currentViewObj = MarketplaceView; break;
            case 'publish': currentViewObj = PublishServiceView; break;
            case 'login': currentViewObj = LoginView; break;
            case 'register': currentViewObj = RegisterView; break;
            case 'profile': currentViewObj = ProfileView; break;
            case 'profile-edit': currentViewObj = ProfileEditView; break;
            case 'messaging': currentViewObj = MessagingView; break;
            case 'tracking': currentViewObj = TrackingView; break;
            case 'dashboard': currentViewObj = DashboardView; break;
            case 'ai': currentViewObj = AIAssistantView; break;
            case 'settings': currentViewObj = SettingsView; break;
            case 'notifications': currentViewObj = NotificationsView; break;
            default: currentViewObj = HomeView;
        }

        // Synchronously overwrite AppState.lang and AppState.t before rendering
        AppState.lang = lang;
        AppState.t = t;

        // We render the vanilla template strings
        const html = currentViewObj.render();
        containerRef.current.innerHTML = html;

        // Animation Let's not re-animate on simple data updates
        // We only animate if the path actually changed
        if (mainRef.current && mainRef.current.dataset.lastPath !== path) {
            animate(
                mainRef.current,
                { opacity: [0, 1], y: [15, 0] },
                { duration: 0.4, ease: "easeOut" }
            );
            mainRef.current.dataset.lastPath = path;
        }

        // Attach events
        if (currentViewObj.attachEvents) {
            currentViewObj.attachEvents();
        }
        
        // Setup icons
        setTimeout(() => {
            if (window.lucide) {
                window.lucide.createIcons({ root: containerRef.current });
            }
        }, 50);

        return () => {
            if (typeof window.activeMessagingTeardown === 'function') {
                try {
                    window.activeMessagingTeardown();
                } catch (e) {
                    console.error("Error tearing down active messaging:", e);
                }
                window.activeMessagingTeardown = null;
            }
            if (typeof window.activeProfileTeardown === 'function') {
                try {
                    window.activeProfileTeardown();
                } catch (e) {
                     console.error("Error tearing down active profile:", e);
                }
                window.activeProfileTeardown = null;
            }
        };

    }, [path, lang, t, updater]);

    return (
        <main ref={mainRef} className="flex-grow view-enter pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div ref={containerRef} />
        </main>
    );
};

const VanillaExtrasWrapper = () => {
    const { lang, t } = useI18n(); // for reactivity
    const containerRef = useRef(null);
    const [updater, setUpdater] = useState(0);
    
    useEffect(() => {
        const handleStateChange = () => setUpdater(prev => prev + 1);
        AppState.subscribe(handleStateChange);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        AppState.lang = lang;
        AppState.t = t;
        // The components depend on AppState.t which reads from AppState.lang, which is synced with Context
        containerRef.current.innerHTML = Footer() + BottomTabBar() + ContactModal() + CommentsModal() + ServiceInfoModal();
        setTimeout(() => {
            if (window.lucide) window.lucide.createIcons({ root: containerRef.current });
        }, 50);
    }, [lang, t, updater]);
    
    return <div ref={containerRef} />;
}

const AppContent = () => {
    const [currentPath, setCurrentPath] = useState(AppState.currentPath);
    const [updater, setUpdater] = useState(0);

    useEffect(() => {
        // Initialize theme on mount
        if (AppState.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        AppState.subscribe(() => {
            setCurrentPath(AppState.currentPath);
            setUpdater(prev => prev + 1);
            if (AppState.user) startTutorialIfNeeded();
        });
        initToastContainer();
        if (AppState.user) startTutorialIfNeeded();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 md:pb-0 pb-16">
            <Navbar />
            <VanillaViewWrapper path={currentPath} updater={updater} />
            <VanillaExtrasWrapper />
            {/* The global event delegates are kept in main.jsx */}
        </div>
    );
};

export const App = () => {
    return (
        <I18nProvider>
            <AppContent />
        </I18nProvider>
    );
};

export default App;
