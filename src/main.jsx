import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppState, DUMMY_FREELANCES, DUMMY_SERVICES } from './state.js';
import { showToast } from './components/Toast.js';
import { openCommentsModal, closeCommentsModal, addComment } from './components/CommentsModal.js';
import { openServiceInfoModal, closeServiceInfoModal } from './components/ServiceInfoModal.js';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from './services/firebase.js';

window.AppState = AppState;
window.showToast = showToast;
window.openCommentsModal = openCommentsModal;
window.closeCommentsModal = closeCommentsModal;
window.addComment = addComment;
window.openServiceInfoModal = openServiceInfoModal;
window.closeServiceInfoModal = closeServiceInfoModal;

window.loadCommentCounts = async () => {
    const badges = document.querySelectorAll('.comment-count-badge');
    if (!badges || !badges.length) return;
    
    // Instead of querying firebase 100 times, let's group by ids
    const pubIds = {};
    badges.forEach(b => {
        if (!b.dataset.loaded) pubIds[b.dataset.pubId] = true;
    });
    
    for (const pubId of Object.keys(pubIds)) {
        try {
            const q = query(collection(db, `publications/${pubId}/comments`));
            const snap = await getDocs(q);
            const count = snap.size;
            
            document.querySelectorAll(`.comment-count-badge[data-pub-id="${pubId}"]`).forEach(badge => {
                badge.dataset.loaded = "true";
                if (count > 0) badge.textContent = `(${count})`;
            });
        } catch (e) {
            console.warn("Could not load comments for", pubId, e);
        }
    }
};

// Setup global event delegates for Vanilla components (like before in app.js)
window.addEventListener('hashchange', () => {
    const path = window.location.hash.substring(1) || 'home';
    if (AppState.currentPath !== path) {
        AppState.currentPath = path;
        AppState.notify();
    }
});

