import React, { useEffect, useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { AppState } from '../state.js';
import { 
    Layers, HelpCircle, Sun, Moon, PlusCircle, Search, 
    MessageSquare, LayoutDashboard, KanbanSquare, Sparkles, 
    Settings, User, LogOut, Bell, BookOpen, Trash2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { patchOklchForHtml2pdf, prepareElementForPdfExport } from '../utils/pdfHelper.js';

if (typeof window !== 'undefined') {
    window.html2pdf = html2pdf;
}

export const Navbar = () => {
    const { lang, setLang, t } = useI18n();
    const [updater, setUpdater] = useState(0);
    const [isDark, setIsDark] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [confirmClearNotifsNav, setConfirmClearNotifsNav] = useState(false);

    useEffect(() => {
        window.openManualMenu = openManualMenu;
        
        const handleStateChange = () => setUpdater(prev => prev + 1);
        const unsubscribe = AppState.subscribe(handleStateChange);
        
        setIsDark(document.documentElement.classList.contains('dark'));

        if (AppState.user && !AppState.tourSeen) {
            setTimeout(startTour, 1000);
        }

        return () => {
            delete window.openManualMenu;
            if (unsubscribe) unsubscribe();
        };
    }, [lang]);

    useEffect(() => {
        if (!isDropdownOpen) {
            document.body.classList.remove('nav-dropdown-open');
            return;
        }
        
        document.body.classList.add('nav-dropdown-open');
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.user-menu-dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
            document.body.classList.remove('nav-dropdown-open');
        };
    }, [isDropdownOpen]);

    const handleThemeToggle = () => {
        document.documentElement.classList.toggle('dark');
        const dark = document.documentElement.classList.contains('dark');
        setIsDark(dark);
    };

    const handleRoute = (route) => {
        if (AppState) AppState.navigate(route);
    };

    const openManualMenu = () => {
        const features = [
            {
                title: "1. Accueil & Annuaire",
                intro: "La page d'accueil sert de répertoire central haut de gamme pour découvrir les talents et les services proposés sur la communauté SkillLink.",
                bullets: [
                    { label: "Recherche par mots-clés", text: "Une barre de recherche puissante vous permet de trouver instantanément des prestataires par nom, compétence, tags de code ou mot-clé." },
                    { label: "Filtres par catégories", text: "Filtrez et segmentez l'affichage des experts par rôle et spécialisation (Développeur, Designer, Marketing, etc.)." },
                    { label: "Grilles de profils", text: "Visualisez les propositions d'experts incluant leur avatar de confiance, projet complétés, et note de satisfaction globale." },
                    { label: "Action directe", text: "Depuis n'importe quelle fiche, engagez directement un échange de message privé, visitez son profil complet ou proposez un contrat." }
                ]
            },
            {
                title: "2. Publication d'Offres",
                intro: "Ce module permet aux freelances de de définir des services élégants et d'en contrôler l'ensemble de la présentation.",
                bullets: [
                    { label: "Formulaire structuré", text: "Renseignez le titre, la catégorie métier, le tarif de base, les délais estimatifs et une fiche descriptive détaillée." },
                    { label: "Import d'images flexible", text: "Bénéficiez du choix d'import image par téléchargement de fichier local ou lien URL externe. La validité est vérifiée en direct." },
                    { label: "Génération IA", text: "L'assistant IA peut désormais générer automatiquement une description professionnelle de 100 mots à partir de votre simple titre service." },
                    { label: "Mémorisation intelligente", text: "Ne ressaisissez plus vos liens : l'application mémorise vos 3 dernières URLs d'images insérées pour plus de rapidité." },
                    { label: "Prévisualisation en direct", text: "Basculez instantanément pour admirer le résultat exact sur la carte finale ainsi que sur la page de détail avant mise en ligne." },
                    { label: "Gestionnaire d'offres", text: "Une vue dédiée regroupe l'ensemble d'offres créées, vous permettant de suivre les retours et les conversions." }
                ]
            },
            {
                title: "3. Messagerie Directe",
                intro: "Restez au contact des clients et simplifiez vos discussions à l'aide d'un espace de discussion instantané.",
                bullets: [
                    { label: "Liste des contacts", text: "Retrouvez à gauche l'historique complet de vos conversations avec des notifications de messages non-lus." },
                    { label: "Bulles de chat fluides", text: "Discutez à l'aide de bulles de messages claires, découpées harmonieusement selon l'émetteur et le récepteur." },
                    { label: "Notifications Temps Réel", text: "Un signal sonore discret et une alerte vous préviennent instantanément de l'arrivée d'un nouveau message, même hors messagerie." },
                    { label: "Fichiers et Accents", text: "Intégrez des documents, fichiers de consignes, images ou captures d'écran directement dans le fil d'échange." }
                ]
            },
            {
                title: "4. Assistant IA (SkillBot)",
                intro: "Un agent propulsé par l'IA à vos côtés pour rédiger, traduire ou planifier sans effort.",
                bullets: [
                    { label: "Optimisation de fiches", text: "Demandez à l'IA d'ajuster le contenu promotionnel ou le texte de votre fiche de service pour maximiser l'intérêt." },
                    { label: "Aide au code & Prototypage", text: "Obtenez des conseils d'architecture logicielle, résolvez des bugs ou demandez des scripts d'exemple de haute facture." },
                    { label: "Modèles QuickStart", text: "Utilisez des suggestions rapides pour optimiser votre profil, améliorer un service ou générer des idées de marketing d'un clic." },
                    { label: "Génération de mots-clés", text: "SkillBot analyse votre offre et vous propose une liste de tags de compétences pertinents pour optimiser votre portée." },
                    { label: "Discussion naturelle", text: "Une boîte de conversation de premier choix, fluide, mémorisant parfaitement les jalons précédents de l'entretien." }
                ]
            },
            {
                title: "5. Kanban & Suivi",
                intro: "Suivez visuellement l'avancement des commandes et fluidifiez la gestion des étapes de livrables.",
                bullets: [
                    { label: "Étapes standardisées", text: "Visualisez l'état d'avancement réparti en 3 colonnes de référence claire (En attente, En cours, Terminés)." },
                    { label: "Glisser-déposer interactif", text: "Mettez à jour le statut d'un projet d'un simple mouvement glissé. Le panneau coordonne instantanément le recalcul." },
                    { label: "Fiches de synthèse", text: "Regardez les infos cruciales : nom du donneur d'ordre, montant engagé, et compteurs de temps restants." },
                    { label: "Actions intégrées", text: "Validez ou formulez une demande de revue directement depuis la fiche projet sans navigation annexe." }
                ]
            },
            {
                title: "6. Espace Profil",
                intro: "Configurez votre espace d'exposition public et consolidez votre marque personnelle.",
                bullets: [
                    { label: "Informations générales", text: "Personnalisez votre bio, votre photo de profil professionnelle, votre rôle principal ainsi que votre localisation." },
                    { label: "Compétences & Tags", text: "Gérez de façon autonome les compétences rattachées à votre savoir-faire pour remonter dans les moteurs de recherche." },
                    { label: "Métriques & Performance", text: "Évaluez vos revenus globaux, taux de succès, et statistiques d'avis pour rassurer l'ensemble des donneurs d'ordre." },
                    { label: "Export PDF dynamique", text: "Générez d'un seul clic un CV professionnel clair et harmonisé, basé sur le contenu à jour de votre tableau de bord." }
                ]
            },
            {
                title: "7. Options Globales",
                intro: "L'application s'adapte à votre ergonomie d'utilisation préférée grâce à ses paramètres globaux.",
                bullets: [
                    { label: "Thème Sombre / Clair", text: "Basculez instantanément l'ensemble de l'interface en thème nocturne raffiné ou diurne haute clarté selon votre confort." },
                    { label: "Multilingue en direct", text: "Passez instantanément du Français à l'Anglais de façon totalement fluide." },
                    { label: "Centre d'Aide intégré", text: "Consultez ou exportez à tout moment ce guide pour avoir accès aux réponses fondamentales sur le fonctionnement." }
                ]
            },
            {
                title: "8. Avis & Critiques",
                intro: "Construisez une réputation incontestable avec le système automatisé de recommandations.",
                bullets: [
                    { label: "Évaluation double", text: "Laissez une appréciation par étoiles de 1 à 5 combinée à un texte descriptif sur vos projets communs." },
                    { label: "Automodération légitime", text: "Les utilisateurs conservent un droit complet d'ajustement ou de rectification de leur feedback à la conclusion." },
                    { label: "Calcul instantané", text: "La plateforme recalcule l'impact des retours en temps réel pour l'afficher sur votre vitrine publique." }
                ]
            }
        ];

        const userStatus = AppState && AppState.user 
            ? `<div class="flex items-center gap-2 justify-center"><div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> <span>Connecté en tant que : <strong>${AppState.user.role || 'Utilisateur'}</strong> (${AppState.user.email || ''})</span></div>` 
            : `<div class="flex items-center gap-2 justify-center"><div class="w-2 h-2 rounded-full bg-slate-400"></div> <span>Utilisateur non connecté (Visiteur)</span></div>`;
        
        const manualHTML = `
            <div class="manual-static-section animate-fade-in">
                <!-- Premium Header Hero Card -->
                <div class="relative bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-slate-500/0 dark:from-indigo-600/20 dark:via-purple-950/10 dark:to-transparent border border-indigo-100/55 dark:border-indigo-900/40 rounded-3xl p-6 sm:p-10 mb-10 overflow-hidden shadow-sm">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12"></div>
                    <div class="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl -z-10 -translate-x-12 translate-y-12"></div>
                    
                    <div class="text-center relative z-10 max-w-2xl mx-auto">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-250/20">
                            <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Documentation Officielle
                        </span>
                        
                        <h1 class="text-slate-900 dark:text-white text-2xl sm:text-4xl m-0 font-black tracking-tight leading-tight">
                            Manuel d'Utilisation <span class="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">SkillLink</span>
                        </h1>
                        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                            Généré en temps réel le ${new Date().toLocaleDateString('fr-FR')} &bull; Version Interactive
                        </p>
                        
                        <div class="mt-6 inline-block font-semibold px-4 py-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-slate-700 dark:text-slate-350 rounded-2xl text-xs border border-slate-200/50 dark:border-slate-800 shadow-sm">
                            ${userStatus}
                        </div>
                    </div>
                </div>
                
                <!-- Introduction Card -->
                <div id="section-intro" class="mb-10 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800/60 scroll-mt-6">
                    <h2 class="text-slate-900 dark:text-white text-xl sm:text-2xl font-extrabold flex items-center gap-2 tracking-tight">
                        <span class="w-1.5 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full"></span>
                        Introduction
                    </h2>
                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                        Bienvenue sur la plateforme de documentation de <strong>SkillLink</strong>. Ce guide exhaustif vous accompagne pas à pas pour configurer votre profil, publier des prestations professionnelles, de négocier et fluidifier votre flux de projet en toute confiance. 
                    </p>
                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5">
                        Que vous soyez un expert désireux de faire décoller ses projets, ou une entreprise recherchant le profil parfait, ce manuel dynamique s'ajuste en temps réel pour vous livrer des informations pratiques immédiatement activables.
                    </p>
                </div>
                
                <!-- Timeline Changelog block -->
                <div id="section-recent" class="mb-10 p-6 sm:p-8 bg-indigo-50/25 dark:bg-indigo-950/10 rounded-3xl border border-indigo-100/25 dark:border-indigo-900/40 scroll-mt-6">
                    <h2 class="text-slate-900 dark:text-white text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 tracking-tight border-b border-indigo-200/25 pb-4">
                        <div class="w-8 h-8 rounded-xl bg-indigo-100/50 dark:bg-indigo-950/40 border border-indigo-200/30 dark:border-indigo-900/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <i data-lucide="sparkles" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        Mises à jour de la Version Actuelle
                    </h2>
                    <p class="text-xs text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider mt-3 ml-1">Notes de mise à jour récentes</p>
                    
                    <div class="mt-6 space-y-4">
                        <div class="flex gap-4 items-start">
                            <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-300"><strong>Import d'images flexible :</strong> Choix complet d'import image par upload direct ou lien URL.</p>
                        </div>
                        <div class="flex gap-4 items-start">
                            <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-300"><strong>Sécurité d'image :</strong> Validation rigoureuse des formats d'extension autorisés (JPG, PNG, WEBP).</p>
                        </div>
                        <div class="flex gap-4 items-start">
                            <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-300"><strong>Historique d'URLs :</strong> Sauvegarde auto des 3 dernières images insérées pour une réutilisation rapide.</p>
                        </div>
                        <div class="flex gap-4 items-start">
                            <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-300"><strong>Assistant IA Avancé :</strong> Nouveaux modèles de rédaction de fiches et patterns d'optimisation de profil intégrés.</p>
                        </div>
                        <div class="flex gap-4 items-start">
                            <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center shrink-0">
                                <i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <p class="text-sm text-slate-600 dark:text-slate-300"><strong>Alertes de Messagerie :</strong> Système de notifications sonores synchronisées globalement pour ne rater aucun prospect.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Features block -->
            <div class="manual-static-section mb-6 scroll-mt-6" id="section-features">
                <h2 class="text-slate-900 dark:text-white text-xl sm:text-2xl font-extrabold flex items-center gap-2 tracking-tight">
                    <span class="w-1.5 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full"></span>
                    Modules & Fonctionnalités clés
                </h2>
                <p class="text-sm text-slate-500 mt-2">Détail technique et fonctionnel de la suite de modules interactifs de SkillLink.</p>
            </div>
            
            <div class="space-y-8 mt-6">
                ${features.map((f, i) => `
                    <div id="feature-${i}" class="manual-feature-block bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 hover:shadow-lg dark:hover:shadow-black/10 hover:border-indigo-150 dark:hover:border-indigo-900/60 transition-all duration-300 relative overflow-hidden group scroll-mt-6">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/0 group-hover:bg-indigo-500/5 rounded-full blur-2xl -z-10 transition-all duration-300"></div>
                        
                        <div class="flex items-start gap-4 mb-5 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                            <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm shrink-0">
                                <i data-lucide="${[
                                    'search',
                                    'plus-circle',
                                    'message-square',
                                    'sparkles',
                                    'kanban-square',
                                    'user',
                                    'settings',
                                    'star'
                                ][i]}" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h3 class="text-slate-800 dark:text-slate-100 font-black text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">${f.title}</h3>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-lg mt-1 inline-block border border-indigo-500/10">Module Intégré</span>
                            </div>
                        </div>
                        
                        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">${f.intro || ''}</p>
                        
                        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${f.bullets.map(b => `
                                <div class="flex items-start gap-3.5 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-200">
                                    <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-150/50 dark:border-indigo-900/35 shadow-sm">
                                        <i data-lucide="check" class="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1 leading-normal">${b.label}</h4>
                                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${b.text}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- FAQ Section -->
            <div id="section-faq" class="manual-static-section mt-12 mb-6 scroll-mt-6">
                <h2 class="text-slate-900 dark:text-white text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 tracking-tight border-b border-slate-150 dark:border-slate-800/50 pb-4">
                    <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/55 dark:border-indigo-900/30 shadow-sm shrink-0">
                        <i data-lucide="help-circle" class="w-4 h-4"></i>
                    </div>
                    Manuel d'utilisation & FAQ
                </h2>
                <p class="text-sm text-slate-500 mt-2">Retrouvez les réponses de nos experts techniques sur le fonctionnement de SkillLink.</p>
            </div>

            <div class="space-y-4 mt-6">
                ${Array.from({length: 20}, (_, i) => {
                    const qTitle = AppState.t('faq_q' + (i + 1) + '_title');
                    if (!qTitle || qTitle === 'faq_q' + (i + 1) + '_title' || qTitle === '') return '';
                    return `
                    <details class="manual-feature-block group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm hover:border-indigo-200 dark:hover:border-indigo-600/30 transition-colors">
                        <summary class="flex justify-between items-center font-bold text-sm cursor-pointer list-none p-5 text-slate-900 dark:text-white marker:content-none *:outline-none hover:bg-slate-50 dark:hover:bg-slate-800/45 transition-colors">
                            <span class="flex items-center gap-2.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                ${qTitle}
                            </span>
                            <span class="flex-shrink-0 ml-4 p-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-transform duration-300 group-open:rotate-180">
                                <i data-lucide="chevron-down" class="w-4 h-4"></i>
                            </span>
                        </summary>
                        <div class="text-slate-600 dark:text-slate-350 text-sm p-6 pt-2 leading-relaxed border-t border-slate-100 dark:border-slate-800 whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/20">
                            ${AppState.t('faq_q' + (i + 1) + '_desc')}
                        </div>
                    </details>
                    `;
                }).join('')}
            </div>

            <div id="manual-no-results" class="hidden p-12 text-center bg-slate-50/50 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="search-code" class="w-6 h-6"></i>
                </div>
                <h4 class="text-slate-800 dark:text-slate-100 font-bold mb-1">Aucune correspondance</h4>
                <p class="text-xs text-slate-400 dark:text-slate-500">Essayez de saisir d'autres termes ou explorez d'autres sections dans le sommaire.</p>
            </div>

            <div class="manual-static-section mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-550 text-center flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span>&copy; ${new Date().getFullYear()} SkillLink &bull; Tous droits réservés</span>
                <span>Document dynamique synchronisé avec vos jalons d'API</span>
            </div>
        `;

        const modalDiv = document.createElement('div');
        modalDiv.className = 'fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in block';
        modalDiv.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-6xl w-full flex flex-col border border-slate-100 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/55 dark:border-indigo-900/30 shadow-sm flex items-center justify-center size-10">
                            <i data-lucide="book-open" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-black text-slate-900 dark:text-white leading-none">Manuel d'utilisation</h3>
                            <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 inline-block">Support & Centre d'aide</span>
                        </div>
                    </div>
                    
                    <div class="flex-1 max-w-md relative">
                        <input type="text" id="manual-search-input" placeholder="Rechercher une fonctionnalité (ex: publication, IA, Kanban)..." class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder:text-slate-400 dark:placeholder:text-slate-500">
                        <svg class="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <div class="flex items-center space-x-2">
                        <button id="btn-fullscreen-manual" class="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer" title="Plein écran">
                            <svg class="w-5 h-5 fullscreen-icon-expand animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            <svg class="w-5 h-5 fullscreen-icon-shrink hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"></path></svg>
                        </button>
                        <button id="btn-download-pdf" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-[0_4px_14px_0_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.18)] transition-all flex items-center cursor-pointer">
                            <svg class="w-4 h-4 sm:mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span class="hidden sm:inline">Télécharger PDF</span>
                        </button>
                        <button class="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer btn-close-modal">
                            <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                
                <div class="flex flex-1 overflow-hidden">
                    <!-- Left beautiful Sidebar -->
                    <div class="w-72 bg-slate-50/50 dark:bg-slate-900/40 border-r border-slate-150 dark:border-slate-800/80 p-6 overflow-y-auto hidden md:block">
                        <div class="mb-6 flex items-center justify-between">
                            <h4 class="font-extrabold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest">Sommaire</h4>
                            <span class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20 font-bold text-[9px] uppercase">Ressources</span>
                        </div>
                        <ul class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 font-semibold mb-6">
                            <li>
                                <a href="#section-intro" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all toc-link">
                                    <i data-lucide="book-open" class="w-4 h-4 text-slate-400 shrink-0"></i> Introduction
                                </a>
                            </li>
                            <li>
                                <a href="#section-recent" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all toc-link">
                                    <i data-lucide="sparkles" class="w-4 h-4 text-emerald-500 shrink-0"></i> Nouveautés
                                </a>
                            </li>
                            <li>
                                <a href="#section-faq" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all toc-link">
                                    <i data-lucide="help-circle" class="w-4 h-4 text-indigo-500 shrink-0"></i> FAQ & Centre d'aide
                                </a>
                            </li>
                        </ul>
                        
                        <div class="mb-4">
                            <h4 class="font-extrabold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest pl-3">Modules & Guides</h4>
                        </div>
                        <ul class="space-y-1.5 text-xs font-semibold">
                            ${features.map((f, i) => `
                                <li>
                                    <a href="#feature-${i}" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all toc-link">
                                        <i data-lucide="${[
                                            'search',
                                            'plus-circle',
                                            'message-square',
                                            'sparkles',
                                            'kanban-square',
                                            'user',
                                            'settings',
                                            'star'
                                        ][i]}" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i> 
                                        <span class="truncate block">${f.title}</span>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                        
                        <!-- Contact Help Support Panel footer -->
                        <div class="mt-8 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/20 rounded-2xl">
                            <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Besoin d'aide ?</h5>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">Notre support technique basé à Douala réagit en moins de 24h ouvrables.</p>
                            <button id="sidebar-help-contact" class="w-full text-center py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold rounded-xl border border-indigo-100 dark:border-indigo-900 transition-all shadow-sm cursor-pointer hover:shadow">
                                Contacter l'équipe
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content pane -->
                    <div class="flex-1 p-6 sm:p-10 overflow-y-auto bg-white dark:bg-slate-900 scroll-smooth" id="manual-content-container">
                        ${manualHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);
        if (window.lucide) window.lucide.createIcons({ root: modalDiv });

        modalDiv.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetEl = modalDiv.querySelector(`#${targetId}`);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        const searchInput = modalDiv.querySelector('#manual-search-input');
        const noResultsMsg = modalDiv.querySelector('#manual-no-results');
        
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const blocks = modalDiv.querySelectorAll('.manual-feature-block');
            const staticSections = modalDiv.querySelectorAll('.manual-static-section');
            let hasResults = false;
            
            blocks.forEach(block => {
                const text = block.textContent.toLowerCase();
                if (text.includes(term)) {
                    block.style.display = 'block';
                    hasResults = true;
                } else {
                    block.style.display = 'none';
                }
            });

            if (term.length > 0) {
                staticSections.forEach(section => section.style.display = 'none');
                noResultsMsg.style.display = hasResults ? 'none' : 'block';
            } else {
                staticSections.forEach(section => section.style.display = 'block');
                noResultsMsg.style.display = 'none';
            }
        });

        let isFullScreen = false;
        modalDiv.querySelector('#btn-fullscreen-manual').addEventListener('click', () => {
            const innerDiv = modalDiv.children[0];
            const iconExpand = modalDiv.querySelector('.fullscreen-icon-expand');
            const iconShrink = modalDiv.querySelector('.fullscreen-icon-shrink');
            
            isFullScreen = !isFullScreen;
            
            if (isFullScreen) {
                modalDiv.classList.remove('p-4');
                modalDiv.classList.add('p-0');
                innerDiv.classList.remove('rounded-3xl', 'max-w-6xl', 'max-h-[90vh]');
                innerDiv.classList.add('h-screen', 'w-screen', 'max-w-none', 'rounded-none', 'max-h-screen');
                iconExpand.classList.add('hidden');
                iconShrink.classList.remove('hidden');
            } else {
                modalDiv.classList.add('p-4');
                modalDiv.classList.remove('p-0');
                innerDiv.classList.add('rounded-3xl', 'max-w-6xl', 'max-h-[90vh]');
                innerDiv.classList.remove('h-screen', 'w-screen', 'max-w-none', 'rounded-none', 'max-h-screen');
                iconExpand.classList.remove('hidden');
                iconShrink.classList.add('hidden');
            }
        });

        modalDiv.querySelector('.btn-close-modal').addEventListener('click', () => {
            modalDiv.remove();
        });

        modalDiv.querySelector('#sidebar-help-contact').addEventListener('click', () => {
            modalDiv.remove();
            const contactBtn = document.getElementById('contact-toggle');
            if (contactBtn) contactBtn.click();
        });

        modalDiv.querySelector('#btn-download-pdf').addEventListener('click', () => {
            if (!window.html2pdf) {
                if (window.showToast) window.showToast("Le module PDF n'est pas encore prêt.", "error");
                return;
            }

            const content = document.getElementById('manual-content-container');
            if (!content) return;
            
            // Show a modern centered loading overlay with a spinner and smooth backdrop blur
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'pdf-loading-overlay';
            loadingOverlay.className = 'fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[99999] flex flex-col items-center justify-center text-center px-4 transition-all duration-300';
            loadingOverlay.innerHTML = `
                <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                    <div class="w-12 h-12 border-4 border-slate-150 border-t-indigo-600 rounded-full animate-spin mb-4 dark:border-slate-800"></div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Génération du PDF...</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Veuillez patienter pendant la préparation et le téléchargement de votre document.</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);

            const opt = {
                margin:       14,
                filename:     'Manuel_Utilisation_SkillLink.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2.2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak:    { mode: ['css', 'legacy'] }
            };
            
            if (window.showToast) window.showToast("Génération du manuel...", "info");

            const restore = prepareElementForPdfExport(content);

            const html2pdfFunc = html2pdf.default || html2pdf;
            html2pdfFunc().set(opt).from(content).save().then(() => {
                const overlay = document.getElementById('pdf-loading-overlay');
                if (overlay) overlay.remove();
                restore();
                if (window.showToast) window.showToast("Manuel PDF téléchargé", "success");
            }).catch(err => {
                const overlay = document.getElementById('pdf-loading-overlay');
                if (overlay) overlay.remove();
                restore();
                console.error("PDF Error:", err);
                if (window.showToast) window.showToast("Erreur lors de la génération PDF.", "error");
            });
        });
    };

    const startTour = () => {
        const steps = [
            { id: 'nav-btn-home', text: 'Accueil: Retournez à la page principale.' },
            { id: 'btn-nav-explore', text: 'Explorer: Trouvez des talents et services.' },
            { id: 'btn-nav-manual', text: 'Manuel: Accédez à l\'aide et aux astuces.' },
            { id: 'nav-btn-messages', text: 'Messages: Discutez avec les prestataires.' },
            { id: 'nav-user-menu', text: 'Votre profil: Accédez à vos paramètres.' }
        ];

        let currentStep = 0;

        const showStep = () => {
            const step = steps[currentStep];
            const target = document.getElementById(step.id);
            if (!target) {
                currentStep++;
                if (currentStep < steps.length) showStep();
                return;
            }

            const rect = target.getBoundingClientRect();
            const bubble = document.createElement('div');
            bubble.id = 'tour-bubble';
            bubble.className = 'fixed z-[1000] bg-indigo-600 text-white p-3 rounded-lg shadow-lg text-sm font-medium animate-bounce';
            bubble.style.left = `${rect.left + rect.width / 2}px`;
            bubble.style.top = `${rect.bottom + 10}px`;
            bubble.style.transform = 'translateX(-50%)';
            bubble.innerHTML = `<div class="mb-1 text-xs opacity-80">${currentStep + 1}/${steps.length}</div>${step.text}<br/><button id="btn-next-tour" class="mt-2 text-xs underline">Suivant</button>`;
            
            document.body.appendChild(bubble);

            document.getElementById('btn-next-tour').addEventListener('click', () => {
                bubble.remove();
                currentStep++;
                if (currentStep < steps.length) {
                    showStep();
                } else {
                    AppState.setTourSeen(true);
                }
            });
        };

        showStep();
    };

    const handleLogout = () => {
        if (!AppState) return;
        
        // Show confirmation modal
        const modalHtml = `
            <div id="logout-confirm-modal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
                <div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-150 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] max-w-sm w-full p-6 sm:p-8 transform transition-all duration-300 animate-in zoom-in-95 relative overflow-hidden">
                    <div class="text-center">
                        <div class="relative w-16 h-16 bg-rose-50 dark:bg-rose-950/35 text-rose-600 dark:text-rose-450 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100 dark:border-rose-900/30 shadow-sm animate-pulse">
                            <i data-lucide="log-out" class="w-7 h-7 relative z-10"></i>
                        </div>
                        <h3 class="text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">Se déconnecter ?</h3>
                        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[280px] mx-auto leading-relaxed font-semibold">
                            Êtes-vous sûr de vouloir quitter votre session active sur SkillLink ?
                        </p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <button id="logout-cancel" class="w-full sm:flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95">
                            Rester connecté
                        </button>
                        <button id="logout-confirm" class="w-full sm:flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_14px_rgba(225,29,72,0.25)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        document.body.appendChild(tempDiv.firstElementChild);
        
        const modal = document.getElementById('logout-confirm-modal');
        if (window.lucide) window.lucide.createIcons({ root: modal });
        
        document.getElementById('logout-cancel').addEventListener('click', () => {
            modal.remove();
        });
        document.getElementById('logout-confirm').addEventListener('click', () => {
            AppState.logout();
            modal.remove();
        });
    };

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    <div id="nav-btn-home" className="flex items-center cursor-pointer group" onClick={() => handleRoute('home')}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-indigo-100/50 dark:border-indigo-500/20">
                            <Layers className="text-indigo-600 dark:text-indigo-400 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">SkillLink</span>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-3">
                        <div className="hidden md:flex items-center gap-1 bg-slate-50/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                            <button id="btn-nav-manual" onClick={openManualMenu} className="group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] cursor-pointer" title="Manuel">
                                <BookOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
                            </button>
                            <button id="contact-toggle" className="group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] cursor-pointer" title={t('nav_contact')}>
                                <HelpCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                            </button>
                            <button onClick={handleThemeToggle} className="group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] cursor-pointer">
                                {isDark ? <Sun className="w-4 h-4 transition-transform group-hover:scale-110" /> : <Moon className="w-4 h-4 transition-transform group-hover:scale-110" />}
                            </button>
                            <button 
                                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} 
                                className="group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center px-2.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] font-bold text-xs cursor-pointer">
                                {lang === 'fr' ? 'EN' : 'FR'}
                            </button>
                        </div>
                        
                        {AppState.user ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                                {/* Explore Button - Hidden on mobile as it's in bottom bar */}
                                <button id="btn-nav-explore" onClick={() => handleRoute('marketplace')} className="hidden md:flex group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all items-center justify-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" title={t('nav_explore')}>
                                    <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </button>
                                
                                {/* Messages Button */}
                                <button id="nav-btn-messages" onClick={() => handleRoute('messaging')} className="hidden md:flex group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all items-center justify-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" title={t('nav_messages')}>
                                    <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </button>

                                {/* Notifications Button */}
                                <div className="hidden md:block relative user-menu-dropdown-container">
                                    <button onClick={() => {
                                        setIsDropdownOpen(isDropdownOpen === 'notifications' ? false : 'notifications');
                                        if (AppState.unreadCount > 0) AppState.markNotificationsAsRead();
                                    }} className="group text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer relative" title="Notifications">
                                        <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        {AppState.unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
                                        )}
                                    </button>

                                    {isDropdownOpen === 'notifications' && (
                                        <div className="fixed sm:absolute inset-x-4 top-20 sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-3 z-[100] animate-in fade-in-50 slide-in-from-top-1 duration-100 max-h-[60vh] sm:max-h-96 overflow-y-auto">
                                            <div className="border-b border-slate-100 dark:border-slate-800 pb-2 px-4 mb-2 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
                                                {AppState.notifications?.length > 0 && (
                                                    !confirmClearNotifsNav ? (
                                                        <button onClick={(e) => { e.stopPropagation(); setConfirmClearNotifsNav(true); }} className="text-xs text-red-500 hover:text-red-700 transition flex items-center px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                                            <Trash2 className="w-3 h-3 mr-1" /> Vider
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-100 dark:border-red-900/30">
                                                            <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold tracking-wide uppercase">Confirmer :</span>
                                                            <button onClick={async (e) => { 
                                                                e.stopPropagation(); 
                                                                await AppState.clearNotifications(); 
                                                                setConfirmClearNotifsNav(false); 
                                                            }} className="text-[10px] bg-red-500 text-white px-2.5 py-0.5 rounded shadow-sm hover:bg-red-600 transition font-medium flex items-center gap-1 min-w-[32px] justify-center">
                                                                Oui
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); setConfirmClearNotifsNav(false); }} className="text-[10px] bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium">Non</button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            
                                            <div className="relative">
                                                {AppState.notifications?.length > 0 ? (
                                                    <div className="flex flex-col">
                                                    {AppState.notifications.map(notif => (
                                                        <div key={notif.id} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                                            <div className="flex items-start space-x-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate break-words">{notif.title}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 break-words text-wrap">{notif.message}</p>
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString('fr-FR')}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-slate-500 text-sm">Aucune notification</div>
                                            )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

                                    {/* User Dropdown Menu */}
                                <div className="relative user-menu-dropdown-container ml-1">
                                    <button 
                                        id="nav-user-menu"
                                        onClick={() => setIsDropdownOpen(isDropdownOpen === 'user' || isDropdownOpen === true ? false : 'user')} 
                                        className="flex items-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-all py-1 px-1.5 sm:py-1.5 sm:px-2 rounded-2xl sm:rounded-full cursor-pointer hover:shadow-md group"
                                    >
                                        <div className="p-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full group-hover:scale-105 transition-transform duration-300">
                                            {AppState.profileData?.avatarImage ? (
                                                <img src={AppState.profileData.avatarImage} alt="Profile" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white dark:border-slate-800 shadow-sm" />
                                            ) : (
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-white dark:border-slate-800 shadow-sm">
                                                    {(AppState.profileData?.displayName || AppState.user?.nom || "U").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[80px] sm:max-w-[130px] truncate hidden sm:block">
                                            {AppState.profileData?.displayName || AppState.user?.nom || "Utilisateur"}
                                        </span>
                                        <svg className={`w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-all duration-300 hidden sm:block mr-1 ${isDropdownOpen === 'user' || isDropdownOpen === true ? 'rotate-180 text-indigo-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {(isDropdownOpen === 'user' || isDropdownOpen === true) && (
                                        <div className="fixed sm:absolute inset-x-4 top-20 sm:top-auto sm:left-auto sm:right-0 sm:mt-4 sm:w-72 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_65px_rgba(0,0,0,0.45)] border border-slate-150 dark:border-slate-800/80 p-1.5 z-[100] text-slate-705 dark:text-slate-200 animate-in fade-in slide-in-from-top-3 duration-250">
                                            {/* Header with user details */}
                                            <div className="px-4 py-4 rounded-2xl bg-slate-50/75 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 flex items-center space-x-3 mb-1">
                                                <div className="relative group shrink-0">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                                    <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center relative z-10 border border-slate-200 dark:border-slate-700 shadow-inner bg-indigo-50 dark:bg-indigo-950/30">
                                                        {AppState.profileData?.avatarImage ? (
                                                            <img src={AppState.profileData.avatarImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                                {(AppState.profileData?.displayName || AppState.user?.nom || "U").charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="overflow-hidden flex-1">
                                                    <p className="font-extrabold text-[14px] text-slate-900 dark:text-white truncate tracking-tight">
                                                        {AppState.profileData?.displayName || AppState.user?.nom}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                                                        {AppState.user?.email}
                                                    </p>
                                                    <div className="mt-1.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40">
                                                            {AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance' ? 'Membre Freelance' : 'Membre Client'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="py-1 space-y-0.5 animate-fade-in">
                                                <div className="px-3.5 pt-1.5 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mon Compte</div>
                                                
                                                <button 
                                                    onClick={() => { handleRoute('profile'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-indigo-50/50 dark:hover:bg-slate-900 rounded-xl flex items-center space-x-3 transition cursor-pointer font-bold text-slate-700 hover:text-indigo-650 dark:text-slate-300 dark:hover:text-white group"
                                                >
                                                    <User className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                    <span>Mon Profil</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => { handleRoute('profile-edit'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-indigo-50/50 dark:hover:bg-slate-900 rounded-xl flex items-center space-x-3 transition cursor-pointer font-bold text-slate-700 hover:text-indigo-650 dark:text-slate-300 dark:hover:text-white group"
                                                >
                                                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                    <span>Modifier le Profil</span>
                                                </button>

                                                <div className="h-px bg-slate-100 dark:bg-slate-900/60 my-1 mx-2"></div>
                                                <div className="px-3.5 pt-1.5 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-505">Activités & Services</div>

                                                <button 
                                                    onClick={() => { 
                                                        handleRoute(AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance' ? 'tracking' : 'dashboard'); 
                                                        setIsDropdownOpen(false); 
                                                    }} 
                                                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-indigo-50/50 dark:hover:bg-slate-900 rounded-xl flex items-center space-x-3 transition cursor-pointer font-bold text-slate-700 hover:text-indigo-650 dark:text-slate-300 dark:hover:text-white group"
                                                >
                                                    {AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance' ? (
                                                        <>
                                                            <KanbanSquare className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                            <span>Suivi Commandes</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                            <span>Tableau de Bord</span>
                                                        </>
                                                    )}
                                                </button>
                                                
                                                {(AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance') && (
                                                    <button 
                                                        onClick={() => { handleRoute('publish'); setIsDropdownOpen(false); }} 
                                                        className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-indigo-50/50 dark:hover:bg-slate-900 rounded-xl flex items-center space-x-3 transition cursor-pointer font-bold text-slate-700 hover:text-indigo-650 dark:text-slate-300 dark:hover:text-white group"
                                                    >
                                                        <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                        <span>Publier un Service</span>
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => { handleRoute('ai'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-purple-550/10 dark:hover:bg-purple-950/20 rounded-xl flex items-center space-x-3 transition cursor-pointer text-purple-600 dark:text-purple-400 font-extrabold group"
                                                >
                                                    <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                                                    <span>Assistant IA Interactif</span>
                                                </button>

                                                <button 
                                                    onClick={() => { handleRoute('settings'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl flex items-center space-x-3 transition cursor-pointer font-bold text-slate-655 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white group"
                                                >
                                                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                    <span>Réglages de l'application</span>
                                                </button>
                                            </div>
                                            
                                            <div className="border-t border-slate-100 dark:border-slate-800/80 p-1.5 mt-2 bg-slate-50/50 dark:bg-slate-950 rounded-2xl">
                                                <button 
                                                    onClick={() => { handleLogout(); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-3 py-2.5 text-xs sm:text-sm text-rose-600 hover:text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/2 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200/20 rounded-xl flex items-center space-x-3 transition font-extrabold cursor-pointer group"
                                                >
                                                    <div className="p-1 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-105 transition-transform shrink-0">
                                                        <LogOut className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span>Se déconnecter de SkillLink</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3.5 ml-2">
                                <button 
                                    onClick={() => handleRoute('login')} 
                                    className="text-slate-650 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-200 py-2.5 px-3.5 sm:px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-805 flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800"
                                >
                                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <span>{t('nav_login')}</span>
                                </button>
                                <button 
                                    onClick={() => handleRoute('register')} 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-xl font-extrabold transition-all duration-200 shadow-[0_4px_12px_rgba(99,102,241,0.18)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.28)] text-xs sm:text-sm tracking-tight flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <span>{t('nav_register')}</span>
                                    <PlusCircle className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
