import { AppState, DUMMY_SERVICES } from '../state.js';

export const PublishServiceView = {
    render: () => {
        if (!AppState.user) {
            return `
                <div class="max-w-md mx-auto bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-none md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex flex-col mt-12 mb-8 p-8 text-center animate-fade-in">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 mb-4 mx-auto">
                        <i data-lucide="lock" class="w-8 h-8 text-amber-600 dark:text-amber-400"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Connexion requise</h2>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">Vous devez être connecté avec un compte Freelance pour publier une compétence.</p>
                    <button data-route="login" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 cursor-pointer">
                        Se connecter
                    </button>
                </div>
            `;
        }

        if (AppState.user.role === 'client') {
            return `
                <div class="max-w-md mx-auto bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-none md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 flex flex-col mt-12 mb-8 p-8 text-center animate-fade-in">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 mb-4 mx-auto">
                        <i data-lucide="shield-alert" class="w-8 h-8 text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profil Freelance requis</h2>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">Seuls les membres inscrits avec un profil Freelance peuvent publier des offres de services sur le marketplace.</p>
                    <button data-route="profile-edit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 cursor-pointer">
                        Modifier mon profil en Freelance
                    </button>
                </div>
            `;
        }

        return `
        <div class="max-w-3xl mx-auto bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl md:rounded-[2.5rem] shadow-none md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-150 dark:border-slate-800 md:border-2 mt-8 mb-12 p-8 sm:p-12 animate-fade-in view-enter">
            <div class="mb-10 text-center relative">
                <button data-action="back" class="absolute left-0 top-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 mb-4 mt-2">
                    <i data-lucide="sparkles" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
                </div>
                <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Publier une compétence</h2>
                <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Suivez ces étapes pour proposer vos services.</p>
                
                <!-- Stepper -->
                <div class="flex justify-center items-center mt-6 gap-2">
                    <div id="step-1-dot" class="w-3 h-3 rounded-full bg-indigo-600"></div>
                    <div class="w-8 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <div id="step-2-dot" class="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div class="w-8 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <div id="step-3-dot" class="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                </div>
            </div>

            <!-- Error Banner -->
            <div id="form-error" class="hidden mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center gap-3">
                <i data-lucide="alert-circle" class="w-5 h-5 text-red-500 dark:text-red-400 shrink-0"></i>
                <span id="form-error-msg"></span>
            </div>

            <form id="publish-form" class="space-y-6" novalidate>
                <!-- Step 1: General Info -->
                <div id="step-1-content" class="space-y-6">
                    <div id="ai-help-banner" class="hidden mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl animate-fade-in">
                        <div class="flex items-start gap-3">
                            <div class="p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-800 shrink-0">
                                <i data-lucide="sparkles" class="w-4 h-4 text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold text-indigo-900 dark:text-indigo-300">Assistant IA de création</p>
                                <p id="ai-help-msg" class="text-[11px] text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed mt-0.5">Voulez-vous que je génère une description professionnelle pour votre service à partir de votre titre ?</p>
                                <div class="flex gap-2 mt-2">
                                    <button type="button" id="ai-generate-desc" class="px-3 py-1.2 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer">Générer avec l'IA</button>
                                    <button type="button" id="ai-dismiss-help" class="px-3 py-1.2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">Plus tard</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    ${(AppState.profileData.serviceTemplates && AppState.profileData.serviceTemplates.length > 0) ? `
                    <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 sm:p-5 rounded-2xl mb-8">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-300 mb-2 flex items-center">
                            <i data-lucide="layout-template" class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"></i>
                            Utiliser un modèle enregistré
                        </label>
                        <select id="template-selector" class="w-full pl-4 pr-11 py-3.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/40 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-semibold text-sm appearance-none cursor-pointer">
                            <option value="">-- Sélectionner un modèle --</option>
                            ${AppState.profileData.serviceTemplates.map((tpl, i) => `
                                <option value="${i}">${AppState.escapeHtml(tpl.title)}</option>
                            `).join('')}
                        </select>
                    </div>
                    ` : ''}
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Titre du service <span class="text-red-500">*</span></label>
                        <input type="text" id="service-title" placeholder="Ex: Création de site vitrine" class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                    </div>
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Catégorie <span class="text-red-500">*</span></label>
                        <select id="service-category" class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all appearance-none font-medium text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                            <option value="Code">Développement (Code)</option>
                            <option value="Design">Design & Création</option>
                            <option value="Marketing">Marketing & SEO</option>
                        </select>
                    </div>
                </div>

                <!-- Step 2: Description -->
                <div id="step-2-content" class="hidden space-y-6">
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Description détaillée <span class="text-red-500">*</span></label>
                        <textarea id="service-desc" rows="6" placeholder="Décrivez en détail ce que vous proposez..." class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm resize-none"></textarea>
                    </div>
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Délai estimé <span class="text-red-500">*</span></label>
                        <input type="text" id="service-delay" placeholder="Ex: 2 semaines" class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                    </div>
                </div>

                <!-- Step 3: Extras -->
                <div id="step-3-content" class="hidden space-y-6">
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Prix de départ (€) <span class="text-red-500">*</span></label>
                        <input type="number" id="service-price" placeholder="Ex: 500" class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                    </div>
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Image d'illustration (Optionnel)</label>
                        <input type="url" id="service-img" placeholder="https://example.com/image.jpg" class="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="pt-6 flex gap-4">
                    <button type="button" id="btn-prev" class="hidden flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-4 font-bold transition-all hover:bg-slate-200">Précédent</button>
                    <button type="button" id="btn-next" class="flex-1 bg-indigo-600 text-white rounded-xl px-4 py-4 font-bold transition-all hover:bg-indigo-700">Suivant</button>
                    <button type="submit" id="btn-submit" class="hidden flex-1 bg-indigo-600 text-white rounded-xl px-4 py-4 font-bold transition-all hover:bg-indigo-700">Publier le service</button>
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
                tabImgUrl.className = "px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm rounded-lg transition-all cursor-pointer";
                tabImgUpload.className = "px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-all cursor-pointer";
                containerImgUrl.classList.replace('hidden', 'block');
                containerImgUpload.classList.replace('block', 'hidden');
            });
            tabImgUpload.addEventListener('click', () => {
                imgType = 'upload';
                tabImgUpload.className = "px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm rounded-lg transition-all cursor-pointer";
                tabImgUrl.className = "px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-all cursor-pointer";
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

        // Stepper Logic
        let currentStep = 1;

        const updateStepper = () => {
            document.querySelectorAll('[id^=step-][id$=-content]').forEach(el => el.classList.add('hidden'));
            document.getElementById(`step-${currentStep}-content`).classList.remove('hidden');
            
            document.querySelectorAll('[id^=step-][id$=-dot]').forEach(el => el.classList.replace('bg-indigo-600', 'bg-slate-200'));
            document.getElementById(`step-${currentStep}-dot`).classList.replace('bg-slate-200', 'bg-indigo-600');
            
            document.getElementById('btn-prev').classList.toggle('hidden', currentStep === 1);
            document.getElementById('btn-next').classList.toggle('hidden', currentStep === 3);
            document.getElementById('btn-submit').classList.toggle('hidden', currentStep !== 3);
        };

        document.getElementById('btn-next').addEventListener('click', () => {
            if (currentStep < 3) {
                currentStep++;
                updateStepper();
            }
        });

        document.getElementById('btn-prev').addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepper();
            }
        });

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

        const aiGenerateBtn = document.getElementById('ai-generate-desc');
        const aiDismissBtn = document.getElementById('ai-dismiss-help');
        const aiHelpBanner = document.getElementById('ai-help-banner');
        const serviceTitleInput = document.getElementById('service-title');
        const serviceDescInput = document.getElementById('service-desc');

        if (serviceTitleInput) {
            serviceTitleInput.addEventListener('input', () => {
                const title = serviceTitleInput.value.trim();
                if (title.length > 5 && aiHelpBanner.classList.contains('hidden')) {
                    aiHelpBanner.classList.remove('hidden');
                }
            });
        }

        if (aiDismissBtn) {
            aiDismissBtn.addEventListener('click', () => {
                aiHelpBanner.classList.add('hidden');
            });
        }

        if (aiGenerateBtn) {
            aiGenerateBtn.addEventListener('click', async () => {
                const title = serviceTitleInput.value.trim();
                if (!title) return;

                const originalText = aiGenerateBtn.innerText;
                aiGenerateBtn.innerText = "Génération...";
                aiGenerateBtn.disabled = true;

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: `Génère une description professionnelle d'environ 100 mots pour un service intitulé "${title}" sur une plateforme de freelancing. La description doit être convaincante, structurée et inclure des bénéfices pour le client. Réponds uniquement avec le texte de la description.`
                        })
                    });

                    if (!response.ok) throw new Error("Erreur IA");

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let generatedText = "";
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.substring(5));
                                    if (data.type === 'text') {
                                        generatedText += data.text;
                                    }
                                } catch (e) { /* ignore partial json */ }
                            }
                        }
                    }

                    if (generatedText) {
                        serviceDescInput.value = generatedText.trim();
                        // Move to step 2 to show the description
                        currentStep = 2;
                        updateStepper();
                        aiHelpBanner.classList.add('hidden');
                    }
                } catch (error) {
                    console.error("AI Generation error:", error);
                    alert("Désolé, l'IA n'a pas pu générer la description. Veuillez réessayer.");
                } finally {
                    aiGenerateBtn.innerText = originalText;
                    aiGenerateBtn.disabled = false;
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
                
                AppState.isGlobalLoading = true;
                AppState.globalLoadingText = "Publication de votre service en cours...";
                AppState.notify();

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

                    AppState.isGlobalLoading = false;
                    AppState.globalLoadingText = "";
                    AppState.notify();
                    AppState.navigate('marketplace');
                }).catch((err) => {
                    AppState.isGlobalLoading = false;
                    AppState.globalLoadingText = "";
                    AppState.notify();
                    
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
