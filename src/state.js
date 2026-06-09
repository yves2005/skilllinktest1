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
        return "⚠️ L'inscription/connexion avec E-mail et Mot de passe n'est pas activée dans votre Console Firebase.\n\n" +
               "Pour l'activer :\n" +
               "1. Rendez-vous sur https://console.firebase.google.com/\n" +
               "2. Sélectionnez le projet 'skilllinkweb'\n" +
               "3. Allez dans 'Authentification' -> onglet 'Sign-in method'\n" +
               "4. Activez le fournisseur 'E-mail/Mot de passe' (Adresse e-mail) et enregistrez.\n\n" +
               "En attendant, vous pouvez utiliser le bouton 'Continuer avec Google' qui fonctionne immédiatement.";
    }
    if (code === 'auth/popup-blocked') {
        return "⚠️ La fenêtre de connexion Google a été bloquée par votre navigateur.\n\n" +
               "Veuillez autoriser les fenêtres pop-up (popups) de votre navigateur pour ce site, ou ouvrez votre application dans un nouvel onglet indépendant de l'iFrame (recommandé).";
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        return "❌ Identifiants incorrects. Veuillez vérifier l'adresse e-mail ou le mot de passe saisi.";
    }
    if (code === 'auth/email-already-in-use') {
        return "❌ Cette adresse e-mail est déjà associée à un compte existant.";
    }
    if (code === 'auth/weak-password') {
        return "❌ Mot de passe trop faible. Il doit contenir au moins 6 caractères.";
    }
    if (code === 'auth/invalid-email') {
        return "❌ Adresse e-mail invalide. Veuillez vérifier le format.";
    }
    return error.message || String(error);
}

