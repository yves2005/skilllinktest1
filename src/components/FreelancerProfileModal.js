
import { db } from '../services/firebase.js';
import { doc, getDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { AppState, DUMMY_FREELANCES } from '../state.js';

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
                stars += `<i data-lucide="star" class="w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}"></i>`;
            }
            return `<div class="flex gap-0.5">${stars}</div>`;
        };
        
        const avatarImage = data.avatarImage || data.img || data.avatar;
        const coverImage = data.coverImage || data.cover;
        const initials = (data.displayName || data.auteur || 'F').charAt(0).toUpperCase();

        const avatarMarkup = !avatarImage
            ? `<div class="w-24 h-24 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-sm">${initials}</div>`
            : `<img src="${avatarImage}" class="w-24 h-24 rounded-full border-4 border-white object-cover shadow-sm" onerror="this.onerror=null;this.src='https://via.placeholder.com/150'" />`;

        const coverMarkup = !coverImage
            ? `<div class="h-40 w-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>`
            : `<img src="${coverImage}" class="h-40 w-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579546929518-9c39633cc80f?q=80&w=1000&auto=format&fit=crop'" />`;

        content.innerHTML = `
            <div class="relative">
                ${coverMarkup}
                <div class="absolute -bottom-10 left-6">
                    ${avatarMarkup}
                </div>
            </div>
            <div class="mt-12 px-6 pb-8 space-y-6">
                <div>
                    <h3 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        ${data.displayName || data.auteur || 'Freelance'}
                        <span class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            En ligne
                        </span>
                    </h3>
                    <p class="text-indigo-600 font-medium">${data.title || 'Expert'}</p>
                    <div class="flex items-center gap-4 text-sm text-slate-500 mt-2">
                        <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-4 h-4"></i> ${data.location || 'Non spécifiée'}</span>
                        <span class="flex items-center gap-1"><i data-lucide="mail" class="w-4 h-4"></i> ${data.email || 'Non spécifié'}</span>
                        <span class="flex items-center gap-1"><i data-lucide="banknote" class="w-4 h-4"></i> ${data.currency || 'EUR'}</span>
                    </div>
                </div>

                <div class="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <h4 class="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                        <i data-lucide="book-open" class="w-5 h-5"></i> Biographie
                    </h4>
                    <p class="text-slate-700 leading-relaxed">${data.bio || 'Aucune biographie disponible.'}</p>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i data-lucide="award" class="w-5 h-5 text-indigo-600"></i> Compétences
                        </h4>
                        <div class="flex flex-wrap gap-2">
                            ${skillsList.map(skill => `<span class="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-xl text-sm font-medium shadow-sm">${skill}</span>`).join('')}
                        </div>
                    </div>

                    <div>
                        <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i data-lucide="briefcase" class="w-5 h-5 text-indigo-600"></i> Services
                        </h4>
                        <div class="space-y-3">
                            ${(data.services || []).map(s => `<div class="p-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 shadow-sm">${s.title || 'Service'}</div>`).join('') || '<p class="text-slate-500 text-sm">Pas de services disponibles.</p>'}
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="image" class="w-5 h-5 text-indigo-600"></i> Portfolio
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                        ${(data.portfolio || []).map(p => `
                            <div class="relative group cursor-pointer">
                                <img src="${p.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${p.title || 'Portfolio'}" class="w-full h-32 object-cover rounded-2xl">
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-2xl flex items-center justify-center text-white text-sm font-medium p-2 text-center">
                                    ${p.title || 'Projet'}
                                </div>
                            </div>
                        `).join('') || '<p class="text-slate-500 text-sm p-4 border border-dashed rounded-2xl">Pas de portfolio disponible.</p>'}
                    </div>
                </div>

                <div>
                    <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i data-lucide="star" class="w-5 h-5 text-yellow-500"></i> Avis (${(data.reviews || []).length})
                    </h4>
                    <div class="grid gap-4">
                        ${(data.reviews || []).map(r => `
                            <div class="p-6 border border-slate-100 rounded-3xl bg-slate-50 shadow-inner">
                                <div class="flex justify-between items-start mb-3">
                                    <p class="font-bold text-slate-900 text-base">${r.author || 'Client'}</p>
                                    ${renderStars(r.rating || 5)}
                                </div>
                                <p class="text-slate-600 text-sm italic leading-relaxed">"${r.text || ''}"</p>
                            </div>
                        `).join('') || '<p class="text-slate-500 text-sm p-4 border border-dashed rounded-2xl">Pas d\'avis disponibles.</p>'}
                    </div>
                </div>
            </div>
        `;

        
        // Re-render icons
        if (window.lucide) window.lucide.createIcons({ root: content });
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    content.innerHTML = `
        <div class="flex flex-col items-center justify-center p-24 space-y-6">
            <div class="relative">
                <div class="w-16 h-16 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                <div class="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-slate-600 font-medium text-lg animate-pulse tracking-wide">Chargement du profil...</p>
        </div>
    `;

    // Fetch data from Firestore
    try {
        const docSnap = await getDoc(doc(db, 'users', freelanceId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Firestore data for:", freelanceId, data);
            freelance = { id: docSnap.id, ...data };
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
    <div id="freelancer-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] hidden items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div class="flex-shrink-0 flex justify-between items-center px-6 py-4 border-b">
                <h2 class="text-xl font-bold text-slate-800">Profil Freelance</h2>
                <button onclick="window.closeFreelancerProfileModal()" class="text-slate-400 hover:text-slate-600 transition">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            <div id="freelancer-modal-content" class="overflow-y-auto p-0">
                <!-- Content injected dynamically -->
            </div>
        </div>
    </div>
    `;
};
