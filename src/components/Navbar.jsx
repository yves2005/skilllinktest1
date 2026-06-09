import React, { useEffect, useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { AppState } from '../state.js';
import { 
    Layers, HelpCircle, Sun, Moon, PlusCircle, Search, 
    MessageSquare, LayoutDashboard, KanbanSquare, Sparkles, 
    Settings, User, LogOut, Bell, BookOpen 
} from 'lucide-react';

export const Navbar = () => {
    const { lang, setLang, t } = useI18n();
    const [updater, setUpdater] = useState(0);
    const [isDark, setIsDark] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        if (!isDropdownOpen) return;
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.user-menu-dropdown-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
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
                title: "1. Accueil et Moteur de Recherche (Annuaire)",
                desc: `La page d'accueil sert de répertoire central pour découvrir les talents et les services proposés sur SkillLink.
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Recherche par mots-clés :</strong> Une barre de recherche puissante vous permet de trouver des prestataires par nom, compétence ou mot-clé.</li>
                    <li><strong>Filtres par catégories :</strong> Filtrez les résultats par rôle (Développeur, Designer, Marketing, etc.).</li>
                    <li><strong>Grille de profils :</strong> Visualisez les cartes de présentation des experts, incluant leur avatar, leur nombre de projets terminés, leur taux de satisfaction et leur taux de réponse moyen.</li>
                    <li><strong>Action directe :</strong> Depuis la carte d'un profil, vous pouvez visiter son profil détaillé ou le contacter directement par message.</li>
                </ul>`
            },
            {
                title: "2. Publication et Gestion de Services",
                desc: `Ce module permet aux freelances et prestataires de mettre en avant leurs offres.
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Formulaire de création :</strong> Renseignez le titre, la catégorie, le tarif, les tags de compétences, le délai de livraison et une description détaillée de votre service.</li>
                    <li><strong>Gestion des images :</strong> Vous pouvez uploader des images depuis votre ordinateur ou fournir un lien URL direct. Le système vérifie automatiquement la validité de l'image.</li>
                    <li><strong>Historique d'images :</strong> Gagnez du temps grâce à la mémorisation de vos 3 dernières URL d'images utilisées.</li>
                    <li><strong>Prévisualisation en direct (Live Preview) :</strong> Visualisez exactement à quoi ressemblera votre offre (carte et vue détaillée) avant de la publier.</li>
                    <li><strong>Mes services :</strong> Un onglet dédié pour voir la liste des services que vous avez publiés et suivre leurs performances.</li>
                </ul>`
            },
            {
                title: "3. Messagerie Directe",
                desc: `Restez en contact constant avec vos clients et collaborateurs grâce au système de chat intégré.
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Liste des conversations :</strong> Retrouvez à gauche la liste de vos contacts récents avec un aperçu du dernier message et un indicateur non-lu.</li>
                    <li><strong>Bulles de chat fluides :</strong> L'interface de chat présente l'historique des discussions sous forme de bulles différenciées (envoyées / reçues).</li>
                    <li><strong>Envoi en temps réel :</strong> Communiquez rapidement concernant les devis, les fichiers ou les précisions nécessaires pour la réalisation d'une tâche.</li>
                </ul>`
            },
            {
                title: "4. Assistant IA Intégré (SkillBot)",
                desc: `Un compagnon propulsé par l'Intelligence Artificielle pour vous accompagner dans vos tâches quotidiennes sur la plateforme.
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Aide à la rédaction :</strong> Demandez à l'IA d'optimiser la description de votre service, de corriger des fautes, ou de traduire un texte.</li>
                    <li><strong>Support technique et code :</strong> Posez des questions techniques, demandez des exemples de code, ou obtenez de l'aide sur des concepts de programmation.</li>
                    <li><strong>Idéation :</strong> Manque d'inspiration pour vos offres ? L'IA peut vous suggérer des tags pertinents ou organiser vos idées.</li>
                    <li><strong>Interface conversationnelle :</strong> Une expérience similaire aux meilleurs chatbots, gardant le contexte de votre discussion.</li>
                </ul>`
            },
            {
                title: "5. Kanban (Suivi de Commandes)",
                desc: `Gérez visuellement le flux de vos projets de la commande à la livraison.
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Colonnes de statut :</strong> Organisez vos tâches selon leur état (À faire, En cours, En révision, Terminé).</li>
                    <li><strong>Glisser-déposer (Drag & Drop) :</strong> Déplacez facilement une carte de commande d'une colonne à une autre pour mettre à jour son statut de progression.</li>
                    <li><strong>Détail des tickets :</strong> Chaque carte Kanban affiche le nom du client, le titre de la commande, la date limite et le montant attendu.</li>
                    <li><strong>Actions rapides :</strong> Marquez une tâche comme terminée ou contactez le client directement depuis le Kanban.</li>
                </ul>`
            },
            {
                title: "6. Espace Profil Utilisateur",
                desc: `Votre vitrine personnelle auprès de la communauté SkillLink.
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Édition de profil :</strong> Modifiez votre photo d'avatar, votre rôle (ex: Développeur Full-Stack, UI/UX Designer), votre bio et vos informations de contact.</li>
                    <li><strong>Gestion des compétences :</strong> Ajoutez, modifiez ou supprimez les mots-clés (tags) qui définissent votre expertise technique et fonctionnelle.</li>
                    <li><strong>Statistiques de performance :</strong> Suivez vos métriques (projets complétés, avis, taux de réponse) et vos revenus générés.</li>
                    <li><strong>Portfolio :</strong> Présentez vos meilleurs travaux directement sur votre page.</li>
                    <li><strong>Génération de PDF :</strong> En un clic, générez un CV / Portfolio professionnel mis en forme automatiquement.</li>
                </ul>`
            },
            {
                title: "7. Navigation, Paramètres et Options Globales",
                desc: `L'application propose de multiples options pour améliorer le confort d'utilisation au quotidien.
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Mode Sombre / Mode Clair :</strong> Situé en haut de l'écran, ce bouton bascule l'interface entière sur des couleurs sombres ou claires.</li>
                    <li><strong>Sélecteur de Langue :</strong> Traduit l'interface dans diverses langues proposées par le système.</li>
                    <li><strong>Manuel Dynamique :</strong> Accessible à tout moment, pouvant être affiché en plein écran et exportable en version PDF. Il inclut une barre de recherche en temps réel et un sommaire interactif.</li>
                </ul>`
            }
        ];

        const userStatus = AppState && AppState.user ? `Connecté en tant que : ${AppState.user.role || 'Utilisateur'} (${AppState.user.email || ''})` : 'Utilisateur non connecté (Visiteur)';
        
        const manualHTML = `
            <div class="manual-static-section">
                <div class="text-center border-b-2 border-indigo-500 pb-5 mb-8">
                    <h1 class="text-indigo-600 dark:text-indigo-400 text-base md:text-3xl m-0 font-bold">Manuel d'Utilisation - SkillLink</h1>
                    <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-3">Généré dynamiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                    <div class="mt-3 font-bold p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-md text-xs">
                        ${userStatus}
                    </div>
                </div>
                
                <h2 id="section-intro" class="text-slate-800 dark:text-slate-100 text-xl md:text-2xl font-bold scroll-mt-6">Introduction</h2>
                <p class="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">Ce manuel est généré automatiquement et reflète les dernières fonctionnalités de votre application SkillLink. En téléchargeant ce PDF, vous avez toujours la garantie d'avoir la documentation à jour correspondant aux évolutions de l'interface.</p>
                
                <h2 id="section-recent" class="text-slate-800 dark:text-slate-100 text-xl md:text-2xl font-bold mt-8 scroll-mt-6">Modifications Récentes Incluses</h2>
                <ul class="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-5 list-disc mt-4">
                    <li>Ajout du choix d'import d'image (Lien URL ou Fichier local).</li>
                    <li>Validation renforcée des formats de liens d'images (jpg, png, webp).</li>
                    <li>Mémorisation des 3 dernières URLs d'images pour réutilisation.</li>
                    <li>Amélioration de la page de création avec prévisualisation en direct complète.</li>
                </ul>
            </div>

            <h2 id="section-features" class="manual-static-section text-slate-800 dark:text-slate-100 text-xl md:text-2xl font-bold mt-8 mb-4 scroll-mt-6">Modules & Fonctionnalités</h2>
            <div>
                ${features.map((f, i) => `
                    <div id="feature-${i}" class="manual-feature-block mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-indigo-500 scroll-mt-6">
                        <h3 class="m-0 mb-1 text-slate-700 dark:text-slate-200 font-bold text-sm md:text-base">${f.title}</h3>
                        <div class="m-0 text-slate-600 dark:text-slate-400 leading-relaxed text-xs md:text-sm">${f.desc}</div>
                    </div>
                `).join('')}
            </div>

            <div id="manual-no-results" class="hidden p-5 text-center text-slate-500 dark:text-slate-400">Aucune fonctionnalité ne correspond à votre recherche.</div>

            <div class="manual-static-section mt-10 pt-5 border-t border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 text-center">
                &copy; ${new Date().getFullYear()} SkillLink. Document généré dynamiquement depuis l'application.
            </div>
        `;

        const modalDiv = document.createElement('div');
        modalDiv.className = 'fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in block';
        modalDiv.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full flex flex-col border border-slate-100 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 hidden md:block">Manuel d'utilisation</h3>
                    
                    <div class="flex-1 max-w-md relative">
                        <input type="text" id="manual-search-input" placeholder="Rechercher une fonctionnalité (ex: publication, IA)..." class="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500">
                        <svg class="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>

                    <div class="flex items-center space-x-2">
                        <button id="btn-fullscreen-manual" class="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer" title="Plein écran">
                            <svg class="w-5 h-5 fullscreen-icon-expand" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                            <svg class="w-5 h-5 fullscreen-icon-shrink hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"></path></svg>
                        </button>
                        <button id="btn-download-pdf" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center cursor-pointer">
                            <svg class="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <span class="hidden sm:inline">Télécharger PDF</span>
                        </button>
                        <button class="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer btn-close-modal">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                
                <div class="flex flex-1 overflow-hidden">
                    <div class="w-64 bg-slate-50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-800 p-6 overflow-y-auto hidden md:block">
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase text-xs tracking-wider">Sommaire</h4>
                        <ul class="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <li><a href="#section-intro" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition block toc-link">Introduction</a></li>
                            <li><a href="#section-recent" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition block toc-link">Nouveautés</a></li>
                            <li>
                                <a href="#section-features" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition block toc-link">Modules & Fonctionnalités</a>
                                <ul class="pl-4 mt-2 space-y-2 text-xs border-l-2 border-slate-200 dark:border-slate-700 ml-1 font-normal text-slate-500 dark:text-slate-400">
                                    ${features.map((f, i) => `
                                        <li><a href="#feature-${i}" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition block toc-link">${f.title}</a></li>
                                    `).join('')}
                                </ul>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="flex-1 p-8 overflow-y-auto bg-white dark:bg-slate-900 scroll-smooth" id="manual-content-container">
                        ${manualHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);

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
                innerDiv.classList.remove('rounded-3xl', 'max-w-5xl', 'max-h-[90vh]');
                innerDiv.classList.add('h-screen', 'w-screen', 'max-w-none', 'rounded-none', 'max-h-screen');
                iconExpand.classList.add('hidden');
                iconShrink.classList.remove('hidden');
            } else {
                modalDiv.classList.add('p-4');
                modalDiv.classList.remove('p-0');
                innerDiv.classList.add('rounded-3xl', 'max-w-5xl', 'max-h-[90vh]');
                innerDiv.classList.remove('h-screen', 'w-screen', 'max-w-none', 'rounded-none', 'max-h-screen');
                iconExpand.classList.remove('hidden');
                iconShrink.classList.add('hidden');
            }
        });

        modalDiv.querySelector('.btn-close-modal').addEventListener('click', () => {
            modalDiv.remove();
        });

        modalDiv.querySelector('#btn-download-pdf').addEventListener('click', () => {
            if (!window.html2pdf) {
                if (window.showToast) window.showToast("Le module PDF n'est pas encore prêt.", "error");
                return;
            }

            const content = document.getElementById('manual-content-container');
            
            const opt = {
                margin:       10,
                filename:     'Manuel_Utilisation_SkillLink.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            if (window.showToast) window.showToast("Génération du manuel...", "info");

            window.html2pdf().set(opt).from(content).save().then(() => {
                if (window.showToast) window.showToast("Manuel PDF téléchargé", "success");
            }).catch(err => {
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
            <div id="logout-confirm-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center view-enter">
                <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-4 sm:p-6">
                    <div class="text-center">
                        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="log-out" class="w-6 h-6 sm:w-8 sm:h-8"></i>
                        </div>
                        <h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-2">Déconnexion</h3>
                        <p class="text-sm sm:text-base text-slate-500 mb-6">Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
                    </div>
                    <div class="flex gap-3">
                        <button id="logout-cancel" class="flex-1 py-1.5 sm:py-3 px-3 sm:px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium transition cursor-pointer text-sm">
                            Annuler
                        </button>
                        <button id="logout-confirm" class="flex-1 py-1.5 sm:py-3 px-3 sm:px-4 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition shadow-sm cursor-pointer text-sm">
                            Se déconnecter
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
        
        document.getElementById('logout-cancel').addEventListener('click', () => modal.remove());
        document.getElementById('logout-confirm').addEventListener('click', () => {
            AppState.logout();
            modal.remove();
        });
    };

    return (
        <nav className="fixed top-0 w-full z-50 glass-header border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div id="nav-btn-home" className="flex items-center cursor-pointer" onClick={() => handleRoute('home')}>
                        <Layers className="text-indigo-600 w-8 h-8 mr-2" />
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">SkillLink</span>
                    </div>
                    
                    <div className="flex items-center space-x-0.5 sm:space-x-4">
                        <button id="btn-nav-manual" onClick={openManualMenu} className="hidden md:flex text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition flex-col items-center justify-center p-0 cursor-pointer" title="Manuel">
                            <BookOpen className="w-5 h-5 sm:mb-1" />
                            <span className="text-[8px] uppercase font-semibold hidden sm:block">Manuel</span>
                        </button>
                        <button id="contact-toggle" className="hidden md:flex text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition flex-col items-center justify-center p-0">
                            <HelpCircle className="w-5 h-5 sm:mb-1" />
                            <span className="text-[8px] uppercase font-semibold">{t('nav_contact')}</span>
                        </button>
                        <button onClick={handleThemeToggle} className="hidden md:flex text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition flex-col items-center justify-center p-0">
                            {isDark ? <Sun className="w-5 h-5 sm:mb-1" /> : <Moon className="w-5 h-5 sm:mb-1" />}
                            <span className="text-[8px] uppercase font-semibold hidden sm:block">{t('nav_theme')}</span>
                        </button>
                        <button 
                            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} 
                            className="hidden md:flex text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition flex-col items-center justify-center font-bold px-0.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[8px] sm:text-sm">
                            {lang === 'fr' ? 'EN' : 'FR'}
                        </button>
                        
                        {AppState.user ? (
                            <div className="flex items-center space-x-0.5 sm:space-x-4">
                                {/* Explore Button - Hidden on mobile as it's in bottom bar */}
                                <button id="btn-nav-explore" onClick={() => handleRoute('marketplace')} className="hidden md:flex text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition flex-col items-center justify-center p-1">
                                    <Search className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] uppercase font-semibold">{t('nav_explore')}</span>
                                </button>
                                
                                {/* Messages Button */}
                                <button id="nav-btn-messages" onClick={() => handleRoute('messaging')} className="hidden md:flex text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition flex-col items-center justify-center p-1 relative">
                                    <MessageSquare className="w-5 h-5 sm:mb-1" />
                                    <span className="text-[8px] sm:text-[10px] uppercase font-semibold hidden sm:block">{t('nav_messages')}</span>
                                </button>

                                {/* Notifications Button */}
                                <div className="hidden md:block relative user-menu-dropdown-container">
                                    <button onClick={() => {
                                        setIsDropdownOpen(isDropdownOpen === 'notifications' ? false : 'notifications');
                                        if (AppState.unreadCount > 0) AppState.markNotificationsAsRead();
                                    }} className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition flex flex-col items-center justify-center p-1 relative">
                                        <Bell className="w-5 h-5 sm:mb-1" />
                                        {AppState.unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 sm:right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                                        )}
                                        <span className="text-[8px] sm:text-[10px] uppercase font-semibold hidden sm:block">Notifs</span>
                                    </button>

                                    {isDropdownOpen === 'notifications' && (
                                        <div className="fixed sm:absolute inset-x-4 top-20 sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-3 z-[100] animate-in fade-in-50 slide-in-from-top-1 duration-100 max-h-[60vh] sm:max-h-96 overflow-y-auto">
                                            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 px-4 mb-2 text-slate-800 dark:text-slate-100">Notifications</h3>
                                            {AppState.notifications?.length > 0 ? (
                                                <div className="flex flex-col">
                                                    {AppState.notifications.map(notif => (
                                                        <div key={notif.id} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                                            <div className="flex items-start space-x-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{notif.title}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
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
                                    )}
                                </div>

                                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                                    {/* User Dropdown Menu */}
                                <div className="relative user-menu-dropdown-container">
                                    <button 
                                        id="nav-user-menu"
                                        onClick={() => setIsDropdownOpen(isDropdownOpen === 'user' || isDropdownOpen === true ? false : 'user')} 
                                        className="flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-indigo-100 dark:border-slate-700 transition py-1 px-1.5 sm:py-1.5 sm:px-3 rounded-full cursor-pointer"
                                    >
                                        {AppState.profileData?.avatarImage ? (
                                            <img src={AppState.profileData.avatarImage} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                                                {(AppState.profileData?.displayName || AppState.user?.nom || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 max-w-[70px] sm:max-w-[120px] truncate">
                                            {AppState.profileData?.displayName || AppState.user?.nom || "Utilisateur"}
                                        </span>
                                        <svg className={`w-3.5 h-3.5 text-indigo-500 transition-transform duration-200 hidden sm:block ${isDropdownOpen === 'user' || isDropdownOpen === true ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {(isDropdownOpen === 'user' || isDropdownOpen === true) && (
                                        <div className="fixed sm:absolute inset-x-4 top-20 sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-[100] text-slate-700 dark:text-slate-200 animate-in fade-in-50 slide-in-from-top-1 duration-100">
                                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                                                    {AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance' ? 'Freelance / Artisan' : 'Client'}
                                                </p>
                                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                    {AppState.profileData?.displayName || AppState.user?.nom}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                                    {AppState.user?.email}
                                                </p>
                                            </div>
                                            
                                            <div className="py-1">
                                                <button 
                                                    onClick={() => { handleRoute('profile'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition cursor-pointer"
                                                >
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span>Mon Profil</span>
                                                </button>
                                                
                                                <button 
                                                    onClick={() => { handleRoute('profile-edit'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition cursor-pointer"
                                                >
                                                    <Settings className="w-4 h-4 text-slate-400" />
                                                    <span>Modifier le Profil</span>
                                                </button>

                                                <button 
                                                    onClick={() => { 
                                                        handleRoute(AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance' ? 'tracking' : 'dashboard'); 
                                                        setIsDropdownOpen(false); 
                                                    }} 
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition cursor-pointer"
                                                >
                                                    {AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance' ? (
                                                        <>
                                                            <KanbanSquare className="w-4 h-4 text-slate-400" />
                                                            <span>Suivi Commandes</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                                                            <span>Tableau de Bord</span>
                                                        </>
                                                    )}
                                                </button>
                                                
                                                {(AppState.user?.role === 'entrepreneur' || AppState.user?.role === 'freelance') && (
                                                    <button 
                                                        onClick={() => { handleRoute('publish'); setIsDropdownOpen(false); }} 
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition cursor-pointer"
                                                    >
                                                        <PlusCircle className="w-4 h-4 text-slate-400" />
                                                        <span>Publier un Service</span>
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => { handleRoute('ai'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-950/20 flex items-center space-x-2 transition cursor-pointer"
                                                >
                                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400">Assistant IA</span>
                                                </button>

                                                <button 
                                                    onClick={() => { handleRoute('settings'); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 transition cursor-pointer"
                                                >
                                                    <Settings className="w-4 h-4 text-slate-400" />
                                                    <span>Réglages</span>
                                                </button>
                                            </div>
                                            
                                            <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                                                <button 
                                                    onClick={() => { handleLogout(); setIsDropdownOpen(false); }} 
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2 transition font-medium cursor-pointer"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Se déconnecter</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <button onClick={() => handleRoute('login')} className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-medium">{t('nav_login')}</button>
                                <button onClick={() => handleRoute('register')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm">{t('nav_register')}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
