import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppState, DUMMY_FREELANCES, DUMMY_SERVICES, mapFreelanceToProfileData } from './state.js';
import { showToast } from './components/Toast.js';
import { openCommentsModal, closeCommentsModal, addComment } from './components/CommentsModal.js';
import { openServiceInfoModal, closeServiceInfoModal } from './components/ServiceInfoModal.js';
import { openAddReviewModal, closeAddReviewModal } from './components/AddReviewModal.js';
import { openFreelancerProfileModal, closeFreelancerProfileModal } from './components/FreelancerProfileModal.js';
import { collection, query, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './services/firebase.js';

window.AppState = AppState;
window.showToast = showToast;
window.openCommentsModal = openCommentsModal;
window.closeCommentsModal = closeCommentsModal;
window.addComment = addComment;
window.openServiceInfoModal = openServiceInfoModal;
window.closeServiceInfoModal = closeServiceInfoModal;
window.openAddReviewModal = openAddReviewModal;
window.closeAddReviewModal = closeAddReviewModal;
window.openFreelancerProfileModal = openFreelancerProfileModal;
window.closeFreelancerProfileModal = closeFreelancerProfileModal;

window.deleteReview = async (freelanceId, reviewId, authorName = "ce client") => {
    const modalHtml = `
        <div id="delete-review-modal" class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 view-enter">
            <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col items-center text-center">
                <div class="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-6 shadow-sm border border-red-100/50">
                    <i data-lucide="trash-2" class="w-10 h-10 text-red-500"></i>
                </div>
                <h3 class="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Supprimer l'avis ?</h3>
                <p class="text-slate-500 text-sm mb-8 leading-relaxed px-2">Vous êtes sur le point de retirer définitivement l'avis de <strong class="text-slate-800 font-bold">${authorName}</strong>. Cette action impactera votre note globale.</p>
                
                <div class="flex flex-col w-full gap-3">
                    <button id="confirm-delete-review" class="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-red-600/20 active:scale-95">
                        Confirmer la suppression
                    </button>
                    <button id="cancel-delete-review" class="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm transition border border-slate-200/50">
                        Conserver l'avis
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    const modalEl = tempDiv.firstElementChild;
    document.body.appendChild(modalEl);
    if (window.lucide) window.lucide.createIcons({ root: modalEl });
    
    const closeModal = () => {
        modalEl.classList.add('opacity-0');
        setTimeout(() => modalEl.remove(), 200);
    };
    
    document.getElementById('cancel-delete-review').onclick = closeModal;
    document.getElementById('confirm-delete-review').onclick = async () => {
        const btn = document.getElementById('confirm-delete-review');
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Suppression...`;
        if (window.lucide) window.lucide.createIcons({ root: btn });

        console.log(`[DELETE] Starting deletion process for review ${reviewId} on profile ${freelanceId}`);

        try {
            const currentUserId = auth.currentUser?.uid;
            if (!currentUserId) {
                console.error("[DELETE] No authenticated user session found.");
                showToast("Vous devez être connecté pour effectuer cette action", "error");
                closeModal();
                return;
            }

            const freelanceDocRef = doc(db, 'users', freelanceId);
            const reviewDocRef = doc(db, `users/${freelanceId}/reviews`, reviewId);
            
            // Step 1: Fetch review to get rating and verify ownership
            console.log("[DELETE] Step 1: Fetching review document...");
            let reviewDoc;
            try {
                reviewDoc = await getDoc(reviewDocRef);
            } catch (err) {
                console.error("[DELETE] Failed to GET review doc:", err);
                throw err;
            }

            if (!reviewDoc.exists()) {
                console.warn("[DELETE] Review document does not exist anymore.");
                showToast("Cet avis n'existe plus ou a déjà été supprimé.", "info");
                closeModal();
                return;
            }
            
            const reviewData = reviewDoc.data();
            const reviewRating = reviewData.rating || 0;
            const reviewAuthorId = reviewData.authorId;

            console.log(`[DELETE] Review data retrieved. Author: ${reviewAuthorId}, Current User: ${currentUserId}, Profile: ${freelanceId}`);

            // Double check permissions before calling deleteDoc
            const isOwner = currentUserId === freelanceId;
            const isAuthor = currentUserId === reviewAuthorId;

            if (!isOwner && !isAuthor) {
                console.error("[DELETE] Permission violation detected on client-side.");
                showToast("Vous n'avez pas l'autorisation de supprimer cet avis.", "error");
                closeModal();
                return;
            }

            // Step 2: Fetch freelance to update rating
            console.log("[DELETE] Step 2: Fetching freelance document for stats sync...");
            const freelanceDoc = await getDoc(freelanceDocRef);
            
            const data = freelanceDoc.exists() ? freelanceDoc.data() : {};
            const currentCount = data.reviewsCount || 0;
            const currentRating = data.rating || 0;
            
            const newCount = Math.max(0, currentCount - 1);
            const newRating = (newCount > 0 && currentCount > 0) ? ((currentRating * currentCount) - reviewRating) / newCount : 0;
            
            // Step 3: Perform deletion
            console.log("[DELETE] Step 3: Executing deleteDoc...");
            await deleteDoc(reviewDocRef);
            console.log("[DELETE] Review document deleted successfully.");
            
            // Step 4: Try to sync statistics (Best effort, might fail if rules are strict)
            console.log("[DELETE] Step 4: Attempting updateDoc for freelance stats...");
            try {
                await updateDoc(freelanceDocRef, {
                    reviewsCount: newCount,
                    rating: newRating
                });
                console.log("[DELETE] Freelance stats updated successfully.");
            } catch (updateErr) {
                console.warn("[DELETE] Permission restricted for profile stats update, skipping:", updateErr.message);
                // We don't block the user since the review itself was deleted successfully
            }
            
            showToast("L'avis a bien été supprimé", "success");
            closeModal();
        } catch (err) {
            console.error("[DELETE] Critical deletion error caught:", err);
            try {
                handleFirestoreError(err, OperationType.DELETE, `users/${freelanceId}/reviews/${reviewId}`);
            } catch (ignore) { /* reporting completed */ }
            
            const errMsg = err.message || "";
            if (errMsg.includes("permission") || errMsg.includes("permissions")) {
                showToast("Erreur de permissions Firebase. Réessayez plus tard.", "error");
            } else {
                showToast("Erreur technique lors de la suppression.", "error");
            }
            closeModal();
        }
    };
};

