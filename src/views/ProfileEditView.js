import { AppState } from '../state.js';
import { marked } from 'marked';

export const ProfileEditView = {
    render: () => {
        const pd = AppState.profileData;
        return `
        <div class="max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/50 backdrop-blur-md p-6 sm:p-10 rounded-[2.5rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 mt-4 sm:mt-8 view-enter">
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

            <div class="flex items-center mb-8">
                <button data-action="back" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center justify-center p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 mr-4">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                </button>
                <div class="flex-grow">
                    <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center tracking-tight">
                        <div class="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl mr-3">
                            <i data-lucide="edit-3" class="w-5 h-5 text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        Modifier le profil
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Personnalisez vos informations publiques.</p>
                </div>
                <button type="button" id="btn-analyze-profile-edit" class="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-2">
                    <i data-lucide="sparkles" class="w-4 h-4"></i> Suggestions IA
                </button>
            </div>
            
            <div id="analysis-results-edit" class="hidden my-6 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-indigo-100 dark:border-indigo-700 shadow-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none"></div>
            
            <form id="profile-edit-form" class="space-y-6">
                
                <div class="mb-6 p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Photo de profil</label>
                    <div class="flex items-center gap-5">
                        <div id="edit-profile-view-avatar" class="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-extrabold text-indigo-600 dark:text-indigo-400 text-3xl border-2 border-white dark:border-slate-800 shrink-0 shadow-md relative ${pd.avatarImage ? 'bg-cover bg-center' : ''}" style="${pd.avatarImage ? `background-image: url(${pd.avatarImage});` : ''}">
                            ${!pd.avatarImage ? pd.displayName.charAt(0).toUpperCase() : ''}
                        </div>
                        <div class="flex-grow flex flex-col gap-2">
                            <div class="text-xs font-medium text-slate-500 dark:text-slate-400">Image carrée recommandée (JPEG, PNG).</div>
                            <div class="flex items-center gap-3 mt-1">
                                <label for="edit-profile-view-avatar-input" class="bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center gap-2 shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                                    <i data-lucide="upload-cloud" class="w-4 h-4"></i> Téléverser
                                </label>
                                <input type="file" id="edit-profile-view-avatar-input" accept="image/*" class="hidden">
                                <button type="button" id="edit-profile-view-clear-avatar" class="${pd.avatarImage ? 'inline-flex' : 'hidden'} items-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm border border-red-100 dark:border-red-900/30">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i> Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="group">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Nom d'affichage</label>
                    <div class="relative">
                        <i data-lucide="user" class="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                        <input type="text" id="edit-display-name" value="${pd.displayName}" class="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium dark:text-white" placeholder="Votre nom...">
                    </div>
                </div>

                <div class="my-6 p-5 border border-indigo-100 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/10 rounded-3xl flex items-center justify-between transition-colors hover:bg-indigo-50/80 dark:hover:bg-indigo-900/20 cursor-pointer shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]" onclick="document.getElementById('edit-role-freelance').click()">
                    <div class="flex items-center gap-4">
                        <div class="p-2.5 bg-indigo-100 dark:bg-indigo-800/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <i data-lucide="briefcase" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-extrabold text-slate-900 dark:text-white">Mode Freelance</h4>
                            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Activez ce mode pour publier vos services et recevoir des offres.</p>
                        </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer pointer-events-none" onclick="event.stopPropagation()">
                        <input type="checkbox" id="edit-role-freelance" class="sr-only peer" ${AppState.user?.role === 'freelance' ? 'checked' : ''}>
                        <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                </div>
                
                <div class="group">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Titre professionnel</label>
                    <div class="relative">
                        <i data-lucide="award" class="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                        <input type="text" id="edit-title" value="${pd.title}" class="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium dark:text-white" placeholder="Ex: Développeur React Senior">
                    </div>
                </div>

                <div class="pt-4 border-t border-slate-100 dark:border-slate-800 group">
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Compétences clés</label>
                    <div class="relative">
                        <i data-lucide="zap" class="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                        <input type="text" id="user-skills-edit" value="${pd.skills.join(', ')}" class="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium dark:text-white" placeholder="React, Node.js, Design...">
                    </div>
                    <div class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 pl-2">Séparez avec des virgules.</div>
                </div>

                <div class="pt-4">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Biographie</label>
                        <button type="button" id="btn-generate-bio-edit" class="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50 transition-colors shadow-sm flex items-center group cursor-pointer">
                            <i data-lucide="sparkles" class="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400 group-hover:animate-pulse"></i> Assistant IA
                        </button>
                    </div>
                    <textarea id="user-bio-edit" rows="4" class="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all resize-none text-sm font-medium leading-relaxed dark:text-white" placeholder="Présentez-vous...">${pd.bio}</textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div class="group">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Localisation</label>
                        <div class="relative">
                            <i data-lucide="map-pin" class="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                            <input type="text" id="edit-location" value="${pd.location}" class="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium dark:text-white">
                        </div>
                    </div>
                    <div class="group">
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">TJM (€/Jour)</label>
                        <div class="relative">
                            <i data-lucide="banknote" class="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                            <input type="number" id="edit-tjm" value="${pd.tjm}" class="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium dark:text-white">
                        </div>
                    </div>
                </div>

                <div class="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                    <button type="button" data-route="profile" class="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl px-6 py-3 text-sm font-bold transition-colors flex items-center justify-center cursor-pointer">
                        Annuler
                    </button>
                    <button type="submit" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-8 py-3 text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 flex items-center justify-center cursor-pointer">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Enregistrer
                    </button>
                </div>
            </form>
        </div>
    `;
    },
    
    attachEvents: () => {
        const form = document.getElementById('profile-edit-form');
        const btnGenBio = document.getElementById('btn-generate-bio-edit');
        const bioInput = document.getElementById('user-bio-edit');
        const skillsInput = document.getElementById('user-skills-edit');

        const avatarInput = document.getElementById('edit-profile-view-avatar-input');
        const avatarPreview = document.getElementById('edit-profile-view-avatar');
        const btnClearAvatar = document.getElementById('edit-profile-view-clear-avatar');
        let newAvatarUrl = AppState.profileData.avatarImage;

        if (avatarInput && avatarPreview && btnClearAvatar) {
            avatarInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        avatarPreview.innerHTML = '<i data-lucide="loader" class="w-6 h-6 animate-spin text-indigo-600"></i>';
                        if (window.lucide) window.lucide.createIcons({ root: avatarPreview });
                        
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });
                        
                        if (!response.ok) throw new Error('Téléversement échoué');
                        const data = await response.json();
                        
                        newAvatarUrl = data.url;
                        avatarPreview.style.backgroundImage = `url(${newAvatarUrl})`;
                        avatarPreview.classList.add('bg-cover', 'bg-center');
                        avatarPreview.innerHTML = '';
                        btnClearAvatar.classList.remove('hidden');
                        btnClearAvatar.classList.add('inline-flex');
                        if (window.lucide) window.lucide.createIcons();
                    } catch (err) {
                        console.error('Error uploading profile pic:', err);
                        alert('Erreur lors du téléversement de la photo de profil : ' + err.message);
                        avatarPreview.innerHTML = !newAvatarUrl ? AppState.profileData.displayName.charAt(0).toUpperCase() : '';
                    }
                }
            });

            btnClearAvatar.addEventListener('click', () => {
                newAvatarUrl = '';
                avatarInput.value = '';
                avatarPreview.style.backgroundImage = '';
                avatarPreview.classList.remove('bg-cover', 'bg-center');
                avatarPreview.innerHTML = AppState.profileData.displayName.charAt(0).toUpperCase();
                btnClearAvatar.classList.add('hidden');
                btnClearAvatar.classList.remove('inline-flex');
            });
        }

        btnGenBio?.addEventListener('click', async () => {
            const originalHTML = btnGenBio.innerHTML;
            btnGenBio.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 mr-1.5 animate-spin"></i> Génération...';
            btnGenBio.disabled = true;
            if (window.lucide) window.lucide.createIcons();

            const skills = skillsInput.value || "technologiques";

            try {
                const response = await fetch('/api/generate-bio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ skills, provider: AppState.aiProvider || 'gemini' })
                });

                if (!response.ok) throw new Error('Generation failed');
                const data = await response.json();
                
                bioInput.value = data.bio;
                
                btnGenBio.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 mr-1.5 text-emerald-600"></i> Généré';
                btnGenBio.classList.replace('text-indigo-700', 'text-emerald-700');
                btnGenBio.classList.replace('bg-indigo-50', 'bg-emerald-50');
                btnGenBio.classList.replace('border-indigo-100', 'border-emerald-100');
                if (window.lucide) window.lucide.createIcons();
                
                setTimeout(() => {
                    btnGenBio.innerHTML = originalHTML;
                    btnGenBio.classList.replace('text-emerald-700', 'text-indigo-700');
                    btnGenBio.classList.replace('bg-emerald-50', 'bg-indigo-50');
                    btnGenBio.classList.replace('border-emerald-100', 'border-indigo-100');
                    btnGenBio.disabled = false;
                    if (window.lucide) window.lucide.createIcons();
                }, 2000);

            } catch (err) {
                console.error(err);
                btnGenBio.innerHTML = '<i data-lucide="alert-circle" class="w-3.5 h-3.5 mr-1.5 text-red-600"></i> Erreur';
                btnGenBio.classList.replace('text-indigo-700', 'text-red-700');
                btnGenBio.classList.replace('bg-indigo-50', 'bg-red-50');
                btnGenBio.classList.replace('border-indigo-100', 'border-red-100');
                if (window.lucide) window.lucide.createIcons();
                
                setTimeout(() => {
                    btnGenBio.innerHTML = originalHTML;
                    btnGenBio.classList.replace('text-red-700', 'text-indigo-700');
                    btnGenBio.classList.replace('bg-red-50', 'bg-indigo-50');
                    btnGenBio.classList.replace('border-red-100', 'border-indigo-100');
                    btnGenBio.disabled = false;
                    if (window.lucide) window.lucide.createIcons();
                }, 2000);
            }
        });

        // Setup AI Profile Analysis
        const btnAnalyzeProfile = document.getElementById('btn-analyze-profile-edit');
        const resultsEl = document.getElementById('analysis-results-edit');
        if (btnAnalyzeProfile) {
            btnAnalyzeProfile.addEventListener('click', async () => {
                resultsEl.classList.remove('hidden');
                resultsEl.innerHTML = '<div class="flex items-center gap-2"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>Analyse en cours...</div>';
                if (window.lucide) window.lucide.createIcons({ root: resultsEl });

                // Collect current form data
                const portfolioData = {
                    displayName: document.getElementById('edit-display-name').value,
                    title: document.getElementById('edit-title').value,
                    bio: bioInput.value,
                    skills: skillsInput.value,
                    location: document.getElementById('edit-location').value,
                    tjm: document.getElementById('edit-tjm').value
                };

                try {
                    const response = await fetch('/api/analyze-profile', {
                        method: 'POST',
                        body: JSON.stringify({ portfolioData }),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) throw new Error("Erreur lors de l'analyse");
                    
                    const data = await response.json();
                    resultsEl.innerHTML = marked.parse(data.analysis);
                    if (window.lucide) window.lucide.createIcons({ root: resultsEl });
                } catch (e) {
                    resultsEl.innerHTML = 'Erreur lors de l\'analyse. Veuillez réessayer.';
                }
            });
        }

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            
            const newName = document.getElementById('edit-display-name').value.trim();
            const newTitle = document.getElementById('edit-title').value.trim();
            const newBio = bioInput.value.trim();
            const newLocation = document.getElementById('edit-location').value.trim();
            const newTjm = parseInt(document.getElementById('edit-tjm').value, 10);
            const isFreelance = document.getElementById('edit-role-freelance').checked;
            
            const rawSkills = skillsInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            
            const profileUpdates = {
                displayName: newName || AppState.profileData.displayName,
                avatarImage: newAvatarUrl !== undefined ? newAvatarUrl : AppState.profileData.avatarImage,
                title: newTitle || AppState.profileData.title,
                bio: newBio || AppState.profileData.bio,
                location: newLocation || AppState.profileData.location,
                tjm: isNaN(newTjm) ? AppState.profileData.tjm : newTjm,
                role: isFreelance ? 'freelance' : 'client',
                skills: rawSkills
            };

            const originalHTML = btn.innerHTML;
            
            AppState.isGlobalLoading = true;
            AppState.globalLoadingText = "Sauvegarde de votre profil en cours...";
            AppState.notify();

            AppState.updateProfile(profileUpdates).then(() => {
                AppState.isGlobalLoading = false;
                AppState.globalLoadingText = "";
                AppState.notify();
                
                // Show a beautiful Toast for success
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium view-enter z-50 flex items-center';
                toast.innerHTML = `<i data-lucide="check" class="w-4 h-4 mr-2 text-emerald-400"></i> Profil mis à jour`;
                document.body.appendChild(toast);
                if (window.lucide) window.lucide.createIcons({ root: toast });
                setTimeout(() => {
                    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
                
                // Navigate back to profile
                AppState.navigate('profile');
            }).catch((err) => {
                AppState.isGlobalLoading = false;
                AppState.globalLoadingText = "";
                AppState.notify();
                alert("Erreur lors de la mise à jour : " + err.message);
            });
        });
    }
};
