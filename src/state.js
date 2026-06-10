import { db, auth, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from './services/firebase.js';
import { 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    onSnapshot, 
    collection, 
    query, 
    where, 
    or,
    addDoc, 
    orderBy, 
    serverTimestamp,
    getDocFromServer,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase warning: Connection test indicates client is offline. If you manually created your Firebase project, please ensure Firestore Database is enabled/created in your Firebase Console under the 'skilllinkweb' project.");
    } else {
      console.log("Firebase connection test complete.");
    }
  }
}
testConnection();

function translateAuthError(error) {
    const code = error?.code || '';
    if (code === 'auth/operation-not-allowed') {
        return "L'inscription/connexion avec E-mail et Mot de passe n'est pas activée dans votre Console Firebase.\n\n" +
               "Pour l'activer :\n" +
               "1. Rendez-vous sur https://console.firebase.google.com/\n" +
               "2. Sélectionnez le projet 'skilllinkweb'\n" +
               "3. Allez dans 'Authentification' -> onglet 'Sign-in method'\n" +
               "4. Activez le fournisseur 'E-mail/Mot de passe' (Adresse e-mail) et enregistrez.\n\n" +
               "En attendant, vous pouvez utiliser le bouton 'Continuer avec Google' qui fonctionne immédiatement.";
    }
    if (code === 'auth/popup-blocked') {
        return "La fenêtre de connexion Google a été bloquée par votre navigateur.\n\n" +
               "Veuillez autoriser les fenêtres pop-up (popups) de votre navigateur pour ce site, ou ouvrez votre application dans un nouvel onglet indépendant de l'iFrame (recommandé).";
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        return "Identifiants incorrects. Veuillez vérifier l'adresse e-mail ou le mot de passe saisi.";
    }
    if (code === 'auth/email-already-in-use') {
        return "Cette adresse e-mail est déjà associée à un compte existant.";
    }
    if (code === 'auth/weak-password') {
        return "Mot de passe trop faible. Il doit contenir au moins 6 caractères.";
    }
    if (code === 'auth/invalid-email') {
        return "Adresse e-mail invalide. Veuillez vérifier le format.";
    }
    return error.message || String(error);
}

// Global exportable arrays with reactivity
export const DEFAULT_SERVICES = [];

export const DEFAULT_FREELANCES = [];

export function safeSetLocalStorage(key, data) {
    try {
        let compacted = data;
        if (Array.isArray(data)) {
            compacted = data.slice(0, 25).map(item => {
                if (!item || typeof item !== 'object') return item;
                const copy = { ...item };
                for (const k in copy) {
                    if (typeof copy[k] === 'string' && copy[k].length > 1000) {
                        if (copy[k].startsWith('data:image/') || copy[k].startsWith('data:')) {
                            copy[k] = '';
                        } else {
                            copy[k] = copy[k].slice(0, 1000) + '...';
                        }
                    } else if (copy[k] && typeof copy[k] === 'object' && !Array.isArray(copy[k])) {
                        const subObj = { ...copy[k] };
                        for (const subK in subObj) {
                            if (typeof subObj[subK] === 'string' && subObj[subK].length > 1000) {
                                if (subObj[subK].startsWith('data:image/') || subObj[subK].startsWith('data:')) {
                                    subObj[subK] = '';
                                } else {
                                    subObj[subK] = subObj[subK].slice(0, 1000) + '...';
                                }
                            }
                        }
                        copy[k] = subObj;
                    }
                }
                return copy;
            });
        }
        const serialized = JSON.stringify(compacted);
        localStorage.setItem(key, serialized);
    } catch (e) {
        console.warn(`[LocalStorage Cache Warning] Quota issue or error on item '${key}': ${e.message || e}`);
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('cached_') && k !== key) {
                    localStorage.removeItem(k);
                }
            }
            if (Array.isArray(data)) {
                const mini = data.slice(0, 5).map(item => {
                    if (!item || typeof item !== 'object') return item;
                    const copy = { ...item };
                    for (const k in copy) {
                        if (typeof copy[k] === 'string' && (copy[k].length > 100 || copy[k].startsWith('data:'))) {
                            copy[k] = '';
                        }
                    }
                    return copy;
                });
                localStorage.setItem(key, JSON.stringify(mini));
            }
        } catch (innerErr) {
            console.warn("[LocalStorage Cache Warning] Fallback failed:", innerErr.message || innerErr);
        }
    }
}

// Function to map a dummy freelance item to standard ProfileData schema
export const mapFreelanceToProfileData = (freelance) => {
    // Standardize portfolio projects
    const portfolioItems = (freelance.portfolio || []).map((img, idx) => {
        if (typeof img === 'string') {
            return {
                id: `p_${freelance.id}_${idx}`,
                title: `${freelance.skills[idx % freelance.skills.length] || 'Réalisation'}`,
                category: idx % 2 === 0 ? 'Développement Web' : 'UI/UX & Design',
                image: img,
                description: `Projet conçu et livré par ${freelance.name} avec une attention particulière aux exigences métier et aux détails d'exécution.`,
                skills: [freelance.skills[idx % freelance.skills.length] || 'Tech']
            };
        }
        return img;
    });

    const stats = [
        { label: "Projets réussis", value: String(freelance.reviewsCount || 15), icon: "check-circle", color: "emerald" },
        { label: "Taux de réponse", value: "100%", icon: "message-circle", color: "blue" },
        { label: "Délai de réponse", value: freelance.responseTime || "< 1h", icon: "clock", color: "amber" }
    ];

    const reviews = [];

    return {
        id: freelance.id,
        isAvailable: freelance.isAvailable !== undefined ? freelance.isAvailable : true,
        coverImage: freelance.coverImage || null,
        displayName: freelance.name,
        avatarImage: freelance.img || null,
        title: freelance.title,
        location: freelance.location || "Paris, FR",
        tjm: freelance.tjm || 400,
        bio: freelance.bio || "Freelance expert passionné par l'innovation technique, la conception et l'élaboration de produits d'exception.",
        skills: freelance.skills || [],
        stats: stats,
        reviews: reviews,
        portfolio: portfolioItems
    };
};

export const DUMMY_FREELANCES = [];
export const DUMMY_SERVICES = [];
export const DUMMY_PROJECTS = [];