// Global exportable arrays with reactivity
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
    const originalServices = [
        { id: "service_default_1", title: "Développement Site Sur-Mesure", category: "Code", price: "À partir de 1500€", délai: "3 semaines", auteur: "Kamal Dev", rating: 4.9, img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80", authorId: "f1", createdAt: new Date().toISOString() },
        { id: "service_default_2", title: "Identité Visuelle & Logo", category: "Design", price: "À partir de 450€", délai: "1 semaine", auteur: "Studio Marine", rating: 4.8, img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=300&q=80", authorId: "f2", createdAt: new Date().toISOString() },
        { id: "service_default_3", title: "Stratégie SEO & Référencement", category: "Marketing", price: "À partir de 800€", délai: "1 mois", auteur: "Digitale Boost", rating: 5.0, img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=300&q=80", authorId: "f1", createdAt: new Date().toISOString() },
        { id: "service_default_4", title: "Application Mobile React Native", category: "Code", price: "À partir de 3000€", délai: "1.5 mois", auteur: "Julien Tech", rating: 4.7, img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80", authorId: "f1", createdAt: new Date().toISOString() }
    ];
    DUMMY_SERVICES.length = 0;
    DUMMY_SERVICES.push(...originalServices);
    AppState.notify();
}

async function seedDefaultFreelances() {
    console.log("Seeding default freelancers locally (read-only)...");
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
            isAvailable: true,
            responseTime: "< 1h",
            skills: ["React", "Python", "Node.js", "AWS"],
            bio: "Expert certifié AWS. Je conçois des architectures robustes et je développe des applications performantes.",
            portfolio: [
                "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=100&h=100&q=80"
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
            isAvailable: true,
            responseTime: "< 2h",
            skills: ["Figma", "Branding", "UI/UX", "Illustration"],
            bio: "Je donne vie à vos idées avec des designs modernes, épurés et centrés sur l'expérience utilisateur.",
            portfolio: [
                "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=100&h=100&q=80"
            ],
            createdAt: new Date().toISOString()
        }
    ];
    DUMMY_FREELANCES.length = 0;
    DUMMY_FREELANCES.push(...origFreelances);
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
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        console.log("Authenticated User verified with Firebase Auth:", firebaseUser.uid);
        
        // Ensure user profile document exists in `/users/{uid}`
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userProfile = null;
        try {
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                userProfile = userSnap.data();
            } else {
                // Determine user's selected role or default to 'client'
                const fallbackRole = sessionStorage.getItem('register_selected_role') || 'client';
                const fallbackName = sessionStorage.getItem('register_selected_name') || firebaseUser.displayName || firebaseUser.email.split('@')[0];
                
                userProfile = {
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
                
                await setDoc(userDocRef, userProfile);
                console.log("Profile created in Firestore users collection.");
            }
        } catch (error) {
            console.error("Error creating/retrieving user profile:", error);
        }
        
        // Clean session variables
        sessionStorage.removeItem('register_selected_role');
        sessionStorage.removeItem('register_selected_name');

        const activeProfile = userProfile || {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            role: 'client'
        };

        const savedRole = localStorage.getItem(`user_role_${firebaseUser.uid}`);
        const finalRole = savedRole || activeProfile.role;

        AppState.user = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            nom: activeProfile.displayName || (activeProfile.email && activeProfile.email.split('@')[0]) || "Utilisateur",
            email: activeProfile.email || firebaseUser.email,
            role: finalRole
        };

        // Sync local profile data
        AppState.profileData = {
            id: firebaseUser.uid,
            isAvailable: activeProfile.isAvailable ?? true,
            coverImage: activeProfile.coverImage || null,
            displayName: activeProfile.displayName || AppState.user.nom,
            title: activeProfile.title || "Développeur Freelance",
            location: activeProfile.location || "Paris, FR",
            tjm: activeProfile.tjm || 400,
            bio: activeProfile.bio || "",
            skills: activeProfile.skills || [],
            stats: activeProfile.stats || [
                { label: "Projets réussis", value: "34", icon: "check-circle", color: "emerald" },
                { label: "Taux de réponse", value: "100%", icon: "message-circle", color: "blue" },
                { label: "Délai de réponse", value: "< 1h", icon: "clock", color: "amber" }
            ],
            reviews: activeProfile.reviews || [],
            serviceTemplates: activeProfile.serviceTemplates || [],
            recentImageUrls: activeProfile.recentImageUrls || []
        };

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
                
                DUMMY_SERVICES.length = 0;
                DUMMY_SERVICES.push(...missingLocal, ...updatedServices);
                console.log("Services synced successfully:", DUMMY_SERVICES.length);
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
            DUMMY_FREELANCES.length = 0;
            DUMMY_FREELANCES.push(...updatedFreelances);
            console.log("Freelancers synced successfully:", DUMMY_FREELANCES.length);
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
            const unsubUserSelf = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
                if (snapshot.exists()) {
                    const selfD = snapshot.data();
                    const savedRole = localStorage.getItem(`user_role_${firebaseUser.uid}`);
                    const roleToUse = savedRole || selfD.role;
                    if (roleToUse && AppState.user && AppState.user.role !== roleToUse) {
                        AppState.user.role = roleToUse;
                    }
                    AppState.profileData.displayName = selfD.displayName || AppState.profileData.displayName;
                    AppState.profileData.title = selfD.title || AppState.profileData.title;
                    AppState.profileData.bio = selfD.bio || AppState.profileData.bio;
                    AppState.profileData.location = selfD.location || AppState.profileData.location;
                    AppState.profileData.tjm = selfD.tjm || AppState.profileData.tjm;
                    AppState.profileData.skills = selfD.skills || AppState.profileData.skills;
                    AppState.profileData.avatarImage = selfD.avatarImage || AppState.profileData.avatarImage;
                    AppState.profileData.isAvailable = selfD.isAvailable !== false;
                    
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
        
        // Return standard offline previews
        DUMMY_FREELANCES.length = 0;
        DUMMY_SERVICES.length = 0;
        DUMMY_PROJECTS.length = 0;
        
        AppState.notify();
    }
});

if (typeof window !== 'undefined') {
    window.AppState = AppState;
}