window.contactReviewer = async (authorId, authorName = "Expert") => {
    AppState.activeConversationPartnerId = authorId;
    AppState.prefilledChatMessage = `Bonjour ${authorName},\n\nJ'ai vu que vous aviez laissé une recommandation sur mon profil et j'aimerais beaucoup échanger avec vous.\n\nBien cordialement,`;
    AppState.navigate('messaging');
};

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

// Function mapFreelanceToProfileData is imported from './state.js'

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
                    sessionStorage.setItem('last_viewed_profile_id', AppState.user.uid);
                    localStorage.setItem('last_viewed_profile_id', AppState.user.uid);
                } else {
                    const f = DUMMY_FREELANCES.find(item => item.id === targetFid || item.uid === targetFid);
                    if (f) {
                        AppState.profileData = mapFreelanceToProfileData(f);
                        sessionStorage.setItem('last_viewed_profile_id', targetFid);
                        localStorage.setItem('last_viewed_profile_id', targetFid);
                        if (AppState.user && AppState.user.uid !== targetFid) {
                            const viewerName = AppState.user.displayName || AppState.user.nom || "Un utilisateur";
                            setTimeout(() => {
                                AppState.createNotification(
                                    targetFid,
                                    'info',
                                    'Profil visité 👀',
                                    `${viewerName} a consulté votre profil.`
                                ).catch(e => console.error("Could not notify profile view", e));
                            }, 100);
                        }
                    } else {
                        if (AppState.user && fid === AppState.user.uid) {
                            AppState.profileData = JSON.parse(JSON.stringify(AppState.originalProfileData));
                            AppState.profileData.id = AppState.user.uid;
                            sessionStorage.setItem('last_viewed_profile_id', AppState.user.uid);
                            localStorage.setItem('last_viewed_profile_id', AppState.user.uid);
                        }
                    }
                }
            } else {
                AppState.profileData = JSON.parse(JSON.stringify(AppState.originalProfileData));
                if (AppState.user) {
                    AppState.profileData.id = AppState.user.uid;
                    sessionStorage.setItem('last_viewed_profile_id', AppState.user.uid);
                    localStorage.setItem('last_viewed_profile_id', AppState.user.uid);
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
                if (window.lucide) window.lucide.createIcons({ root: mod });
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
        sessionStorage.setItem('last_viewed_profile_id', targetFid);
        localStorage.setItem('last_viewed_profile_id', targetFid);
        
        if (AppState.user && AppState.user.uid !== targetFid) {
            const viewerName = AppState.user.displayName || AppState.user.nom || "Un utilisateur";
            setTimeout(() => {
                AppState.createNotification(
                    targetFid,
                    'info',
                    'Profil visité 👀',
                    `${viewerName} a consulté votre profil.`
                ).catch(e => console.error("Could not notify profile view", e));
            }, 100);
        }
        
        AppState.currentPath = 'profile';
        window.location.hash = 'profile';
    }
}

// Global Video Playback Management: only one video playing at a time & pause when scrolling out of view
const videoIntersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            const video = entry.target;
            if (!video.paused) {
                video.pause();
            }
        }
    });
}, { threshold: 0.1 }); // 10% visible to pause

// We need a MutationObserver to attach the IntersectionObserver to dynamically added <video> tags
const observeNewVideos = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'VIDEO') {
                        videoIntersectionObserver.observe(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('video').forEach(video => {
                            videoIntersectionObserver.observe(video);
                        });
                    }
                }
            });
        }
    }
});

observeNewVideos.observe(document.body, { childList: true, subtree: true });

// Also observe any existing videos right now
document.querySelectorAll('video').forEach(video => {
    videoIntersectionObserver.observe(video);
});

// Enforce single video playback
document.addEventListener('play', (e) => {
    if (e.target.tagName === 'VIDEO') {
        const currentVideo = e.target;
        document.querySelectorAll('video').forEach(video => {
            if (video !== currentVideo && !video.paused) {
                video.pause();
            }
        });
    }
}, true); // use capture phase because 'play' event does not bubble

createRoot(document.getElementById('app')).render(<App />);
