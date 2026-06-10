import { AppState } from '../state.js';

export const LoginView = {
    render: () => `
        <div class="max-w-5xl mx-auto bg-white dark:bg-slate-905 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-slate-150/80 dark:border-slate-800/80 flex flex-col lg:flex-row overflow-hidden mt-8 min-h-[640px] mb-16 animate-fade-in">
            <!-- Left Side / Beautiful Premium Form -->
            <div class="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative bg-gradient-to-b from-white via-slate-50/20 to-slate-100/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 pb-12">
                <!-- Captivating tech grid texture overlay on form side (subtle and precise) -->
                <div class="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay pointer-events-none" style="background-image: radial-gradient(#6366f1 1px, transparent 1.5px), linear-gradient(to right, #6366f1 0.5px, transparent 0.5px), linear-gradient(to bottom, #6366f1 0.5px, transparent 0.5px); background-size: 32px 32px, 64px 64px, 64px 64px;"></div>
                
                <!-- Decorative background radial glows -->
                <div class="absolute top-12 left-12 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                <div class="absolute bottom-12 right-12 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                <div class="mb-10 font-sans relative">
                    <div class="flex items-center gap-4 mb-8">
                        <button data-action="back" class="text-slate-505 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 shadow-sm cursor-pointer hover:scale-105 active:scale-95" title="Retour">
                            <i data-lucide="arrow-left" class="w-4.5 h-4.5"></i>
                        </button>
                        <div class="flex items-center gap-2.5">
                            <span class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/55 dark:border-indigo-900/10 flex items-center justify-center shadow-sm">
                                <i data-lucide="layers" class="text-indigo-600 dark:text-indigo-400 w-5 h-5"></i>
                            </span>
                            <span class="font-black text-xl tracking-tight text-slate-900 dark:text-white leading-none">SkillLink</span>
                        </div>
                    </div>
                    
                    <h2 class="text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">Content de vous revoir !</h2>
                    <p class="text-slate-500 dark:text-slate-400 mt-2.5 text-sm font-semibold leading-relaxed">
                        Connectez-vous à votre espace personnel pour suivre vos commandes actifs et collaborer avec le réseau SkillLink.
                    </p>
                </div>

                <!-- Custom Inline Error Banner -->
                <div id="login-error" class="hidden flex items-start space-x-3.5 p-4.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/15 rounded-2xl text-rose-600 dark:text-rose-400 text-sm mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-350">
                    <div class="p-1.5 bg-white dark:bg-slate-950 rounded-xl shadow-sm shrink-0 border border-rose-500/15">
                        <i data-lucide="alert-triangle" class="w-4.5 h-4.5 text-rose-500"></i>
                    </div>
                    <div class="flex-grow font-bold leading-relaxed pt-0.5" id="login-error-text"></div>
                </div>

                <form id="login-form" class="space-y-5 relative">
                    <div>
                        <label class="block pl-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Adresse de messagerie</label>
                        <div class="relative group">
                            <i data-lucide="mail" class="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-4 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none"></i>
                            <input type="email" id="email" required placeholder="nom@exemple.com" class="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-950/60 border border-slate-205 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm">
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-center pl-1 mb-2">
                            <label class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Mot de passe secret</label>
                            <a href="#" id="forgot-password" class="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline dark:hover:text-amber-500 transition-all">Mot de passe oublié ?</a>
                        </div>
                        <div class="relative group">
                            <i data-lucide="lock" class="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 top-4 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none"></i>
                            <input type="password" id="password" required placeholder="••••••••" class="w-full pl-11 pr-12 py-4 bg-white dark:bg-slate-950/60 border border-slate-205 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm">
                            <button type="button" id="toggle-password" class="absolute right-4 top-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5" title="Afficher/Masquer le mot de passe">
                                <i data-lucide="eye" class="w-5 h-5" id="toggle-password-icon"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 py-4 font-extrabold transition-all duration-300 mt-8 shadow-[0_4px_16px_rgba(99,102,241,0.22)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.32)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center group overflow-hidden relative cursor-pointer">
                        <span class="relative z-10 flex items-center gap-2 uppercase text-xs tracking-wider">
                            Accéder à mon espace <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-250"></i>
                        </span>
                        <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-indigo-750 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <div class="relative flex items-center justify-center my-7">
                        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-150 dark:border-slate-800/80"></div></div>
                        <span class="relative px-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900">OU AUTHENTIFICATION INDIRECTE</span>
                    </div>

                    <div>
                        <button type="button" id="btn-google-login" class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl px-4 py-4 font-bold text-xs sm:text-sm transition-all flex items-center justify-center shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                            <svg class="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Continuer avec Google
                        </button>
                    </div>
                </form>
                
                <div id="reset-password-ui" class="hidden space-y-4 pt-5 border-t border-slate-150 dark:border-slate-800/80 mt-8 animate-in fade-in duration-300">
                    <h4 class="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                        <i data-lucide="key" class="w-4 h-4 text-indigo-500"></i> Réinitialisation de sécurité
                    </h4>
                    <p class="text-xs text-slate-500">Saisissez l'adresse mail ci-dessus, puis demandez l'envoi d'un jeton temporaire.</p>
                    <div id="reset-step-1">
                        <button id="send-code-btn" class="w-full bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/35 text-indigo-750 dark:text-indigo-400 font-extrabold py-3.5 px-4 rounded-xl transition border border-indigo-100/50 dark:border-indigo-900/30 cursor-pointer text-xs uppercase tracking-wider shadow-sm">Envoyer code par mail</button>
                    </div>
                    <div id="reset-step-2" class="hidden space-y-4">
                        <input type="text" id="reset-code" placeholder="Code secret reçu (ex: 884723)" class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 outline-none font-extrabold text-slate-805 dark:text-white placeholder:text-slate-400">
                        <button id="verify-code-btn" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl transition cursor-pointer text-xs uppercase tracking-wider shadow-md">Vérifier code</button>
                    </div>
                </div>
                
                <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-12 font-medium">
                    Vous n'avez pas de compte ? <a href="#" data-route="register" class="text-indigo-600 dark:text-indigo-400 font-black hover:underline cursor-pointer">Inscrivez-vous gratuitement</a>
                </p>
            </div>

            <!-- Right Side / Modern Premium Artwork Dashboard Panel -->
            <div class="hidden lg:flex lg:w-1/2 relative bg-[#060814] overflow-hidden items-center justify-center p-12">
                <!-- Gorgeous dynamic background mesh with high-end color transitions -->
                <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-950/45 via-slate-950/95 to-[#03040c]"></div>
                
                <!-- Captivating tech grid texture overlay (subtle and precise) -->
                <div class="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style="background-image: radial-gradient(#ffffff 1px, transparent 1.5px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px); background-size: 24px 24px, 48px 48px, 48px 48px;"></div>
                
                <!-- Floating, glowing color-shift orbs that pulse seamlessly -->
                <div class="absolute -top-12 -left-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-[110px] animate-pulse" style="animation-duration: 9s;"></div>
                <div class="absolute -bottom-16 -right-16 w-96 h-96 bg-purple-500/15 rounded-full blur-[110px] animate-pulse" style="animation-duration: 11s;"></div>
                <div class="absolute top-1/2 right-1/3 -translate-y-1/2 w-72 h-72 bg-emerald-500/5 rounded-full blur-[90px] animate-pulse" style="animation-duration: 13s;"></div>

                <!-- Abstract fine glowing orbit lines behind elements -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div class="w-[450px] h-[450px] rounded-full border border-dashed border-purple-500/30 animate-[spin_120s_linear_infinite]"></div>
                    <div class="absolute w-[300px] h-[300px] rounded-full border border-solid border-indigo-500/15 animate-[spin_80s_linear_infinite_reverse]"></div>
                </div>

                <div class="relative z-10 w-full max-w-sm flex flex-col justify-between h-full py-8 text-left">
                    <div class="flex items-center mb-8">
                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/5 shadow-inner">
                            <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span class="text-[9.5px] text-indigo-200/90 font-black uppercase tracking-wider">SkillLink Live</span>
                        </div>
                    </div>

                    <div class="my-auto space-y-8">
                        <!-- Custom high fidelity Testimonial Display -->
                        <div class="group p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:border-indigo-500/20 transition-all duration-300 shadow-[0_22px_70px_rgba(0,0,0,0.5)] relative">
                            <div class="absolute -top-3.5 -right-3 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black text-[9px] uppercase tracking-wider shadow-md transform rotate-2 group-hover:rotate-0 transition-transform duration-300">Recommandé</div>
                            <div class="flex items-center gap-1 text-amber-400 mb-4">
                                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                                <span class="text-xs text-white font-bold ml-1.5">5.0/5</span>
                            </div>
                            <p class="text-[13px] font-semibold text-slate-200 leading-relaxed italic">
                                "La qualité des livrables et le professionnalisme des freelances camerounais sur SkillLink ont transformé nos processus de développement de projets."
                            </p>
                            <div class="mt-5 pt-4 border-t border-white/5 flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-300">
                                    MK
                                </div>
                                <div>
                                    <h4 class="text-xs font-black text-white leading-none">Marc Kenfack</h4>
                                    <span class="text-[10px] text-slate-400 font-semibold mt-1 inline-block">CEO de K-Tech Cameroon</span>
                                </div>
                            </div>
                        </div>

                        <!-- Real time credentials badges -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="group p-4.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-purple-500/20 transition-all duration-300 backdrop-blur-md">
                                <div class="text-2xl font-black text-white tracking-tight group-hover:scale-[1.03] transition-transform duration-300 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">99.4%</div>
                                <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 leading-none">Taux de succès</div>
                            </div>
                            <div class="group p-4.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-all duration-300 backdrop-blur-md">
                                <div class="text-2xl font-black text-white tracking-tight group-hover:scale-[1.03] transition-transform duration-300 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">1500+</div>
                                <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 leading-none">Experts validés</div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-indigo-300/40">
                        <span>Paiements séquestres sécurisés</span>
                        <div class="flex gap-1.5">
                            <span class="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-ping"></span>
                            <span class="w-1.5 h-1.5 bg-emerald-400/70 rounded-full"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    attachEvents: () => {
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        const loginErrorText = document.getElementById('login-error-text');
        
        const forgotPasswordLink = document.getElementById('forgot-password');
        const resetPasswordUi = document.getElementById('reset-password-ui');
        const resetStep1 = document.getElementById('reset-step-1');
        const resetStep2 = document.getElementById('reset-step-2');
        const sendCodeBtn = document.getElementById('send-code-btn');
        const verifyCodeBtn = document.getElementById('verify-code-btn');
        const resetCodeInput = document.getElementById('reset-code');

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                resetPasswordUi.classList.remove('hidden');
                loginForm.classList.add('hidden');
            });
        }

        if (sendCodeBtn) {
            sendCodeBtn.addEventListener('click', async () => {
                const email = document.getElementById('email').value.trim();
                if (!email) {
                    if (window.showToast) window.showToast("Renseignez d'abord l'email.", "error");
                    return;
                }
                try {
                    const response = await fetch('/api/password-reset/send-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    const data = await response.json();
                    resetStep1.classList.add('hidden');
                    resetStep2.classList.remove('hidden');
                    
                    if (data.warning) {
                        if (window.showToast) window.showToast(`Code envoyé (pour test : ${data.code})`, "success");
                    } else {
                        if (window.showToast) window.showToast("Code envoyé sur votre adresse e-mail.", "success");
                    }
                } catch (e) {
                    if (window.showToast) window.showToast("Erreur lors de l'envoi du code.", "error");
                }
            });
        }

        if (verifyCodeBtn) {
            verifyCodeBtn.addEventListener('click', async () => {
                const email = document.getElementById('email').value.trim();
                const code = resetCodeInput.value.trim();
                try {
                    const response = await fetch('/api/password-reset/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, code })
                    });
                    if (response.ok) {
                        if (window.showToast) window.showToast("Code vérifié ! (Vous pouvez maintenant changer votre mot de passe - fonctionnalité à implémenter)", "success");
                        // Logic to actually change password would go here.
                    } else {
                        if (window.showToast) window.showToast("Code invalide.", "error");
                    }
                } catch (e) {
                    if (window.showToast) window.showToast("Erreur lors de la vérification.", "error");
                }
            });
        }
        
        const togglePasswordBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        const togglePasswordIcon = document.getElementById('toggle-password-icon');

        if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
            togglePasswordBtn.addEventListener('click', () => {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                togglePasswordIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
                
                // Re-init the newly updated lucide icon if available
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

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;

                if (loginError) loginError.classList.add('hidden');
                
                // Show loading state
                const btn = loginForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>';
                btn.disabled = true;
                if (window.lucide) window.lucide.createIcons();

                AppState.login(email, password).catch((err) => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    if (window.lucide) window.lucide.createIcons();

                    if (window.showToast) {
                        window.showToast(err.message, 'error');
                    }

                    if (loginError && loginErrorText) {
                        loginErrorText.innerHTML = AppState.escapeHtml(err.message);
                        loginError.classList.remove('hidden');
                        if (window.lucide) window.lucide.createIcons({ root: loginError });
                    }
                });
            });
        }

        const googleBtn = document.getElementById('btn-google-login');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                const originalContent = googleBtn.innerHTML;
                googleBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mr-3"></i> Connexion Google...';
                googleBtn.disabled = true;
                if (window.lucide) window.lucide.createIcons({ root: googleBtn });

                if (loginError) loginError.classList.add('hidden');

                AppState.loginWithGoogle().catch((err) => {
                    googleBtn.innerHTML = originalContent;
                    googleBtn.disabled = false;
                    if (window.lucide) window.lucide.createIcons({ root: googleBtn });

                    if (loginError && loginErrorText) {
                        loginErrorText.innerHTML = AppState.escapeHtml(err.message);
                        loginError.classList.remove('hidden');
                        if (window.lucide) window.lucide.createIcons({ root: loginError });
                    }
                });
            });
        }
    }
};
