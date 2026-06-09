import { AppState, DUMMY_SERVICES, DUMMY_FREELANCES } from '../state.js';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase.js';
import { showToast } from './Toast.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const closeServiceInfoModal = () => {
    const modal = document.getElementById('service-info-modal');
    const content = document.getElementById('service-info-modal-content');
    if (modal && content) {
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
};

export const openServiceInfoModal = (serviceId) => {
    const service = DUMMY_SERVICES.find(s => s.id === serviceId);
    if (!service) {
        showToast("Service introuvable.", "error");
        return;
    }

    const modal = document.getElementById('service-info-modal');
    const content = document.getElementById('service-info-modal-content');
    if (!modal || !content) return;

    // Retrieve freelance details
    const authorFid = service.authorId || service.uid;
    const authorInfo = DUMMY_FREELANCES.find(f => f.id === authorFid || f.uid === authorFid);
    const authorImg = service.authorImg || (authorInfo && authorInfo.img) || null;
    let authorTitle = authorInfo ? authorInfo.title : "Expert Indépendant";

    // Set fallback description if none is present
    const categoryDescriptions = {
        'Code': "Prestation technique haut de gamme incluant l'analyse des besoins, le développement de fonctionnalités optimisées, l'intégration responsive et la mise en production.",
        'Design': "Création de maquettes graphiques uniques, recherche d'identité de marque, conception UI/UX soignée et livraison de fichiers sources prêts à l'emploi.",
        'Marketing': "Analyse d'audience, optimisation pour les moteurs de recherche (SEO), campagne d'acquisition et rapport mensuel détaillé des performances."
    };
    const detailedDescription = service.desc || service.description || categoryDescriptions[service.category] || "Création de projets professionnels adaptés à vos contraintes. Prestation effectuée par un expert certifié garantissant qualité et respect des délais.";

    // Render modal details
    const modalImage = document.getElementById('srv-modal-image');
    const modalCategory = document.getElementById('srv-modal-category');
    const modalTitle = document.getElementById('srv-modal-title');
    const modalDescription = document.getElementById('srv-modal-description');
    const modalDelay = document.getElementById('srv-modal-delay');
    const modalPrice = document.getElementById('srv-modal-price');
    const modalAuthorAvatar = document.getElementById('srv-modal-author-avatar');
    const modalAuthorName = document.getElementById('srv-modal-author-name');
    const modalAuthorTitle = document.getElementById('srv-modal-author-title');
    const modalAuthorRating = document.getElementById('srv-modal-author-rating');
    const modalBtnContact = document.getElementById('srv-modal-btn-contact');
    const modalBtnComments = document.getElementById('srv-modal-btn-comments');

    if (modalImage) modalImage.src = service.img || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80";
    if (modalCategory) modalCategory.textContent = service.category;
    if (modalTitle) {
        modalTitle.textContent = service.title;
        const textLen = (service.title || '').length;
        if (textLen > 80) {
            modalTitle.className = "text-base sm:text-lg font-bold text-slate-800 leading-relaxed break-words";
        } else if (textLen > 40) {
            modalTitle.className = "text-lg sm:text-xl font-bold text-slate-800 leading-snug break-words";
        } else {
            modalTitle.className = "text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug break-words";
        }
    }
    if (modalDescription) modalDescription.textContent = detailedDescription;
    
    let formattedDelay = service.délai || "Non spécifié";
    if (/^\d+$/.test(String(formattedDelay).trim())) {
        formattedDelay = `${formattedDelay} jours`;
    }
    if (modalDelay) modalDelay.textContent = formattedDelay;
    
    let formattedPrice = service.price || "Sur devis";
    if (/^\d+$/.test(String(formattedPrice).trim())) {
        formattedPrice = `À partir de ${formattedPrice}€`;
    }
    if (modalPrice) modalPrice.textContent = formattedPrice;

    if (modalAuthorAvatar) {
        if (authorImg) {
            modalAuthorAvatar.innerHTML = `<img src="${authorImg}" alt="${service.auteur}" class="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" referrerPolicy="no-referrer" />`;
        } else {
            modalAuthorAvatar.innerHTML = `<div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">${(service.auteur || "U").charAt(0).toUpperCase()}</div>`;
        }
    }
    if (modalAuthorName) modalAuthorName.textContent = service.auteur || "Expert";
    if (modalAuthorTitle) modalAuthorTitle.textContent = authorTitle;
    if (modalAuthorRating) modalAuthorRating.textContent = `${service.rating || '5.0'} / 5.0`;

    // Dynamic contact action configuration
    const isMyOwnService = auth.currentUser && (auth.currentUser.uid === service.authorId);
    if (modalBtnContact) {
        if (isMyOwnService) {
            modalBtnContact.innerHTML = `<i data-lucide="edit-3" class="w-4 h-4 mr-2"></i> Gérer mon offre`;
            modalBtnContact.className = "flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg shadow-sm transition flex items-center justify-center text-xs sm:text-sm cursor-pointer border border-slate-200";
            modalBtnContact.onclick = () => {
                closeServiceInfoModal();
                AppState.navigate('profile');
            };
        } else {
            modalBtnContact.innerHTML = `<i data-lucide="message-square" class="w-4 h-4 mr-2"></i> Contacter le Freelance`;
            modalBtnContact.className = "flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg shadow-lg shadow-indigo-600/20 transition flex items-center justify-center text-xs sm:text-sm cursor-pointer border-none";
            modalBtnContact.onclick = () => {
                if (!auth.currentUser) {
                    closeServiceInfoModal();
                    showToast("Veuillez vous connecter pour contacter ce freelance.", "info");
                    AppState.navigate('login');
                    return;
                }
                closeServiceInfoModal();
                AppState.activeConversationPartnerId = authorFid;
                AppState.prefilledChatMessage = `Bonjour ${service.auteur || 'Expert'},\n\nJe suis très intéressé(e) par votre service "${service.title}" (${service.price || 'Sur devis'}).\nJ'aimerais échanger avec vous pour en savoir plus et définir les modalités de collaboration.\n\nBien cordialement,`;
                AppState.navigate('messaging');
            };
        }
    }

    if (modalBtnComments) {
        modalBtnComments.onclick = () => {
            closeServiceInfoModal();
            setTimeout(() => {
                window.openCommentsModal(serviceId, service.title);
            }, 50);
        };
    }

    // Dynamic Review & Rating section display configuration
    const reviewSection = document.getElementById('srv-modal-review-section');
    const reviewAuthorDisplay = document.getElementById('srv-modal-review-author-display');
    if (reviewSection) {
        if (!isMyOwnService) {
            reviewSection.classList.remove('hidden');
            if (reviewAuthorDisplay) {
                reviewAuthorDisplay.textContent = service.auteur || "ce freelance";
            }
            // Pre-fill user name if logged in
            const reviewAuthorInput = document.getElementById('srv-modal-review-author');
            if (reviewAuthorInput) {
                reviewAuthorInput.value = AppState.user ? (AppState.user.nom || '') : '';
            }
            const reviewTextInput = document.getElementById('srv-modal-review-text');
            if (reviewTextInput) reviewTextInput.value = '';
            
            const ratingInput = document.getElementById('srv-modal-selected-rating');
            if (ratingInput) ratingInput.value = '0';
            
            const ratingLabel = document.getElementById('srv-modal-star-label');
            if (ratingLabel) {
                ratingLabel.textContent = "Sélectionnez une note";
                ratingLabel.className = "text-xs font-semibold text-slate-400 ml-2";
            }

            const stars = document.querySelectorAll('.srv-star-btn');
            const ratingTexts = {
                1: "Médiocre (1/5)",
                2: "Moyen (2/5)",
                3: "Bien (3/5)",
                4: "Très bon (4/5)",
                5: "Excellent ! (5/5)"
            };

            const updateStarsHighlight = (ratingValue) => {
                stars.forEach((star, index) => {
                    const icon = star.querySelector('[data-lucide="star"]');
                    if (icon) {
                        if (index < ratingValue) {
                            icon.classList.remove('text-slate-200');
                            icon.classList.add('text-amber-400', 'fill-current');
                        } else {
                            icon.classList.add('text-slate-200');
                            icon.classList.remove('text-amber-400', 'fill-current');
                        }
                    }
                });
            };

            stars.forEach(star => {
                star.onmouseenter = () => {
                    const val = parseInt(star.getAttribute('data-value'), 10);
                    updateStarsHighlight(val);
                    if (ratingLabel) ratingLabel.textContent = ratingTexts[val] || "Sélectionnez une note";
                };

                star.onmouseleave = () => {
                    const currentVal = parseInt(ratingInput.value, 10);
                    updateStarsHighlight(currentVal);
                    if (ratingLabel) ratingLabel.textContent = ratingTexts[currentVal] || "Sélectionnez une note";
                };

                star.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = parseInt(star.getAttribute('data-value'), 10);
                    ratingInput.value = val;
                    updateStarsHighlight(val);
                    if (ratingLabel) {
                        ratingLabel.textContent = ratingTexts[val];
                        ratingLabel.className = "text-xs font-extrabold text-amber-600 ml-2 transition-colors duration-200";
                    }
                };
            });

            const reviewForm = document.getElementById('srv-modal-review-form');
            if (reviewForm) {
                console.log("ServiceInfoModal: Form found, attaching submit listener.");
                // Remove any previous listener to avoid duplicates if necessary, though 'onsubmit =' usually overwrites
                reviewForm.onsubmit = null; 
                reviewForm.addEventListener('submit', async (e) => {
                    console.log("ServiceInfoModal: Submit event triggered.");
                    e.preventDefault();
                    
                    if (!auth.currentUser) {
                        showToast("Veuillez vous connecter pour laisser un avis.", "error");
                        closeServiceInfoModal();
                        AppState.navigate('login');
                        return;
                    }

                    const ratingVal = parseInt(ratingInput.value, 10);
                    console.log("ServiceInfoModal: Rating:", ratingVal);
                    if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
                        showToast('Veuillez sélectionner une évaluation en cliquant sur les étoiles.', 'error');
                        return;
                    }
                    
                    const authorVal = document.getElementById('srv-modal-review-author').value.trim();
                    const textVal = document.getElementById('srv-modal-review-text').value.trim();
                    console.log("ServiceInfoModal: Author:", authorVal, "Text:", textVal);
                    
                    if (!authorVal || !textVal) {
                        showToast('Veuillez remplir tous les champs obligatoires.', 'error');
                        return;
                    }
                    
                    const newReview = {
                        author: authorVal,
                        date: "À l'instant",
                        text: textVal,
                        rating: ratingVal
                    };

                    // Persist to Cloud Firestore subcollection
                    try {
                        console.log("Saving review to Firestore:", authorFid, authorVal, textVal, ratingVal);
                        await addDoc(collection(db, `users/${authorFid}/reviews`), {
                            author: authorVal,
                            authorId: auth.currentUser?.uid || 'anonymous',
                            text: textVal,
                            rating: ratingVal,
                            createdAt: serverTimestamp()
                        });
                        console.log("Review saved to Firestore successfully.");
                    } catch (dbErr) {
                        console.error("Failed to save review to Firestore subcollection:", dbErr);
                        handleFirestoreError(dbErr, OperationType.CREATE, `users/${authorFid}/reviews`);
                        return; // Stop submission on DB error
                    }
                    
                    // 1. Update active view profile reviews if it belongs to this author
                    if (AppState.profileData && AppState.profileData.id === authorFid) {
                        if (!AppState.profileData.reviews) {
                            AppState.profileData.reviews = [];
                        }
                        AppState.profileData.reviews.unshift(newReview);
                        
                        if (AppState.profileData.stats) {
                            const projStat = AppState.profileData.stats.find(s => s.label === "Projets réussis" || s.label === "Projets");
                            if (projStat) {
                                const originalVal = parseInt(projStat.value, 10) || 0;
                                projStat.value = String(originalVal + 1);
                            }
                        }
                    }

                    // 2. Update entry in central DUMMY_FREELANCES list
                    const targetFreelance = DUMMY_FREELANCES.find(item => item.id === authorFid || item.uid === authorFid);
                    if (targetFreelance) {
                        if (!targetFreelance.reviews) {
                            targetFreelance.reviews = [];
                        }
                        targetFreelance.reviews.unshift(newReview);
                        targetFreelance.reviewsCount = (targetFreelance.reviewsCount || 0) + 1;
                    }

                    // 3. Dispatch an in-app review notification
                    try {
                        const userName = AppState.user?.nom || AppState.profileData?.displayName || "Un client";
                        await AppState.createNotification(
                            authorFid,
                            'review',
                            'Nouvel avis publié !',
                            `${userName} a laissé une évaluation de ${ratingVal}/5 avec un avis : "${textVal.substring(0, 40)}..."`
                        );
                    } catch (err) {
                        console.error("Failed to trigger review notification:", err);
                    }

                    // 4. Update the layout and show feedback toast
                    AppState.notify();
                    closeServiceInfoModal();
                    showToast("Votre avis a bien été publié !", "success");
                });
            } else {
                console.error("ServiceInfoModal: Form NOT FOUND.");
            }
        } else {
            reviewSection.classList.add('hidden');
        }
    }

    // Show modal
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);

    if (window.lucide) window.lucide.createIcons({ root: modal });

    // Handle clicks outside content to close
    modal.onclick = (e) => {
        if (e.target === modal) closeServiceInfoModal();
    };
};