import translationsData from './translations.json';

export const AppState = {
    user: null, // Dynamic React Auth State
    currentPath: window.location.hash ? window.location.hash.substring(1) : 'home',
    lang: 'fr',
    translations: translationsData,
    theme: localStorage.getItem('theme') || 'light', // Default to light
    currency: localStorage.getItem('currency') || 'EUR',
    historyStack: [],
    notifications: [],
    unreadCount: 0,
    listeners: [],
    
    isPageLoading: false,
    isAppFirstLoad: true,
    isAuthInitialized: false,
    isGlobalLoading: false,
    globalLoadingText: "",
    
    setTheme(newTheme) {
        this.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        this.notify();
    },

    setCurrency(currency) {
        this.currency = currency;
        localStorage.setItem('currency', currency);
        this.notify();
    },
    setTourSeen(seen) {
        this.tourSeen = seen;
        localStorage.setItem('tourSeen', seen);
        this.notify();
    },
    isTwoFactorEnabled: false,
    tourSeen: localStorage.getItem('tourSeen') === 'true',
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    isAuthInitialized: false, // Ajout pour le chargement initial
    isPageLoading: true, // Seamless view loading
    isAppFirstLoad: true, // Seamless app startup loading
    securityLogs: [
        { date: "Aujourd'hui, 11:42", event: "Vérification des règles de sécurité", status: "Sécurisé", ip: "109.11.45.18" },
        { date: "Hier, 18:34", event: "Connexion réussie", status: "Autorisé", ip: "109.11.45.18" }
    ],

    // Global XSS Sanitization helper accessible in all views
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    playNotificationSound(type = 'default') {
        if (!this.soundEnabled) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (type === 'servicePublished') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            }
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {
            console.error("Audio playback failed", e);
        }
    },

    profileData: {
        isAvailable: true,
        coverImage: null,
        displayName: "",
        title: "",
        location: "",
        tjm: 400,
        bio: "",
        skills: [],
        stats: [
            { label: "Projets réussis", value: "34", icon: "check-circle", color: "emerald" },
            { label: "Taux de réponse", value: "100%", icon: "message-circle", color: "blue" },
            { label: "Délai de réponse", value: "< 1h", icon: "clock", color: "amber" }
        ],
        reviews: [],
        serviceTemplates: [],
        recentImageUrls: []
    },
    
    async loadTranslations() {
        // Translations are statically imported, so we just run notify if needed
        this.notify();
    },
    
    setLanguage(lang) {
        if (this.lang !== lang) {
            this.lang = lang;
            this.notify();
        }
    },
    
    t(key) {
        if (typeof key !== 'string') {
            if (key === null || key === undefined) return '';
            if (typeof key === 'object') {
                try {
                    return String(key.label || key.name || key.title || JSON.stringify(key));
                } catch (e) {
                    return '[Object]';
                }
            }
            return String(key);
        }
        if (!this.translations[this.lang]) return key;
        return this.translations[this.lang][key] || key;
    },
    
    formatPrice(priceString) {
        if (!priceString) return '';
        const digits = priceString.match(/\d+/);
        const numericPart = digits ? digits[0] : '';
        const symbol = this.currency === 'EUR' ? '€' : this.currency === 'USD' ? '$' : 'FCFA';
        
        // Try to respect the "À partir de" prefix if it's there
        if (priceString.includes('À partir de')) {
            return `À partir de ${numericPart}${symbol}`;
        }
        return `${numericPart}${symbol}`;
    },
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },
    
    notify() {
        this.listeners.forEach(listener => {
            try { listener(); } catch (e) { console.error("Listener error:", e); }
        });
    },

    navigate(path) {
        if (path === 'profile') {
            if (this.user) {
                const userKey = `last_viewed_profile_id_${this.user.uid}`;
                sessionStorage.setItem('last_viewed_profile_id', this.user.uid);
                localStorage.setItem('last_viewed_profile_id', this.user.uid);
                sessionStorage.setItem(userKey, this.user.uid);
                localStorage.setItem(userKey, this.user.uid);
                if (this.originalProfileData) {
                    this.profileData = JSON.parse(JSON.stringify(this.originalProfileData));
                    this.profileData.id = this.user.uid;
                }
            }
        }
        if (this.currentPath !== path) {
            this.historyStack.push(this.currentPath);
            this.currentPath = path;
            window.location.hash = path;
            this.notify();
        }
    },

    goBack() {
        if (this.historyStack.length > 0) {
            this.currentPath = this.historyStack.pop();
        } else {
            this.currentPath = 'home';
        }
        window.location.hash = this.currentPath;
        this.notify();
    },

    // Authentic Firebase register
    async register(name, email, password, role) {
        console.log("Registering via Firebase Auth...", { name, email, role });
        const mappedRole = (role === 'entrepreneur' || role === 'freelance') ? 'freelance' : 'client';
        sessionStorage.setItem('register_selected_role', mappedRole);
        sessionStorage.setItem('register_selected_name', name);

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("Firebase registration succeeded!");
            this.navigate('home');
        } catch (error) {
            const translated = translateAuthError(error);
            console.warn("Firebase registration failure:", error);
            throw new Error(translated);
        }
    },

    // Authentic Firebase login
    async login(email, password, role = 'client') {
        console.log("Logging in via Firebase Auth...", { email });
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Firebase login succeeded!");
            this.navigate('home');
        } catch (error) {
            const translated = translateAuthError(error);
            console.warn("Firebase login failure:", error);
            throw new Error(translated);
        }
    },

    // Google Sign-In with popup
    async loginWithGoogle() {
        console.log("Logging in via Google Auth...");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Google connection succeeded:", result.user.email);
            this.navigate('home');
        } catch (error) {
            const translated = translateAuthError(error);
            console.warn("Google login failure:", error);
            throw new Error(translated);
        }
    },

    async logout() {
        try {
            if (window.activeMessagingTeardown) {
                window.activeMessagingTeardown();
                window.activeMessagingTeardown = null;
            }
            clearFirestoreListeners();
            if (this.user) {
                sessionStorage.removeItem(`last_viewed_profile_id_${this.user.uid}`);
                localStorage.removeItem(`last_viewed_profile_id_${this.user.uid}`);
            }
            sessionStorage.removeItem('last_viewed_profile_id');
            localStorage.removeItem('last_viewed_profile_id');
            await signOut(auth);
            this.user = null;
            this.navigate('login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    },

    async forgotPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("Password reset error:", error);
            throw error;
        }
    },

    // Notifications Operations
    async createNotification(userId, type, title, message) {
        if (!auth.currentUser) return;
        const id = "notif_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const notificationData = {
            userId,
            type,
            title,
            message,
            read: false,
            createdAt: new Date().toISOString()
        };
        try {
            await setDoc(doc(db, 'notifications', id), notificationData);
        } catch (e) {
            console.error("Failed to create notification", e);
        }
    },

    async markNotificationsAsRead() {
        if (!auth.currentUser) return;
        try {
            const unreadNotifs = this.notifications.filter(n => !n.read);
            for (const notif of unreadNotifs) {
                await updateDoc(doc(db, 'notifications', notif.id), { read: true });
            }
        } catch (e) {
            console.error("Failed to mark notifications as read", e);
        }
    },

    async clearNotifications() {
        if (!auth.currentUser) return;
        this.isGlobalLoading = true;
        this.globalLoadingText = "Suppression de toutes les notifications en cours...";
        this.notify();
        try {
            for (const notif of this.notifications) {
                await deleteDoc(doc(db, 'notifications', notif.id));
            }
            this.notifications = [];
            this.unreadCount = 0;
            if (window.showToast) window.showToast("Notifications vidées avec succès", "success");
            this.notify();
        } catch (e) {
            console.error("Failed to clear notifications", e);
            if (window.showToast) window.showToast("Erreur lors de la suppression des notifications", "error");
        } finally {
            this.isGlobalLoading = false;
            this.globalLoadingText = "";
            this.notify();
        }
    },

    async handleFavorite(serviceId, authorId, serviceTitle) {
        if (!auth.currentUser) return;
        if (auth.currentUser.uid === authorId) return; // don't notify self
        try {
            const userName = this.user?.nom || this.profileData?.displayName || "Un utilisateur";
            await this.createNotification(
                authorId,
                'favorite',
                'Nouveau favori !',
                `${userName} a ajouté votre service "${serviceTitle}" à ses favoris.`
            );
        } catch (error) {
            console.error("Error handling favorite:", error);
        }
    },

    async toggleServiceFavorite(btnElement, serviceId, authorId, serviceTitle) {
        if (!auth.currentUser) {
            if (window.showToast) window.showToast("Veuillez vous connecter pour ajouter un service en favoris.", "error");
            return;
        }
        if (auth.currentUser.uid === authorId) {
            if (window.showToast) window.showToast("Vous ne pouvez pas ajouter votre propre service en favoris.", "info");
            return;
        }

        const isAdding = !btnElement.classList.contains('text-red-500');
        if (isAdding) {
            btnElement.classList.remove('text-slate-400');
            btnElement.classList.add('text-red-500');
            btnElement.innerHTML = '<i data-lucide="heart" class="w-4 h-4 fill-current"></i>';
            if (window.lucide) window.lucide.createIcons({ root: btnElement });
            if (window.showToast) window.showToast("Service ajouté aux favoris !", "success");

            try {
                const userName = this.user?.nom || this.profileData?.displayName || "Un utilisateur";
                await this.createNotification(
                    authorId,
                    'favorite',
                    'Nouveau favori !',
                    `${userName} a ajouté votre service "${serviceTitle}" à ses favoris.`
                );
            } catch (error) {
                console.error("Error handling favorite notification:", error);
            }
        } else {
            btnElement.classList.remove('text-red-500');
            btnElement.classList.add('text-slate-400');
            btnElement.innerHTML = '<i data-lucide="heart" class="w-4 h-4"></i>';
            if (window.lucide) window.lucide.createIcons({ root: btnElement });
            if (window.showToast) window.showToast("Service retiré des favoris.", "info");
        }
    },

    // Real-time Service Operations
    async publishService(title, category, price, délai, img, desc = "") {
        if (!auth.currentUser) {
            throw new Error("Vous devez être connecté en tant que freelance ou entrepreneur pour publier un service.");
        }
        const id = "srv_" + Date.now().toString(36);
        const serviceDoc = {
            title,
            category,
            price,
            délai,
            desc: desc || "",
            auteur: AppState.user?.nom || auth.currentUser.email.split('@')[0],
            authorId: auth.currentUser.uid,
            rating: 5.0,
            img: img || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80",
            createdAt: new Date().toISOString()
        };
        try {
            console.log("Attempting to write service to Firestore:", doc(db, 'services', id));
            await setDoc(doc(db, 'services', id), serviceDoc);
            console.log("Published service to Firestore.");
            
            // Notify all users (do not fail the service creation if notifications fail)
            try {
                const usersSnap = await getDocs(collection(db, 'users'));
                const notifData = {
                    title: "Nouveau Service",
                    message: `Un nouveau service "${title}" vient d'être publié !`,
                    type: "servicePublished",
                    soundType: "servicePublished",
                    createdAt: new Date().toISOString()
                };
                
                for (const userDoc of usersSnap.docs) {
                    if (userDoc.id === auth.currentUser.uid) continue;
                    const notifId = "notif_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
                    try {
                        await setDoc(doc(db, 'notifications', notifId), {
                            ...notifData,
                            userId: userDoc.id,
                            read: false
                        });
                    } catch (innerErr) {
                        console.warn(`Failed to create notification for user ${userDoc.id}:`, innerErr);
                    }
                }
                console.log("Notifications processing finished for target users.");
            } catch (notifErr) {
                console.error("Error fetching users or processing notifications:", notifErr);
            }
        } catch (e) {
            console.error("Firestore critical error (service publication failed):", e);
            // ONLY fallback if the *service document* write failed
            const savedLocal = JSON.parse(localStorage.getItem('local_services') || "[]");
            savedLocal.unshift({ id, ...serviceDoc });
            localStorage.setItem('local_services', JSON.stringify(savedLocal));
            DUMMY_SERVICES.unshift({ id, ...serviceDoc });
            AppState.notify();
        }
    },

    async deleteService(id) {
        try {
            await deleteDoc(doc(db, 'services', id));
            console.log("Deleted service from Firestore.");
            const savedLocal = JSON.parse(localStorage.getItem('local_services') || "[]");
            const newLocal = savedLocal.filter(s => s.id !== id);
            localStorage.setItem('local_services', JSON.stringify(newLocal));
        } catch (e) {
            // Delete from local as fallback
            const savedLocal = JSON.parse(localStorage.getItem('local_services') || "[]");
            const newLocal = savedLocal.filter(s => s.id !== id);
            localStorage.setItem('local_services', JSON.stringify(newLocal));
            const idx = DUMMY_SERVICES.findIndex(s => s.id === id);
            if(idx > -1) DUMMY_SERVICES.splice(idx, 1);
            AppState.notify();
            console.warn('Fallback applied for delete.');
        }
    },

    async updateService(id, updates) {
        try {
            await updateDoc(doc(db, 'services', id), updates);
            console.log("Updated service in Firestore.");
            const savedLocal = JSON.parse(localStorage.getItem('local_services') || "[]");
            const idx = savedLocal.findIndex(s => s.id === id);
            if (idx > -1) {
                 savedLocal[idx] = { ...savedLocal[idx], ...updates };
                 localStorage.setItem('local_services', JSON.stringify(savedLocal));
            }
        } catch (e) {
            // Update local fallback
            const savedLocal = JSON.parse(localStorage.getItem('local_services') || "[]");
            const idx = savedLocal.findIndex(s => s.id === id);
            if(idx > -1) {
                savedLocal[idx] = { ...savedLocal[idx], ...updates };
                localStorage.setItem('local_services', JSON.stringify(savedLocal));
            }
            const sIdx = DUMMY_SERVICES.findIndex(s => s.id === id);
            if(sIdx > -1) {
                DUMMY_SERVICES[sIdx] = { ...DUMMY_SERVICES[sIdx], ...updates };
                AppState.notify();
            }
            console.warn('Fallback applied for update.');
        }
    },

    // Profile updates synced to Cloud Firestore
    async updateProfile(updates) {
        if (!auth.currentUser) return;

        // Apply local state updates first for instant feedback (optimistic update/fallback)
        if (updates.role && AppState.user) {
            AppState.user.role = updates.role;
            localStorage.setItem(`user_role_${auth.currentUser.uid}`, updates.role);
        }
        if (updates.displayName) AppState.profileData.displayName = updates.displayName;
        if (updates.avatarImage !== undefined) AppState.profileData.avatarImage = updates.avatarImage;
        if (updates.title) AppState.profileData.title = updates.title;
        if (updates.bio) AppState.profileData.bio = updates.bio;
        if (updates.location) AppState.profileData.location = updates.location;
        if (updates.tjm) AppState.profileData.tjm = updates.tjm;
        if (updates.skills) AppState.profileData.skills = updates.skills;
        if (updates.isAvailable !== undefined) AppState.profileData.isAvailable = updates.isAvailable;
        if (updates.coverImage) AppState.profileData.coverImage = updates.coverImage;
        if (updates.portfolio) AppState.profileData.portfolio = updates.portfolio;
        if (updates.serviceTemplates) AppState.profileData.serviceTemplates = updates.serviceTemplates;
        if (updates.recentImageUrls) AppState.profileData.recentImageUrls = updates.recentImageUrls;
        
        if (AppState.originalProfileData) {
            AppState.originalProfileData = JSON.parse(JSON.stringify(AppState.profileData));
        }

        AppState.notify();

        try {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, updates);
            console.log("Synced profile back to Firestore.");
        } catch (e) {
            console.warn("Could not sync profile to Firestore, falling back to local state.", e);
        }
    },

    // Security logs synced to Cloud Firestore
    async logSecurityEvent(event, status, ip = "109.11.45.18") {
        if (!auth.currentUser) return;
        const logId = "log_" + Date.now().toString(36);
        const logDoc = {
            userId: auth.currentUser.uid,
            date: "Aujourd'hui, " + new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
            event,
            status,
            ip,
            createdAt: new Date().toISOString()
        };
        try {
            await setDoc(doc(db, 'security_logs', logId), logDoc);
            console.log("Security log written to Firestore.");
        } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, 'security_logs');
        }
    }
};

