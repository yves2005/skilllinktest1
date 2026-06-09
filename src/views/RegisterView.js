import { AppState } from '../state.js';

export const RegisterView = {
    render: () => `
        <div class="max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex overflow-hidden mt-6 min-h-[600px] mb-8">
            <!-- Left Side / Form -->
            <div class="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                <div class="mt-0 mb-[23px] pt-0 pb-[2px] px-0">
                    <div class="flex items-center space-x-2 mb-6">
                        <button data-action="back" class="text-slate-400 hover:text-slate-600 transition flex items-center justify-center p-1.5 rounded-full hover:bg-slate-100">
                            <i data-lucide="arrow-left" class="w-5 h-5"></i>
                        </button>
                        <i data-lucide="layers" class="text-indigo-600 w-8 h-8 ml-2"></i>
                        <span class="font-bold text-xl tracking-tight text-slate-900">SkillLink</span>
                    </div>
                    <h2 class="text-xl font-bold text-slate-900 tracking-tight">Créer un compte</h2>
                    <p class="text-slate-500 mt-2">Rejoignez la plateforme et commencez dès aujourd'hui.</p>
                </div>

                <!-- Custom Inline Error Banner -->
                <div id="register-error" class="hidden flex items-start space-x-2.5 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm mb-6 transition-all duration-350">
                    <i data-lucide="alert-circle" class="w-5 h-5 shrink-0 text-rose-500 mt-0.5"></i>
                    <div class="flex-grow font-medium leading-relaxed" id="register-error-text"></div>
                </div>

                <form id="register-form" class="space-y-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Nom complet</label>
                            <div class="relative">
                                <i data-lucide="user" class="w-5 h-5 text-slate-400 absolute left-3.5 top-4"></i>
                                <input type="text" id="name" required placeholder="Alex Dupont" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium">
                            </div>
                        </div>
                        <div>
                            <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Je m'inscris en tant que...</label>
                            <div class="relative">
                                <select id="role" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition appearance-none font-medium text-slate-700">
                                    <option value="client">Client</option>
                                    <option value="entrepreneur">Freelance / Artisan</option>
                                </select>
                                <i data-lucide="users" class="w-5 h-5 text-indigo-500 absolute left-3.5 top-4 pointer-events-none"></i>
                                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Adresse Email</label>
                        <div class="relative">
                            <i data-lucide="mail" class="w-5 h-5 text-slate-400 absolute left-3.5 top-4"></i>
                            <input type="email" id="email" required placeholder="contact@exemple.com" class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium">
                        </div>
                    </div>

                    <div>
                        <label class="block pl-1 text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
                        <div class="relative">
                            <i data-lucide="lock" class="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5"></i>
                            <input type="password" id="password" required placeholder="••••••••" class="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition font-medium">
                            <button type="button" id="toggle-password" class="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition">
                                <i data-lucide="eye" class="w-5 h-5" id="toggle-password-icon"></i>
                            </button>
                        </div>
                        
                        <!-- Visual Password Strength Meter (Securitized Indicator) -->
                        <div class="mt-2.5 px-1 hidden" id="pwd-strength-indicator">
                            <div class="flex gap-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div id="strength-bar-1" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                                <div id="strength-bar-2" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                                <div id="strength-bar-3" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                                <div id="strength-bar-4" class="h-full bg-slate-200 w-1/4 transition-all duration-300"></div>
                            </div>
                            <span class="text-[11px] font-bold text-slate-400 mt-1.5 flex items-center shadow-sm" id="strength-status-text">
                                <i data-lucide="shield-alert" class="w-3.5 h-3.5 mr-1 text-slate-400"></i> Trop court
                            </span>
                        </div>
                        <p class="text-[11px] text-slate-500 mt-2 pl-1" id="pswd-requirements">Le mot de passe doit inclure 8+ caract., majuscule & chiffre.</p>
                    </div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-4 font-bold transition mt-8 shadow-md shadow-indigo-200 flex items-center justify-center group overflow-hidden relative">
                        <span class="relative z-10 flex items-center">Créer mon compte <i data-lucide="arrow-right" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"></i></span>
                        <div class="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <div class="mt-6">
                        <button type="button" id="btn-google-register" class="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-3.5 font-bold transition flex items-center justify-center shadow-sm">
                            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            S'inscrire avec Google
                        </button>
                    </div>
                </form>
                
                <p class="text-center text-sm text-slate-500 mt-8">
                    Vous avez déjà un compte ? <a href="#" data-route="login" class="text-indigo-600 font-bold hover:underline">Connectez-vous</a>
                </p>
            </div>

            <!-- Right Side / Artwork -->
            <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80" alt="Collaboration" class="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay">
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-800/90 mix-blend-multiply"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                
                <div class="relative z-10 p-16 text-center">
                    <div class="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                        <i data-lucide="rocket" class="w-10 h-10 text-white"></i>
                    </div>
                    <h3 class="text-4xl font-extrabold text-white tracking-tight mb-6 leading-tight">Démarrez votre aventure.</h3>
                    <p class="text-indigo-100 text-lg max-w-md mx-auto leading-relaxed">Rejoignez une communauté professionnelle de qualité et développez votre activité en toute sérénité.</p>
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
