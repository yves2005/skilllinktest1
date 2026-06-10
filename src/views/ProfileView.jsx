import { DUMMY_SERVICES, AppState } from '../state.js';
import { ServiceCard } from '../components/ServiceCard.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
const ProfileChartsWrapper = React.lazy(() => import('../components/ProfileChartsWrapper.jsx').then(m => ({ default: m.ProfileChartsWrapper })));
const BookingCalendar = React.lazy(() => import('../components/BookingCalendar.jsx').then(m => ({ default: m.BookingCalendar })));
import { db } from '../services/firebase.js';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { showPortfolioViewerModal } from '../components/PortfolioViewerModal.js';
import { renderPortfolioCard } from '../components/PortfolioCard.js';
import { patchOklchForHtml2pdf } from '../utils/pdfHelper.js';

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
        <div id="profile-export-container" class="max-w-4xl mx-auto px-4 sm:px-6 mt-4 sm:mt-8 pb-12 view-enter">
            <!-- Navigation Rapide -->
            <div class="hidden sm:flex justify-center gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <button data-route="marketplace" class="flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-bold text-sm tracking-wide">
                    <i data-lucide="search" class="w-4 h-4 mr-2"></i> Explorer
                </button>
                <div class="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                <button data-route="ai" class="flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-bold text-sm tracking-wide">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-2"></i> Assistant IA
                </button>
            </div>

            <!-- Profil Entete -->
            <div class="bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                <div id="profile-cover" class="h-48 sm:h-56 ${AppState.profileData.coverImage ? 'bg-cover bg-center' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'} relative" ${AppState.profileData.coverImage ? `style="background-image: url(${AppState.profileData.coverImage})"` : ''}>
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
                <div class="px-6 sm:px-10 pb-10 relative">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 sm:-mt-20 mb-6 gap-4">
                        <div class="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-lg mb-2 sm:mb-0 relative border border-slate-100 dark:border-slate-800">
                            <div id="profile-avatar" class="w-full h-full bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-4xl sm:text-5xl overflow-hidden border-4 border-white dark:border-slate-900 relative ${AppState.profileData.avatarImage ? 'bg-cover bg-center' : ''}" ${AppState.profileData.avatarImage ? `style="background-image: url(${AppState.profileData.avatarImage}); color: transparent;"` : ''}>
                                ${!AppState.profileData.avatarImage ? AppState.profileData.displayName.charAt(0).toUpperCase() : ''}
                                ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                                <!-- Hover to Upload/Delete Avatar trigger -->
                                <div id="avatar-overlay" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full flex flex-col items-center justify-center text-white cursor-pointer z-10 gap-2" title="Gérer la photo de profil">
                                    <button id="avatar-click-trigger" class="flex flex-col items-center font-sans tracking-wide hover:scale-110 transition-transform">
                                        <i data-lucide="camera" class="w-6 h-6 mb-1"></i>
                                        <span class="text-[9px] font-extrabold uppercase tracking-widest text-white/90">Modifier</span>
                                    </button>
                                    ${AppState.profileData.avatarImage ? `
                                        <button id="btn-delete-avatar" class="flex flex-col items-center text-red-300 hover:text-red-100 hover:scale-110 transition-all font-sans tracking-wide">
                                            <i data-lucide="trash-2" class="w-5 h-5 mb-1"></i>
                                            <span class="text-[9px] font-extrabold uppercase tracking-widest text-red-200">Supprimer</span>
                                        </button>
                                    ` : ''}
                                </div>
                                <input type="file" id="avatar-direct-upload-input" class="hidden" accept="image/*">
                                ` : ''}
                            </div>
                            ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                            <button id="toggle-availability" class="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 border-[3px] border-white dark:border-slate-900 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-md ${AppState.profileData.isAvailable ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}" title="${AppState.profileData.isAvailable ? 'Disponible' : 'Indisponible'}">
                            </button>
                            ` : `
                            <div class="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 border-[3px] border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-md ${AppState.profileData.isAvailable ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}" title="${AppState.profileData.isAvailable ? 'Disponible' : 'Indisponible'}">
                            </div>
                            `}
                        </div>
                        <div class="flex flex-wrap gap-3 w-full sm:w-auto">
                            <button id="btn-export-pdf" class="flex-1 sm:flex-none border border-slate-200/80 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center backdrop-blur-md">
                                <i data-lucide="download" class="w-4 h-4 mr-2"></i> Exporter en PDF
                            </button>
                            ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                            <button id="btn-edit-profile" class="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-2xl font-bold transition-colors shadow-sm flex items-center justify-center border border-slate-200/50 dark:border-slate-700">
                                <i data-lucide="edit-3" class="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400"></i> Modifier mon profil
                            </button>
                            ` : `
                            <button data-route="messaging" class="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 flex items-center justify-center">
                                <i data-lucide="message-square" class="w-4 h-4 mr-2 text-indigo-200"></i> Contacter
                            </button>
                            `}
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap items-center gap-4">
                        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">${AppState.profileData.displayName}</h2>
                        <span id="availability-badge" class="px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm tracking-wide ${AppState.profileData.isAvailable ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}">
                            ${AppState.profileData.isAvailable ? 'Disponible' : 'Indisponible'}
                        </span>
                    </div>
                    ${renderProfileViewBadges(AppState.profileData)}
                    <p class="text-indigo-600 dark:text-indigo-400 font-bold text-lg sm:text-xl mt-2 tracking-wide">${AppState.profileData.title}</p>
                    
                    <p class="mt-6 text-slate-600 dark:text-slate-350 leading-relaxed text-[15px] font-medium max-w-3xl bg-indigo-50/40 dark:bg-slate-800/40 p-6 rounded-3xl border border-indigo-100/60 dark:border-slate-800/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                        ${AppState.profileData.bio}
                    </p>

                    <!-- Stats -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 border-y border-slate-100 dark:border-slate-800/60 py-8">
                        ${AppState.profileData.stats.map(s => `
                            <div class="text-center sm:text-left flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div class="w-14 h-14 rounded-full bg-${s.color}-50 dark:bg-${s.color}-900/20 flex items-center justify-center text-${s.color}-600 dark:text-${s.color}-400 shadow-sm border border-${s.color}-100 dark:border-${s.color}-900/30">
                                    <i data-lucide="${s.icon}" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <p class="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-1">${s.value}</p>
                                    <p class="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-widest">${s.label}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Chart Container -->
                    <div id="profile-chart-container"></div>
                    
                    <!-- Booking Calendar Container -->
                    <div id="booking-calendar-container"></div>

                    <div class="flex flex-wrap items-center mt-10 gap-y-4 gap-x-4">
                        <span class="flex items-center px-4 py-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 shadow-sm font-semibold text-slate-700 dark:text-slate-300 text-sm"><i data-lucide="map-pin" class="w-4 h-4 mr-2 text-slate-400"></i> ${AppState.profileData.location}</span>
                        <span class="flex items-center px-4 py-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 shadow-sm font-semibold text-slate-700 dark:text-slate-300 text-sm"><i data-lucide="wallet" class="w-4 h-4 mr-2 text-slate-400"></i> ${AppState.profileData.tjm}€ / jour</span>
                        <span class="flex items-center text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 rounded-2xl border border-amber-200 dark:border-amber-900/30 shadow-sm text-sm"><i data-lucide="star" class="w-4 h-4 mr-2 fill-amber-500/20 text-amber-500"></i> 4.9 <span class="text-amber-600/70 dark:text-amber-400/50 ml-1.5 font-semibold text-xs">(42 Avis)</span></span>
                    </div>
                    
                    <!-- Skills -->
                    <div class="mt-10">
                        <h4 class="text-[11px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-widest mb-4 flex items-center gap-2">
                            <i data-lucide="zap" class="w-4 h-4"></i> Compétences
                        </h4>
                        <div class="flex flex-wrap gap-2.5 items-center" id="skills-container">
                            ${AppState.profileData.skills.map(skill => {
                                const isOwner = AppState.user && AppState.user.uid === AppState.profileData.id;
                                if (isOwner) {
                                    return `
                                        <span class="text-[13px] font-bold px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm flex items-center group cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/30 transition-all hover:scale-105" title="Cliquer pour supprimer" data-skill="${skill}">
                                            ${skill} <i data-lucide="x" class="w-3.5 h-3.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </span>
                                    `;
                                } else {
                                    return `
                                        <span class="text-[13px] font-bold px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
                                            ${skill}
                                        </span>
                                    `;
                                }
                            }).join('')}
                            ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                            <div class="relative ml-2">
                                <button id="btn-add-skill" class="text-xs font-bold px-4 py-2 flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600/50">
                                    <i data-lucide="plus" class="w-4 h-4 mr-1.5"></i> Ajouter
                                </button>
                                <div id="add-skill-form" class="hidden absolute top-full left-0 mt-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-xl p-3 flex gap-2 z-20 w-56">
                                    <input type="text" id="new-skill-input" placeholder="Ex: Node.js" class="w-full text-sm font-medium px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 placeholder-slate-400 transition-all">
                                    <button id="confirm-add-skill" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 flex items-center justify-center transition-colors shadow-sm"><i data-lucide="check" class="w-4 h-4"></i></button>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div> <!-- End of Profil Entete Card -->

            <!-- Portfolio -->
            <div class="mt-8 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-6 sm:p-10">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 class="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
                        <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mr-3">
                            <i data-lucide="image" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        Portfolio
                    </h3>
                    ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? `
                    <div>
                        <button id="btn-upload-portfolio" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 text-sm flex items-center justify-center border border-transparent cursor-pointer w-full sm:w-auto hover:-translate-y-0.5">
                            <i data-lucide="plus-circle" class="w-4 h-4 mr-2"></i> Ajouter au portfolio
                        </button>
                    </div>
                    ` : ''}
                </div>
                <div id="portfolio-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${(profileData.portfolio || []).map(p => renderPortfolioCard(p, AppState.user && AppState.user.uid === AppState.profileData.id)).join('')}
                </div>
            </div>

            <!-- Avis & Recommandations -->
            <div class="mt-8 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-6 sm:p-10">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 class="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
                        <div class="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl mr-3">
                            <i data-lucide="message-square-heart" class="w-5 h-5 text-pink-600 dark:text-pink-400 fill-pink-600/20 dark:fill-pink-400/20"></i>
                        </div>
                        Avis & Recommandations
                    </h3>
                    ${(AppState.user && AppState.user.uid !== AppState.profileData.id) ? `
                    <button onclick="window.openAddReviewModal('${AppState.profileData.id}', '${AppState.profileData.displayName}')" class="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto">
                        <i data-lucide="plus-circle" class="w-4 h-4"></i> Laisser un avis
                    </button>
                    ` : ''}
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" id="reviews-grid">
                    ${AppState.profileData.reviews && AppState.profileData.reviews.length > 0 ? AppState.profileData.reviews.map(r => `
                        <div class="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 group shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden">
                            <div class="absolute top-0 right-0 p-4 opacity-10 dark:opacity-[0.03]">
                                <i data-lucide="quote" class="w-16 h-16 text-indigo-900 dark:text-white"></i>
                            </div>
                            <div class="flex justify-between items-start mb-6 relative z-10">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-extrabold text-base shadow-sm border-2 border-white dark:border-slate-800">
                                        ${AppState.escapeHtml(r.author || "C").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-slate-900 dark:text-white text-base leading-none mb-1.5">${AppState.escapeHtml(r.author || "Client")}</h4>
                                        <p class="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">${r.date}</p>
                                    </div>
                                </div>
                                <div class="flex bg-amber-50/80 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm backdrop-blur-sm">
                                    ${Array(5).fill(0).map((_, i) => `
                                        <i data-lucide="star" class="w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500/50' : 'text-slate-200 dark:text-slate-700'}"></i>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="relative z-10">
                                <p class="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic break-words [word-break:break-word]">"${AppState.escapeHtml(r.text)}"</p>
                            </div>
                            
                            ${(r.videoUrl && r.videoUrl.trim() !== '' && r.videoUrl !== 'undefined') ? `
                                ${(r.videoUrl.includes('youtube.com/watch?v=') || r.videoUrl.includes('youtu.be/')) ? `
                                    <div class="mt-5 rounded-2xl overflow-hidden shadow-md aspect-video border border-slate-200/50 dark:border-slate-700 relative z-10">
                                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${r.videoUrl.includes('youtube.com/watch?v=') ? r.videoUrl.split('v=')[1].split('&')[0] : r.videoUrl.split('youtu.be/')[1].split('?')[0]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                    </div>
                                ` : `
                                    <div class="mt-5 rounded-2xl overflow-hidden shadow-md aspect-video border border-slate-200/50 dark:border-slate-700 bg-slate-900 relative z-10">
                                        <video src="${r.videoUrl}" class="w-full h-full object-cover" controls preload="metadata"></video>
                                    </div>
                                `}
                            ` : ''}
                            
                            ${(AppState.user && (AppState.user.uid === AppState.profileData.id || AppState.user.uid === r.authorId)) ? `
                                <div class="flex gap-2 mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-700/50 justify-end opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                                    ${(AppState.user.uid === AppState.profileData.id) ? `
                                        <button onclick="window.deleteReview('${AppState.profileData.id}', '${r.id}', '${AppState.escapeHtml(r.author)}')" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs font-bold border border-red-100/50 dark:border-red-900/30">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i> Supprimer
                                        </button>
                                    ` : ''}
                                    ${(AppState.user.uid !== r.authorId && r.authorId !== 'anonymous') ? `
                                        <button onclick="window.contactReviewer('${r.authorId}', '${AppState.escapeHtml(r.author)}')" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-xs font-bold border border-indigo-100/50 dark:border-indigo-800/30">
                                            <i data-lucide="message-circle" class="w-4 h-4"></i> Contacter
                                        </button>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `).join('') : `
                        <div class="col-span-full py-16 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-5 shadow-sm border border-slate-200/50 dark:border-slate-700">
                                <i data-lucide="message-square-heart" class="w-10 h-10 text-slate-300 dark:text-slate-600"></i>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 font-bold">Aucun avis disponible pour le moment.</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- Missions -->
            <div class="mt-8 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 mb-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 class="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
                        <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mr-3">
                            <i data-lucide="briefcase" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        ${(AppState.user && AppState.user.uid === AppState.profileData.id) ? 'Mes publications' : 'Publications'}
                    </h3>
                    ${(AppState.user && AppState.user.uid === AppState.profileData.id && AppState.user.role === 'freelance') ? `
                    <button onclick="window.AppState.navigate('publish')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 text-sm flex items-center justify-center w-full sm:w-auto hover:-translate-y-0.5">
                        <i data-lucide="plus-circle" class="w-4 h-4 mr-2"></i> Ajouter un service
                    </button>
                    ` : ''}
                </div>
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
        if (profileData && profileData.id) {
            // Stability check: only start if no active listener or listener is for a different profile
            if (window.activeProfileTeardown && window.activeProfileId !== profileData.id) {
                try {
                    window.activeProfileTeardown();
                } catch (e) { console.warn("Teardown failed:", e); }
                window.activeProfileTeardown = null;
            }

            if (!window.activeProfileTeardown) {
                window.activeProfileId = profileData.id;
                const q = query(collection(db, `users/${profileData.id}/reviews`), orderBy('createdAt', 'desc'));
                window.activeProfileTeardown = onSnapshot(q, (snapshot) => {
                    const fetchedReviews = [];
                    snapshot.forEach(docSnap => {
                        const data = docSnap.data();
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
                    
                    // Only notify if there's a difference to avoid loop
                    const currentReviewTexts = (AppState.profileData.reviews || []).map(r => r.id + r.text).join('|');
                    const newReviewTexts = fetchedReviews.map(r => r.id + r.text).join('|');
                    
                    if (currentReviewTexts !== newReviewTexts) {
                        AppState.profileData.reviews = fetchedReviews;
                        AppState.notify();
                    }
                }, (error) => {
                    console.warn("Failed to listen to profile reviews:", error);
                });
            }
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

                // Prepend metadata header with generated date and Confidential tag
                const originalPosition = element.style.position;
                element.style.position = 'relative';

                const metaHeader = document.createElement('div');
                metaHeader.id = 'pdf-metadata-header';
                metaHeader.style.display = 'flex';
                metaHeader.style.justifyContent = 'space-between';
                metaHeader.style.alignItems = 'center';
                metaHeader.style.fontSize = '11px';
                metaHeader.style.fontFamily = 'monospace';
                metaHeader.style.borderBottom = '1px solid #cbd5e1';
                metaHeader.style.paddingBottom = '8px';
                metaHeader.style.marginBottom = '24px';
                metaHeader.style.color = '#64748b';
                metaHeader.style.width = '100%';

                metaHeader.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ef4444; margin-right: 4px;"></span>
                        <span style="font-weight: bold; color: #dc2626; letter-spacing: 0.05em;">CONFIDENTIAL</span>
                        <span style="color: #cbd5e1; margin: 0 4px;">|</span>
                        <span style="font-weight: 500;">DOCUMENT OFFICIEL</span>
                    </div>
                    <div style="text-align: right;">
                        Généré le : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                `;

                // Append metadata footer
                const metaFooter = document.createElement('div');
                metaFooter.id = 'pdf-metadata-footer';
                metaFooter.style.display = 'flex';
                metaFooter.style.justifyContent = 'space-between';
                metaFooter.style.alignItems = 'center';
                metaFooter.style.fontSize = '9px';
                metaFooter.style.fontFamily = 'monospace';
                metaFooter.style.borderTop = '1px solid #cbd5e1';
                metaFooter.style.paddingTop = '12px';
                metaFooter.style.marginTop = '32px';
                metaFooter.style.color = '#94a3b8';
                metaFooter.style.width = '100%';

                metaFooter.innerHTML = `
                    <div>
                        <span>Document généré automatiquement. Données strictement confidentielles.</span>
                    </div>
                    <div>
                        <span>Propriété exclusive de : ${profileData.displayName || 'Freelance'}</span>
                    </div>
                `;

                // Append multi-page Confidential watermark overlay
                const watermark = document.createElement('div');
                watermark.id = 'pdf-watermark-overlay';
                watermark.style.position = 'absolute';
                watermark.style.top = '0';
                watermark.style.left = '0';
                watermark.style.right = '0';
                watermark.style.bottom = '0';
                watermark.style.pointerEvents = 'none';
                watermark.style.zIndex = '9999';
                watermark.style.display = 'flex';
                watermark.style.flexDirection = 'column';
                watermark.style.justifyContent = 'space-around';
                watermark.style.alignItems = 'center';
                watermark.style.opacity = '0.04';
                watermark.style.overflow = 'hidden';
                watermark.style.height = '100%';
                watermark.style.width = '100%';

                watermark.innerHTML = `
                    <div style="font-size: 80px; font-weight: 900; transform: rotate(-30deg); letter-spacing: 12px; color: #000; font-family: sans-serif; white-space: nowrap; margin: 120px 0;">CONFIDENTIAL</div>
                    <div style="font-size: 80px; font-weight: 900; transform: rotate(-30deg); letter-spacing: 12px; color: #000; font-family: sans-serif; white-space: nowrap; margin: 120px 0;">CONFIDENTIAL</div>
                    <div style="font-size: 80px; font-weight: 900; transform: rotate(-30deg); letter-spacing: 12px; color: #000; font-family: sans-serif; white-space: nowrap; margin: 120px 0;">CONFIDENTIAL</div>
                    <div style="font-size: 80px; font-weight: 900; transform: rotate(-30deg); letter-spacing: 12px; color: #000; font-family: sans-serif; white-space: nowrap; margin: 120px 0;">CONFIDENTIAL</div>
                    <div style="font-size: 80px; font-weight: 900; transform: rotate(-30deg); letter-spacing: 12px; color: #000; font-family: sans-serif; white-space: nowrap; margin: 120px 0;">CONFIDENTIAL</div>
                `;

                element.insertBefore(metaHeader, element.firstChild);
                element.appendChild(metaFooter);
                element.appendChild(watermark);

                const opt = {
                  margin:       10,
                  filename:     `CV_${(profileData.displayName || profileData.name || 'freelance').replace(/\s+/g, '_').toLowerCase()}.pdf`,
                  image:        { type: 'jpeg', quality: 0.98 },
                  html2canvas:  { scale: 2, useCORS: true, logging: false },
                  jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                  pagebreak:    { mode: ['css', 'legacy'] }
                };
                
                const restore = patchOklchForHtml2pdf();
                window.html2pdf().set(opt).from(element).save().then(() => {
                    restore();
                    // Remove newly injected metadata and watermark elements
                    const headerToRemove = document.getElementById('pdf-metadata-header');
                    const footerToRemove = document.getElementById('pdf-metadata-footer');
                    const watermarkToRemove = document.getElementById('pdf-watermark-overlay');
                    if (headerToRemove) headerToRemove.remove();
                    if (footerToRemove) footerToRemove.remove();
                    if (watermarkToRemove) watermarkToRemove.remove();
                    element.style.position = originalPosition;

                    // Restore original state
                    if (isDark) document.documentElement.classList.add('dark');
                    element.style.backgroundColor = '';
                    
                    if(btnContainer) btnContainer.style.display = 'flex';
                    if(toggleAvail) toggleAvail.style.display = 'flex';
                    if(changeCover) changeCover.style.display = 'flex';
                    if(backBtn) backBtn.style.display = 'flex';
                    if(quickNav) quickNav.style.display = 'flex';
                    profileActions.forEach(el => el.style.display = 'flex');
                }).catch(err => {
                    restore();
                    console.error("Profile PDF error:", err);
                    const headerToRemove = document.getElementById('pdf-metadata-header');
                    const footerToRemove = document.getElementById('pdf-metadata-footer');
                    const watermarkToRemove = document.getElementById('pdf-watermark-overlay');
                    if (headerToRemove) headerToRemove.remove();
                    if (footerToRemove) footerToRemove.remove();
                    if (watermarkToRemove) watermarkToRemove.remove();
                    element.style.position = originalPosition;

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

            // Create or Edit Portfolio modal logic and delete confirmation logic helper
        const triggerDeletePortfolioConfirmation = (project, id, closeModalCallback = null) => {
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
            
            document.getElementById('delete-portfolio-confirm').addEventListener('click', async () => {
                confirmModalEl.remove();
                AppState.profileData.portfolio = (AppState.profileData.portfolio || []).filter(p => p.id !== id);
                
                AppState.isGlobalLoading = true;
                AppState.globalLoadingText = "Suppression du projet en cours...";
                AppState.notify();
                
                try {
                    await AppState.updateProfile({ portfolio: AppState.profileData.portfolio });
                    if (closeModalCallback) closeModalCallback();
                    
                    // Show a beautiful Toast
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                    toast.innerHTML = `<i data-lucide="trash-2" class="w-4 h-4 mr-2 text-rose-400"></i> Projet supprimé du portfolio`;
                    document.body.appendChild(toast);
                    if (window.lucide) window.lucide.createIcons({ root: toast });
                    setTimeout(() => {
                        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                        setTimeout(() => toast.remove(), 305);
                    }, 3000);
                } catch (err) {
                    console.error("Error saving portfolio change back to cloud :", err);
                    if (closeModalCallback) closeModalCallback();
                } finally {
                    AppState.isGlobalLoading = false;
                    AppState.globalLoadingText = "";
                    AppState.notify();
                }
            });
        };

        const openEditPortfolioModal = (project) => {
            const editModalHtml = `
                <div id="edit-project-modal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-enter">
                    <div class="bg-white dark:bg-slate-900 rounded-[2.2rem] p-6 md:p-8 w-full max-w-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.7)] border border-slate-100 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto m-auto relative text-slate-800 dark:text-slate-100">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                                <i data-lucide="edit-3" class="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400"></i> Modifier la réalisation
                            </h3>
                            <button id="edit-project-close" class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 transition p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        
                        <form id="edit-project-form" class="space-y-5">
                            <div>
                                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Titre de la réalisation</label>
                                <input type="text" id="edit-project-title" required value="${AppState.escapeHtml(project.title)}" placeholder="Ex: Boutique WooCommerce" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm">
                            </div>
                            
                            <div>
                                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Catégorie</label>
                                <select id="edit-project-category" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm cursor-pointer">
                                    <option value="Développement Web" ${project.category === 'Développement Web' ? 'selected' : ''}>Développement Web</option>
                                    <option value="Mobile iOS/Android" ${project.category === 'Mobile iOS/Android' ? 'selected' : ''}>Mobile iOS/Android</option>
                                    <option value="UI/UX & Design" ${project.category === 'UI/UX & Design' ? 'selected' : ''}>UI/UX & Design</option>
                                    <option value="Marketing & SEO" ${project.category === 'Marketing & SEO' ? 'selected' : ''}>Marketing & SEO</option>
                                    <option value="Cloud & DevOps" ${project.category === 'Cloud & DevOps' ? 'selected' : ''}>Cloud & DevOps</option>
                                </select>
                            </div>

                            <!-- Option de sélection de l'image -->
                            <div>
                                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Illustration de la réalisation</label>
                                <div class="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-3 border border-slate-200/50 dark:border-slate-850">
                                    <button type="button" id="edit-img-tab-keep" class="flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm">
                                        Conserver l'image
                                    </button>
                                    <button type="button" id="edit-img-tab-upload" class="flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                                        <i data-lucide="upload" class="w-3" class="w-3 h-3 inline mr-1 text-indigo-500"></i> Importer photo
                                    </button>
                                    <button type="button" id="edit-img-tab-preset" class="flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                                        <i data-lucide="image" class="w-3" class="w-3 h-3 inline mr-1 text-slate-500"></i> Prédéfinie
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Container 1: Keep original photo previews -->
                            <div id="edit-project-keep-group" class="block">
                                <div class="relative rounded-2xl overflow-hidden aspect-[16/9] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                                    <img src="${project.imageUrl || project.image}" loading="lazy" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80'">
                                    <div class="absolute bottom-2 left-2 bg-slate-900/85 dark:bg-slate-800/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                        Image actuelle
                                    </div>
                                </div>
                            </div>

                            <!-- Container 2: Upload new photo drag & drop -->
                            <div id="edit-project-file-group" class="hidden">
                                <div class="border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-2xl p-5 text-center hover:bg-slate-50/50 dark:hover:bg-slate-950/40 cursor-pointer transition relative group" id="edit-drop-zone">
                                    <input type="file" id="edit-project-image-file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
                                    <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-indigo-500 mb-1.5 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-semibold text-slate-600 dark:text-slate-350">Sélectionner ou glisser-déposer votre photo</p>
                                    <p class="text-[10px] text-slate-400 mt-0.5">Formats acceptés : PNG, JPG, WEBP</p>
                                    <div id="edit-file-selected-indicator" class="hidden text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-2"></div>
                                    <div id="edit-file-preview-container" class="hidden mt-3 relative mx-auto max-w-[200px] aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                        <img id="edit-file-preview-img" loading="lazy" class="w-full h-full object-cover">
                                    </div>
                                </div>
                            </div>

                            <!-- Container 3: Preset dropdown illustrations -->
                            <div id="edit-project-preset-group" class="hidden">
                                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Sélectionner une illustration type</label>
                                <select id="edit-project-preset" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm cursor-pointer">
                                    <option value="web" selected>Site Web (Unsplash)</option>
                                    <option value="mobile">App Mobile (Unsplash)</option>
                                    <option value="design">Figma Design (Unsplash)</option>
                                    <option value="seo">Analytics Dashboard (Unsplash)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Description</label>
                                <textarea id="edit-project-desc" required rows="3" placeholder="Présentation rapide de la réalisation (technologies, rôles...)" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm resize-none">${AppState.escapeHtml(project.description || '')}</textarea>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Compétences (mots-clés séparés par des virgules)</label>
                                <input type="text" id="edit-project-skills" value="${AppState.escapeHtml((project.skills || []).join(', '))}" placeholder="Ex: React, Node.js, Design" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm">
                            </div>
                            
                            <div class="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800/85">
                                <button type="button" id="edit-project-cancel" class="px-5 py-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition text-sm cursor-pointer">Annuler</button>
                                <button type="submit" id="edit-submit-project-btn" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition text-sm shadow-md shadow-indigo-650/10 cursor-pointer flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            const editModalEl = document.createElement('div');
            editModalEl.innerHTML = editModalHtml;
            const modalNode = editModalEl.firstElementChild;
            document.body.appendChild(modalNode);
            if (window.lucide) window.lucide.createIcons({ root: modalNode });
            
            const closeEditModal = () => modalNode.remove();
            
            document.getElementById('edit-project-close').addEventListener('click', closeEditModal);
            document.getElementById('edit-project-cancel').addEventListener('click', closeEditModal);
            modalNode.addEventListener('click', (e) => {
                if (e.target === modalNode) closeEditModal();
            });
            
            const tabKeepBtn = document.getElementById('edit-img-tab-keep');
            const tabUploadBtn = document.getElementById('edit-img-tab-upload');
            const tabPresetBtn = document.getElementById('edit-img-tab-preset');

            const keepGroup = document.getElementById('edit-project-keep-group');
            const fileGroup = document.getElementById('edit-project-file-group');
            const presetGroup = document.getElementById('edit-project-preset-group');

            const presetSelect = document.getElementById('edit-project-preset');
            const fileInput = document.getElementById('edit-project-image-file');
            const fileIndicator = document.getElementById('edit-file-selected-indicator');
            
            let currentImageMode = "keep"; // keep/custom/preset
            
            const selectTab = (mode) => {
                currentImageMode = mode;
                [tabKeepBtn, tabUploadBtn, tabPresetBtn].forEach(b => {
                    b.className = "flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent bg-transparent shadow-none";
                });
                keepGroup.classList.add('hidden');
                fileGroup.classList.add('hidden');
                presetGroup.classList.add('hidden');

                if (mode === 'keep') {
                    tabKeepBtn.className = "flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/60 dark:border-slate-700/60";
                    keepGroup.classList.remove('hidden');
                } else if (mode === 'custom') {
                    tabUploadBtn.className = "flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/60 dark:border-slate-700/60";
                    fileGroup.classList.remove('hidden');
                } else if (mode === 'preset') {
                    tabPresetBtn.className = "flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/60 dark:border-slate-700/60";
                    presetGroup.classList.remove('hidden');
                }
            };

            tabKeepBtn.addEventListener('click', () => selectTab('keep'));
            tabUploadBtn.addEventListener('click', () => selectTab('custom'));
            tabPresetBtn.addEventListener('click', () => selectTab('preset'));
            
            const editDropZone = document.getElementById('edit-drop-zone');
            if (editDropZone) {
                ['dragenter', 'dragover'].forEach(eventName => {
                    editDropZone.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        editDropZone.classList.add('border-indigo-500', 'bg-indigo-50/20');
                    }, false);
                });

                ['dragleave', 'drop'].forEach(eventName => {
                    editDropZone.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        editDropZone.classList.remove('border-indigo-500', 'bg-indigo-50/20');
                    }, false);
                });

                editDropZone.addEventListener('drop', (e) => {
                    const dt = e.dataTransfer;
                    const files = dt.files;
                    if (files && files.length > 0) {
                        fileInput.files = files;
                        const event = new Event('change', { bubbles: true });
                        fileInput.dispatchEvent(event);
                    }
                }, false);
            }

            let editUploadedBase64 = '';

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileIndicator.innerText = `Photo sélectionnée : ${file.name}`;
                    fileIndicator.classList.remove('hidden');

                    const reader = new FileReader();
                    reader.onload = (re) => {
                        editUploadedBase64 = re.target.result;
                        const previewContainer = document.getElementById('edit-file-preview-container');
                        const previewImg = document.getElementById('edit-file-preview-img');
                        if (previewContainer && previewImg) {
                            previewImg.src = editUploadedBase64;
                            previewContainer.classList.remove('hidden');
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    fileIndicator.classList.add('hidden');
                    const previewContainer = document.getElementById('edit-file-preview-container');
                    if (previewContainer) previewContainer.classList.add('hidden');
                    editUploadedBase64 = '';
                }
            });
            
            const form = document.getElementById('edit-project-form');
            form.addEventListener('submit', async (submitEv) => {
                submitEv.preventDefault();
                
                const title = document.getElementById('edit-project-title').value.trim();
                const category = document.getElementById('edit-project-category').value;
                const description = document.getElementById('edit-project-desc').value.trim();
                const submitBtn = document.getElementById('edit-submit-project-btn');
                const skillsVal = document.getElementById('edit-project-skills').value;
                const skills = skillsVal.split(',').map(s => s.trim()).filter(s => s.length > 0);
                
                let image = project.imageUrl || project.image || "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80";
                
                if (currentImageMode === 'custom') {
                    const file = fileInput.files[0];
                    if (file) {
                        submitBtn.innerHTML = '<i class="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></i> Téléchargement...';
                        submitBtn.disabled = true;
                        
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        try {
                            const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            if (!response.ok) throw new Error('Un problème est survenu lors du téléversement.');
                            const resData = await response.json();
                            image = resData.url;
                        } catch (err) {
                            console.error('Error during portfolio upload in edit modal', err);
                            if (editUploadedBase64) {
                                image = editUploadedBase64;
                            } else {
                                alert('Erreur lors du téléversement. Conservation de l’image d’origine.');
                            }
                        }
                    } else if (editUploadedBase64) {
                        image = editUploadedBase64;
                    }
                } else if (currentImageMode === 'preset') {
                    const preset = presetSelect.value;
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
                
                // Update the project item details
                const updatedPortfolio = (AppState.profileData.portfolio || []).map(p => {
                    if (p.id === project.id) {
                        return {
                            ...p,
                            title,
                            category,
                            imageUrl: image,
                            image: image,
                            description,
                            skills
                        };
                    }
                    return p;
                });
                
                AppState.profileData.portfolio = updatedPortfolio;
                closeEditModal();
                
                AppState.isGlobalLoading = true;
                AppState.globalLoadingText = "Mise à jour du projet en cours...";
                AppState.notify();
                
                // Sync to Firestore
                AppState.updateProfile({
                    portfolio: AppState.profileData.portfolio
                }).then(() => {
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                    toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 mr-2 text-emerald-400"></i> Projet mis à jour avec succès !`;
                    document.body.appendChild(toast);
                    if (window.lucide) window.lucide.createIcons({ root: toast });
                    setTimeout(() => {
                        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                        setTimeout(() => toast.remove(), 305);
                    }, 3000);
                }).catch(err => {
                    console.error("Could not sync portfolio update to Firestore :", err);
                }).finally(() => {
                    AppState.isGlobalLoading = false;
                    AppState.globalLoadingText = "";
                    AppState.notify();
                });
            });
        };

        // Bind quick action click handlers from the grid
        document.querySelectorAll('.btn-edit-portfolio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const pItem = (AppState.profileData.portfolio || []).find(p => p.id === id);
                if (pItem) {
                    openEditPortfolioModal(pItem);
                }
            });
        });

        document.querySelectorAll('.btn-delete-portfolio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const pItem = (AppState.profileData.portfolio || []).find(p => p.id === id);
                if (pItem) {
                    triggerDeletePortfolioConfirmation(pItem, id);
                }
            });
        });

        // Portfolio custom gallery events
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.btn-edit-portfolio') || e.target.closest('.btn-delete-portfolio')) {
                    return; // Prevent triggering detail modal when quick actions are clicked
                }
                if (e.target.closest('.skill-tag')) {
                    const skill = e.target.closest('.skill-tag').getAttribute('data-skill');
                    AppState.preSelectedSearchQuery = skill;
                    AppState.navigate('marketplace');
                    return;
                }
                const projId = item.getAttribute('data-id');
                const project = (AppState.profileData.portfolio || []).find(p => p.id === projId);
                if (!project) return;
                
                if (item.querySelector('.portfolio-loader-overlay')) return;
                
                const loaderHtml = `<div class="absolute inset-0 bg-white/50 dark:bg-slate-950/50 flex items-center justify-center backdrop-blur-sm z-30 portfolio-loader-overlay rounded-3xl"><i data-lucide="loader-2" class="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin drop-shadow-sm"></i></div>`;
                item.insertAdjacentHTML('beforeend', loaderHtml);
                if (window.lucide) window.lucide.createIcons({ root: item });

                const imgSrc = project.imageUrl || project.image || 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80';
                
                const img = new Image();
                
                const handleImageReady = () => {
                    const overlay = item.querySelector('.portfolio-loader-overlay');
                    if (overlay) overlay.remove();
                    
                    const isOwner = (AppState.user && AppState.user.uid === AppState.profileData.id);
                    
                    showPortfolioViewerModal(project, isOwner, 
                        // onEdit handler
                        (proj, closeFn) => {
                            closeFn();
                            openEditPortfolioModal(proj);
                        },
                        // onDelete handler
                        (proj, closeFn) => {
                            triggerDeletePortfolioConfirmation(proj, proj.id, closeFn);
                        }
                    );
                };

                img.onload = handleImageReady;
                img.onerror = () => {
                    // Fallback if image fails to load
                    handleImageReady();
                };
                img.src = imgSrc;
            });
        });

        const uploadBtn = document.getElementById('btn-upload-portfolio');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const addModalHtml = `
                    <div id="add-project-modal" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 view-enter">
                        <div class="bg-white dark:bg-slate-900 rounded-[2.2rem] p-6 md:p-8 w-full max-w-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.7)] border border-slate-100 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto m-auto relative text-slate-800 dark:text-slate-100">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center">
                                    <i data-lucide="image-plus" class="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400"></i> Ajouter au Portfolio
                                </h3>
                                <button id="add-project-close" class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 transition p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer">
                                    <i data-lucide="x" class="w-5 h-5"></i>
                                </button>
                            </div>
                            
                            <form id="add-project-form" class="space-y-5">
                                <div>
                                    <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Titre de la réalisation</label>
                                    <input type="text" id="project-title" required placeholder="Ex: Boutique WooCommerce" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm">
                                </div>
                                
                                <div>
                                    <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Catégorie</label>
                                    <select id="project-category" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm cursor-pointer">
                                        <option>Développement Web</option>
                                        <option>Mobile iOS/Android</option>
                                        <option>UI/UX & Design</option>
                                        <option>Marketing & SEO</option>
                                        <option>Cloud & DevOps</option>
                                    </select>
                                </div>

                                <!-- Option de sélection de l'image -->
                                <div>
                                    <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Illustration de la réalisation</label>
                                    <div class="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-3 border border-slate-200/50 dark:border-slate-850">
                                        <button type="button" id="add-img-tab-upload" class="flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm">
                                            <i data-lucide="upload" class="w-3" class="w-3 h-3 inline mr-1 text-indigo-500"></i> Importer ma photo
                                        </button>
                                        <button type="button" id="add-img-tab-preset" class="flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                                            <i data-lucide="image" class="w-3" class="w-3 h-3 inline mr-1 text-slate-500"></i> Illustration type
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Container 1: Upload photo (active by default!) -->
                                <div id="project-file-group" class="block">
                                    <div class="border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-2xl p-5 text-center hover:bg-slate-50/50 dark:hover:bg-slate-950/40 cursor-pointer transition relative group" id="drop-zone">
                                        <input type="file" id="project-image-file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
                                        <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-indigo-500 mb-1.5 group-hover:scale-110 transition-transform"></i>
                                        <p class="text-xs font-semibold text-slate-600 dark:text-slate-350 font-sans">Sélectionner ou glisser-déposer votre photo</p>
                                        <p class="text-[10px] text-slate-400 mt-0.5 font-mono">Formats acceptés : PNG, JPG, WEBP</p>
                                        <div id="file-selected-indicator" class="hidden text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-2 font-mono"></div>
                                        <div id="file-preview-container" class="hidden mt-3 relative mx-auto max-w-[200px] aspect-[16/10] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                            <img id="file-preview-img" loading="lazy" class="w-full h-full object-cover">
                                        </div>
                                    </div>
                                </div>

                                <!-- Container 2: Preset selector (hidden by default) -->
                                <div id="project-preset-group" class="hidden">
                                    <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Style d'illustration</label>
                                    <select id="project-preset" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm cursor-pointer">
                                        <option value="web" selected>Site Web (Unsplash)</option>
                                        <option value="mobile">App Mobile (Unsplash)</option>
                                        <option value="design">Figma Design (Unsplash)</option>
                                        <option value="seo">Analytics Dashboard (Unsplash)</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Description</label>
                                    <textarea id="project-desc" required rows="3" placeholder="Présentation rapide de la réalisation (technologies, rôles...)" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm resize-none"></textarea>
                                </div>
                                
                                <div>
                                    <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-405 mb-1.5">Compétences (mots-clés séparés par des virgules)</label>
                                    <input type="text" id="project-skills" placeholder="Ex: React, Node.js, Design" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition font-medium text-slate-800 dark:text-slate-150 text-sm">
                                </div>
                                
                                <div class="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800/85">
                                    <button type="button" id="add-project-cancel" class="px-5 py-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition text-sm cursor-pointer">Annuler</button>
                                    <button type="submit" id="submit-project-btn" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition text-sm shadow-md shadow-indigo-650/10 cursor-pointer flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]">
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
                
                const tabUploadBtn = document.getElementById('add-img-tab-upload');
                const tabPresetBtn = document.getElementById('add-img-tab-preset');
 
                const fileGroup = document.getElementById('project-file-group');
                const presetGroup = document.getElementById('project-preset-group');
 
                const presetSelect = document.getElementById('project-preset');
                const fileInput = document.getElementById('project-image-file');
                const fileIndicator = document.getElementById('file-selected-indicator');
                
                let currentImageMode = "custom"; // custom/preset
                
                const selectTab = (mode) => {
                    currentImageMode = mode;
                    [tabUploadBtn, tabPresetBtn].forEach(b => {
                        b.className = "flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-transparent bg-transparent shadow-none";
                    });
                    fileGroup.classList.add('hidden');
                    presetGroup.classList.add('hidden');
 
                    if (mode === 'custom') {
                        tabUploadBtn.className = "flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/60 dark:border-slate-700/60";
                        fileGroup.classList.remove('hidden');
                    } else if (mode === 'preset') {
                        tabPresetBtn.className = "flex-1 py-1.5 text-xs font-bold text-center rounded-lg transition-all cursor-pointer bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/60 dark:border-slate-700/60";
                        presetGroup.classList.remove('hidden');
                    }
                };

                tabUploadBtn.addEventListener('click', () => selectTab('custom'));
                tabPresetBtn.addEventListener('click', () => selectTab('preset'));
                
                const dropZone = document.getElementById('drop-zone');
                if (dropZone) {
                    ['dragenter', 'dragover'].forEach(eventName => {
                        dropZone.addEventListener(eventName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropZone.classList.add('border-indigo-500', 'bg-indigo-50/20');
                        }, false);
                    });

                    ['dragleave', 'drop'].forEach(eventName => {
                        dropZone.addEventListener(eventName, (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/20');
                        }, false);
                    });

                    dropZone.addEventListener('drop', (e) => {
                        const dt = e.dataTransfer;
                        const files = dt.files;
                        if (files && files.length > 0) {
                            fileInput.files = files;
                            const event = new Event('change', { bubbles: true });
                            fileInput.dispatchEvent(event);
                        }
                    }, false);
                }

                let addUploadedBase64 = '';

                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        fileIndicator.innerText = `Photo sélectionnée : ${file.name}`;
                        fileIndicator.classList.remove('hidden');

                        const reader = new FileReader();
                        reader.onload = (re) => {
                            addUploadedBase64 = re.target.result;
                            const previewContainer = document.getElementById('file-preview-container');
                            const previewImg = document.getElementById('file-preview-img');
                            if (previewContainer && previewImg) {
                                previewImg.src = addUploadedBase64;
                                previewContainer.classList.remove('hidden');
                            }
                        };
                        reader.readAsDataURL(file);
                    } else {
                        fileIndicator.classList.add('hidden');
                        const previewContainer = document.getElementById('file-preview-container');
                        if (previewContainer) previewContainer.classList.add('hidden');
                        addUploadedBase64 = '';
                    }
                });
                
                const form = document.getElementById('add-project-form');
                form.addEventListener('submit', async (submitEv) => {
                    submitEv.preventDefault();
                    
                    const title = document.getElementById('project-title').value;
                    const category = document.getElementById('project-category').value;
                    const description = document.getElementById('project-desc').value;
                    
                    let image = '';
                    const submitBtn = document.getElementById('submit-project-btn');
                    const skillsInput = document.getElementById('project-skills').value;
                    const skills = skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    
                    if (currentImageMode === 'custom') {
                        const file = fileInput.files[0];
                        if (!file && !addUploadedBase64) {
                            alert('Veuillez sélectionner un fichier image à téléverser.');
                            return;
                        }
                        
                        submitBtn.innerHTML = '<i class="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></i> Téléversement...';
                        submitBtn.disabled = true;
                        
                        let uploadedSuccessfully = false;
                        if (file) {
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
                                uploadedSuccessfully = true;
                            } catch (err) {
                                console.error('Error during portfolio upload', err);
                            }
                        }

                        if (!uploadedSuccessfully) {
                            if (addUploadedBase64) {
                                image = addUploadedBase64;
                            } else {
                                alert('Erreur lors du téléversement. Utilisation d’une illustration par défaut.');
                                image = "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80";
                            }
                        }
                    } else {
                        const preset = presetSelect.value;
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
                        imageUrl: image,
                        image: image,
                        description,
                        skills
                    };
                    
                    if (!AppState.profileData.portfolio) {
                        AppState.profileData.portfolio = [];
                    }
                    AppState.profileData.portfolio.unshift(newItemObj);
                    
                    closeAddModal();
                    
                    AppState.isGlobalLoading = true;
                    AppState.globalLoadingText = "Ajout du projet en cours...";
                    AppState.notify();
                    
                    // Sync updates back to Firestore
                    AppState.updateProfile({
                        portfolio: AppState.profileData.portfolio
                    }).then(() => {
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
                    }).catch(err => {
                        console.error("Could not sync portfolio update to Firestore :", err);
                    }).finally(() => {
                        AppState.isGlobalLoading = false;
                        AppState.globalLoadingText = "";
                        AppState.notify();
                    });
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
                    <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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
                        document.getElementById('delete-pub-confirm').addEventListener('click', async () => {
                            modal.remove();
                            
                            AppState.isGlobalLoading = true;
                            AppState.globalLoadingText = "Suppression du service en cours...";
                            AppState.notify();
                            
                            try {
                                await AppState.deleteService(id);
                                renderMyPublications();
    
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
                            } catch (e) {
                                console.error("Error deleting service:", e);
                            } finally {
                                AppState.isGlobalLoading = false;
                                AppState.globalLoadingText = "";
                                AppState.notify();
                            }
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
            root.render(
                <React.Suspense fallback={
                    <div className="animate-pulse bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 h-80 flex flex-col justify-center items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-3"></div>
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                        <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                }>
                    <ProfileChartsWrapper profileData={profileData} />
                </React.Suspense>
            );
            chartContainer.__reactRoot = root;
        }

        // Render Calendar
        const calendarContainer = document.getElementById('booking-calendar-container');
        if (calendarContainer) {
            const root = createRoot(calendarContainer);
            root.render(
                <React.Suspense fallback={
                    <div className="animate-pulse bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 mt-6 h-64 flex flex-col justify-center items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                             <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                }>
                    <BookingCalendar />
                </React.Suspense>
            );
            calendarContainer.__reactRoot = root;
        }
    }
};