// Seeding Default Database Items to prevent blank states

async function seedDefaultServices() {
    console.log("Seeding default services locally (read-only)...");
    DUMMY_SERVICES.length = 0;
    DUMMY_SERVICES.push(...DEFAULT_SERVICES);
    AppState.notify();
}

async function seedDefaultFreelances() {
    console.log("Seeding default freelancers locally (read-only)...");
    DUMMY_FREELANCES.length = 0;
    DUMMY_FREELANCES.push(...DEFAULT_FREELANCES);
    AppState.notify();
}

async function seedDefaultProjectsForUser(uid, role) {
    console.log("Seeding default projects for active user context:", uid);
    const defaults = [
        {
            id: "CMD-4091",
            title: "Développement Saas",
            freelance: role === 'freelance' ? (AppState.profileData?.displayName || "Mon Portfolio") : "Kamal Dev",
            freelanceId: role === 'freelance' ? uid : "f1",
            clientId: role === 'client' ? uid : "client_abc",
            serviceId: "1",
            status: "in-progress",
            date: "2026-06-05",
            lastUpdate: "Maquette_v2.pdf livrée",
            price: "1500€"
        },
        {
            id: "CMD-3820",
            title: "Identité Visuelle & Logo",
            freelance: role === 'freelance' ? (AppState.profileData?.displayName || "Mon Portfolio") : "Studio Marine",
            freelanceId: role === 'freelance' ? uid : "f2",
            clientId: role === 'client' ? uid : "client_abc",
            serviceId: "2",
            status: "validation",
            date: "2026-05-20",
            lastUpdate: "Fichiers sources vectoriels envoyés",
            price: "450€"
        }
    ];
    for (const p of defaults) {
        try {
            await setDoc(doc(db, 'projects', p.id), p);
        } catch (e) {
            console.error(e);
        }
    }
}

