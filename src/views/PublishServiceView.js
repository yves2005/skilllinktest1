import { AppState, DUMMY_SERVICES } from '../state.js';

export const PublishServiceView = {
    render: () => {
        if (!AppState.user) {
            return `
                <div class="max-w-md mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col mt-12 mb-8 p-8 text-center animate-fade-in">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 mb-4 mx-auto">
                        <i data-lucide="lock" class="w-8 h-8 text-amber-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-900">Connexion requise</h2>
                    <p class="text-slate-500 mt-2 mb-6 text-sm">Vous devez être connecté avec un compte Freelance pour publier une compétence.</p>
                    <button data-route="login" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 font-bold transition shadow-md cursor-pointer">
                        Se connecter
                    </button>
                </div>
            `;
        }

        if (AppState.user.role === 'client') {
            return `
                <div class="max-w-md mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col mt-12 mb-8 p-8 text-center animate-fade-in">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 mb-4 mx-auto">
                        <i data-lucide="shield-alert" class="w-8 h-8 text-indigo-600"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-900">Profil Freelance requis</h2>
                    <p class="text-slate-500 mt-2 mb-6 text-sm">Seuls les membres inscrits avec un profil Freelance peuvent publier des offres de services sur le marketplace.</p>
                    <button data-route="profile-edit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 font-bold transition shadow-md cursor-pointer">
                        Modifier mon profil en Freelance
                    </button>
                </div>
            `;
        }

        return `
        <div class="max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col mt-6 mb-8 p-8 sm:p-12">
            <!-- Navigation Rapide -->
            <div class="flex justify-center gap-4 mb-8 pb-4 border-b border-slate-100">
                <button data-route="marketplace" class="flex items-center text-slate-500 hover:text-indigo-600 transition font-medium text-sm">
                    <i data-lucide="search" class="w-4 h-4 mr-1.5"></i> Explorer
                </button>
                <div class="w-px h-5 bg-slate-200"></div>
                <button data-route="ai" class="flex items-center text-slate-500 hover:text-indigo-600 transition font-medium text-sm">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-1.5"></i> Assistant IA
                </button>
            </div>

            <div class="mb-10 text-center relative">
                <button data-action="back" class="absolute left-0 top-0 text-slate-400 hover:text-slate-600 transition flex items-center justify-center p-2 rounded-full hover:bg-slate-100">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </button>
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 mb-4 mt-2">
                    <i data-lucide="sparkles" class="w-8 h-8 text-indigo-600"></i>
                </div>
                <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Publier une compétence</h2>
                <p class="text-slate-500 mt-2">Proposez vos services à notre communauté de clients.</p>
            </div>

            <!-- Error Banner -->
            <div id="form-error" class="hidden mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                <i data-lucide="alert-circle" class="w-5 h-5 text-red-500 shrink-0"></i>
                <span id="form-error-msg">Veuillez corriger les erreurs ci-dessous.</span>
            </div>

            <form id="publish-form" class="space-y-6" novalidate>
                ${(AppState.profileData.serviceTemplates && AppState.profileData.serviceTemplates.length > 0) ? `
                <div class="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl mb-6">
                    <label class="block pl-1 text-sm font-semibold text-indigo-900 mb-1.5 flex items-center">
                        <i data-lucide="layout-template" class="w-4 h-4 mr-1.5 text-indigo-500"></i>
                        Utiliser un modèle enregistré
                    </label>
                    <div class="relative">
                        <select id="template-selector" class="w-full pl-4 pr-10 py-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium text-slate-700 appearance-none">
                            <option value="">-- Sélectionner un modèle --</option>
                            ${AppState.profileData.serviceTemplates.map((tpl, i) => `
                                <option value="${i}">${AppState.escapeHtml(tpl.title)}</option>
                            `).join('')}
                        </select>
                        <i data-lucide="chevron-down" class="w-4 h-4 text-indigo-400 absolute right-4 top-3.5 pointer-events-none"></i>
                    </div>
                </div>
                ` : ''}

                <div>
                    <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Titre du service <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <i data-lucide="type" class="w-5 h-5 text-slate-400 absolute left-3.5 top-4"></i>
                        <input type="text" id="service-title" placeholder="Ex: Création de site vitrine complet" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium">
                    </div>
                </div>

                <div>
                    <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Description détaillée <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <i data-lucide="align-left" class="w-5 h-5 text-slate-400 absolute left-3.5 top-4"></i>
                        <textarea id="service-desc" rows="4" placeholder="Décrivez en détail ce que vous proposez..." class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium resize-none"></textarea>
                    </div>
                    <p class="text-xs text-slate-500 mt-1.5 pl-1">Minimum 20 caractères.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Catégorie <span class="text-red-500">*</span></label>
                        <div class="relative">
                            <select id="service-category" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition appearance-none font-medium text-slate-700">
                                <option value="Code">Développement (Code)</option>
                                <option value="Design">Design & Création</option>
                                <option value="Marketing">Marketing & SEO</option>
                            </select>
                            <i data-lucide="folder" class="w-5 h-5 text-indigo-500 absolute left-3.5 top-4 pointer-events-none"></i>
                            <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none"></i>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Prix de départ (€) <span class="text-red-500">*</span></label>
                        <div class="relative">
                            <i data-lucide="euro" class="w-5 h-5 text-slate-400 absolute left-3.5 top-4"></i>
                            <input type="number" id="service-price" placeholder="Ex: 500" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Délai estimé <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <i data-lucide="clock" class="w-5 h-5 text-slate-400 absolute left-3.5 top-4"></i>
                        <input type="text" id="service-delay" placeholder="Ex: 2 semaines" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium">
                    </div>
                </div>

                <div>
                    <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5 flex justify-between items-center">
                        <span>Image d'illustration <span class="text-xs text-slate-500 font-normal ml-1">(Optionnel)</span></span>
                        <div class="flex bg-slate-100 rounded-lg p-0.5">
                            <button type="button" id="tab-img-url" class="px-3 py-1 text-xs font-bold bg-white text-indigo-600 shadow-sm rounded-md transition cursor-pointer">Lien URL</button>
                            <button type="button" id="tab-img-upload" class="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md transition cursor-pointer">Fichier</button>
                        </div>
                    </label>
                    <div id="container-img-url" class="relative block">
                        <i data-lucide="image" class="w-5 h-5 text-slate-400 absolute left-3.5 top-4"></i>
                        <input type="url" id="service-img" placeholder="https://example.com/image.jpg" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium">
                        ${AppState.profileData.recentImageUrls && AppState.profileData.recentImageUrls.length > 0 ? `
                        <div class="mt-2 flex flex-wrap gap-2">
                            <span class="text-xs text-slate-500 flex items-center">Récents :</span>
                            ${AppState.profileData.recentImageUrls.map(url => `
                                <button type="button" class="btn-recent-img px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs rounded border border-indigo-100 transition cursor-pointer max-w-[150px] truncate" title="${AppState.escapeHtml(url)}" data-url="${AppState.escapeHtml(url)}">
                                    ${AppState.escapeHtml(url.replace(/^https?:\/\//, ''))}
                                </button>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    <div id="container-img-upload" class="relative hidden">
                        <input type="file" id="service-img-file" accept="image/*" class="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
                    </div>
                </div>

                <div class="pt-4 space-y-3">
                    <button type="button" id="btn-preview" class="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-4 py-3 font-bold transition shadow-md flex items-center justify-center cursor-pointer">
                        Prévisualiser <i data-lucide="eye" class="w-4 h-4 ml-2"></i>
                    </button>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 font-bold transition shadow-md flex items-center justify-center cursor-pointer">
                        Publier le service <i data-lucide="send" class="w-4 h-4 ml-2"></i>
                    </button>
                    <button type="button" data-route="marketplace" class="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 font-bold transition flex items-center justify-center cursor-pointer">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
        `;
    },
    
    attachEvents: () => {
        const form = document.getElementById('publish-form');
        const formError = document.getElementById('form-error');
        const formErrorMsg = document.getElementById('form-error-msg');
        const templateSelector = document.getElementById('template-selector');
        
        let imgType = 'url';
        let base64Image = '';

        const tabImgUrl = document.getElementById('tab-img-url');
        const tabImgUpload = document.getElementById('tab-img-upload');
        const containerImgUrl = document.getElementById('container-img-url');
        const containerImgUpload = document.getElementById('container-img-upload');
        const imgFileInput = document.getElementById('service-img-file');

        if (tabImgUrl && tabImgUpload) {
            tabImgUrl.addEventListener('click', () => {
                imgType = 'url';
                tabImgUrl.className = "px-3 py-1 text-xs font-bold bg-white text-indigo-600 shadow-sm rounded-md transition cursor-pointer";
                tabImgUpload.className = "px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md transition cursor-pointer";
                containerImgUrl.classList.replace('hidden', 'block');
                containerImgUpload.classList.replace('block', 'hidden');
            });
            tabImgUpload.addEventListener('click', () => {
                imgType = 'upload';
                tabImgUpload.className = "px-3 py-1 text-xs font-bold bg-white text-indigo-600 shadow-sm rounded-md transition cursor-pointer";
                tabImgUrl.className = "px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-md transition cursor-pointer";
                containerImgUpload.classList.replace('hidden', 'block');
                containerImgUrl.classList.replace('block', 'hidden');
            });
            imgFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        base64Image = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    base64Image = '';
                }
            });
            document.querySelectorAll('.btn-recent-img').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const url = e.currentTarget.getAttribute('data-url');
                    if (url) {
                        document.getElementById('service-img').value = url;
                    }
                });
            });
        }

        const btnPreview = document.getElementById('btn-preview');
        
        if (btnPreview) {
            btnPreview.addEventListener('click', () => {
                const title = document.getElementById('service-title').value.trim() || 'Titre du service';
                const desc = document.getElementById('service-desc').value.trim() || 'Description du service...';
                const category = document.getElementById('service-category').value;
                const priceNum = document.getElementById('service-price').value.trim() || '0';
                const delay = document.getElementById('service-delay').value.trim() || 'Non spécifié';
                let img = document.getElementById('service-img').value.trim();
                if (imgType === 'upload') {
                    img = base64Image;
                }
                if (!img) img = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80';

                const authorData = AppState.profileData || {};
                const authorName = authorData.name || 'Prénom Nom';
                const authorPhoto = authorData.avatar || 'https://i.pravatar.cc/150?img=12';

                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in block';
                modal.innerHTML = `
                    <div class="bg-slate-100 rounded-3xl max-w-4xl w-full p-6 border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button class="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer z-10" onclick="this.closest('.fixed').remove()">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                        <h3 class="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-3">Prévisualisation</h3>
                        
                        <div class="max-w-md mx-auto">
                            <!-- Card Preview -->
                            <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col h-full transform transition hover:shadow-md">
                                <div class="relative h-48 bg-slate-100 mt-2 mx-2 rounded-2xl overflow-hidden">
                                    <img src="${AppState.escapeHtml(img)}" alt="${AppState.escapeHtml(title)}" class="w-full h-full object-cover">
                                    <div class="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold rounded-lg shadow-sm">
                                        ${AppState.escapeHtml(category)}
                                    </div>
                                    <button class="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 rounded-xl shadow-sm transition">
                                        <i data-lucide="heart" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                <div class="p-5 flex-1 flex flex-col">
                                    <div class="flex items-center space-x-3 mb-3">
                                        <img src="${AppState.escapeHtml(authorPhoto)}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-slate-100">
                                        <div>
                                            <div class="text-sm font-bold text-slate-800 leading-tight">${AppState.escapeHtml(authorName)}</div>
                                            <div class="flex items-center text-xs text-amber-500 font-medium">
                                                <i data-lucide="star" class="w-3 h-3 fill-current mr-0.5"></i> 5.0 (0)
                                            </div>
                                        </div>
                                    </div>
                                    <h3 class="text-lg font-bold text-slate-800 mb-2 line-clamp-2">${AppState.escapeHtml(title)}</h3>
                                    <p class="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">${AppState.escapeHtml(desc)}</p>
                                    
                                    <div class="flex items-center text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                                        <i data-lucide="clock" class="w-3.5 h-3.5 mr-1.5 text-indigo-400"></i> ${AppState.escapeHtml(delay)}
                                    </div>
                                    
                                    <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between mt-auto gap-3">
                                        <div class="text-xs text-slate-500 font-medium uppercase tracking-wide w-full sm:w-auto text-center sm:text-left">Prix de départ</div>
                                        <div class="text-md sm:text-lg font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl w-full sm:w-auto text-center">À partir de ${AppState.escapeHtml(priceNum)}€</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                `;
                document.body.appendChild(modal);
                if (window.lucide) window.lucide.createIcons({ root: modal });
            });
        }

        if (templateSelector) {
            templateSelector.addEventListener('change', (e) => {
                const idx = e.target.value;
                if (idx !== '') {
                    const tpl = AppState.profileData.serviceTemplates[parseInt(idx)];
                    if (tpl) {
                        document.getElementById('service-title').value = tpl.title || '';
                        document.getElementById('service-desc').value = tpl.desc || '';
                        document.getElementById('service-category').value = tpl.category || 'Code';
                        document.getElementById('service-price').value = tpl.price || '';
                        document.getElementById('service-delay').value = tpl.delay || '';
                    }
                } else {
                    form.reset();
                }
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Reset error state
                if (formError) formError.classList.add('hidden');

                const title = document.getElementById('service-title').value.trim();
                const desc = document.getElementById('service-desc').value.trim();
                const category = document.getElementById('service-category').value;
                const priceNum = document.getElementById('service-price').value.trim();
                const delay = document.getElementById('service-delay').value.trim();
                let img = document.getElementById('service-img').value.trim();
                if (imgType === 'upload') {
                    img = base64Image;
                }

                // Programmatic validations to give proper feedback inside IFRAME
                let error = "";
                if (!title) {
                    error = "Veuillez saisir un titre pour votre service.";
                } else if (title.length < 5) {
                    error = "Le titre du service doit contenir au moins 5 caractères.";
                } else if (!desc) {
                    error = "Veuillez rédiger une description détaillée.";
                } else if (desc.length < 20) {
                    error = "La description détaillée doit contenir au moins 20 caractères.";
                } else if (!priceNum) {
                    error = "Veuillez spécifier un prix de départ (€).";
                } else if (parseInt(priceNum, 10) < 5) {
                    error = "Le prix de départ minimum est de 5 €.";
                } else if (!delay) {
                    error = "Veuillez spécifier un délai estimé (ex: 2 semaines).";
                }
                
                if (!error && img && imgType === 'url') {
                    const hasValidExt = /\.(jpe?g|png|webp)(\?.*)?$/i.test(img);
                    if (!hasValidExt) {
                        error = "L'URL de l'image doit pointer vers un format valide (jpg, png, webp).";
                    }
                }

                if (error) {
                    if (formError && formErrorMsg) {
                        formErrorMsg.innerText = error;
                        formError.classList.remove('hidden');
                        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        alert(error);
                    }
                    return;
                }

                const btn = form.querySelector('button[type="submit"]');
                const originalContent = btn.innerHTML;
                btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mr-2"></i> Publication en cours...';
                if (window.lucide) window.lucide.createIcons({ root: form });

                const price = `À partir de ${priceNum}€`;
                
                if (img && imgType === 'url') {
                    const currentUrls = AppState.profileData.recentImageUrls || [];
                    const updatedUrls = [img, ...currentUrls.filter(u => u !== img)].slice(0, 3);
                    AppState.updateProfile({ recentImageUrls: updatedUrls });
                }

                // Persist real-time item to Firebase Firestore (Including desc parameter)
                console.log("Publishing service:", { title, category, price, delay, img, desc });
                AppState.publishService(title, category, price, delay, img, desc).then(() => {
                    console.log("Service published successfully!");
                    // Notify about newly created project request
                    import('../services/NotificationService.js').then(({ NotificationService }) => {
                        NotificationService.sendEmail({
                            to: "admin@plateforme.com",
                            subject: `Nouveau projet publié : ${title}`,
                            body: `Un nouveau projet ou service a été publié :\n\nTitre : ${title}\nCatégorie : ${category}\nBudget : ${price}\n\nConnectez-vous pour le consulter.`
                        });
                        
                        NotificationService.sendEmail({
                            to: "moi@exemple.com",
                            subject: `Confirmation : Projet publié`,
                            body: `Votre projet "${title}" a été publié avec succès sur la plateforme.`
                        });
                    }).catch(console.error);

                    AppState.navigate('marketplace');
                }).catch((err) => {
                    console.error("Publication error detail:", err);
                    if (formError && formErrorMsg) {
                        let visibleMsg = err.message || "Erreur de connexion Firebase : Veuillez vérifier vos permissions de publication.";
                        try {
                            const parsed = JSON.parse(err.message);
                            if (parsed.error) {
                                visibleMsg = `Erreur Firebase (${parsed.operationType}) : ${parsed.error}`;
                            }
                        } catch (e) {
                            // Message is not a JSON string, display as is
                        }
                        formErrorMsg.innerText = visibleMsg;
                        formError.classList.remove('hidden');
                        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        alert("Erreur lors de la publication : " + err.message);
                    }
                    btn.innerHTML = originalContent;
                });
            });
        }
    }
};