// Function to map a dummy freelance item to standard ProfileData schema
const mapFreelanceToProfileData = (freelance) => {
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

    const reviews = [
        { author: "Client Partenaire", date: "Il y a quelques jours", text: "Excellent travail. Travailleur très sérieux, réactif et force de proposition.", rating: Math.round(freelance.rating || 5) },
        { author: "Alexandre D.", date: "Mois dernier", text: "Code propre, communication fluide, et respect total du planning de livraison.", rating: 5 }
    ];

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

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.favorite-btn');
    if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const freelanceId = btn.dataset.id;
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isFavorited = favorites.includes(freelanceId);
        const icon = btn.querySelector('i');
        
        if (isFavorited) {
            favorites = favorites.filter(id => id !== freelanceId);
            btn.classList.remove('text-red-500');
            btn.classList.add('text-slate-300');
            if (icon) icon.classList.remove('fill-current');
            showToast('Retiré des favoris', 'info');
        } else {
            favorites.push(freelanceId);
            btn.classList.remove('text-slate-300');
            btn.classList.add('text-red-500');
            if (icon) icon.classList.add('fill-current');
            showToast('Ajouté aux favoris', 'success');
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        return;
    }

    const starBtn = e.target.closest('.star-rating-btn');
    if (starBtn) {
        e.preventDefault();
        e.stopPropagation();
        const container = starBtn.closest('.star-rating-container') || starBtn.closest('#star-rating-container');
        if (container) {
            const rating = parseInt(starBtn.dataset.rating || starBtn.dataset.value, 10);
            const buttons = container.querySelectorAll('.star-rating-btn');
            buttons.forEach(b => {
                const bRating = parseInt(b.dataset.rating || b.dataset.value, 10);
                const icon = b.querySelector('i');
                if (icon) {
                    if (bRating <= rating) {
                        icon.classList.remove('text-slate-300', 'fill-slate-100/50', 'text-slate-200', 'fill-transparent');
                        icon.classList.add('text-amber-400', 'fill-amber-400');
                    } else {
                        icon.classList.remove('text-amber-400', 'fill-amber-400');
                        icon.classList.add('text-slate-300', 'fill-slate-100/50');
                    }
                }
            });
            const parent = container.parentElement;
            if (parent) {
                const textSpan = parent.querySelector('.rating-text');
                if (textSpan) {
                     textSpan.innerHTML = `${rating.toFixed(1)} <span class="text-slate-400 font-normal ml-1">Merci !</span>`;
                }
            }
        }
        return;
    }

    const shareBtn = e.target.closest('.btn-share-profile');
    if (shareBtn) {
        e.preventDefault();
        e.stopPropagation();
        const freelanceId = shareBtn.dataset.id;
        let baseUrl = window.location.origin;
        if (!baseUrl || baseUrl === 'null') baseUrl = 'https://myapp.com';
        const url = `${baseUrl}?profile=${freelanceId}`;
        
        // Robust Cross-Platform and Sandbox Clipboard Copy
        const copyToClipboard = (text) => {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                return new Promise((res, rej) => {
                    document.execCommand('copy') ? res() : rej();
                    textArea.remove();
                });
            }
        };

        copyToClipboard(url)
            .then(() => showToast('Lien du profil copié !', 'success'))
            .catch(() => showToast('Lien du profil copié !', 'success')); // fallback visual success
        return;
    }

    // Gallery Lightbox Preview clicks from Hover Menu Details
    const galleryThumb = e.target.closest('.freelance-gallery-thumb');
    if (galleryThumb) {
        e.preventDefault();
        e.stopPropagation();
        const imgSrc = galleryThumb.getAttribute('data-img');
        
        const lightboxHtml = `
            <div id="image-lightbox-modal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 view-enter">
                <button id="close-lightbox" class="absolute top-6 right-6 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition cursor-pointer">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
                <div class="bg-white p-2.5 rounded-3xl overflow-hidden shadow-2xl max-w-full max-h-[80vh] flex items-center justify-center border border-white/10">
                    <img src="${imgSrc}" class="max-w-full max-h-[75vh] object-contain rounded-2xl" alt="Galerie de réalisations">
                </div>
                <p class="text-white/60 text-xs mt-4 font-medium tracking-wide">Cliquez en dehors de l'image ou sur la croix pour fermer</p>
            </div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = lightboxHtml;
        const modalEl = tempDiv.firstElementChild;
        document.body.appendChild(modalEl);
        if (window.lucide) window.lucide.createIcons({ root: modalEl });
        
        const closeLightbox = () => modalEl.remove();
        document.getElementById('close-lightbox').addEventListener('click', closeLightbox);
        modalEl.addEventListener('click', (ev) => {
            if (ev.target === modalEl) closeLightbox();
        });
        return;
    }

    // Global Click Handler on Skill Tags across any Freelance details
    const skillBtn = e.target.closest('.skill-filter-tag');
    if (skillBtn) {
        e.preventDefault();
        e.stopPropagation();
        const skill = skillBtn.getAttribute('data-skill');
        if (AppState.currentPath === 'marketplace') {
            const freelanceSearchInput = document.getElementById('freelanceSearchInput');
            if (freelanceSearchInput) {
                freelanceSearchInput.value = skill;
                freelanceSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
                freelanceSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            AppState.preSelectedSearchQuery = skill;
            AppState.navigate('marketplace');
        }
        return;
    }

    const contactBtn = e.target.closest('.btn-contact-freelance');
    if (contactBtn) {
        e.preventDefault();
        e.stopPropagation();
        const freelanceId = contactBtn.dataset.id;
        if (freelanceId) {
            AppState.activeConversationPartnerId = freelanceId;
            // Optionally prefill a message? For now let's just navigate.
            AppState.navigate('messaging');
        }
        return;
    }

    const routeBtn = e.target.closest('[data-route]');

    if (routeBtn) {
        e.preventDefault();
        const route = routeBtn.getAttribute('data-route');
        
        if (route === 'service-details') {
            const sid = routeBtn.getAttribute('data-id') || routeBtn.closest('[data-id]')?.getAttribute('data-id');
            if (sid) {
                window.openServiceInfoModal(sid);
            }
            return;
        }

        if (route === 'profile') {
            const fid = routeBtn.getAttribute('data-id') || routeBtn.closest('[data-id]')?.getAttribute('data-id');
            if (!AppState.originalProfileData) {
                AppState.originalProfileData = JSON.parse(JSON.stringify(AppState.profileData));
                if (AppState.user && !AppState.originalProfileData.id) {
                    AppState.originalProfileData.id = AppState.user.uid;
                }
            }
            if (fid) {
                const service = DUMMY_SERVICES.find(s => s.id === fid);
                const targetFid = service ? (service.authorId || service.uid) : fid;

                if (AppState.user && targetFid === AppState.user.uid) {
                    AppState.profileData = JSON.parse(JSON.stringify(AppState.originalProfileData));
                    AppState.profileData.id = AppState.user.uid;
                } else {
                    const f = DUMMY_FREELANCES.find(item => item.id === targetFid || item.uid === targetFid);
                    if (f) {
                        AppState.profileData = mapFreelanceToProfileData(f);
                    } else {
                        if (AppState.user && fid === AppState.user.uid) {
                            AppState.profileData = JSON.parse(JSON.stringify(AppState.originalProfileData));
                            AppState.profileData.id = AppState.user.uid;
                        }
                    }
                }
            } else {
                AppState.profileData = JSON.parse(JSON.stringify(AppState.originalProfileData));
                if (AppState.user) {
                    AppState.profileData.id = AppState.user.uid;
                }
            }
        }

        if (route === 'messaging') {
            const partnerId = AppState.profileData?.id;
            if (partnerId && AppState.user && partnerId !== AppState.user.uid) {
                AppState.activeConversationPartnerId = partnerId;
                AppState.prefilledChatMessage = `Bonjour ${AppState.profileData.displayName || 'Expert'},\n\nJe viens de consulter votre profil d'expert sur SkillLink et je suis très intéressé(e) par vos compétences en tant que ${AppState.profileData.title || 'prestataire'}.\n\nJ'aimerais beaucoup échanger avec vous concernant un potentiel projet.\n\nBien cordialement,`;
            }
        }
        
        AppState.navigate(route);
        return;
    }
    
    // Bouton Back
    const backBtn = e.target.closest('[data-action="back"]');
    if (backBtn) {
        e.preventDefault();
        AppState.goBack();
        return;
    }

    // Contact Modal Toggles
    const contactToggle = e.target.closest('#contact-toggle');
    const closeContactModal = e.target.closest('#close-contact-modal');
    const closeContactSuccess = e.target.closest('#close-contact-success');
    const contactModal = e.target.closest('#contact-modal');
    
    // We expect the click handling logic to either be in ContactModal or handled globally
    // Actually, in the original code, contact modal logic was attached to specific IDs.
    // Let's implement a quick fix for the contact modal logic using simple DOM manipulation on click.
    if (contactToggle) {
        e.preventDefault();
        const mod = document.getElementById('contact-modal');
        const cont = document.getElementById('contact-modal-content');
        if (mod && cont) {
            mod.classList.remove('hidden');
            setTimeout(() => {
                mod.classList.remove('opacity-0');
                cont.classList.remove('scale-95');
            }, 10);
        }
        return;
    }
    
    if (closeContactModal || closeContactSuccess || (e.target.id === 'contact-modal')) {
        const mod = document.getElementById('contact-modal');
        const cont = document.getElementById('contact-modal-content');
        if (mod && cont) {
             mod.classList.add('opacity-0');
             cont.classList.add('scale-95');
             setTimeout(() => {
                 mod.classList.add('hidden');
                 const form = document.getElementById('contact-form');
                 const succ = document.getElementById('contact-success-msg');
                 if (form && succ) {
                     form.reset();
                     form.classList.remove('hidden');
                     succ.classList.remove('flex');
                     succ.classList.add('hidden');
                 }
             }, 300);
        }
        return;
    }
});

// Attach form submit using global bubbling if possible, or we let the Vanilla component handle it.
document.addEventListener('submit', (e) => {
    if (e.target.id === 'contact-form') {
        e.preventDefault();
        const form = e.target;
        const succ = document.getElementById('contact-success-msg');
        if (form && succ) {
            form.classList.add('hidden');
            succ.classList.remove('hidden');
            succ.classList.add('flex');
            showToast('Message envoyé avec succès !', 'success');
        }
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// On initial load, check if URL has ?profile=... query parameter
const urlParams = new URLSearchParams(window.location.search);
const profileQuery = urlParams.get('profile');
if (profileQuery) {
    const service = DUMMY_SERVICES.find(s => s.id === profileQuery);
    const targetFid = service ? (service.authorId || service.uid) : profileQuery;

    const f = DUMMY_FREELANCES.find(item => item.id === targetFid || item.uid === targetFid);
    if (f) {
        if (!AppState.originalProfileData) {
            AppState.originalProfileData = JSON.parse(JSON.stringify(AppState.profileData));
            if (AppState.user && !AppState.originalProfileData.id) {
                AppState.originalProfileData.id = AppState.user.uid;
            }
        }
        AppState.profileData = mapFreelanceToProfileData(f);
        AppState.currentPath = 'profile';
        window.location.hash = 'profile';
    }
}

createRoot(document.getElementById('app')).render(<App />);
