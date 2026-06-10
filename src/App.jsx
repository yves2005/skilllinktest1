import React, { useEffect, useRef, useState } from 'react';
import { I18nProvider, useI18n } from './contexts/I18nContext';
import { Navbar } from './components/Navbar.jsx';
import { LoadingOverlay } from './components/LoadingOverlay.jsx';

import { AppState } from './state.js';
import { Footer } from './components/Footer.js';
import { BottomTabBar } from './components/BottomTabBar.js';
import { ContactModal } from './components/ContactModal.js';
import { CommentsModal } from './components/CommentsModal.js';
import { AddReviewModal } from './components/AddReviewModal.js';
import { ServiceInfoModal } from './components/ServiceInfoModal.js';
import { FreelancerProfileModal } from './components/FreelancerProfileModal.js';
import { startTutorialIfNeeded } from './components/Tutorial.js';
import { initToastContainer } from './components/Toast.js';
import { animate } from 'motion';

const VanillaViewWrapper = ({ path, updater }) => {
    const { lang, t } = useI18n(); // trigger re-render on lang change
    const containerRef = useRef(null);
    const mainRef = useRef(null);
    const [isLoadingView, setIsLoadingView] = useState(false);
    const [currentViewObj, setCurrentViewObj] = useState(null);
    const [loadedPath, setLoadedPath] = useState(null);

    // Effect 1: Handle dynamic module importing. Run ONLY when `path` changes.
    useEffect(() => {
        let isMounted = true;
        setLoadedPath(null);
        setIsLoadingView(true);
        AppState.isPageLoading = true;
        AppState.notify();

        // Turn opacity down instantly and add a subtle blur to signal page change warmly
        if (containerRef.current) {
            containerRef.current.style.opacity = '0';
            containerRef.current.style.filter = 'blur(4px)';
            containerRef.current.style.transition = 'opacity 0.25s ease-out, filter 0.25s ease-out';
        }

        let viewPromise;
        switch (path) {
            case 'home': viewPromise = import('./views/HomeView.js').then(m => m.HomeView); break;
            case 'marketplace': viewPromise = import('./views/MarketplaceView.jsx').then(m => m.MarketplaceView); break;
            case 'publish': viewPromise = import('./views/PublishServiceView.js').then(m => m.PublishServiceView); break;
            case 'login': viewPromise = import('./views/LoginView.js').then(m => m.LoginView); break;
            case 'register': viewPromise = import('./views/RegisterView.js').then(m => m.RegisterView); break;
            case 'profile': viewPromise = import('./views/ProfileView.jsx').then(m => m.ProfileView); break;
            case 'profile-edit': viewPromise = import('./views/ProfileEditView.js').then(m => m.ProfileEditView); break;
            case 'messaging': viewPromise = import('./views/MessagingView.js').then(m => m.MessagingView); break;
            case 'tracking': viewPromise = import('./views/TrackingView.js').then(m => m.TrackingView); break;
            case 'dashboard': viewPromise = import('./views/DashboardView.js').then(m => m.DashboardView); break;
            case 'ai': viewPromise = import('./views/AIAssistantView.js').then(m => m.AIAssistantView); break;
            case 'settings': viewPromise = import('./views/SettingsView.js').then(m => m.SettingsView); break;
            case 'notifications': viewPromise = import('./views/NotificationsView.js').then(m => m.NotificationsView); break;
            default: viewPromise = import('./views/HomeView.js').then(m => m.HomeView);
        }

        viewPromise.then(async (viewObj) => {
            if (!isMounted) return;

            setCurrentViewObj(viewObj);
            setLoadedPath(path);

            // Deactivate Loading UI smoothly
            setIsLoadingView(false);
            AppState.isPageLoading = false;
            AppState.isAppFirstLoad = false;
            AppState.notify();
        }).catch(err => {
            console.error("Failed to load view:", err);
            if (isMounted) {
                setIsLoadingView(false);
                AppState.isPageLoading = false;
                AppState.isAppFirstLoad = false;
                AppState.notify();
                if (containerRef.current) {
                    containerRef.current.style.opacity = '1';
                    containerRef.current.style.filter = 'none';
                }
            }
        });

        return () => {
            isMounted = false;
        };
    }, [path]);

    // Effect 2: Handle rendering of loaded view. Run when view object, lang, or global state updates.
    useEffect(() => {
        if (!containerRef.current || !currentViewObj || loadedPath !== path) return;

        // Synchronously overwrite AppState.lang and AppState.t before rendering
        AppState.lang = lang;
        AppState.t = t;

        // Render view's HTML to DOM (hidden since opacity is 0)
        const html = currentViewObj.render();
        containerRef.current.innerHTML = html;

        // Attach view event listeners
        if (currentViewObj.attachEvents) {
            currentViewObj.attachEvents();
        }
        
        // Sync rendering with Lucide Icons
        setTimeout(() => {
            if (window.lucide && containerRef.current) {
                window.lucide.createIcons({ root: containerRef.current });
            }
        }, 50);

        // Trigger beautiful CSS and Motion fade-and-slide
        containerRef.current.style.opacity = '1';
        containerRef.current.style.filter = 'blur(0px)';

        if (mainRef.current && mainRef.current.dataset.lastPath !== path) {
            animate(
                containerRef.current,
                { opacity: [0, 1], y: [12, 0] },
                { duration: 0.45, ease: "easeOut" }
            );
            mainRef.current.dataset.lastPath = path;
        }

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

    }, [currentViewObj, loadedPath, path, lang, updater]);

    return (
        <main ref={mainRef} className="flex-grow view-enter pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
            {isLoadingView && !AppState.isAppFirstLoad && (
                <div className="absolute inset-x-0 top-0 bottom-0 bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur-[4px] flex items-start justify-center z-50 transition-all duration-300 pt-32">
                    <div className="flex flex-col items-center bg-white/90 dark:bg-slate-800/95 border border-slate-150/40 dark:border-slate-700/80 px-8 py-6 rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.08)] backdrop-blur-md">
                        <div className="w-10 h-10 border-4 border-indigo-50 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase animate-pulse">Chargement...</p>
                    </div>
                </div>
            )}
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
        
        const observer = new MutationObserver(() => {
            const modals = document.querySelectorAll('.fixed.inset-0');
            let hasOpenModal = false;
            modals.forEach((m) => {
                if (!m.classList.contains('hidden') && !m.classList.contains('pointer-events-none') && m.style.display !== 'none') {
                    hasOpenModal = true;
                }
            });
            const isDropdownOpen = document.body.classList.contains('nav-dropdown-open');
            const shouldLock = hasOpenModal || isDropdownOpen;
            const isLocked = document.body.classList.contains('overflow-hidden');
            
            if (shouldLock && !isLocked) {
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.paddingRight = `${scrollbarWidth}px`;
                const glassHeader = document.querySelector('nav.fixed.top-0');
                if (glassHeader) glassHeader.style.paddingRight = `${scrollbarWidth}px`;
                document.body.classList.add('overflow-hidden');
            } else if (!shouldLock && isLocked) {
                document.body.style.paddingRight = '';
                const glassHeader = document.querySelector('nav.fixed.top-0');
                if (glassHeader) glassHeader.style.paddingRight = '';
                document.body.classList.remove('overflow-hidden');
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        AppState.lang = lang;
        AppState.t = t;
        // The components depend on AppState.t which reads from AppState.lang, which is synced with Context
        containerRef.current.innerHTML = Footer() + BottomTabBar() + ContactModal() + CommentsModal() + ServiceInfoModal() + AddReviewModal() + FreelancerProfileModal();
        setTimeout(() => {
            if (window.lucide) window.lucide.createIcons({ root: containerRef.current });
        }, 50);
    }, [lang, t, updater]);
    
    return <div ref={containerRef} />;
}

const AppContent = () => {
    const [currentPath, setCurrentPath] = useState(AppState.currentPath);
    const [updater, setUpdater] = useState(0);
    const [isAuthInit, setIsAuthInit] = useState(AppState.isAuthInitialized);
    const [isPageLoading, setIsPageLoading] = useState(AppState.isPageLoading);
    const [isGlobalLoading, setIsGlobalLoading] = useState(AppState.isGlobalLoading);
    const [globalLoadingText, setGlobalLoadingText] = useState(AppState.globalLoadingText);

    useEffect(() => {
        // Initialize theme on mount
        if (AppState.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        AppState.subscribe(() => {
            setCurrentPath(AppState.currentPath);
            setIsAuthInit(AppState.isAuthInitialized);
            setIsPageLoading(AppState.isPageLoading);
            setIsGlobalLoading(AppState.isGlobalLoading);
            setGlobalLoadingText(AppState.globalLoadingText);
            setUpdater(prev => prev + 1);
            if (AppState.user) startTutorialIfNeeded();
        });
        initToastContainer();
        if (AppState.user) startTutorialIfNeeded();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 md:pb-0 pb-16">
            <LoadingOverlay show={isGlobalLoading || !isAuthInit || (AppState.isAppFirstLoad && isPageLoading)} customMessage={isGlobalLoading ? globalLoadingText : null} />
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
