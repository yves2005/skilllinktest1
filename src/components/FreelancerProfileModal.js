import { db } from '../services/firebase.js';
import { doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { AppState, DUMMY_FREELANCES } from '../state.js';
import { showPortfolioViewerModal } from './PortfolioViewerModal.js';
import { renderPortfolioCard } from './PortfolioCard.js';

export const closeFreelancerProfileModal = () => {
    const modal = document.getElementById('freelancer-modal');
    if (modal) modal.classList.add('hidden');
};

export const openFreelancerProfileModal = async (freelanceId) => {
    const modal = document.getElementById('freelancer-modal');
    const content = document.getElementById('freelancer-modal-content');
    if (!modal || !content) return;
    
    // Find freelance in dummy
    let freelance = DUMMY_FREELANCES.find(f => f.id === freelanceId || f.uid === freelanceId);
    
    if (freelance) {
        freelance.services = freelance.services || [];
        freelance.reviews = freelance.reviews || [];
        freelance.portfolio = freelance.portfolio || [];
    }

    const renderContent = (data) => {
        const skillsList = Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()) : []);
        
        const renderStars = (rating) => {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<i data-lucide="star" class="w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}"></i>`;
            }
            return `<div class="flex gap-0.5">${stars}</div>`;
        };
        
        const avatarImage = data.avatarImage || data.img || data.avatar;
        const coverImage = data.coverImage || data.cover;
        const initials = (data.displayName || data.auteur || 'F').charAt(0).toUpperCase();

        const avatarMarkup = !avatarImage
            ? `<div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">${initials}</div>`
            : `<img src="${avatarImage}" loading="lazy" class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-md" onerror="this.onerror=null;this.src='https://via.placeholder.com/150'" />`;

        const coverMarkup = !coverImage
            ? `<div class="h-40 sm:h-48 w-full bg-gradient-to-r from-indigo-500/80 to-purple-600/80"></div>`
            : `<img src="${coverImage}" loading="lazy" class="h-40 sm:h-48 w-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579546929518-9c39633cc80f?q=80&w=1000&auto=format&fit=crop'" />`;

        content.innerHTML = `
            <div class="relative">
                ${coverMarkup}
                <div class="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-10 hover:scale-105 transition-transform duration-300">
                    ${avatarMarkup}
                </div>
            </div>
            <div class="mt-14 sm:mt-16 px-6 sm:px-10 pb-10 space-y-8">
                <div>
                    <div class="flex flex-wrap items-center gap-3 mb-2">
                        <h3 class="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            ${data.displayName || data.auteur || 'Freelance'}
                        </h3>
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 text-[11px] font-bold border border-emerald-100/50 shadow-sm">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            En ligne
                        </span>
                    </div>
                    <p class="text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wide mb-4">${data.title || 'Expert'}</p>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm font-semibold"><i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i> ${data.location || 'Remote'}</span>
                        <span class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm font-semibold"><i data-lucide="mail" class="w-4 h-4 text-slate-400"></i> ${data.email || 'Non spécifié'}</span>
                        <span class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm font-semibold"><i data-lucide="banknote" class="w-4 h-4 text-slate-400"></i> ${data.currency || 'EUR'}</span>
                    </div>
                </div>

                <div class="bg-indigo-50/40 dark:bg-indigo-900/10 p-5 sm:p-6 rounded-3xl border border-indigo-100/60 dark:border-indigo-800/30">
                    <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <div class="p-1.5 bg-indigo-100 dark:bg-indigo-800/50 rounded-xl text-indigo-600 dark:text-indigo-400"><i data-lucide="user" class="w-4 h-4"></i></div>
                        À propos
                    </h4>
                    <p class="text-slate-600 dark:text-slate-350 text-[13px] leading-relaxed font-medium">${data.bio || 'Aucune biographie disponible.'}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-50/50 dark:bg-slate-800/20 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition duration-300">
                        <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <div class="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400"><i data-lucide="check-circle-2" class="w-4 h-4"></i></div>
                            Compétences
                        </h4>
                        <div class="flex flex-wrap gap-2">
                            ${skillsList.map(skill => `<span class="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-shadow">${skill}</span>`).join('') || '<p class="text-slate-400 text-xs italic font-medium">Aucune compétence.</p>'}
                        </div>
                    </div>

                    <div class="bg-slate-50/50 dark:bg-slate-800/20 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition duration-300">
                        <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <div class="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-xl text-purple-600 dark:text-purple-400"><i data-lucide="briefcase" class="w-4 h-4"></i></div>
                            Services (${(data.services || []).length})
                        </h4>
                        <div class="space-y-2.5">
                            ${(data.services || []).map(s => `
                                <div class="px-3.5 py-3 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                                    <div class="flex items-center gap-2.5 truncate">
                                        <div class="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"></div>
                                        <span class="truncate">${s.title || 'Service'}</span>
                                    </div>
                                    <i data-lucide="arrow-right" class="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all"></i>
                                </div>
                            `).join('') || '<p class="text-slate-400 text-xs mt-1 italic font-medium">Pas de services publiés.</p>'}
                        </div>
                    </div>
                </div>
                
                <div class="pt-2">
                    <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <div class="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400"><i data-lucide="image" class="w-4 h-4"></i></div>
                        Portfolio
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        ${(data.portfolio || []).map(p => {
                            const project = typeof p === 'string' ? {
                                id: 'p_' + Math.random().toString(36).substr(2, 9),
                                title: 'Projet',
                                category: 'Réalisation',
                                imageUrl: p,
                                description: '',
                                skills: []
                            } : p;
                            return renderPortfolioCard(project, false);
                        }).join('') || '<p class="text-slate-400 text-xs py-8 px-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-center flex flex-col items-center gap-2 bg-slate-50/50 dark:bg-slate-800/10 col-span-full font-medium"><i data-lucide="image" class="w-8 h-8 opacity-20"></i> Aucun portfolio disponible.</p>'}
                    </div>
                </div>

                <div class="pt-2 pb-6">
                    <h4 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <div class="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400"><i data-lucide="star" class="w-4 h-4 fill-amber-500/20 text-amber-500"></i></div>
                        Avis vérifiés (${(data.reviews || []).length})
                    </h4>
                    <div class="grid gap-4">
                        ${(data.reviews || []).map(r => `
                            <div class="p-5 border border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 hover:bg-white dark:hover:bg-slate-800/40 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 group flex flex-col gap-3">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-extrabold text-sm shadow-sm border border-slate-100 dark:border-slate-600">
                                            ${(r.author || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-800 dark:text-slate-200 text-sm leading-none mb-1.5">${r.author || 'Client'}</p>
                                            <p class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">${r.date || "Récemment"}</p>
                                        </div>
                                    </div>
                                    <div class="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100/50 dark:border-amber-900/40">
                                        ${renderStars(r.rating || 5)}
                                    </div>
                                </div>
                                <p class="text-slate-600 dark:text-slate-350 text-[13px] italic leading-relaxed break-words [word-break:break-word] mt-1 pl-1 font-medium">"${r.text || ''}"</p>
                                
                                ${(r.videoUrl && r.videoUrl.trim() !== '' && r.videoUrl !== 'undefined') ? `
                                    ${(r.videoUrl.includes('youtube.com/watch?v=') || r.videoUrl.includes('youtu.be/')) ? `
                                        <div class="mt-1.5 rounded-xl overflow-hidden shadow-sm aspect-video border border-slate-100 dark:border-slate-800">
                                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${r.videoUrl.includes('youtube.com/watch?v=') ? r.videoUrl.split('v=')[1].split('&')[0] : r.videoUrl.split('youtu.be/')[1].split('?')[0]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                        </div>
                                    ` : `
                                        <div class="mt-1.5 rounded-xl overflow-hidden shadow-sm aspect-video border border-slate-100 dark:border-slate-800 bg-slate-900">
                                            <video src="${r.videoUrl}" class="w-full h-full object-cover" controls preload="metadata"></video>
                                        </div>
                                    `}
                                ` : ''}

                                ${(AppState.user && (AppState.user.uid === data.id || AppState.user.uid === r.authorId)) ? `
                                    <div class="flex gap-2 mt-2 pt-3 border-t border-slate-100/80 dark:border-slate-700/50 justify-end transition-opacity">
                                        ${(AppState.user.uid === data.id) ? `
                                            <button onclick="window.deleteReview('${data.id}', '${r.id}', '${AppState.escapeHtml(r.author)}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-[10px] font-bold border border-red-100/50 dark:border-red-900/30 cursor-pointer shadow-sm">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Supprimer
                                            </button>
                                        ` : ''}
                                        ${(AppState.user.uid !== r.authorId && r.authorId !== 'anonymous') ? `
                                            <button onclick="window.contactReviewer('${r.authorId}', '${AppState.escapeHtml(r.author)}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-[10px] font-bold border border-indigo-100/50 dark:border-indigo-900/30 cursor-pointer shadow-sm">
                                                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i> Contacter
                                            </button>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('') || '<div class="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700"><div class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-3"><i data-lucide="star" class="w-5 h-5 text-slate-300 dark:text-slate-500"></i></div><p class="text-slate-500 font-bold text-sm">Pas d\'avis disponibles.</p></div>'}
                    </div>
                </div>
            </div>
        `;

        // Bind click on freelance portfolio items to show detailed modal
        modal.querySelectorAll('.freelance-portfolio-item').forEach(item => {
            item.addEventListener('click', () => {
                const projId = item.getAttribute('data-id');
                const pItem = (data.portfolio || []).map(p => {
                    return typeof p === 'string' ? {
                        id: 'p_' + Math.random().toString(36).substr(2, 9),
                        title: 'Projet',
                        category: 'Réalisation',
                        imageUrl: p,
                        description: '',
                        skills: []
                    } : p;
                }).find(p => p.id === projId);

                if (!pItem) return;
                
                if (item.querySelector('.portfolio-loader-overlay')) return;
                
                const loaderHtml = `<div class="absolute inset-0 bg-white/50 dark:bg-slate-950/50 flex items-center justify-center backdrop-blur-sm z-30 portfolio-loader-overlay rounded-3xl"><i data-lucide="loader-2" class="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin drop-shadow-sm"></i></div>`;
                item.insertAdjacentHTML('beforeend', loaderHtml);
                if (window.lucide) window.lucide.createIcons({ root: item });

                const imgSrc = pItem.imageUrl || pItem.image || 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80';
                
                const img = new Image();
                
                const handleImageReady = () => {
                    const overlay = item.querySelector('.portfolio-loader-overlay');
                    if (overlay) overlay.remove();

                    showPortfolioViewerModal(pItem, false);
                };

                img.onload = handleImageReady;
                img.onerror = () => {
                    handleImageReady();
                };
                img.src = imgSrc;
            });
        });

        // Re-render icons
        if (window.lucide) window.lucide.createIcons({ root: modal });
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    content.innerHTML = `
        <div class="flex flex-col items-center justify-center p-20 space-y-4">
            <div class="relative">
                <div class="w-12 h-12 border-4 border-indigo-100/50 rounded-full animate-pulse"></div>
                <div class="absolute inset-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-slate-500 font-semibold text-sm animate-pulse tracking-wide">Chargement du profil...</p>
        </div>
    `;

    // Fetch data from Firestore
    try {
        const docSnap = await getDoc(doc(db, 'users', freelanceId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Firestore data for:", freelanceId, data);
            freelance = { id: docSnap.id, ...data };
            
            // Notify the user that their profile was viewed
            if (AppState.user && AppState.user.uid !== freelanceId) {
                const viewerName = AppState.user.displayName || AppState.user.nom || "Un utilisateur";
                setTimeout(() => {
                    AppState.createNotification(
                        freelanceId,
                        'info',
                        'Profil visité 👀',
                        `${viewerName} a consulté votre profil.`
                    ).catch(e => console.error("Could not notify profile view", e));
                }, 100);
            }
        }

        // Fetch reviews & services
        const [reviewsSnap, servicesSnap] = await Promise.all([
            getDocs(query(collection(db, `users/${freelanceId}/reviews`), orderBy('createdAt', 'desc'))),
            getDocs(query(collection(db, 'services'), where('authorId', '==', freelanceId)))
        ]);
        
        freelance.reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        freelance.services = servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderContent(freelance);
    } catch (e) {
        console.error("Fetch error:", e);
        if (freelance) {
            renderContent(freelance);
        } else {
            content.innerHTML = '<p class="p-6 text-center text-slate-500">Freelance introuvable.</p>';
        }
    }
};

export const FreelancerProfileModal = () => {
    return `
    <div id="freelancer-modal" class="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-[200] hidden items-center justify-center p-4 sm:p-6 transition-all duration-300">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative border border-slate-100 dark:border-slate-800 scale-95 origin-center animate-in zoom-in-95 duration-200">
            <!-- Absolute Floating Close Button -->
            <button onclick="window.closeFreelancerProfileModal()" class="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 p-2 sm:p-2.5 rounded-full border border-slate-200/50 dark:border-slate-700 shadow-sm transition-all hover:scale-110 hover:shadow-md cursor-pointer flex items-center justify-center">
                <i data-lucide="x" class="w-4 h-4 sm:w-5 sm:h-5"></i>
            </button>
            <div id="freelancer-modal-content" class="overflow-y-auto p-0 hide-scrollbar">
                <!-- Content injected dynamically -->
            </div>
        </div>
    </div>
    `;
};