// Active connection listeners manager
let firestoreUnsubscribers = [];

function clearFirestoreListeners() {
    firestoreUnsubscribers.forEach(unsub => {
        try { unsub(); } catch (e) { console.error("Could not unsub:", e); }
    });
    firestoreUnsubscribers = [];
}

// Global hook: Sync authentication state reactively with Cloud Firestore
// Timeout de sécurité pour ne pas bloquer l'utilisateur si Firebase est lent
setTimeout(() => {
    if (!AppState.isAuthInitialized) {
        console.warn("Auth initialization timed out, clearing overlay for safety.");
        AppState.isAuthInitialized = true;
        AppState.notify();
    }
}, 3000);

onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        console.log("Authenticated User verified with Firebase Auth:", firebaseUser.uid);
        
        // --- STEP 1: FAST LOCAL ESTIMATION ---
        // Instantly populate user profile state from local cache or default templates in under 1ms
        const savedRole = localStorage.getItem(`user_role_${firebaseUser.uid}`) || sessionStorage.getItem('register_selected_role') || 'client';
        const displayName = sessionStorage.getItem('register_selected_name') || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Utilisateur";
        
        AppState.user = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            nom: displayName,
            email: firebaseUser.email,
            role: savedRole
        };

        const cachedProfileStr = localStorage.getItem(`my_profile_cache_${firebaseUser.uid}`);
        let cachedProfile = null;
        try {
            if (cachedProfileStr) cachedProfile = JSON.parse(cachedProfileStr);
        } catch (e) {
            console.warn("Could not parse cached profile", e);
        }

        const defaultProfile = {
            id: firebaseUser.uid,
            isAvailable: true,
            coverImage: null,
            displayName: displayName,
            title: savedRole === 'freelance' ? "Développeur Freelance" : "Entrepreneur",
            location: "Paris, FR",
            tjm: 400,
            bio: "Membre de la communauté SkillLink.",
            skills: [],
            stats: [
                { label: "Projets réussis", value: "34", icon: "check-circle", color: "emerald" },
                { label: "Taux de réponse", value: "100%", icon: "message-circle", color: "blue" },
                { label: "Délai de réponse", value: "< 1h", icon: "clock", color: "amber" }
            ],
            reviews: [],
            portfolio: [],
            serviceTemplates: [],
            recentImageUrls: []
        };

        AppState.profileData = cachedProfile ? { ...defaultProfile, ...cachedProfile } : defaultProfile;
        AppState.profileData.skills = AppState.profileData.skills || [];
        AppState.profileData.stats = AppState.profileData.stats || defaultProfile.stats;
        AppState.profileData.reviews = AppState.profileData.reviews || [];
        AppState.profileData.portfolio = AppState.profileData.portfolio || [];
        
        AppState.originalProfileData = JSON.parse(JSON.stringify(AppState.profileData));

        // --- STEP 1.5: HYDRATE FROM LOCALSTORAGE CACHE INSTANTLY ---
        try {
            const cachedServices = JSON.parse(localStorage.getItem(`cached_services_${firebaseUser.uid}`) || '[]');
            const filteredServices = cachedServices.filter(s => s && s.id && !s.id.startsWith('service_default_') && s.authorId !== 'f1' && s.authorId !== 'f2');
            if (filteredServices.length > 0) {
                DUMMY_SERVICES.length = 0;
                DUMMY_SERVICES.push(...filteredServices);
            } else {
                DUMMY_SERVICES.length = 0;
                DUMMY_SERVICES.push(...DEFAULT_SERVICES);
            }
            const cachedFreelancers = JSON.parse(localStorage.getItem(`cached_freelancers_${firebaseUser.uid}`) || '[]');
            const filteredFreelancers = cachedFreelancers.filter(f => f && f.id !== 'f1' && f.id !== 'f2' && f.uid !== 'f1' && f.uid !== 'f2');
            if (filteredFreelancers.length > 0) {
                DUMMY_FREELANCES.length = 0;
                DUMMY_FREELANCES.push(...filteredFreelancers);
            } else {
                DUMMY_FREELANCES.length = 0;
                DUMMY_FREELANCES.push(...DEFAULT_FREELANCES);
            }
            const cachedProjects = JSON.parse(localStorage.getItem(`cached_projects_${firebaseUser.uid}`) || '[]');
            if (cachedProjects.length > 0) {
                DUMMY_PROJECTS.length = 0;
                DUMMY_PROJECTS.push(...cachedProjects);
            }
            const cachedNotifs = JSON.parse(localStorage.getItem(`cached_notifs_${firebaseUser.uid}`) || '[]');
            if (cachedNotifs.length > 0) {
                AppState.notifications = cachedNotifs;
                AppState.unreadCount = cachedNotifs.filter(n => !n.read).length;
            }

            // Restore last viewed profile data from local fast cache if we are loading on 'profile' hash
            let lastViewedId = firebaseUser.uid;
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('profile')) {
                lastViewedId = urlParams.get('profile');
            } else {
                // If there's a stored id from a recent click without page load, use it ONLY if we aren't reloading
                // Wait, if it's a fresh load (initAuth), and no profile in URL, we MUST show their OWN profile
                lastViewedId = firebaseUser.uid;
            }

            const isCurrentlyOnProfile = window.location.hash === '#profile' || window.location.hash.startsWith('#profile');
            if (isCurrentlyOnProfile && lastViewedId && lastViewedId !== firebaseUser.uid) {
                const f = DUMMY_FREELANCES.find(item => item.id === lastViewedId || item.uid === lastViewedId);
                if (f) {
                    AppState.profileData = mapFreelanceToProfileData(f);
                }
            } else {
                sessionStorage.removeItem('last_viewed_profile_id');
                localStorage.removeItem('last_viewed_profile_id');
            }
        } catch (cacheErr) {
            console.warn("Could not load local storage cache:", cacheErr);
        }

        // --- STEP 2: DECLARE INITIALIZATION COMPLETE ---
        // Instantly unlock the login page and show the home view. The active Firestore listeners will hydrate remaining data in the background
        AppState.isAuthInitialized = true;
        AppState.notify();

        // Clear existing Firestore listeners and re-register
        clearFirestoreListeners();

        // 1. Services Live Snapshot
        try {
            const servicesQuery = query(collection(db, 'services'));
            const unsubServices = onSnapshot(servicesQuery, (snapshot) => {
                const updatedServices = [];
                snapshot.forEach(doc => {
                    updatedServices.push({ id: doc.id, ...doc.data() });
                });
                
                const savedLocal = JSON.parse(localStorage.getItem('local_services') || "[]");
                // Remove local entries that appear in server (reconnected)
                const missingLocal = savedLocal.filter(s => !updatedServices.some(u => u.id === s.id));
                
                // Merge loaded/local services, then merge DEFAULT_SERVICES that aren't already represented
                const combinedServices = [...missingLocal, ...updatedServices];
                DEFAULT_SERVICES.forEach(defS => {
                    if (!combinedServices.some(s => s.id === defS.id)) {
                        combinedServices.push(defS);
                    }
                });

                DUMMY_SERVICES.length = 0;
                DUMMY_SERVICES.push(...combinedServices);
                console.log("Services synced successfully:", DUMMY_SERVICES.length);
                safeSetLocalStorage(`cached_services_${firebaseUser.uid}`, DUMMY_SERVICES);
                AppState.notify();
            }, (err) => {
                handleFirestoreError(err, OperationType.GET, 'services');
            });
            firestoreUnsubscribers.push(unsubServices);
        } catch (e) {
            console.error(e);
        }

        // 2. Freelancers (Users collection)
        try {
            const freelancesQuery = query(collection(db, 'users'), where('role', '==', 'freelance'));
            const unsubFreelances = onSnapshot(freelancesQuery, (snapshot) => {
                const updatedFreelances = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    updatedFreelances.push({
                        id: doc.id,
                        uid: doc.id,
                        name: data.displayName || data.email?.split('@')[0],
                        title: data.title || "Développeur Freelance",
                        location: data.location || "Paris, FR",
                        tjm: data.tjm || 400,
                        rating: data.rating || 5.0,
                        reviewsCount: data.reviewsCount || 0,
                        img: data.avatarImage || data.img || null,
                        isAvailable: data.isAvailable !== false,
                        responseTime: data.responseTime || "< 1h",
                        skills: data.skills || [],
                        bio: data.bio || "Aucune description de profil n'a été rédigée pour le moment.",
                        portfolio: data.portfolio || []
                    });
                });
                
                // Merge live freelancers, then add DEFAULT_FREELANCES that aren't already represented by id or uid
                const combinedFreelance = [...updatedFreelances];
                DEFAULT_FREELANCES.forEach(defF => {
                    if (!combinedFreelance.some(f => f.id === defF.id || f.uid === defF.uid)) {
                        combinedFreelance.push(defF);
                    }
                });

                DUMMY_FREELANCES.length = 0;
                DUMMY_FREELANCES.push(...combinedFreelance);
                console.log("Freelancers synced successfully:", DUMMY_FREELANCES.length);
                safeSetLocalStorage(`cached_freelancers_${firebaseUser.uid}`, DUMMY_FREELANCES);

                // Restore last viewed profile data from live sync if on 'profile' hash
                let lastViewedId = firebaseUser.uid;
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('profile')) {
                    lastViewedId = urlParams.get('profile');
                } else if (sessionStorage.getItem('last_viewed_profile_id')) {
                    // if it's currently stored this means we navigated in the SPA WITHOUT reloading!
                    lastViewedId = sessionStorage.getItem('last_viewed_profile_id');
                }

                const isCurrentlyOnProfile = window.location.hash === '#profile' || window.location.hash.startsWith('#profile');
                if (isCurrentlyOnProfile && lastViewedId && lastViewedId !== firebaseUser.uid) {
                    const f = DUMMY_FREELANCES.find(item => item.id === lastViewedId || item.uid === lastViewedId);
                    if (f) {
                        AppState.profileData = mapFreelanceToProfileData(f);
                    }
                }

                AppState.notify();
            }, (err) => {
                handleFirestoreError(err, OperationType.GET, 'users');
            });
            firestoreUnsubscribers.push(unsubFreelances);
        } catch (e) {
            console.error(e);
        }

        // 3. Projects Live Snapshot
        try {
            const projectsQuery = query(
                collection(db, 'projects'),
                or(
                    where('clientId', '==', firebaseUser.uid),
                    where('freelanceId', '==', firebaseUser.uid)
                )
            );
            const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
                const loadedProjects = [];
                snapshot.forEach(doc => {
                    loadedProjects.push({ id: doc.id, ...doc.data() });
                });
                
                DUMMY_PROJECTS.length = 0;
                DUMMY_PROJECTS.push(...loadedProjects);
                safeSetLocalStorage(`cached_projects_${firebaseUser.uid}`, DUMMY_PROJECTS);
                AppState.notify();
            }, (err) => {
                handleFirestoreError(err, OperationType.GET, 'projects');
            });
            firestoreUnsubscribers.push(unsubProjects);
        } catch (e) {
            console.error(e);
        }

        // 4. Security Logs Live Snapshot
        try {
            const securityLogsQuery = query(collection(db, 'security_logs'), where('userId', '==', firebaseUser.uid));
            const unsubLogs = onSnapshot(securityLogsQuery, (snapshot) => {
                const logs = [];
                snapshot.forEach(doc => {
                    logs.push({ id: doc.id, ...doc.data() });
                });
                logs.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                
                AppState.securityLogs = logs.length > 0 ? logs : [
                    { date: "Aujourd'hui, " + new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}), event: "Vérification des règles de sécurité", status: "Sécurisé", ip: "109.11.45.18" },
                    { date: "Hier, 18:34", event: "Connexion réussie", status: "Autorisé", ip: "109.11.45.18" }
                ];
                AppState.notify();
            }, (err) => {
                handleFirestoreError(err, OperationType.GET, 'security_logs');
            });
            firestoreUnsubscribers.push(unsubLogs);
        } catch (e) {
            console.error(e);
        }

        // 5. Notifications Live Snapshot
        try {
            let _isNotifsInitialized = false;
            const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', firebaseUser.uid));
            const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
                const notifs = [];
                let unreadCnt = 0;
                let hasNewAdded = false;
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    notifs.push({ id: doc.id, ...data });
                    if (!data.read) {
                        unreadCnt++;
                    }
                });
                
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' && !change.doc.data().read) {
                        hasNewAdded = true;
                    }
                });

                if (_isNotifsInitialized && hasNewAdded) {
                    const newNotifs = snapshot.docChanges()
                        .filter(change => change.type === 'added' && !change.doc.data().read)
                        .map(change => change.doc.data());
                    
                    if (newNotifs.some(n => n.soundType === 'servicePublished')) {
                        AppState.playNotificationSound('servicePublished');
                    } else {
                        AppState.playNotificationSound('default');
                    }
                }
                _isNotifsInitialized = true;

                notifs.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                
                AppState.notifications = notifs;
                AppState.unreadCount = unreadCnt;
                safeSetLocalStorage(`cached_notifs_${firebaseUser.uid}`, notifs);
                AppState.notify();
            }, (err) => {
                if (err.message && err.message.includes('permissions')) {
                    console.warn("Notifications collection permissions denied. Please update your firestore.rules manually.");
                } else {
                    handleFirestoreError(err, OperationType.GET, 'notifications');
                }
            });
            firestoreUnsubscribers.push(unsubNotifications);
        } catch (e) {
            console.error(e);
        }

        // Secondary Single User Profile real-time updater
        try {
            const unsubUserSelf = onSnapshot(doc(db, 'users', firebaseUser.uid), async (snapshot) => {
                if (snapshot.exists()) {
                    const selfD = snapshot.data();
                    const savedRole = localStorage.getItem(`user_role_${firebaseUser.uid}`);
                    const roleToUse = savedRole || selfD.role;
                    if (roleToUse && AppState.user && AppState.user.role !== roleToUse) {
                        AppState.user.role = roleToUse;
                    }
                    
                    // Maintain originalProfileData to capture the owner's details
                    if (!AppState.originalProfileData) {
                        AppState.originalProfileData = {};
                    }
                    AppState.originalProfileData.id = firebaseUser.uid;
                    AppState.originalProfileData.displayName = selfD.displayName || AppState.originalProfileData.displayName || selfD.displayName || "";
                    AppState.originalProfileData.title = selfD.title || AppState.originalProfileData.title || "";
                    AppState.originalProfileData.bio = selfD.bio || AppState.originalProfileData.bio || "";
                    AppState.originalProfileData.location = selfD.location || AppState.originalProfileData.location || "Paris, FR";
                    AppState.originalProfileData.tjm = selfD.tjm || AppState.originalProfileData.tjm || 400;
                    AppState.originalProfileData.skills = selfD.skills || AppState.originalProfileData.skills || [];
                    AppState.originalProfileData.stats = selfD.stats || AppState.originalProfileData.stats || [
                        { label: "Projets réussis", value: "34", icon: "check-circle", color: "emerald" },
                        { label: "Taux de réponse", value: "100%", icon: "message-circle", color: "blue" },
                        { label: "Délai de réponse", value: "< 1h", icon: "clock", color: "amber" }
                    ];
                    AppState.originalProfileData.reviews = selfD.reviews || AppState.originalProfileData.reviews || [];
                    AppState.originalProfileData.avatarImage = selfD.avatarImage || AppState.originalProfileData.avatarImage || null;
                    AppState.originalProfileData.coverImage = selfD.coverImage || AppState.originalProfileData.coverImage || null;
                    AppState.originalProfileData.isAvailable = selfD.isAvailable !== false;
                    AppState.originalProfileData.portfolio = selfD.portfolio || AppState.originalProfileData.portfolio || [];
                    
                    safeSetLocalStorage(`my_profile_cache_${firebaseUser.uid}`, AppState.originalProfileData);

                    // Track whether the current view is the user's OWN profile
                    let lastViewedId = firebaseUser.uid;
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.get('profile')) {
                        lastViewedId = urlParams.get('profile');
                    } else if (sessionStorage.getItem('last_viewed_profile_id')) {
                        lastViewedId = sessionStorage.getItem('last_viewed_profile_id');
                    }
                    const isViewingOwn = lastViewedId === firebaseUser.uid;

                    if (isViewingOwn) {
                        AppState.profileData.id = firebaseUser.uid;
                        AppState.profileData.displayName = selfD.displayName || AppState.profileData.displayName;
                        AppState.profileData.title = selfD.title || AppState.profileData.title;
                        AppState.profileData.bio = selfD.bio || AppState.profileData.bio;
                        AppState.profileData.location = selfD.location || AppState.profileData.location;
                        AppState.profileData.tjm = selfD.tjm || AppState.profileData.tjm;
                        AppState.profileData.skills = selfD.skills || AppState.profileData.skills;
                        AppState.profileData.stats = selfD.stats || AppState.originalProfileData.stats || AppState.profileData.stats;
                        AppState.profileData.reviews = selfD.reviews || AppState.originalProfileData.reviews || AppState.profileData.reviews;
                        AppState.profileData.avatarImage = selfD.avatarImage || AppState.profileData.avatarImage;
                        AppState.profileData.coverImage = selfD.coverImage || AppState.profileData.coverImage;
                        AppState.profileData.isAvailable = selfD.isAvailable !== false;
                        AppState.profileData.portfolio = selfD.portfolio || [];
                    }
                    
                    // Instant update for the freelance list if it contains the user
                    const freelanceIndex = DUMMY_FREELANCES.findIndex(f => f.uid === firebaseUser.uid);
                    if (freelanceIndex !== -1) {
                        DUMMY_FREELANCES[freelanceIndex] = {
                            ...DUMMY_FREELANCES[freelanceIndex],
                            name: selfD.displayName || DUMMY_FREELANCES[freelanceIndex].name,
                            title: selfD.title || DUMMY_FREELANCES[freelanceIndex].title,
                            bio: selfD.bio || DUMMY_FREELANCES[freelanceIndex].bio,
                            skills: selfD.skills || DUMMY_FREELANCES[freelanceIndex].skills,
                            img: selfD.avatarImage || DUMMY_FREELANCES[freelanceIndex].img
                        };
                    }
                    // Instant update for the service list if the user is an author
                    DUMMY_SERVICES.forEach(service => {
                        if (service.authorId === firebaseUser.uid) {
                            service.auteur = selfD.displayName || service.auteur;
                        }
                    });
                    
                    AppState.notify();
                } else {
                    // Profile does not exist yet! Let's build it asynchronously without blocking!
                    const fallbackRole = sessionStorage.getItem('register_selected_role') || 'client';
                    const fallbackName = sessionStorage.getItem('register_selected_name') || firebaseUser.displayName || firebaseUser.email.split('@')[0];
                    const userProfile = {
                        uid: firebaseUser.uid,
                        displayName: fallbackName,
                        email: firebaseUser.email,
                        role: fallbackRole,
                        isAvailable: true,
                        title: fallbackRole === 'freelance' ? "Développeur Freelance" : "",
                        location: "Paris, FR",
                        tjm: 400,
                        bio: "Nouveau membre de la communauté SkillLink.",
                        skills: [],
                        createdAt: new Date().toISOString()
                    };
                    try {
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        await setDoc(userDocRef, userProfile);
                        console.log("Profile created asynchronously in Firestore.");
                    } catch (err) {
                        console.error("Error creating user profile asynchronously:", err);
                    }
                }
            });
            firestoreUnsubscribers.push(unsubUserSelf);
        } catch (em) {
            console.error(em);
        }

        AppState.notify();
    } else {
        console.log("No authenticated user active.");
        AppState.user = null;
        if (typeof window !== 'undefined' && window.activeMessagingTeardown) {
            window.activeMessagingTeardown();
            window.activeMessagingTeardown = null;
        }
        clearFirestoreListeners();
        
        // --- SPEED UP FOR GUEST ACCESS ---
        // Keep active pre-filled arrays when unauthenticated so guests can interact instantly!
        const origFreelances = [
            {
                id: "f1",
                uid: "f1",
                name: "Kamal Dev",
                displayName: "Kamal Dev",
                email: "kamal@example.com",
                role: "freelance",
                isAvailable: true,
                title: "Développeur Full-Stack & Architecte Cloud",
                location: "Paris, FR",
                tjm: 450,
                rating: 4.9,
                reviewsCount: 10,
                img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80",
                responseTime: "< 1h",
                skills: ["React", "Python", "Node.js", "AWS"],
                bio: "Expert certifié AWS. Je conçois des architectures robustes et je développe des applications performantes.",
                portfolio: [
                    {
                        id: "p_f1_1",
                        title: "E-commerce Mode",
                        category: "Développement Web",
                        imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=300&h=200&q=80",
                        description: "Conception complète d'une plateforme de vente en ligne.",
                        skills: ["React", "Node.js"]
                    }
                ],
                reviews: [
                    {
                        id: "r1",
                        author: "Sarah Laroche",
                        rating: 5,
                        text: "Un travail remarquable sur notre plateforme SaaS de logistique ! Kamal a su concevoir une architecture extrêmement résiliente sous Node/React et AWS. Son professionnalisme et ses rapports réguliers ont fait toute la différence. Je recommande vivement pour vos projets techniques complexes.",
                        videoUrl: "https://www.youtube.com/watch?v=aqz-KE-BPKQ",
                        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
                    }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: "f2",
                uid: "f2",
                name: "Studio Marine",
                displayName: "Studio Marine",
                email: "marine@example.com",
                role: "freelance",
                isAvailable: true,
                title: "Directrice Artistique & UI/UX Designer",
                location: "Lyon, FR",
                tjm: 380,
                rating: 4.8,
                reviewsCount: 5,
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
                responseTime: "< 2h",
                skills: ["Figma", "Branding", "UI/UX", "Illustration"],
                bio: "Je donne vie à vos idées avec des designs modernes, épurés et centrés sur l'expérience utilisateur.",
                portfolio: [
                    {
                        id: "p_f2_1",
                        title: "Branding Studio",
                        category: "UI/UX & Design",
                        imageUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=300&h=200&q=80",
                        description: "Refonte de l'identité visuelle pour un studio créatif.",
                        skills: ["Figma", "Branding"]
                    }
                ],
                reviews: [
                    {
                        id: "r2",
                        author: "Maxime Dubois",
                        rating: 5,
                        text: "Marine a transformé notre identité visuelle d'une manière absolument incroyable. Ses compétences UI/UX sur Figma ont permis de refondre intégralement notre tunnel d'achat et d'augmenter le taux de conversion de près de 24%. Créativité exceptionnelle et respect absolu des délais !",
                        videoUrl: "https://www.youtube.com/watch?v=EngW7tLk6R8",
                        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
                    },
                    {
                        id: "r3",
                        author: "Éléonore Bailly",
                        rating: 5,
                        text: "L'accompagnement de Marine a été impeccable du conseil stratégique initial jusqu'à la livraison finale des maquettes interactives. Elle a cerné notre besoin immédiatement et a livré une charte graphique extrêmement élégante, épurée et moderne.",
                        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-women-working-on-a-creative-project-41718-large.mp4",
                        createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
                    }
                ],
                createdAt: new Date().toISOString()
            }
        ];
        DUMMY_FREELANCES.length = 0;
        DUMMY_FREELANCES.push(...origFreelances);

        const originalServices = [
            { id: "service_default_1", title: "Développement Site Sur-Mesure", category: "Code", price: "À partir de 1500€", délai: "3 semaines", auteur: "Kamal Dev", rating: 4.9, img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80", authorId: "f1", createdAt: new Date().toISOString() },
            { id: "service_default_2", title: "Identité Visuelle & Logo", category: "Design", price: "À partir de 450€", délai: "1 semaine", auteur: "Studio Marine", rating: 4.8, img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=300&q=80", authorId: "f2", createdAt: new Date().toISOString() },
            { id: "service_default_3", title: "Stratégie SEO & Référencement", category: "Marketing", price: "À partir de 800€", délai: "1 mois", auteur: "Digitale Boost", rating: 5.0, img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=300&q=80", authorId: "f1", createdAt: new Date().toISOString() },
            { id: "service_default_4", title: "Application Mobile React Native", category: "Code", price: "À partir de 3000€", délai: "1.5 mois", auteur: "Julien Tech", rating: 4.7, img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80", authorId: "f1", createdAt: new Date().toISOString() }
        ];
        DUMMY_SERVICES.length = 0;
        DUMMY_SERVICES.push(...originalServices);

        DUMMY_PROJECTS.length = 0;
        
        AppState.notify();
    }

    sessionStorage.removeItem('register_selected_role');
    sessionStorage.removeItem('register_selected_name');

    AppState.isAuthInitialized = true;
    AppState.notify();
});

if (typeof window !== 'undefined') {
    window.AppState = AppState;
}
