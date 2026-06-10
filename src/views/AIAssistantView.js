import { AppState } from '../state.js';
import { marked } from 'marked';

export const AIAssistantView = {
    render: () => `
        <div class="max-w-4xl mx-auto h-[700px] flex flex-col bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl md:rounded-[2.5rem] shadow-none md:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 md:border-2 mt-8 overflow-hidden view-enter">
            <!-- Header -->
            <div class="bg-slate-900 dark:bg-slate-950 text-white p-6 sm:p-8 flex flex-col justify-center relative flex-shrink-0 border-b border-slate-100 dark:border-slate-800/60">
                <button data-action="back" class="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/10 z-20">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
                <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
                <div class="flex items-center space-x-4 relative z-10 pr-12">
                    <div class="w-12 h-12 rounded-xl bg-indigo-500/10 backdrop-blur flex items-center justify-center border border-indigo-500/20 shadow-inner">
                        <i data-lucide="sparkles" class="w-6 h-6 text-indigo-400"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-black tracking-tight text-white">Assistant IA</h2>
                        <p class="text-indigo-200/70 text-xs font-medium mt-1">La puissance de l'IA au service de votre réussite.</p>
                    </div>
                </div>
            </div>
            
            <!-- Chat Area -->
            <div id="chat-messages" class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-slate-50/80 dark:bg-slate-900/90 bg-fixed relative scroll-smooth">
                <!-- Initial Message -->
                <div class="flex justify-start">
                    <div class="w-12 h-12 rounded-[1rem] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50 flex-shrink-0 mr-4 mt-1 text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <i data-lucide="bot" class="w-5 h-5"></i>
                    </div>
                    <div class="bg-white dark:bg-slate-800/60 px-6 py-5 w-full max-w-[85%] rounded-[1.25rem] rounded-tl-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm animate-fade-in">
                        <p class="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-semibold">
                            ${AppState.user?.role === 'entrepreneur' 
                                ? "Bonjour ! Je suis votre co-pilote IA. Je peux vous aider à optimiser votre profil, identifier vos tarifs idéaux, ou rédiger des propositions irrésistibles. Comment puis-je vous aider aujourd'hui ?" 
                                : "Bonjour ! Je suis votre assistant IA projet. Je suis là pour vous aider à définir vos besoins de projet avec précision, structurer vos idées et vous recommander les freelances les plus qualifiés pour votre mission. Par quoi voulons-nous commencer ?"}
                        </p>
                        <div class="mt-5 flex flex-wrap gap-2.5">
                            ${AppState.user?.role === 'entrepreneur' ? `
                            <button type="button" class="quick-prompt text-left sm:text-center text-xs bg-slate-100/60 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5">Rédige ma bio</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-xs bg-slate-100/60 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5">Analyser mes tarifs</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-xs bg-slate-100/60 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5">Modèle de proposition</button>
                            ` : `
                            <button type="button" class="quick-prompt text-left sm:text-center text-xs bg-slate-100/60 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5">M'aider à définir mon besoin</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-xs bg-slate-100/60 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5">Trouver le bon profil</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-xs bg-slate-100/60 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm cursor-pointer hover:shadow hover:-translate-y-0.5">Estimer un budget</button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Input Area -->
            <div class="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
                <form id="ai-form" class="relative flex items-center max-w-4xl mx-auto">
                    <input id="ai-input" type="text" placeholder="Posez-moi votre question..." class="w-full pl-6 pr-16 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/30 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-white text-sm shadow-sm font-medium" autocomplete="off">
                    <button type="submit" id="ai-generate-btn" class="absolute right-2.5 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none">
                        <i data-lucide="send-horizonal" class="w-5 h-5"></i>
                    </button>
                </form>
            </div>
        </div>
    `,
    
    attachEvents: () => {
        const form = document.getElementById('ai-form');
        const input = document.getElementById('ai-input');
        const btn = document.getElementById('ai-generate-btn');
        const chatMessages = document.getElementById('chat-messages');
        const quickPrompts = document.querySelectorAll('.quick-prompt');
        
        const updateBtnState = () => {
            btn.disabled = input.value.trim().length === 0;
        };
        
        input?.addEventListener('input', updateBtnState);
        updateBtnState(); // initial state
        
        const appendUserMessage = (text) => {
            const el = document.createElement('div');
            el.className = "flex justify-end view-enter p-1";
            el.innerHTML = `
                <div class="bg-indigo-600 dark:bg-indigo-500 px-6 py-4 w-fit max-w-[85%] rounded-[1.25rem] rounded-tr-sm shadow-md">
                    <p class="text-white text-sm leading-relaxed font-semibold">${text}</p>
                </div>
            `;
            chatMessages.appendChild(el);
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        };
        
        const appendBotMessage = (text) => {
            const el = document.createElement('div');
            el.className = "flex justify-start view-enter p-1";
            el.innerHTML = `
                <div class="w-12 h-12 rounded-[1rem] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50 flex-shrink-0 mr-4 mt-1 text-indigo-600 dark:text-indigo-400 shadow-sm animate-fade-in animate-once">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div class="bg-white dark:bg-slate-800/60 px-6 py-5 w-full max-w-[85%] rounded-[1.25rem] rounded-tl-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm animate-fade-in">
                    <div class="text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose prose-slate dark:prose-invert max-w-none font-medium">${marked.parse(text)}</div>
                </div>
            `;
            chatMessages.appendChild(el);
            if (window.lucide) window.lucide.createIcons();
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        };
        
        const appendLoading = () => {
            const el = document.createElement('div');
            el.id = 'ai-loading';
            el.className = "flex justify-start view-enter p-1";
            el.innerHTML = `
                <div class="w-12 h-12 rounded-[1rem] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50 flex-shrink-0 mr-4 mt-1 text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div class="bg-white dark:bg-slate-800/60 px-6 py-4 w-fit rounded-[1.25rem] rounded-tl-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex space-x-2 items-center">
                    <div class="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce"></div>
                    <div class="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
                    <div class="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
                </div>
            `;
            chatMessages.appendChild(el);
            if (window.lucide) window.lucide.createIcons();
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
            return el;
        };

        const handleSend = async (text) => {
            const query = text.trim();
            if(!query) return;
            
            appendUserMessage(query);
            input.value = '';
            updateBtnState();
            
            const loadingEl = appendLoading();

            try {
                const fetchWithRetry = async (url, options, retries = 2) => {
                    for (let i = 0; i <= retries; i++) {
                        const response = await fetch(url, options);
                        if (response.ok || (i === retries && response.status !== 503)) {
                            return response;
                        }
                        if (i < retries) {
                            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
                        }
                    }
                };

                const response = await fetchWithRetry('/api/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query, role: AppState.user?.role || 'client' })
                });

                if (!response || !response.ok) {
                    const text = response ? await response.text() : 'No response';
                    let errorData;
                    try {
                        errorData = JSON.parse(text);
                    } catch (e) {
                        errorData = { error: 'API Error (' + (response ? response.status : 'Network Error') + '): ' + text.substring(0, 50) + '...' };
                    }
                    throw new Error(errorData.error || 'API Error');
                }
                const data = await response.json();
                appendBotMessage(data.response);
            } catch (e) {
                console.error("Chat error:", e);
                appendBotMessage(e.message || "Désolé, une erreur est survenue lors de la communication avec l'IA.");
            } finally {
                loadingEl.remove();
            }
        };
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSend(input.value);
        });
        
        quickPrompts.forEach(p => {
            p.addEventListener('click', (e) => {
                e.preventDefault();
                handleSend(p.innerText);
            });
        });
    }
};
