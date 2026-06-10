import { AppState } from '../state.js';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase.js';
import { showToast } from './Toast.js';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

export const closeAddReviewModal = () => {
    const modal = document.getElementById('add-review-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

export const openAddReviewModal = (freelanceId, freelanceName) => {
    console.log("Attempting to open modal for:", freelanceId);
    const modal = document.getElementById('add-review-modal');
    console.log("Modal found:", !!modal);
    if (!modal) return;
    
    // Setting up the reviewer info
    const reviewAuthorInput = document.getElementById('add-rev-author');
    if (reviewAuthorInput) {
        reviewAuthorInput.value = AppState.user ? (AppState.user.nom || '') : '';
    }
    document.getElementById('add-rev-text').value = '';
    document.getElementById('add-rev-selected-rating').value = '0';

    modal.classList.remove('hidden');
    
    // Setup stars interaction same as in ServiceInfoModal, keep it simple
    // Actually, I can just reuse the interaction logic if I put it here.
    
    // Setup tabs for video input
    const tabUrl = document.getElementById('tab-add-rev-url');
    const tabUpload = document.getElementById('tab-add-rev-upload');
    const containerUrl = document.getElementById('container-add-rev-url');
    const containerUpload = document.getElementById('container-add-rev-upload');
    
    if (tabUrl && tabUpload && containerUrl && containerUpload) {
        tabUrl.onclick = () => {
            tabUrl.className = "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-indigo-50 text-indigo-700";
            tabUpload.className = "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-slate-50 text-slate-500 hover:bg-slate-100";
            containerUrl.classList.remove('hidden');
            containerUpload.classList.add('hidden');
            document.getElementById('add-rev-video-upload').value = '';
        };
        tabUpload.onclick = () => {
            tabUpload.className = "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-indigo-50 text-indigo-700";
            tabUrl.className = "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-slate-50 text-slate-500 hover:bg-slate-100";
            containerUpload.classList.remove('hidden');
            containerUrl.classList.add('hidden');
            document.getElementById('add-rev-video-url').value = '';
        };
    }

    // Form submission
    const reviewForm = document.getElementById('add-review-form');
    reviewForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const ratingVal = parseInt(document.getElementById('add-rev-selected-rating').value, 10);
        if (!ratingVal || ratingVal < 1) {
            showToast('Veuillez noter le freelance.', 'error');
            return;
        }
        
        const authorVal = document.getElementById('add-rev-author').value.trim();
        const textVal = document.getElementById('add-rev-text').value.trim();
        const videoUrlVal = document.getElementById('add-rev-video-url')?.value.trim() || '';
        let finalVideoUrl = videoUrlVal;

        const videoFile = document.getElementById('add-rev-video-upload')?.files[0];
        
        if (!authorVal || !textVal) {
            showToast('Remplissez tous les champs.', 'error');
            return;
        }

        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span class="text-white">Publication en cours...</span>`;
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-80', 'cursor-not-allowed', 'flex', 'items-center', 'justify-center');

            try {
                if (videoFile) {
                    const formData = new FormData();
                    formData.append('file', videoFile);
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    if (!uploadRes.ok) throw new Error("Upload vidéo échoué: " + uploadRes.statusText);
                    const uploadData = await uploadRes.json();
                    finalVideoUrl = uploadData.url;
                }
            } catch (uploadErr) {
                console.error("Video upload failed:", uploadErr);
                showToast("Erreur lors de l'envoi de la vidéo. Veuillez réessayer.", "error");
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-80', 'cursor-not-allowed', 'flex', 'items-center', 'justify-center');
                return;
            }

            // Update freelance rating and count in Firestore
            const freelanceDocRef = doc(db, 'users', freelanceId);
            const freelanceDoc = await getDoc(freelanceDocRef);
            if (freelanceDoc.exists()) {
                const data = freelanceDoc.data();
                const currentCount = data.reviewsCount || 0;
                const currentRating = data.rating || 0;
                
                const newCount = currentCount + 1;
                const newRating = ((currentRating * currentCount) + ratingVal) / newCount;
                
                try {
                    await updateDoc(freelanceDocRef, {
                        reviewsCount: newCount,
                        rating: newRating
                    });
                } catch (updateErr) {
                    console.warn("Could not update freelance stats, proceeding with review creation:", updateErr);
                }
            }

            const authorId = auth.currentUser?.uid;
            if (!authorId) {
                showToast("Votre session a expiré. Veuillez vous reconnecter.", "error");
                return;
            }

            await addDoc(collection(db, `users/${freelanceId}/reviews`), {
                author: authorVal,
                authorId: authorId,
                text: textVal,
                rating: ratingVal,
                videoUrl: finalVideoUrl,
                createdAt: serverTimestamp()
            });

            if (finalVideoUrl) {
                try {
                    await addDoc(collection(db, 'video_testimonials'), {
                        author: authorVal,
                        authorId: authorId,
                        freelanceId: freelanceId,
                        freelanceName: freelanceName,
                        text: textVal,
                        rating: ratingVal,
                        videoUrl: finalVideoUrl,
                        createdAt: serverTimestamp()
                    });
                } catch(err) {
                    console.warn("Could not save to global video_testimonials:", err);
                }
            }

            showToast("Avis publié !", "success");
            closeAddReviewModal();
        } catch (dbErr) {
            console.error("Firestore Error in review creation: ", dbErr);
            handleFirestoreError(dbErr, OperationType.CREATE, `users/${freelanceId}/reviews`);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-80', 'cursor-not-allowed', 'flex', 'items-center', 'justify-center');
        }
    };
};

export const AddReviewModal = () => {
    return `
    <div id="add-review-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8">
            <h3 class="text-2xl font-bold text-slate-800 mb-6">Partager votre expérience</h3>
            <form id="add-review-form" class="space-y-5">
                <div>
                     <label class="block text-sm font-semibold text-slate-500 mb-1.5">Note (1-5)</label>
                     <select id="add-rev-selected-rating" class="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                         <option value="0">Sélectionnez une note...</option>
                         <option value="1">1 - Très déçu</option>
                         <option value="2">2 - Insatisfaisant</option>
                         <option value="3">3 - Moyen</option>
                         <option value="4">4 - Très bien</option>
                         <option value="5">5 - Excellent</option>
                     </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-500 mb-1.5">Votre nom</label>
                    <input type="text" id="add-rev-author" required class="w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-500 mb-1.5">Votre avis</label>
                    <textarea id="add-rev-text" required rows="4" class="w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Partagez votre expérience..."></textarea>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>Témoignage vidéo (Optionnel)</span>
                        <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded cursor-help" title="Lien externe ou fichier local">Aide</span>
                    </label>
                    <div class="flex gap-2 mb-3">
                        <button type="button" id="tab-add-rev-url" class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-indigo-50 text-indigo-700">Lien Youtube/Vimeo</button>
                        <button type="button" id="tab-add-rev-upload" class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors bg-slate-50 text-slate-500 hover:bg-slate-100">Fichier (.mp4, .webm)</button>
                    </div>
                    
                    <div id="container-add-rev-url" class="relative">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i data-lucide="video" class="w-4 h-4 text-slate-400"></i>
                        </div>
                        <input type="url" id="add-rev-video-url" class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Lien vers une courte vidéo (ex: YouTube, Vimeo)">
                    </div>

                    <div id="container-add-rev-upload" class="hidden relative">
                        <input type="file" id="add-rev-video-upload" accept="video/mp4,video/webm,video/ogg" class="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 p-2 border border-slate-200 rounded-2xl bg-slate-50/50">
                    </div>
                </div>
                <div class="pt-2">
                    <button type="submit" class="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Publier l'avis</button>
                    <button type="button" onclick="window.closeAddReviewModal()" class="w-full text-slate-500 py-3.5 mt-2 font-medium hover:text-slate-800 transition-colors">Annuler</button>
                </div>
            </form>
        </div>
    </div>
    `;
};
