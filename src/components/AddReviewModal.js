import { AppState } from '../state.js';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase.js';
import { showToast } from './Toast.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
        
        if (!authorVal || !textVal) {
            showToast('Remplissez tous les champs.', 'error');
            return;
        }
        
        try {
            await addDoc(collection(db, `users/${freelanceId}/reviews`), {
                author: authorVal,
                authorId: auth.currentUser?.uid || 'anonymous',
                text: textVal,
                rating: ratingVal,
                createdAt: serverTimestamp()
            });
            showToast("Avis publié !", "success");
            closeAddReviewModal();
        } catch (dbErr) {
            console.error(dbErr);
            showToast("Erreur lors de l'enregistrement.", "error");
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
                    <textarea id="add-rev-text" required rows="4" class="w-full px-4 py-3 border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
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
