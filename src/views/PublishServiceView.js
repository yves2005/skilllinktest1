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
            <!-- Navigation Rapide -->
            <div class="flex justify-center gap-6 pb-6 mb-8 border-b border-slate-100 dark:border-slate-800/60">
                <button data-route="marketplace" class="flex items-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-bold text-sm border-none bg-transparent cursor-pointer tracking-wide">
                    <i data-lucide="search" class="w-4 h-4 mr-2"></i> Explorer
                </button>
                <div class="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
                <button data-route="ai" class="flex items-center text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-bold text-sm border-none bg-transparent cursor-pointer tracking-wide">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-2"></i> Assistant IA
                </button>
            </div>

            <div class="mb-10 text-center relative">
                <button data-action="back" class="absolute left-0 top-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 mb-4 mt-2">
                    <i data-lucide="sparkles" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
                </div>
                <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Publier une compétence</h2>
                <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Proposez vos services à notre communauté de clients.</p>
            </div>

            <!-- Error Banner -->
            <div id="form-error" class="hidden mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center gap-3">
                <i data-lucide="alert-circle" class="w-5 h-5 text-red-500 dark:text-red-400 shrink-0"></i>
                <span id="form-error-msg">Veuillez corriger les erreurs ci-dessous.</span>
            </div>

            <form id="publish-form" class="space-y-6" novalidate>
                ${(AppState.profileData.serviceTemplates && AppState.profileData.serviceTemplates.length > 0) ? `
                <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 sm:p-5 rounded-2xl mb-8">
                    <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-indigo-900 dark:text-indigo-300 mb-2 flex items-center">
                        <i data-lucide="layout-template" class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"></i>
                        Utiliser un modèle enregistré
                    </label>
                    <div class="relative">
                        <select id="template-selector" class="w-full pl-4 pr-11 py-3.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/40 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-semibold text-sm appearance-none cursor-pointer">
                            <option value="">-- Sélectionner un modèle --</option>
                            ${AppState.profileData.serviceTemplates.map((tpl, i) => `
                                <option value="${i}">${AppState.escapeHtml(tpl.title)}</option>
                            `).join('')}
                        </select>
                        <i data-lucide="chevron-down" class="w-5 h-5 text-indigo-400 dark:text-indigo-500 absolute right-4 top-[15px] pointer-events-none"></i>
                    </div>
                </div>
                ` : ''}

                <div class="group">
                    <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Titre du service <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <i data-lucide="type" class="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-[15px] transition-colors"></i>
                        <input type="text" id="service-title" placeholder="Ex: Création de site vitrine complet" class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                    </div>
                </div>

                <div class="group">
                    <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Description détaillée <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <i data-lucide="align-left" class="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-[15px] transition-colors"></i>
                        <textarea id="service-desc" rows="4" placeholder="Décrivez en détail ce que vous proposez..." class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm resize-none"></textarea>
                    </div>
                    <p class="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1.5 pl-1">Minimum 20 caractères.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Catégorie <span class="text-red-500">*</span></label>
                        <div class="relative">
                            <select id="service-category" class="w-full pl-12 pr-11 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all appearance-none font-medium text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <option value="Code">Développement (Code)</option>
                                <option value="Design">Design & Création</option>
                                <option value="Marketing">Marketing & SEO</option>
                            </select>
                            <i data-lucide="folder" class="w-5 h-5 text-indigo-500 dark:text-indigo-400 absolute left-4 top-[15px] pointer-events-none"></i>
                            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400 absolute right-4 top-[15px] pointer-events-none"></i>
                        </div>
                    </div>
                    
                    <div class="group">
                        <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Prix de départ (€) <span class="text-red-500">*</span></label>
                        <div class="relative">
                            <i data-lucide="euro" class="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-[15px] transition-colors"></i>
                            <input type="number" id="service-price" placeholder="Ex: 500" class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                        </div>
                    </div>
                </div>

                <div class="group">
                    <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Délai estimé <span class="text-red-500">*</span></label>
                    <div class="relative">
                        <i data-lucide="clock" class="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-[15px] transition-colors"></i>
                        <input type="text" id="service-delay" placeholder="Ex: 2 semaines" class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                    </div>
                </div>

                <div class="group">
                    <label class="block pl-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex justify-between items-center">
                        <span>Image d'illustration <span class="text-[10px] text-slate-400 dark:text-slate-500 font-bold lowercase tracking-normal ml-1">(Optionnel)</span></span>
                        <div class="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0 border border-slate-200/55 dark:border-slate-700">
                            <button type="button" id="tab-img-url" class="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm rounded-lg transition-all cursor-pointer">Lien URL</button>
                            <button type="button" id="tab-img-upload" class="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-all cursor-pointer">Fichier</button>
                        </div>
                    </label>
                    <div id="container-img-url" class="relative block">
                        <i data-lucide="image" class="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 absolute left-4 top-[15px] transition-colors"></i>
                        <input type="url" id="service-img" placeholder="https://example.com/image.jpg" class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:text-white outline-none transition-all font-medium text-sm">
                        ${AppState.profileData.recentImageUrls && AppState.profileData.recentImageUrls.length > 0 ? `
                        <div class="mt-3 flex flex-wrap gap-2 items-center">
                            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Récents :</span>
                            ${AppState.profileData.recentImageUrls.map(url => `
                                <button type="button" class="btn-recent-img px-2.5 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-100 dark:border-indigo-900/50 transition-colors cursor-pointer max-w-[150px] truncate" title="${AppState.escapeHtml(url)}" data-url="${AppState.escapeHtml(url)}">
                                    ${AppState.escapeHtml(url.replace(/^https?:\/\//, ''))}
                                </button>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    <div id="container-img-upload" class="relative hidden">
                        <input type="file" id="service-img-file" accept="image/*" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-medium text-sm dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
                    </div>
                </div>

                <div class="pt-6 space-y-4">
                    <button type="button" id="btn-preview" class="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-xl px-4 py-4 font-bold transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center cursor-pointer">
                        Prévisualiser <i data-lucide="eye" class="w-4 h-4 ml-2"></i>
                    </button>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-4 font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 flex items-center justify-center cursor-pointer">
                        Publier le service <i data-lucide="send" class="w-4 h-4 ml-2"></i>
                    </button>
                    <button type="button" data-route="marketplace" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-3.5 font-bold transition-all flex items-center justify-center cursor-pointer">
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
                modal.className = 'fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in block';
                modal.innerHTML = `
                    <div class="bg-slate-100 dark:bg-slate-950 rounded-[2rem] max-w-4xl w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto transform scale-95 animate-modal-pop">
                        <button class="absolute top-6 right-6 p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors cursor-pointer z-10" onclick="this.closest('.fixed').remove()">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                        <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-3 uppercase tracking-wider">Prévisualisation</h3>
                        
                        <div class="max-w-md mx-auto">
                            <!-- Card Preview -->
                            <div class="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full transform transition hover:shadow-md">
                                <div class="relative h-48 bg-slate-100 dark:bg-slate-800 mt-2 mx-2 rounded-[1.5rem] overflow-hidden">
                                    <img src="${AppState.escapeHtml(img)}" loading="lazy" alt="${AppState.escapeHtml(title)}" class="w-full h-full object-cover">
                                    <div class="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg shadow-sm">
                                        ${AppState.escapeHtml(category)}
                                    </div>
                                    <button class="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-xl shadow-sm transition">
                                        <i data-lucide="heart" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                <div class="p-6 flex-1 flex flex-col">
                                    <div class="flex items-center space-x-3 mb-4">
                                        <img src="${AppState.escapeHtml(authorPhoto)}" loading="lazy" alt="Avatar" class="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <div class="text-sm font-bold text-slate-800 dark:text-white leading-tight">${AppState.escapeHtml(authorName)}</div>
                                            <div class="flex items-center text-xs text-amber-500 font-semibold mt-0.5">
                                                <i data-lucide="star" class="w-3.5 h-3.5 fill-current mr-0.5"></i> 5.0 (0)
                                            </div>
                                        </div>
                                    </div>
                                    <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">${AppState.escapeHtml(title)}</h3>
                                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1 leading-relaxed">${AppState.escapeHtml(desc)}</p>
                                    
                                    <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl font-semibold">
                                        <i data-lucide="clock" class="w-4 h-4 mr-2 text-indigo-400 dark:text-indigo-400"></i> ${AppState.escapeHtml(delay)}
                                    </div>
                                    
                                    <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between mt-auto gap-3">
                                        <div class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider w-full sm:w-auto text-center sm:text-left">Prix de départ</div>
                                        <div class="text-md sm:text-lg font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3.5 py-1.5 rounded-xl w-full sm:w-auto text-center border border-indigo-100/50 dark:border-indigo-800/40">À partir de ${AppState.escapeHtml(priceNum)}€</div>
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