export const ServiceInfoModal = () => {
    return `
    <div id="service-info-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] hidden items-center justify-center p-4 transition-opacity duration-300 opacity-0 flex">
        <div id="service-info-modal-content" class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300 flex flex-col max-h-[90vh] border border-slate-100">
            <!-- Header Image -->
            <div class="h-56 shrink-0 relative overflow-hidden bg-slate-100">
                <img id="srv-modal-image" src="" class="w-full h-full object-cover" alt="Illustration du service" referrerPolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                <button type="button" class="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition cursor-pointer border border-white/20" onclick="window.closeServiceInfoModal()">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
                
                <div class="absolute bottom-4 left-6">
                    <span id="srv-modal-category" class="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md text-nowrap"></span>
                </div>
            </div>
            
            <!-- Modal Body scrollable -->
            <div class="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
                <!-- Title & Meta -->
                <div>
                    <h2 id="srv-modal-title" class="text-xl font-bold text-slate-900 leading-snug break-words"></h2>
                </div>

                <!-- Price and Deliverables Box -->
                <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
                    <div class="flex items-center space-x-3">
                        <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
                            <i data-lucide="wallet" class="w-5 h-5"></i>
                        </div>
                        <div class="min-w-0">
                            <span class="block text-[10px] text-slate-450 font-semibold uppercase tracking-wider leading-none mb-1">Tarif indicatif</span>
                            <span id="srv-modal-price" class="text-sm sm:text-base font-bold text-slate-850 leading-none truncate block"></span>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                        <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shrink-0">
                            <i data-lucide="clock" class="w-5 h-5"></i>
                        </div>
                        <div class="min-w-0">
                            <span class="block text-[10px] text-slate-450 font-semibold uppercase tracking-wider leading-none mb-1">Délai estimé</span>
                            <span id="srv-modal-delay" class="text-sm sm:text-base font-bold text-slate-850 leading-none truncate block"></span>
                        </div>
                    </div>
                </div>

                <!-- Description -->
                <div class="space-y-2">
                    <h4 class="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Description de la prestation</h4>
                    <p id="srv-modal-description" class="text-slate-650 text-sm leading-relaxed whitespace-pre-line break-words"></p>
                </div>

                <!-- Freelancer Info Section -->
                <div class="pt-6 border-t border-slate-100">
                    <h4 class="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-3">Prestataire</h4>
                    <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 gap-3">
                        <div class="flex items-center space-x-3 min-w-0">
                            <div id="srv-modal-author-avatar" class="shrink-0"></div>
                            <div class="min-w-0">
                                <span id="srv-modal-author-name" class="block font-semibold text-slate-850 text-sm leading-tight truncate"></span>
                                <span id="srv-modal-author-title" class="block text-xs text-slate-500 leading-tight truncate"></span>
                            </div>
                        </div>
                        <div class="flex items-center bg-amber-50 text-amber-700 rounded-xl px-3 py-1.5 text-xs font-semibold border border-amber-100 shrink-0">
                            <i data-lucide="star" class="w-3.5 h-3.5 fill-current mr-1 text-amber-500"></i>
                            <span id="srv-modal-author-rating"></span>
                        </div>
                    </div>
                </div>

                <!-- Laisser un avis Section -->
                <div id="srv-modal-review-section" class="pt-6 border-t border-slate-100 hidden">
                    <div class="bg-indigo-50/20 rounded-2xl p-5 border border-indigo-100/30 space-y-4">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <h4 class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                    <i data-lucide="pen-tool" class="w-4 h-4 text-indigo-600"></i> Laisser un avis & Note
                                </h4>
                                <p class="text-slate-500 text-[11px] mt-1 leading-normal font-medium">Vous avez déjà collaboré avec <span id="srv-modal-review-author-display" class="font-semibold text-slate-700">ce freelance</span> ? Partagez vos impressions.</p>
                            </div>
                        </div>
                        
                        <form id="srv-modal-review-form" class="space-y-4">
                            <div>
                                <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Votre évaluation</label>
                                <div class="flex items-center gap-1" id="srv-modal-star-container">
                                    <button type="button" class="srv-star-btn group hover:scale-110 transition-transform p-0.5 cursor-pointer" data-value="1">
                                        <i data-lucide="star" class="w-5 h-5 text-slate-200 fill-transparent transition-colors hover:text-amber-400"></i>
                                    </button>
                                    <button type="button" class="srv-star-btn group hover:scale-110 transition-transform p-0.5 cursor-pointer" data-value="2">
                                        <i data-lucide="star" class="w-5 h-5 text-slate-200 fill-transparent transition-colors hover:text-amber-400"></i>
                                    </button>
                                    <button type="button" class="srv-star-btn group hover:scale-110 transition-transform p-0.5 cursor-pointer" data-value="3">
                                        <i data-lucide="star" class="w-5 h-5 text-slate-200 fill-transparent transition-colors hover:text-amber-400"></i>
                                    </button>
                                    <button type="button" class="srv-star-btn group hover:scale-110 transition-transform p-0.5 cursor-pointer" data-value="4">
                                        <i data-lucide="star" class="w-5 h-5 text-slate-200 fill-transparent transition-colors hover:text-amber-400"></i>
                                    </button>
                                    <button type="button" class="srv-star-btn group hover:scale-110 transition-transform p-0.5 cursor-pointer" data-value="5">
                                        <i data-lucide="star" class="w-5 h-5 text-slate-200 fill-transparent transition-colors hover:text-amber-400"></i>
                                    </button>
                                    <span id="srv-modal-star-label" class="text-xs font-semibold text-slate-400 ml-2">Sélectionnez une note</span>
                                </div>
                                <input type="hidden" id="srv-modal-selected-rating" value="0" required>
                            </div>
                            
                            <div class="grid grid-cols-1 gap-3">
                                <div>
                                    <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1" for="srv-modal-review-author">Votre nom ou entreprise</label>
                                    <input type="text" id="srv-modal-review-author" required placeholder="Ex: Marie (CEO Tech Corp)" class="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl transition font-medium text-slate-800 text-xs">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1" for="srv-modal-review-text">Votre expérience ou recommandation</label>
                                <textarea id="srv-modal-review-text" required rows="2" placeholder="Présentation claire et objective de votre collaboration..." class="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl transition font-medium text-slate-800 text-xs resize-none"></textarea>
                            </div>
                            
                            <div class="pt-1">
                                <button type="submit" id="srv-modal-submit-review-btn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold transition shadow-md shadow-indigo-650/10 text-xs flex items-center justify-center gap-2 cursor-pointer">
                                    <i data-lucide="send" class="w-3.5 h-3.5"></i> Publier mon avis
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Actions Footer -->
            <div class="p-4 border-t border-slate-100 bg-white flex gap-3 shrink-0">
                <button type="button" id="srv-modal-btn-comments" class="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-lg transition flex items-center justify-center text-xs sm:text-sm cursor-pointer" title="Voir les commentaires">
                    <i data-lucide="message-square" class="w-4 h-4 mr-1.5"></i> Commentaires
                </button>
                <button type="button" id="srv-modal-btn-contact" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg shadow-lg shadow-indigo-600/20 transition flex items-center justify-center text-xs sm:text-sm border-none cursor-pointer">
                    <i data-lucide="message-square" class="w-4 h-4 mr-2"></i> Contacter
                </button>
            </div>
        </div>
    </div>
    `;
};
