import { AppState } from '../state.js';

export const RegisterView = {
    render: () => `
        <div class="max-w-5xl mx-auto bg-white dark:bg-slate-905 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-slate-150/80 dark:border-slate-800/80 flex flex-col lg:flex-row overflow-hidden mt-8 min-h-[640px] mb-16 animate-fade-in">
            <!-- Left Side / Form -->
            <div class="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-gradient-to-b from-white via-slate-50/20 to-slate-100/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 pb-12">
                <!-- Captivating tech grid texture overlay on form side (subtle and precise) -->
                <div class="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay pointer-events-none" style="background-image: radial-gradient(#6366f1 1px, transparent 1.5px), linear-gradient(to right, #6366f1 0.5px, transparent 0.5px), linear-gradient(to bottom, #6366f1 0.5px, transparent 0.5px); background-size: 32px 32px, 64px 64px, 64px 64px;"></div>
                
                <!-- Decorative background radial glows -->
                <div class="absolute top-12 left-12 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                <div class="absolute bottom-12 right-12 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                <div class="mb-10 font-sans relative">
                    <div class="flex items-center gap-4 mb-8">
                        <button data-action="back" class="text-slate-550 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 shadow-sm cursor-pointer hover:scale-105 active:scale-95" title="Retour">
                            <i data-lucide="arrow-left" class="w-4.5 h-4.5"></i>
                        </button>
                        <div class="flex items-center gap-2.5">
                            <span class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/55 dark:border-indigo-900/10 flex items-center justify-center shadow-sm">
                                <i data-lucide="layers" class="text-indigo-600 dark:text-indigo-400 w-5 h-5"></i>
                            </span>
                            <span class="font-black text-xl tracking-tight text-slate-900 dark:text-white leading-none">SkillLink</span>
                        </div>
                    </div>
                    <h2 class="text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">Créer un profil gratuit</h2>
                    <p class="text-slate-500 dark:text-slate-400 mt-2.5 text-sm font-semibold leading-relaxed">
                        Rejoignez le réseau professionnel de référence et proposez ou recrutez des services en toute sécurité.
                    </p>
                </div>

                <!-- Custom Inline Error Banner -->
                <div id="register-error" class="hidden flex items-start space-x-3.5 p-4.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 rounded-2xl text-rose-600 dark:text-rose-400 text-sm mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-350">
                    <div class="p-1.5 bg-white dark:bg-slate-950 rounded-xl shadow-sm shrink-0 border border-rose-500/15">
                        <i data-lucide="alert-triangle" class="w-4.5 h-4.5 text-rose-500"></i>
                    </div>
                    <div class="flex-grow font-bold leading-relaxed pt-0.5" id="register-error-text"></div>
                </div>

                <form id="register-form" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block pl-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Votre nom complet</label>
                            <div class="relative group">
                                <i data-lucide="user" class="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-4 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none"></i>
                                <input type="text" id="name" required placeholder="Alex Dupont" class="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-950/60 border border-slate-205 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm">
                            </div>
                        </div>
                        <div>
                            <label class="block pl-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Je souhaite m'inscrire</label>
                            <div class="relative group">
                                <select id="role" class="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-slate-950/60 border border-slate-205 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none font-semibold text-slate-700 dark:text-slate-305 shadow-sm cursor-pointer">
                                    <option value="client">Client (Je recherche des prestataires)</option>
                                    <option value="entrepreneur">Freelance / Artisan (Je propose des services)</option>
                                </select>
                                <i data-lucide="users" class="w-5 h-5 text-indigo-500 dark:text-indigo-450 absolute left-4 top-4 pointer-events-none"></i>
                                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-4 top-[18px] pointer-events-none"></i>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block pl-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Adresse Email</label>
                        <div class="relative group">
                            <i data-lucide="mail" class="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-4 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none"></i>
                            <input type="email" id="email" required placeholder="nom@exemple.com" class="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-950/60 border border-slate-205 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm">
                        </div>
                    </div>

                    <div>
                        <label class="block pl-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mot de passe de connexion</label>
                        <div class="relative group">
                            <i data-lucide="lock" class="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-4 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none"></i>
                            <input type="password" id="password" required placeholder="••••••••" class="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-950/60 border border-slate-205 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm">
                            <button type="button" id="toggle-password" class="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-205 transition-colors cursor-pointer p-0.5" title="Afficher/Masquer le mot de passe">
                                <i data-lucide="eye" class="w-5 h-5" id="toggle-password-icon"></i>
                            </button>
                        </div>
                        
                        <!-- Visual Password Strength Meter (Securitized Indicator) -->
                        <div class="mt-3 px-1 hidden" id="pwd-strength-indicator">
                            <div class="flex gap-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div id="strength-bar-1" class="h-full bg-slate-205 dark:bg-slate-700 w-1/4 transition-all duration-300"></div>
                                <div id="strength-bar-2" class="h-full bg-slate-205 dark:bg-slate-700 w-1/4 transition-all duration-300"></div>
                                <div id="strength-bar-3" class="h-full bg-slate-205 dark:bg-slate-700 w-1/4 transition-all duration-300"></div>
                                <div id="strength-bar-4" class="h-full bg-slate-205 dark:bg-slate-700 w-1/4 transition-all duration-300"></div>
                            </div>
                            <span class="text-[11px] font-extrabold text-slate-400 dark:text-slate-505 mt-2 flex items-center" id="strength-status-text">
                                <i data-lucide="shield-alert" class="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500"></i> Trop court
                            </span>
                        </div>
                        <p class="text-[11px] text-slate-550 dark:text-slate-400 mt-2 pl-1 font-medium leading-relaxed" id="pswd-requirements">Le mot de passe doit inclure au moins 8 caractères, un chiffre et une majuscule.</p>
                    </div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 py-4 font-extrabold transition-all duration-300 mt-8 shadow-[0_4px_16px_rgba(99,102,241,0.22)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.32)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center group overflow-hidden relative cursor-pointer">
                        <span class="relative z-10 flex items-center gap-2 uppercase text-xs tracking-wider">
                            Créer mon compte <i data-lucide="arrow-right" class="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform duration-250"></i>
                        </span>
                        <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-indigo-750 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <div class="relative flex items-center justify-center my-6">
                        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-150 dark:border-slate-800/80"></div></div>
                        <span class="relative px-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900">OU INSCRIPTION APPPLET</span>
                    </div>

                    <div>
                        <button type="button" id="btn-google-register" class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl px-4 py-4 font-bold text-xs sm:text-sm transition-all flex items-center justify-center shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                            <svg class="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            S'inscrire avec Google
                        </button>
                    </div>
                </form>
                
                <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-8 font-medium">
                    Vous avez déjà un compte ? <a href="#" data-route="login" class="text-indigo-600 dark:text-indigo-400 font-black hover:underline cursor-pointer">Connectez-vous</a>
                </p>
            </div>

            <!-- Right Side / Modern Premium Artwork Info Panel -->
            <div class="hidden lg:flex lg:w-1/2 relative bg-[#060814] overflow-hidden items-center justify-center p-12">
                <!-- Gorgeous dynamic background mesh with high-end color transitions -->
                <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/45 via-slate-950/95 to-[#03040c]"></div>
                
                <!-- Captivating tech grid texture overlay (subtle and precise) -->
                <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style="background-image: radial-gradient(#ffffff 1px, transparent 1.5px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px); background-size: 24px 24px, 48px 48px, 48px 48px;"></div>
                
                <!-- Floating, glowing color-shift orbs that pulse seamlessly -->
                <div class="absolute -top-12 -right-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-[110px] animate-pulse" style="animation-duration: 8s;"></div>
                <div class="absolute -bottom-16 -left-16 w-96 h-96 bg-purple-500/15 rounded-full blur-[110px] animate-pulse" style="animation-duration: 12s;"></div>
                <div class="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-72 bg-emerald-500/5 rounded-full blur-[90px] animate-pulse" style="animation-duration: 10s;"></div>

                <!-- Abstract fine glowing orbit lines behind elements -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div class="w-[450px] h-[450px] rounded-full border border-dashed border-indigo-500/30 animate-[spin_100s_linear_infinite]"></div>
                    <div class="absolute w-[300px] h-[300px] rounded-full border border-solid border-purple-500/15 animate-[spin_60s_linear_infinite_reverse]"></div>
                </div>

                <div class="relative z-10 w-full max-w-sm flex flex-col justify-between h-full py-8 text-left">
                    <div class="flex items-center mb-8">
                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/5 shadow-inner">
                            <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                            <span class="text-[9.5px] text-indigo-200/90 font-black uppercase tracking-wider">Avantages Membres</span>
                        </div>
                    </div>

                    <div class="my-auto space-y-6">
                        <h3 class="text-2xl font-black text-white leading-tight tracking-tight">
                            Une place de marché <span class="bg-gradient-to-r from-indigo-300 via-pink-200 to-purple-300 bg-clip-text text-transparent">conçue pour votre réussite</span>.
                        </h3>
                        <p class="text-slate-400 text-xs font-semibold leading-relaxed">Profitez de services haut de gamme et d'outils collaboratifs ultra-modernes intégrés :</p>
                        
                        <div class="space-y-4">
                            <!-- Benefit 1 -->
                            <div class="group flex items-start gap-4 p-4.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
                                <span class="p-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-300">
                                    <i data-lucide="check-circle-2" class="w-4.5 h-4.5"></i>
                                </span>
                                <div>
                                    <h4 class="text-xs font-black text-white tracking-wide">Publication d'offres gratuite</h4>
                                    <p class="text-[10.5px] text-slate-400/90 mt-1.5 leading-relaxed font-medium">Mettez en valeur vos compétences ou recherchez des experts sans aucun frais mensuel récurrent.</p>
                                </div>
                            </div>

                            <!-- Benefit 2 -->
                            <div class="group flex items-start gap-4 p-4.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-purple-500/20 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
                                <span class="p-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-300">
                                    <i data-lucide="message-square" class="w-4.5 h-4.5"></i>
                                </span>
                                <div>
                                    <h4 class="text-xs font-black text-white tracking-wide">Messagerie Ultra-Fluide</h4>
                                    <p class="text-[10.5px] text-slate-400/90 mt-1.5 leading-relaxed font-medium">Un canal instantané et sécurisé avec partage de documents de consigne de code sans friction.</p>
                                </div>
                            </div>

                            <!-- Benefit 3 -->
                            <div class="group flex items-start gap-4 p-4.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
                                <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-300">
                                    <i data-lucide="shield-check" class="w-4.5 h-4.5"></i>
                                </span>
                                <div>
                                    <h4 class="text-xs font-black text-white tracking-wide">Paiements Séquestres</h4>
                                    <p class="text-[10.5px] text-slate-400/90 mt-1.5 leading-relaxed font-medium">Les transactions financières sont bloquées en séquestre et débloquées uniquement après livraison validée.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-indigo-300/40">
                        <span>Plus de 1500+ Prestataires vérifiés</span>
                        <div class="flex gap-1.5">
                            <span class="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-ping"></span>
                            <span class="w-1.5 h-1.5 bg-indigo-400/70 rounded-full"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    attachEvents: () => {
        const form = document.getElementById('register-form');
        if (form) {
            const passwordInput = document.getElementById('password');
            const pwdIndicator = document.getElementById('pwd-strength-indicator');
            const togglePasswordBtn = document.getElementById('toggle-password');
            const togglePasswordIcon = document.getElementById('toggle-password-icon');

            if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
                togglePasswordBtn.addEventListener('click', () => {
                    const isPassword = passwordInput.getAttribute('type') === 'password';
                    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                    togglePasswordIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
                    if (window.lucide) {
                        window.lucide.createIcons({
                            nameAttr: 'data-lucide',
                            attrs: {
                                class: 'w-5 h-5'
                            }
                        });
                    }
                });
            }

            const bars = [
                document.getElementById('strength-bar-1'),
                document.getElementById('strength-bar-2'),
                document.getElementById('strength-bar-3'),
                document.getElementById('strength-bar-4')
            ];
            const pwdText = document.getElementById('strength-status-text');

            if (passwordInput && pwdIndicator) {
                passwordInput.addEventListener('input', () => {
                    const val = passwordInput.value;
                    if (!val) {
                        pwdIndicator.classList.add('hidden');
                        return;
                    }
                    pwdIndicator.classList.remove('hidden');

                    let score = 0;
                    if (val.length >= 8) score++;
                    if (/[A-Z]/.test(val)) score++;
                    if (/[0-9]/.test(val)) score++;
                    if (/[^A-Za-z0-9]/.test(val)) score++;

                    // Colors & messages
                    const levels = [
                        { text: "Faible (trop simple)", color: "bg-rose-500", icon: "shield-alert" },
                        { text: "Moyen (améliorez-le)", color: "bg-amber-500", icon: "shield-alert" },
                        { text: "Sécurisé (Robuste)", color: "bg-emerald-500", icon: "shield" },
                        { text: "Très fort (Excellent !)", color: "bg-indigo-600", icon: "shield-check" }
                    ];

                    const level = levels[Math.max(0, score - 1)];

                    bars.forEach((bar, idx) => {
                        if (bar) {
                            bar.className = `h-full rounded-full transition-all duration-300 w-1/4 ${idx < score ? level.color : 'bg-slate-200'}`;
                        }
                    });

                    if (pwdText) {
                        pwdText.innerHTML = `<i data-lucide="${level.icon}" class="w-3.5 h-3.5 mr-1 ${score >= 3 ? 'text-emerald-500' : 'text-amber-500'}"></i> ${level.text}`;
                        if (window.lucide) window.lucide.createIcons({ root: pwdText });
                    }
                });
            }

            const registerError = document.getElementById('register-error');
            const registerErrorText = document.getElementById('register-error-text');

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const role = document.getElementById('role').value;

                if (registerError) registerError.classList.add('hidden');
                
                // Enforce safety level password strength on registration
                if (password.length < 8) {
                    if (registerError && registerErrorText) {
                        registerErrorText.innerHTML = "Sécurité : Le mot de passe doit contenir au moins 8 caractères.";
                        registerError.classList.remove('hidden');
                        if (window.lucide) window.lucide.createIcons({ root: registerError });
                    }
                    return;
                }
                
                // Show loading state
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>';
                btn.disabled = true;
                if (window.lucide) window.lucide.createIcons();

                AppState.register(name, email, password, role).catch((err) => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    if (window.lucide) window.lucide.createIcons();

                    if (window.showToast) {
                        window.showToast(err.message, 'error');
                    }

                    if (registerError && registerErrorText) {
                        registerErrorText.innerHTML = AppState.escapeHtml(err.message);
                        registerError.classList.remove('hidden');
                        if (window.lucide) window.lucide.createIcons({ root: registerError });
                    }
                });
            });

            const googleRegBtn = document.getElementById('btn-google-register');
            if (googleRegBtn) {
                googleRegBtn.addEventListener('click', () => {
                    const originalContent = googleRegBtn.innerHTML;
                    googleRegBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mr-3"></i> Connexion Google...';
                    googleRegBtn.disabled = true;
                    if (window.lucide) window.lucide.createIcons({ root: googleRegBtn });

                    if (registerError) registerError.classList.add('hidden');

                    AppState.loginWithGoogle().catch((err) => {
                        googleRegBtn.innerHTML = originalContent;
                        googleRegBtn.disabled = false;
                        if (window.lucide) window.lucide.createIcons({ root: googleRegBtn });

                        if (registerError && registerErrorText) {
                            registerErrorText.innerHTML = AppState.escapeHtml(err.message);
                            registerError.classList.remove('hidden');
                            if (window.lucide) window.lucide.createIcons({ root: registerError });
                        }
                    });
                });
            }
        }
    }
};
