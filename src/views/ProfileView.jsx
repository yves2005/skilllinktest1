import { DUMMY_SERVICES, AppState } from '../state.js';
import { ServiceCard } from '../components/ServiceCard.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProfileChartsWrapper } from '../components/ProfileChartsWrapper.jsx';
import { BookingCalendar } from '../components/BookingCalendar.jsx';
import { db } from '../services/firebase.js';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const renderProfileViewBadges = (profileData) => {
    // Determine average rating from reviews if present, otherwise default to 5
    const reviews = profileData.reviews || [];
    const reviewsCount = reviews.length;
    const ratingSum = reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    const rating = reviewsCount > 0 ? (ratingSum / reviewsCount) : 5.0;
    
    // Determine completed projects from stats or portfolio list
    let completedProjects = (profileData.portfolio || []).length;
    if (profileData.stats) {
        const completedStat = profileData.stats.find(s => s.label === "Projets réussis" || s.label === "Projets");
        if (completedStat) {
            completedProjects = Math.max(completedProjects, parseInt(completedStat.value, 10) || 0);
        }
    }
    
    const badges = [];
    
    // Top Rated badge criteria: Rating >= 4.8 and at least some completed projects or reviews
    if (rating >= 4.8 && (reviewsCount >= 2 || completedProjects >= 1)) {
        badges.push({
            id: 'top-rated',
            label: 'Top Rated',
            icon: 'award',
            bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
            desc: "Expert exceptionnel avec des notes prestigieuses (> 4.8/5) et des réalisations vérifiées."
        });
    } else if (rating >= 4.5) {
        badges.push({
            id: 'recommanded',
            label: 'Très Recommandé',
            icon: 'thumbs-up',
            bgColor: 'bg-indigo-50 text-indigo-700 border-indigo-150',
            desc: "Très bien noté pour son professionnalisme et ses travaux de qualité."
        });
    }
    
    // Expert / Trusted depending on completion count
    if (completedProjects >= 5 || reviewsCount >= 5) {
        badges.push({
            id: 'expert',
            label: 'Expert Élite',
            icon: 'shield-check',
            bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            desc: "Profil certifié ayant réalisé un grand nombre de missions réussies."
        });
    } else if (completedProjects >= 1 || reviewsCount >= 1) {
        badges.push({
            id: 'trusted',
            label: 'Membre Vérifié',
            icon: 'check-circle',
            bgColor: 'bg-blue-50 text-blue-700 border-blue-150',
            desc: "Compétences professionnelles vérifiées avec portfolio de projets à l'appui."
        });
    }
    
    if (badges.length === 0) return '';
    
    return `
        <div class="flex flex-wrap gap-2 mt-2">
            ${badges.map(b => `
                <div class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl ${b.bgColor} border shadow-sm cursor-help relative group" title="${b.desc}">
                    <i data-lucide="${b.icon}" class="w-3.5 h-3.5"></i>
                    ${b.label}
                    <!-- Tooltip -->
                    <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-900 text-white rounded-lg text-[10px] font-normal normal-case leading-normal tracking-normal text-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 duration-200">
                        ${b.desc}
                        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

export const ProfileView = {
    render: () => {
        const profileData = AppState.profileData;
        return `
        <div id="profile-export-container" class="max-w-4xl mx-auto mt-4 pb-12">
            <!-- Navigation Rapide -->
            <div class="flex justify-center gap-4 mb-8 pb-4 border-b border-slate-200">
                <button data-route="marketplace" class="flex items-center text-slate-500 hover:text-indigo-600 transition font-bold text-sm">
                    <i data-lucide="search" class="w-4 h-4 mr-1.5"></i> Explorer
                </button>
                <div class="w-px h-5 bg-slate-300"></div>
                <button data-route="ai" class="flex items-center text-slate-500 hover:text-indigo-600 transition font-bold text-sm">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-1.5"></i> Assistant IA
                </button>
            </div>

            <!-- Profil Entete -->
            <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
                <div id="profile-cover" class="h-36 ${AppState.profileData.coverImage ? 'bg-cover bg-center' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'} relative" ${AppState.profileData.coverImage ? `style="background-image: url(${AppState.profileData.coverImage})"` : ''}>
                    <button data-action="back" class="absolute top-4 left-4 bg-black/20 hover:bg-black/30 text-white backdrop-blur px-2 py-2 rounded-full text-sm font-medium transition cursor-pointer flex items-center shadow-sm">
                        <i data-lucide="arrow-left" class="w-5 h-5"></i>
                    </button>
                    ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                    <div class="absolute top-4 right-4 flex gap-2">
                        <button id="change-cover-btn" class="bg-white/20 hover:bg-white/30 text-white backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center shadow-sm">
                            <i data-lucide="camera" class="w-4 h-4 mr-1.5"></i> Changer
                        </button>
                        ${AppState.profileData.coverImage ? `
                        <button id="btn-delete-cover" class="bg-red-500/20 hover:bg-red-500/30 text-white backdrop-blur px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer flex items-center shadow-sm">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                        ` : ''}
                    </div>
                    <input type="file" id="cover-upload-input" class="hidden" accept="image/*">
                    ` : ''}
                </div>
                <div class="px-8 pb-8 relative">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-12 mb-4 gap-4">
                        <div class="w-24 h-24 bg-white rounded-full p-1 shadow-md mb-2 sm:mb-0 relative">
                            <div id="profile-avatar" class="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-3xl overflow-hidden border border-indigo-50 relative ${AppState.profileData.avatarImage ? 'bg-cover bg-center' : ''}" ${AppState.profileData.avatarImage ? `style="background-image: url(${AppState.profileData.avatarImage}); color: transparent;"` : ''}>
                                ${!AppState.profileData.avatarImage ? AppState.profileData.displayName.charAt(0).toUpperCase() : ''}
                                ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                                <!-- Hover to Upload/Delete Avatar trigger -->
                                <div id="avatar-overlay" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center text-white cursor-pointer z-10 gap-1" title="Gérer la photo de profil">
                                    <button id="avatar-click-trigger" class="flex flex-col items-center font-sans tracking-wide">
                                        <i data-lucide="camera" class="w-5 h-5 mb-0.5 transform group-hover:scale-110 transition-transform"></i>
                                        <span class="text-[8px] font-bold uppercase">Modifier</span>
                                    </button>
                                    ${AppState.profileData.avatarImage ? `
                                        <button id="btn-delete-avatar" class="flex flex-col items-center text-red-300 hover:text-red-100 font-sans tracking-wide">
                                            <i data-lucide="trash-2" class="w-5 h-5 mb-0.5"></i>
                                            <span class="text-[8px] font-bold uppercase">Supprimer</span>
                                        </button>
                                    ` : ''}
                                </div>
                                <input type="file" id="avatar-direct-upload-input" class="hidden" accept="image/*">
                                ` : ''}
                            </div>
                            ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                            <button id="toggle-availability" class="absolute bottom-0 right-0 w-6 h-6 border-2 border-white rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm ${AppState.profileData.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}" title="${AppState.profileData.isAvailable ? 'Disponible' : 'Indisponible'}">
                            </button>
                            ` : `
                            <div class="absolute bottom-0 right-0 w-6 h-6 border-2 border-white rounded-full flex items-center justify-center shadow-sm ${AppState.profileData.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}" title="${AppState.profileData.isAvailable ? 'Disponible' : 'Indisponible'}">
                            </div>
                            `}
                        </div>
                        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button id="btn-export-pdf" class="flex-1 sm:flex-none border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center">
                                <i data-lucide="download" class="w-4 h-4 mr-2"></i> Exporter en PDF
                            </button>
                            ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                            <button id="btn-edit-profile" class="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center border border-slate-200">
                                <i data-lucide="edit-3" class="w-4 h-4 mr-2"></i> Modifier mon profil
                            </button>
                            ` : `
                            <button data-route="messaging" class="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center">
                                <i data-lucide="message-square" class="w-4 h-4 mr-2"></i> Contacter
                            </button>
                            `}
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">${AppState.profileData.displayName}</h2>
                        <span id="availability-badge" class="px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${AppState.profileData.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}">
                            ${AppState.profileData.isAvailable ? 'Disponible' : 'Indisponible'}
                        </span>
                    </div>
                    ${renderProfileViewBadges(AppState.profileData)}
                    <p class="text-slate-500 font-medium text-lg mt-1">${AppState.profileData.title}</p>
                    
                    <p class="mt-4 text-slate-600 leading-relaxed text-sm max-w-2xl bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                        ${AppState.profileData.bio}
                    </p>

                    <!-- Stats -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 border-y border-slate-100 py-6">
                        ${AppState.profileData.stats.map(s => `
                            <div class="text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-${s.color}-50 flex items-center justify-center text-${s.color}-600">
                                    <i data-lucide="${s.icon}" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <p class="text-2xl font-bold text-slate-900 leading-tight">${s.value}</p>
                                    <p class="text-[11px] uppercase font-bold text-slate-400 tracking-wider">${s.label}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Chart Container -->
                    <div id="profile-chart-container"></div>
                    
                    <!-- Booking Calendar Container -->
                    <div id="booking-calendar-container"></div>

                    <div class="flex flex-wrap items-center mt-6 text-sm text-slate-600 gap-y-3 gap-x-4">
                        <span class="flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm font-medium"><i data-lucide="map-pin" class="w-4 h-4 mr-1.5 text-slate-400"></i> ${AppState.profileData.location}</span>
                        <span class="flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm font-medium"><i data-lucide="wallet" class="w-4 h-4 mr-1.5 text-slate-400"></i> ${AppState.profileData.tjm}€ / jour</span>
                        <span class="flex items-center text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm"><i data-lucide="star" class="w-4 h-4 mr-1.5 fill-current"></i> 4.9 (42 Avis)</span>
                    </div>
                    
                    <!-- Skills -->
                    <div class="mt-6">
                        <h4 class="text-xs uppercase font-bold text-slate-400 tracking-widest mb-3">Compétences</h4>
                        <div class="flex flex-wrap gap-2 items-center" id="skills-container">
                            ${AppState.profileData.skills.map(skill => {
                                const isOwner = AppState.user && AppState.user.uid === AppState.profileData.id;
                                if (isOwner) {
                                    return `
                                        <span class="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shadow-sm flex items-center group cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-colors" title="Cliquer pour supprimer" data-skill="${skill}">
                                            ${skill} <i data-lucide="x" class="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </span>
                                    `;
                                } else {
                                    return `
                                        <span class="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shadow-sm flex items-center" data-skill="${skill}">
                                            ${skill}
                                        </span>
                                    `;
                                }
                            }).join('')}
                            ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                            <div class="relative ml-1">
                                <button id="btn-add-skill" class="text-xs font-bold px-2 py-1 flex items-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100">
                                    <i data-lucide="plus" class="w-4 h-4 mr-1"></i> Ajouter
                                </button>
                                <div id="add-skill-form" class="hidden absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex gap-2 z-10 w-48">
                                    <input type="text" id="new-skill-input" placeholder="Ex: Node.js" class="w-full text-xs px-2 py-1 border border-slate-200 rounded outline-none focus:border-indigo-500">
                                    <button id="confirm-add-skill" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded p-1"><i data-lucide="check" class="w-3 h-3"></i></button>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Portfolio -->
            <div class="mt-10">
                <div class="flex justify-between items-center mb-5">
                    <h3 class="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                        <i data-lucide="image" class="w-5 h-5 mr-2 text-indigo-600"></i> Portfolio
                    </h3>
                    ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                    <div>
                        <button id="btn-upload-portfolio" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-md shadow-indigo-650/10 text-sm flex items-center border border-transparent cursor-pointer">
                            <i data-lucide="plus-circle" class="w-4 h-4 mr-2"></i> Ajouter au portfolio
                        </button>
                    </div>
                    ` : ''}
                </div>
                <div id="portfolio-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${(profileData.portfolio || []).map(p => `
                        <div class="group relative aspect-[4/3] bg-slate-100 rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 portfolio-item" data-id="${p.id}">
                            <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            
                            <!-- Overlay on hover styling -->
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col justify-end p-5">
                                <span class="text-indigo-400 text-[10px] font-bold tracking-wider uppercase mb-1">${p.category}</span>
                                <h4 class="text-white font-extrabold text-base tracking-tight mb-1">${p.title}</h4>
                                <p class="text-slate-300 text-xs line-clamp-2 mb-3 leading-relaxed">${p.description}</p>
                                ${p.skills && p.skills.length > 0 ? `
                                <div class="flex flex-wrap gap-1.5 mb-3">
                                    ${p.skills.map(skill => `<span class="bg-indigo-500/30 border border-indigo-400/50 text-white px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold pointer-events-auto hover:bg-indigo-500/60 skill-tag transition cursor-pointer" data-skill="${skill}">${skill}</span>`).join('')}
                                </div>
                                ` : ''}
                                <div class="flex items-center text-xs font-bold text-white group/btn mt-auto">
                                    <span>Voir le projet</span>
                                    <i data-lucide="arrow-right" class="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1"></i>
                                </div>
                            </div>
                            
                            <!-- Static overlay badge displaying title directly when not hovered -->
                            <div class="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm transition-opacity duration-300 group-hover:opacity-0 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                                <span class="text-[11px] font-bold text-slate-800 tracking-tight">${p.title}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <!-- Avis & Recommandations -->
            <div class="mt-10">
                <h3 class="text-xl font-bold text-slate-900 mb-5 flex items-center tracking-tight">
                    <i data-lucide="message-square-heart" class="w-5 h-5 mr-2 text-pink-500"></i> Avis & Recommandations
                </h3>
                ${(AppState.user && AppState.user.uid !== AppState.profileData.id) ? `
                <button onclick="window.openAddReviewModal('${AppState.profileData.id}', '${AppState.profileData.displayName}')" class="mb-4 text-indigo-600 text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline">
                    <i data-lucide="plus" class="w-4 h-4"></i> Ajouter un avis
                </button>
                ` : ''}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    ${AppState.profileData.reviews.map(r => `
                        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4 class="font-bold text-slate-900 text-sm">${AppState.escapeHtml(r.author)}</h4>
                                    <p class="text-xs text-slate-400">${r.date}</p>
                                </div>
                                <div class="flex">
                                    ${Array(5).fill(0).map((_, i) => `<i data-lucide="star" class="w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-slate-200'}"></i>`).join('')}
                                </div>
                            </div>
                            <p class="text-sm text-slate-600 font-medium italic">"${AppState.escapeHtml(r.text)}"</p>
                            ${(AppState.user && (AppState.user.uid === AppState.profileData.id || AppState.user.uid === r.authorId)) ? `
                                <div class="flex gap-2 mt-3 pt-3 border-t border-slate-50 justify-end">
                                    ${(AppState.user.uid === AppState.profileData.id) ? `
                                        <button onclick="window.deleteReview('${AppState.profileData.id}', '${r.id}')" class="text-xs font-bold text-red-500 hover:underline">Supprimer</button>
                                    ` : ''}
                                    ${(AppState.user.uid !== r.authorId && r.authorId !== 'anonymous') ? `
                                        <button onclick="window.contactReviewer('${r.authorId}')" class="text-xs font-bold text-indigo-600 hover:underline">Contacter</button>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Missions -->
            <div class="mt-10">
                <h3 class="text-xl font-bold text-slate-900 mb-5 flex items-center tracking-tight">
                    <i data-lucide="briefcase" class="w-5 h-5 mr-2 text-indigo-600"></i> Mes publications
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="my-publications-grid">
                    <!-- Publications will be rendered here -->
                </div>
            </div>
        </div>
    `;
    },

    attachEvents: () => {
        const profileData = AppState.profileData;

        // Setup real-time listener for current user/freelance reviews
        if (profileData && profileData.id && !window.activeProfileTeardown) {
            const q = query(collection(db, `users/${profileData.id}/reviews`), orderBy('createdAt', 'desc'));
            window.activeProfileTeardown = onSnapshot(q, (snapshot) => {
                console.log("Snapshot received for profile reviews:", snapshot.size);
                const fetchedReviews = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    console.log("Review data:", data);
                    const dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    }) : "À l'instant";
                    fetchedReviews.push({
                        id: docSnap.id,
                        author: data.author || "Client",
                        date: dateStr,
                        text: data.text || "",
                        rating: data.rating || 5,
                        authorId: data.authorId || 'anonymous'
                    });
                });
                
                // Just use the fetched reviews
                let finalReviews = [...fetchedReviews];
                
                // Only notify if there's a difference to avoid loop
                const currentReviewTexts = (AppState.profileData.reviews || []).map(r => r.text).join('|');
                const newReviewTexts = finalReviews.map(r => r.text).join('|');
                if (currentReviewTexts !== newReviewTexts) {
                    AppState.profileData.reviews = finalReviews;
                    AppState.notify();
                }
            }, (error) => {
                console.warn("Failed to listen to profile reviews:", error);
            });
        }
        
        // Export PDF
        const btnExportPdf = document.getElementById('btn-export-pdf');
        if (btnExportPdf) {
            btnExportPdf.addEventListener('click', () => {
                const element = document.getElementById('profile-export-container');
                
                // Temporarily hide elements not meant for PDF
                const btnContainer = btnExportPdf.parentElement;
                const toggleAvail = document.getElementById('toggle-availability');
                const changeCover = document.getElementById('change-cover-btn');
                const backBtn = document.querySelector('[data-action="back"]');
                const profileActions = document.querySelectorAll('#btn-edit-profile');
                const quickNav = element.querySelector('.flex.justify-center.gap-4.mb-8.pb-4.border-b');
                
                if(btnContainer) btnContainer.style.display = 'none';
                if(toggleAvail) toggleAvail.style.display = 'none';
                if(changeCover) changeCover.style.display = 'none';
                if(backBtn) backBtn.style.display = 'none';
                if(quickNav) quickNav.style.display = 'none';
                profileActions.forEach(el => el.style.display = 'none');
                
                // Temporarily switch to light mode for printing
                const isDark = document.documentElement.classList.contains('dark');
                if (isDark) document.documentElement.classList.remove('dark');
                
                // Add specific printable stylings if needed
                element.style.backgroundColor = '#ffffff';

                const opt = {
                  margin:       10,
                  filename:     `CV_${(profileData.displayName || profileData.name || 'freelance').replace(/\s+/g, '_').toLowerCase()}.pdf`,
                  image:        { type: 'jpeg', quality: 0.98 },
                  html2canvas:  { scale: 2, useCORS: true, logging: false },
                  jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                  pagebreak:    { mode: ['css', 'legacy'] }
                };
                
                window.html2pdf().set(opt).from(element).save().then(() => {
                    // Restore original state
                    if (isDark) document.documentElement.classList.add('dark');
                    element.style.backgroundColor = '';
                    
                    if(btnContainer) btnContainer.style.display = 'flex';
                    if(toggleAvail) toggleAvail.style.display = 'flex';
                    if(changeCover) changeCover.style.display = 'flex';
                    if(backBtn) backBtn.style.display = 'flex';
                    if(quickNav) quickNav.style.display = 'flex';
                    profileActions.forEach(el => el.style.display = 'flex');
                });
            });
        }

        // Toggle availability
        const btnToggleAvailability = document.getElementById('toggle-availability');
        const badgeAvailability = document.getElementById('availability-badge');
        const changeCoverBtn = document.getElementById('change-cover-btn');
        const coverInput = document.getElementById('cover-upload-input');
        const profileCover = document.getElementById('profile-cover');

        // Edit Profile logic
        const btnEditProfile = document.getElementById('btn-edit-profile');
        if (btnEditProfile) {
            btnEditProfile.addEventListener('click', () => {
                const modalHtml = `
                    <div id="edit-profile-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-enter overflow-y-auto w-full h-full">
                        <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl m-auto">
                            <h3 class="text-xl font-bold text-slate-900 mb-4">Modifier mon profil</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-1">Photo de profil</label>
                                    <div class="flex items-center gap-3">
                                        <div id="edit-avatar-preview" class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg border border-indigo-50 ${profileData.avatarImage ? 'bg-cover bg-center text-transparent' : ''}" style="${profileData.avatarImage ? `background-image: url(${profileData.avatarImage}); color: transparent;` : ''}">
                                            ${!profileData.avatarImage ? profileData.displayName.charAt(0).toUpperCase() : ''}
                                        </div>
                                        <input type="file" id="edit-profile-avatar-input" accept="image/*" class="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                                        <button id="edit-profile-clear-avatar" class="${profileData.avatarImage ? 'block' : 'hidden'} text-xs text-red-500 font-bold hover:underline">Supprimer</button>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-bold text-slate-700 mb-1">Nom</label>
                                        <input type="text" id="edit-profile-name" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value="${profileData.displayName}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-bold text-slate-700 mb-1">Titre professionnel</label>
                                        <input type="text" id="edit-profile-title" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value="${profileData.title}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-bold text-slate-700 mb-1">Localisation</label>
                                        <input type="text" id="edit-profile-location" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value="${profileData.location}">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-bold text-slate-700 mb-1">TJM (€)</label>
                                        <input type="number" id="edit-profile-tjm" min="1" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors" value="${profileData.tjm}">
                                        <p id="error-profile-tjm" class="text-xs text-red-500 mt-1 hidden"></p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                                    <textarea id="edit-profile-bio" rows="4" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-colors" placeholder="Décrivez votre expérience (min 30 caractères)">${profileData.bio}</textarea>
                                    <p id="error-profile-bio" class="text-xs text-red-500 mt-1 hidden"></p>
                                </div>

                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-1">Services proposés (Compétences)</label>
                                    <input type="text" id="edit-profile-skills" class="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" value="${profileData.skills.join(', ')}">
                                    <p class="text-xs text-slate-500 mt-1">Séparez les compétences par des virgules (ex: React, Node.js, Design)</p>
                                </div>
                            </div>
                            
                            <div class="mt-6 flex justify-end gap-3">
                                <button id="edit-profile-cancel" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition">Annuler</button>
                                <button id="edit-profile-save" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm">Enregistrer</button>
                            </div>
                        </div>
                    </div>
                `;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = modalHtml;
                document.body.appendChild(tempDiv.firstElementChild);
                
                const modal = document.getElementById('edit-profile-modal');
                let newAvatarDataUrl = profileData.avatarImage;
                
                const avatarInput = document.getElementById('edit-profile-avatar-input');
                const avatarPreview = document.getElementById('edit-avatar-preview');
                const btnClearAvatar = document.getElementById('edit-profile-clear-avatar');
                
                avatarInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            avatarPreview.innerHTML = `<i data-lucide="loader" class="w-6 h-6 animate-spin text-indigo-600"></i>`;
                            if (window.lucide) window.lucide.createIcons({ root: avatarPreview });
                            
                            const formData = new FormData();
                            formData.append('file', file);
                            
                            const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            
                            if (!response.ok) throw new Error('Un problème est survenu lors du téléversement.');
                            const resultData = await response.json();
                            
                            newAvatarDataUrl = resultData.url;
                            avatarPreview.style.backgroundImage = `url(${newAvatarDataUrl})`;
                            avatarPreview.style.color = 'transparent';
                            avatarPreview.classList.add('bg-cover', 'bg-center');
                            avatarPreview.innerHTML = '';
                            btnClearAvatar.classList.remove('hidden');
                        } catch (err) {
                            console.error('Error uploading avatar:', err);
                            alert('Erreur lors du téléversement de la photo de profil : ' + err.message);
                            avatarPreview.innerHTML = !newAvatarDataUrl ? profileData.displayName.charAt(0).toUpperCase() : '';
                        }
                    }
                });
                
                btnClearAvatar.addEventListener('click', () => {
                    newAvatarDataUrl = null;
                    avatarInput.value = '';
                    avatarPreview.style.backgroundImage = '';
                    avatarPreview.style.color = '';
                    avatarPreview.classList.remove('bg-cover', 'bg-center');
                    avatarPreview.innerHTML = profileData.displayName.charAt(0).toUpperCase();
                    btnClearAvatar.classList.add('hidden');
                });
                
                document.getElementById('edit-profile-cancel').addEventListener('click', () => modal.remove());
                document.getElementById('edit-profile-save').addEventListener('click', () => {
                    const nameInput = document.getElementById('edit-profile-name');
                    const titleInput = document.getElementById('edit-profile-title');
                    const locationInput = document.getElementById('edit-profile-location');
                    const tjmInput = document.getElementById('edit-profile-tjm');
                    const bioInput = document.getElementById('edit-profile-bio');
                    const skillsInput = document.getElementById('edit-profile-skills');

                    let isValid = true;

                    // Bio validation
                    if (bioInput.value.trim().length < 30) {
                        bioInput.classList.remove('border-slate-200', 'focus:border-indigo-500');
                        bioInput.classList.add('border-red-500', 'focus:border-red-500', 'bg-red-50');
                        document.getElementById('error-profile-bio').textContent = 'La bio doit contenir au moins 30 caractères.';
                        document.getElementById('error-profile-bio').classList.remove('hidden');
                        isValid = false;
                    } else {
                        bioInput.classList.add('border-slate-200', 'focus:border-indigo-500');
                        bioInput.classList.remove('border-red-500', 'focus:border-red-500', 'bg-red-50');
                        document.getElementById('error-profile-bio').classList.add('hidden');
                    }

                    // TJM validation
                    const tjmValue = parseInt(tjmInput.value, 10);
                    if (isNaN(tjmValue) || tjmValue <= 0) {
                        tjmInput.classList.remove('border-slate-200', 'focus:border-indigo-500');
                        tjmInput.classList.add('border-red-500', 'focus:border-red-500', 'bg-red-50');
                        document.getElementById('error-profile-tjm').textContent = 'Veuillez entrer un TJM valide (supérieur à 0).';
                        document.getElementById('error-profile-tjm').classList.remove('hidden');
                        isValid = false;
                    } else {
                        tjmInput.classList.add('border-slate-200', 'focus:border-indigo-500');
                        tjmInput.classList.remove('border-red-500', 'focus:border-red-500', 'bg-red-50');
                        document.getElementById('error-profile-tjm').classList.add('hidden');
                    }

                    if (!isValid) return;

                    profileData.avatarImage = newAvatarDataUrl;
                    profileData.displayName = nameInput.value.trim();
                    profileData.title = titleInput.value.trim();
                    profileData.location = locationInput.value.trim();
                    profileData.tjm = tjmValue;
                    profileData.bio = bioInput.value.trim();
                    profileData.skills = skillsInput.value.split(',').map(s => s.trim()).filter(s => s);
                    
                    AppState.notify(); // re-render the view
                    
                    // Sync updates back to Firestore
                    AppState.updateProfile({
                        avatarImage: profileData.avatarImage,
                        displayName: profileData.displayName,
                        title: profileData.title,
                        location: profileData.location,
                        tjm: profileData.tjm,
                        bio: profileData.bio,
                        skills: profileData.skills
                    }).catch(err => console.error("Could not sync profile modal edit to Firestore :", err));

                    modal.remove();

                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 mr-2 text-green-400"></i> Profil mis à jour avec succès`;
                    document.body.appendChild(toast);
                    if (window.lucide) window.lucide.createIcons({ root: toast });
                    setTimeout(() => {
                        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                        setTimeout(() => toast.remove(), 300);
                    }, 3000);
                });
            });
        }

        changeCoverBtn?.addEventListener('click', () => {
            coverInput?.click();
        });

        coverInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const changeBtnHtml = changeCoverBtn.innerHTML;
                    changeCoverBtn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 mr-1.5 animate-spin"></i> Téléchargement...`;
                    if (window.lucide) window.lucide.createIcons({ root: changeCoverBtn });
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) throw new Error('Téléversement a échoué');
                    const resData = await response.json();
                    const dataUrl = resData.url;
                    
                    if (profileData) {
                        profileData.coverImage = dataUrl;
                    }
                    profileCover.style.backgroundImage = `url(${dataUrl})`;
                    profileCover.classList.add('bg-cover', 'bg-center');
                    profileCover.classList.remove('bg-gradient-to-r', 'from-indigo-500', 'via-purple-500', 'to-pink-500');
                    
                    // Sync cover image back to Firestore
                    await AppState.updateProfile({ coverImage: dataUrl });
                    changeCoverBtn.innerHTML = changeBtnHtml;
                    if (window.lucide) window.lucide.createIcons({ root: changeCoverBtn });
                } catch (err) {
                    console.error("Error uploading cover image:", err);
                    alert("Erreur lors du changement de l'image de couverture.");
                    changeCoverBtn.innerHTML = `<i data-lucide="camera" class="w-4 h-4 mr-1.5"></i> Changer de couverture`;
                    if (window.lucide) window.lucide.createIcons({ root: changeCoverBtn });
                }
            }
        });

        const avatarClickTrigger = document.getElementById('avatar-click-trigger');
        const avatarDirectInput = document.getElementById('avatar-direct-upload-input');
        const profileAvatarEl = document.getElementById('profile-avatar');

        avatarClickTrigger?.addEventListener('click', () => {
            avatarDirectInput?.click();
        });

        const btnDeleteAvatar = document.getElementById('btn-delete-avatar');
        btnDeleteAvatar?.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) {
                try {
                    await AppState.updateProfile({ avatarImage: null });
                } catch (err) {
                    console.error("Error deleting avatar:", err);
                }
            }
        });

        // Gestionnaire de suppression pour la photo de couverture (delegation)
        if (!window.hasDeleteCoverListener) {
            document.addEventListener('click', async (e) => {
                const deleteBtn = e.target.closest('#btn-delete-cover');
                if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm("Voulez-vous vraiment supprimer votre photo de couverture ?")) {
                        try {
                            await AppState.updateProfile({ coverImage: null });
                        } catch (err) {
                            console.error("Error deleting cover:", err);
                        }
                    }
                }
            });
            window.hasDeleteCoverListener = true;
        }

        avatarDirectInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    avatarClickTrigger.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin text-white"></i>`;
                    if (window.lucide) window.lucide.createIcons({ root: avatarClickTrigger });
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) throw new Error('Téléversement échoué');
                    const resData = await response.json();
                    const imgUrl = resData.url;
                    
                    profileData.avatarImage = imgUrl;
                    
                    // Update current UI
                    profileAvatarEl.style.backgroundImage = `url(${imgUrl})`;
                    profileAvatarEl.classList.add('bg-cover', 'bg-center');
                    profileAvatarEl.style.color = 'transparent';
                    
                    // Remove initial text if any
                    const textNode = Array.from(profileAvatarEl.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textNode) {
                        textNode.textContent = '';
                    }
                    
                    // Sync back to Firestore
                    await AppState.updateProfile({ avatarImage: imgUrl });
                    
                    // Re-render
                    AppState.notify();
                } catch (err) {
                    console.error("Error direct-uploading avatar:", err);
                    alert("Erreur lors de l'importation de la photo de profil : " + err.message);
                } finally {
                    if (avatarClickTrigger) {
                        avatarClickTrigger.innerHTML = `
                            <i data-lucide="camera" class="w-5 h-5 mb-0.5 transform group-hover:scale-110 transition-transform"></i>
                            <span class="text-[8px] font-bold uppercase tracking-wider font-sans">Modifier</span>
                        `;
                        if (window.lucide) window.lucide.createIcons({ root: avatarClickTrigger });
                    }
                }
            }
        });
        
        const updateAvailabilityUI = () => {
            if (profileData.isAvailable) {
                btnToggleAvailability.classList.replace('bg-slate-400', 'bg-emerald-500');
                btnToggleAvailability.title = "Disponible";
                badgeAvailability.textContent = "Disponible";
                badgeAvailability.className = "px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm bg-emerald-50 text-emerald-700 border-emerald-100";
            } else {
                btnToggleAvailability.classList.replace('bg-emerald-500', 'bg-slate-400');
                btnToggleAvailability.title = "Indisponible";
                badgeAvailability.textContent = "Indisponible";
                badgeAvailability.className = "px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm bg-slate-50 text-slate-500 border-slate-200";
            }
        };

        btnToggleAvailability?.addEventListener('click', () => {
            const isOwner = AppState.user && AppState.user.uid === AppState.profileData.id;
            if (!isOwner) return;
            profileData.isAvailable = !profileData.isAvailable;
            updateAvailabilityUI();
            
            // Sync status to Firestore
            AppState.updateProfile({ isAvailable: profileData.isAvailable })
                .catch(err => console.error("Could not sync availability toggle to Firestore:", err));
            
            // Show toast notification
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
            toast.innerHTML = `<i data-lucide="info" class="w-4 h-4 mr-2 text-indigo-400"></i> Statut mis à jour : ${profileData.isAvailable ? 'Disponible' : 'Indisponible'}`;
            document.body.appendChild(toast);
            if (window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        });

        // Skills Management
        const bindSkillDeletes = () => {
            const isOwner = AppState.user && AppState.user.uid === AppState.profileData.id;
            if (!isOwner) return;

            document.querySelectorAll('#skills-container span[data-skill]').forEach(el => {
                el.addEventListener('click', (e) => {
                    const skill = e.currentTarget.getAttribute('data-skill');
                    profileData.skills = profileData.skills.filter(s => s !== skill);
                    
                    // Sync updated skills list to Firestore
                    AppState.updateProfile({ skills: profileData.skills })
                        .catch(err => console.error("Could not sync removed skill to Firestore :", err));
                        
                    renderSkillsList();
                });
            });
        };

        const renderSkillsList = () => {
            const container = document.getElementById('skills-container');
            if (!container) return;
            const isOwner = AppState.user && AppState.user.uid === AppState.profileData.id;
            const addBtnHtml = isOwner ? `
                <div class="relative ml-1" id="add-skill-wrapper">
                    <button id="btn-add-skill" class="text-xs font-bold px-2 py-1 flex items-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100">
                        <i data-lucide="plus" class="w-4 h-4 mr-1"></i> Ajouter
                    </button>
                    <div id="add-skill-form" class="hidden absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex gap-2 z-10 w-48">
                        <input type="text" id="new-skill-input" placeholder="Ex: Node.js" class="w-full text-xs px-2 py-1 border border-slate-200 rounded outline-none focus:border-indigo-500">
                        <button id="confirm-add-skill" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded p-1"><i data-lucide="check" class="w-3 h-3"></i></button>
                    </div>
                </div>
            ` : '';
            
            container.innerHTML = profileData.skills.map(skill => {
                if (isOwner) {
                    return `
                        <span class="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shadow-sm flex items-center group cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-colors view-enter" title="Cliquer pour supprimer" data-skill="${skill}">
                            ${skill} <i data-lucide="x" class="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </span>
                    `;
                } else {
                    return `
                        <span class="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 shadow-sm flex items-center view-enter" data-skill="${skill}">
                            ${skill}
                        </span>
                    `;
                }
            }).join('') + addBtnHtml;
            
            if (window.lucide) window.lucide.createIcons();
            bindSkillDeletes();
            if (isOwner) {
                bindAddSkillEvents();
            }
        };

        const bindAddSkillEvents = () => {
            const btnAdd = document.getElementById('btn-add-skill');
            const formContainer = document.getElementById('add-skill-form');
            const input = document.getElementById('new-skill-input');
            const confirmBtn = document.getElementById('confirm-add-skill');

            btnAdd?.addEventListener('click', () => {
                formContainer.classList.toggle('hidden');
                if (!formContainer.classList.contains('hidden')) {
                    input.focus();
                }
            });

            const submitSkill = () => {
                const val = input.value.trim();
                if (val && !profileData.skills.includes(val)) {
                    profileData.skills.push(val);
                    
                    // Sync updated skills list to Firestore
                    AppState.updateProfile({ skills: profileData.skills })
                        .catch(err => console.error("Could not sync added skill to Firestore :", err));
                        
                    renderSkillsList();
                } else {
                    formContainer.classList.add('hidden');
                }
            };

            confirmBtn?.addEventListener('click', submitSkill);
            input?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') submitSkill();
                if (e.key === 'Escape') formContainer.classList.add('hidden');
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                const wrapper = document.getElementById('add-skill-wrapper');
                if (wrapper && !wrapper.contains(e.target)) {
                    formContainer?.classList.add('hidden');
                }
            });
        };

        bindSkillDeletes();
        bindAddSkillEvents();

        // Portfolio custom gallery events
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.skill-tag')) {
                    const skill = e.target.closest('.skill-tag').getAttribute('data-skill');
                    AppState.preSelectedSearchQuery = skill;
                    AppState.navigate('marketplace');
                    return;
                }
                const projId = item.getAttribute('data-id');
                const project = (AppState.profileData.portfolio || []).find(p => p.id === projId);
                if (!project) return;
                
                const viewerHtml = `
                    <div id="project-view-modal" class="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 view-enter">
                        <div class="bg-white rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl border border-slate-105 flex flex-col md:flex-row max-h-[90vh]">
                            <div class="w-full md:w-1/2 aspect-video md:aspect-auto md:h-full bg-slate-100 relative max-h-[40vh] md:max-h-full">
                                <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover">
                            </div>
                            <div class="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                                <div>
                                    <div class="flex justify-between items-start mb-4">
                                        <span class="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] tracking-wide uppercase rounded-full">${project.category}</span>
                                        <button id="close-project-view" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition cursor-pointer">
                                            <i data-lucide="x" class="w-5 h-5"></i>
                                        </button>
                                    </div>
                                    <h3 class="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">${project.title}</h3>
                                    <p class="text-slate-600 text-xs md:text-sm leading-relaxed mb-4 font-medium">${project.description}</p>
                                    ${project.skills && project.skills.length > 0 ? `
                                    <div class="flex flex-wrap gap-1.5 mb-6">
                                        ${project.skills.map(skill => `<span class="bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-indigo-700 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold cursor-pointer skill-tag transition" data-skill="${skill}">${skill}</span>`).join('')}
                                    </div>
                                    ` : '<div class="mb-6"></div>'}
                                </div>
                                <div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                    ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                                    <button id="delete-project-btn" data-id="${project.id}" class="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i> Supprimer ce projet
                                    </button>
                                    ` : ''}
                                    <span class="text-[10px] font-mono text-slate-400">ID: ${project.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = viewerHtml;
                const modalEl = tempDiv.firstElementChild;
                document.body.appendChild(modalEl);
                if (window.lucide) window.lucide.createIcons({ root: modalEl });
                
                const closeModal = () => modalEl.remove();
                document.getElementById('close-project-view').addEventListener('click', closeModal);
                modalEl.addEventListener('click', (e) => {
                    if (e.target.closest('.skill-tag')) {
                        const skill = e.target.closest('.skill-tag').getAttribute('data-skill');
                        AppState.preSelectedSearchQuery = skill;
                        closeModal();
                        AppState.navigate('marketplace');
                        return;
                    }
                    if (e.target === modalEl) closeModal();
                });
                
                document.getElementById('delete-project-btn')?.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    
                    // Show a beautiful confirmation modal
                    const confirmModalHtml = `
                        <div id="delete-portfolio-confirm-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 view-enter">
                            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-slate-100">
                                <div class="flex items-center gap-3.5 mb-4 text-red-600">
                                    <div class="p-2.5 bg-red-50 rounded-2xl border border-red-100">
                                        <i data-lucide="alert-triangle" class="w-6 h-6 text-red-600"></i>
                                    </div>
                                    <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">Supprimer ?</h3>
                                </div>
                                <p class="text-slate-500 mb-6 text-sm leading-relaxed">Êtes-vous sûr de vouloir supprimer définitivement le projet <strong class="text-slate-800 font-bold">"${AppState.escapeHtml(project.title)}"</strong> de votre portfolio ?</p>
                                <div class="flex justify-end gap-3">
                                    <button id="delete-portfolio-cancel" class="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition cursor-pointer" type="button">Annuler</button>
                                    <button id="delete-portfolio-confirm" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition cursor-pointer flex items-center shadow-lg shadow-red-600/20" type="button">
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    const confirmDiv = document.createElement('div');
                    confirmDiv.innerHTML = confirmModalHtml;
                    const confirmModalEl = confirmDiv.firstElementChild;
                    document.body.appendChild(confirmModalEl);
                    if (window.lucide) window.lucide.createIcons({ root: confirmModalEl });
                    
                    document.getElementById('delete-portfolio-cancel').addEventListener('click', () => {
                        confirmModalEl.remove();
                    });
                    
                    document.getElementById('delete-portfolio-confirm').addEventListener('click', () => {
                        confirmModalEl.remove();
                        AppState.profileData.portfolio = (AppState.profileData.portfolio || []).filter(p => p.id !== id);
                        AppState.updateProfile({ portfolio: AppState.profileData.portfolio }).then(() => {
                            closeModal();
                            AppState.notify();
                            
                            // Show a beautiful Toast
                            const toast = document.createElement('div');
                            toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                            toast.innerHTML = `<i data-lucide="trash-2" class="w-4 h-4 mr-2 text-rose-400"></i> Projet supprimé du portfolio`;
                            document.body.appendChild(toast);
                            if (window.lucide) window.lucide.createIcons({ root: toast });
                            setTimeout(() => {
                                toast.classList.add('opacity-0', 'transition-opacity', 'duration-350');
                                setTimeout(() => toast.remove(), 350);
                            }, 3000);
                        }).catch(err => {
                            console.error("Error saving portfolio change back to cloud :", err);
                            // Fallback to offline deletion visual
                            closeModal();
                            AppState.notify();
                        });
                    });
                });
            });
        });

        // Portfolio upload and popup form modal
        const uploadBtn = document.getElementById('btn-upload-portfolio');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const addModalHtml = `
                    <div id="add-project-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-enter">
                        <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
                                    <i data-lucide="image-plus" class="w-6 h-6 mr-2 text-indigo-600"></i> Ajouter au Portfolio
                                </h3>
                                <button id="add-project-close" class="text-slate-400 hover:text-slate-600 transition p-1.5 hover:bg-slate-100 rounded-full">
                                    <i data-lucide="x" class="w-5 h-5"></i>
                                </button>
                            </div>
                            
                            <form id="add-project-form" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Titre de la réalisation</label>
                                    <input type="text" id="project-title" required placeholder="Ex: Boutique WooCommerce" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl transition font-medium text-slate-800 text-sm">
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Catégorie</label>
                                        <select id="project-category" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl transition font-medium text-slate-800 text-sm cursor-pointer">
                                            <option>Développement Web</option>
                                            <option>Mobile iOS/Android</option>
                                            <option>UI/UX & Design</option>
                                            <option>Marketing & SEO</option>
                                            <option>Cloud & DevOps</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mode d'illustration</label>
                                        <select id="project-preset" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl transition font-medium text-slate-800 text-sm cursor-pointer">
                                            <option value="web">Site Web (Unsplash)</option>
                                            <option value="mobile">App Mobile (Unsplash)</option>
                                            <option value="design">Figma Design (Unsplash)</option>
                                            <option value="seo">Analytics Dashboard (Unsplash)</option>
                                            <option value="custom">Télécharger un fichier</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div id="project-file-group" class="hidden">
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Fichier image</label>
                                    <div class="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:bg-slate-50/50 cursor-pointer transition relative group" id="drop-zone">
                                        <input type="file" id="project-image-file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
                                        <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-indigo-500 mb-1.5 group-hover:scale-110 transition-transform"></i>
                                        <p class="text-xs font-semibold text-slate-605">Sélectionner ou Glisser-Déposer</p>
                                        <p class="text-[10px] text-slate-400 mt-0.5">Images de type PNG, JPG, WEBP</p>
                                        <div id="file-selected-indicator" class="hidden text-xs text-indigo-600 font-bold mt-2"></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                                    <textarea id="project-desc" required rows="3" placeholder="Présentation rapide de la réalisation (technologies, rôles...)" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl transition font-medium text-slate-800 text-sm resize-none"></textarea>
                                </div>
                                
                                <div>
                                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Compétences (mots-clés séparés par des virgules)</label>
                                    <input type="text" id="project-skills" placeholder="Ex: React, Node.js, Design" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl transition font-medium text-slate-800 text-sm">
                                </div>
                                
                                <div class="flex gap-2 justify-end pt-2 border-t border-slate-100">
                                    <button type="button" id="add-project-cancel" class="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition text-sm cursor-pointer">Annuler</button>
                                    <button type="submit" id="submit-project-btn" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition text-sm shadow-md shadow-indigo-650/10 cursor-pointer flex items-center justify-center">
                                        Confirmer & Ajouter
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                
                const addModalEl = document.createElement('div');
                addModalEl.innerHTML = addModalHtml;
                const modalNode = addModalEl.firstElementChild;
                document.body.appendChild(modalNode);
                if (window.lucide) window.lucide.createIcons({ root: modalNode });
                
                const closeAddModal = () => modalNode.remove();
                
                document.getElementById('add-project-close').addEventListener('click', closeAddModal);
                document.getElementById('add-project-cancel').addEventListener('click', closeAddModal);
                modalNode.addEventListener('click', (e) => {
                    if (e.target === modalNode) closeAddModal();
                });
                
                const presetSelect = document.getElementById('project-preset');
                const fileGroup = document.getElementById('project-file-group');
                const fileInput = document.getElementById('project-image-file');
                const fileIndicator = document.getElementById('file-selected-indicator');
                
                presetSelect.addEventListener('change', () => {
                    if (presetSelect.value === 'custom') {
                        fileGroup.classList.remove('hidden');
                    } else {
                        fileGroup.classList.add('hidden');
                    }
                });
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        fileIndicator.innerText = `Fichier sélectionné : ${file.name}`;
                        fileIndicator.classList.remove('hidden');
                    } else {
                        fileIndicator.classList.add('hidden');
                    }
                });
                
                const form = document.getElementById('add-project-form');
                form.addEventListener('submit', async (submitEv) => {
                    submitEv.preventDefault();
                    
                    const title = document.getElementById('project-title').value;
                    const category = document.getElementById('project-category').value;
                    const description = document.getElementById('project-desc').value;
                    const preset = presetSelect.value;
                    
                    let image = '';
                    const submitBtn = document.getElementById('submit-project-btn');
                    const skillsInput = document.getElementById('project-skills').value;
                    const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    
                    if (preset === 'custom') {
                        const file = fileInput.files[0];
                        if (!file) {
                            alert('Veuillez sélectionner un fichier image à téléverser.');
                            return;
                        }
                        
                        submitBtn.innerHTML = '<i class="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></i> Téléversement...';
                        submitBtn.disabled = true;
                        
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        try {
                            const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            if (!response.ok) throw new Error('Failed uploading image');
                            const resData = await response.json();
                            image = resData.url;
                        } catch (err) {
                            console.error('Error during portfolio upload', err);
                            alert('Erreur lors du téléversement. Utilisation d’une illustration par défaut.');
                            image = "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80";
                        }
                    } else {
                        switch (preset) {
                            case 'web':
                                image = "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80";
                                break;
                            case 'mobile':
                                image = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80";
                                break;
                            case 'design':
                                image = "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80";
                                break;
                            case 'seo':
                                image = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80";
                                break;
                            default:
                                image = "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80";
                        }
                    }
                    
                    const newItemObj = {
                        id: 'p_' + Date.now(),
                        title,
                        category,
                        image,
                        description,
                        skills
                    };
                    
                    if (!AppState.profileData.portfolio) {
                        AppState.profileData.portfolio = [];
                    }
                    AppState.profileData.portfolio.unshift(newItemObj);
                    
                    closeAddModal();
                    AppState.notify();
                    
                    // Sync updates back to Firestore
                    AppState.updateProfile({
                        portfolio: AppState.profileData.portfolio
                    }).catch(err => console.error("Could not sync portfolio update to Firestore :", err));
                    
                    // Show success toast
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 mr-2 text-emerald-400"></i> Projet ajouté avec succès !`;
                    document.body.appendChild(toast);
                    if (window.lucide) window.lucide.createIcons({ root: toast });
                    setTimeout(() => {
                        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                        setTimeout(() => toast.remove(), 305);
                    }, 3000);
                });
            });
        }

        // --- Render My Publications ---
        const renderMyPublications = () => {
            const myServices = DUMMY_SERVICES.filter(s => s.authorId === AppState.profileData.id || s.auteur === AppState.profileData.displayName);
            const pubGrid = document.getElementById('my-publications-grid');
            if (!pubGrid) return;
            
            if (myServices.length === 0) {
                pubGrid.innerHTML = '<div class="col-span-full py-8 text-center text-slate-500 font-medium">Aucune publication pour le moment.</div>';
                return;
            }
            
            pubGrid.innerHTML = myServices.map(s => {
                const serviceWithImg = { ...s };
                if (AppState.profileData && AppState.profileData.avatarImage) {
                    serviceWithImg.authorImg = AppState.profileData.avatarImage;
                }
                const isOwner = AppState.user && AppState.user.uid === AppState.profileData.id;
                return `
                <div class="relative group">
                    ${ServiceCard(serviceWithImg)}
                    ${isOwner ? `
                    <div class="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button class="btn-edit-pub bg-white p-2 rounded-full text-indigo-600 hover:text-indigo-800 shadow-md hover:scale-110 transition-transform" data-id="${s.id}" title="Modifier le titre">
                            <i data-lucide="edit-3" class="w-4 h-4 pointer-events-none"></i>
                        </button>
                        <button class="btn-delete-pub bg-white p-2 rounded-full text-red-600 hover:text-red-800 shadow-md hover:scale-110 transition-transform" data-id="${s.id}" title="Supprimer la publication">
                            <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
                        </button>
                    </div>
                    ` : ''}
                </div>
                `;
            }).join('');
            
            if (window.lucide) window.lucide.createIcons();
            bindPublicationEvents();
        };

        const bindPublicationEvents = () => {
            if (window.loadCommentCounts) window.loadCommentCounts();
            document.querySelectorAll('.btn-edit-pub').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = e.currentTarget.getAttribute('data-id');
                    const serviceIndex = DUMMY_SERVICES.findIndex(s => s.id === id);
                    if (serviceIndex !== -1) {
                        const currentService = DUMMY_SERVICES[serviceIndex];
                        const modalHtml = `
                            <div id="edit-pub-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-enter">
                                <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                                    <h3 class="text-lg font-bold text-slate-900 mb-4">Modifier la publication</h3>
                                    <div class="space-y-4 mb-6">
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                                            <input type="text" id="edit-pub-title" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value="${(currentService.title || '').toString().replace(/"/g, '&quot;')}">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                            <textarea id="edit-pub-desc" rows="3" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none">${(currentService.desc || '').toString().replace(/"/g, '&quot;')}</textarea>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                                            <select id="edit-pub-category" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none">
                                                <option value="Code" ${currentService.category === 'Code' ? 'selected' : ''}>Code</option>
                                                <option value="Design" ${currentService.category === 'Design' ? 'selected' : ''}>Design</option>
                                                <option value="Marketing" ${currentService.category === 'Marketing' ? 'selected' : ''}>Marketing</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1">Budget / Prix</label>
                                            <input type="text" id="edit-pub-budget" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value="${(currentService.price || '').toString().replace(/"/g, '&quot;')}">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1">Délai</label>
                                            <input type="text" id="edit-pub-delay" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value="${(currentService.délai || '').toString().replace(/"/g, '&quot;')}">
                                        </div>
                                        <div>
                                            <div class="flex justify-between items-center mb-1">
                                                <label class="block text-sm font-medium text-slate-700">Image</label>
                                                <div class="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                                    <button type="button" id="edit-pub-tab-url" class="px-3 py-1 text-xs font-bold bg-white text-indigo-600 shadow-sm rounded-md transition cursor-pointer">Lien URL</button>
                                                    <button type="button" id="edit-pub-tab-upload" class="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md transition cursor-pointer">Fichier</button>
                                                </div>
                                            </div>
                                            <div id="edit-pub-container-url" class="relative block">
                                                <input type="url" id="edit-pub-img" class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" value="${(currentService.img || '').toString().replace(/"/g, '&quot;')}">
                                            </div>
                                            <div id="edit-pub-container-upload" class="relative hidden">
                                                <input type="file" id="edit-pub-img-file" accept="image/*" class="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex justify-end gap-2">
                                        <button id="edit-pub-cancel" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer" type="button">Annuler</button>
                                        <button id="edit-pub-save" class="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition cursor-pointer" type="button">Enregistrer</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = modalHtml;
                        document.body.appendChild(tempDiv.firstElementChild);
                        
                        const modal = document.getElementById('edit-pub-modal');
                        const input = document.getElementById('edit-pub-title');
                        input.focus();
                        
                        let editImgType = 'url';
                        let editBase64Image = '';

                        const tabUrl = document.getElementById('edit-pub-tab-url');
                        const tabUpload = document.getElementById('edit-pub-tab-upload');
                        const containerUrl = document.getElementById('edit-pub-container-url');
                        const containerUpload = document.getElementById('edit-pub-container-upload');
                        const fileInput = document.getElementById('edit-pub-img-file');

                        tabUrl.addEventListener('click', () => {
                            editImgType = 'url';
                            tabUrl.className = "px-3 py-1 text-xs font-bold bg-white text-indigo-600 shadow-sm rounded-md transition cursor-pointer";
                            tabUpload.className = "px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md transition cursor-pointer";
                            containerUrl.classList.replace('hidden', 'block');
                            containerUpload.classList.replace('block', 'hidden');
                        });

                        tabUpload.addEventListener('click', () => {
                            editImgType = 'upload';
                            tabUpload.className = "px-3 py-1 text-xs font-bold bg-white text-indigo-600 shadow-sm rounded-md transition cursor-pointer";
                            tabUrl.className = "px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md transition cursor-pointer";
                            containerUpload.classList.replace('hidden', 'block');
                            containerUrl.classList.replace('block', 'hidden');
                        });

                        fileInput.addEventListener('change', (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    editBase64Image = ev.target.result;
                                };
                                reader.readAsDataURL(file);
                            }
                        });
                        
                        document.getElementById('edit-pub-cancel').addEventListener('click', () => modal.remove());
                        document.getElementById('edit-pub-save').addEventListener('click', () => {
                            const newTitle = document.getElementById('edit-pub-title').value.trim();
                            const newDesc = document.getElementById('edit-pub-desc').value.trim();
                            const newCategory = document.getElementById('edit-pub-category').value;
                            const newBudget = document.getElementById('edit-pub-budget').value.trim();
                            const newDelay = document.getElementById('edit-pub-delay').value.trim();
                            let newImg = document.getElementById('edit-pub-img').value.trim();
                            
                            if (editImgType === 'upload' && editBase64Image) {
                                newImg = editBase64Image;
                            }

                            AppState.updateService(id, {
                                title: newTitle,
                                desc: newDesc,
                                category: newCategory,
                                price: newBudget, // mapping to existing logic
                                délai: newDelay,
                                img: newImg
                            });
                            
                            renderMyPublications();
                            modal.remove();

                            // Show toast
                            const toast = document.createElement('div');
                            toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                            toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 mr-2 text-green-400"></i> Publication modifiée avec succès`;
                            document.body.appendChild(toast);
                            if (window.lucide) window.lucide.createIcons({ root: toast });
                            setTimeout(() => {
                                toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                                setTimeout(() => toast.remove(), 300);
                            }, 3000);
                        });
                    }
                });
            });

            document.querySelectorAll('.btn-delete-pub').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = e.currentTarget.getAttribute('data-id');
                    const serviceIndex = DUMMY_SERVICES.findIndex(s => s.id === id);
                    if (serviceIndex !== -1) {
                        const modalHtml = `
                            <div id="delete-pub-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-enter">
                                <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                                    <h3 class="text-lg font-bold text-slate-900 mb-2">Supprimer la publication ?</h3>
                                    <p class="text-slate-500 mb-4 text-sm">Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?</p>
                                    <div class="flex justify-end gap-2">
                                        <button id="delete-pub-cancel" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer" type="button">Annuler</button>
                                        <button id="delete-pub-confirm" class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition cursor-pointer" type="button">Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        `;
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = modalHtml;
                        document.body.appendChild(tempDiv.firstElementChild);
                        
                        const modal = document.getElementById('delete-pub-modal');
                        document.getElementById('delete-pub-cancel').addEventListener('click', () => modal.remove());
                        document.getElementById('delete-pub-confirm').addEventListener('click', () => {
                            AppState.deleteService(id);
                            renderMyPublications();
                            modal.remove();

                            // Show toast
                            const toast = document.createElement('div');
                            toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                            toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 mr-2 text-green-400"></i> Publication supprimée`;
                            document.body.appendChild(toast);
                            if (window.lucide) window.lucide.createIcons({ root: toast });
                            setTimeout(() => {
                                toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                                setTimeout(() => toast.remove(), 300);
                            }, 3000);
                        });
                    }
                });
            });
            
            // Prevent navigating when clicking edit/delete over the card
            document.querySelectorAll('#my-publications-grid .btn-edit-pub, #my-publications-grid .btn-delete-pub').forEach(el => {
                el.addEventListener('mousedown', (e) => e.stopPropagation());
            });
        };

        renderMyPublications();

        // Render Chart
        const chartContainer = document.getElementById('profile-chart-container');
        if (chartContainer) {
            const root = createRoot(chartContainer);
            root.render(<ProfileChartsWrapper profileData={profileData} />);
            chartContainer.__reactRoot = root;
        }

        // Render Calendar
        const calendarContainer = document.getElementById('booking-calendar-container');
        if (calendarContainer) {
            const root = createRoot(calendarContainer);
            root.render(<BookingCalendar />);
            calendarContainer.__reactRoot = root;
        }
    }
};
