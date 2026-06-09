import { AppState } from '../state.js';
import { marked } from 'marked';

export const AIAssistantView = {
    render: () => `
        <div class="max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-6 overflow-hidden">
            <!-- Header -->
            <div class="bg-indigo-900 text-white p-5 sm:p-6 flex flex-col justify-center relative flex-shrink-0">
                <button data-action="back" class="absolute top-4 right-4 text-white hover:text-indigo-200 transition flex items-center justify-center p-2 rounded-full hover:bg-white/10 z-20">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
                <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
                <div class="flex items-center space-x-3 relative z-10 pr-10">
                    <div class="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20"><i data-lucide="sparkles" class="w-6 h-6 text-indigo-200"></i></div>
                    <div>
                        <h2 class="text-xl font-bold tracking-tight">Assistant IA SkillLink</h2>
                        <p class="text-indigo-200 text-sm mt-0.5">La puissance de l'IA au service de votre réussite.</p>
                    </div>
                </div>
            </div>
            
            <!-- Chat Area -->
            <div id="chat-messages" class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50 relative scroll-smooth">
                <!-- Initial Message -->
                <div class="flex justify-start">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 flex-shrink-0 mr-3 mt-1 text-indigo-600 shadow-sm">
                        <i data-lucide="bot" class="w-5 h-5"></i>
                    </div>
                    <div class="bg-white px-5 py-4 w-full max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
                        <p class="text-slate-700 text-sm leading-relaxed">
                            ${AppState.user?.role === 'entrepreneur' 
                                ? "Bonjour ! Je suis votre co-pilote IA. Je peux vous aider à optimiser votre profil, identifier vos tarifs idéaux, ou rédiger des propositions irrésistibles. Comment puis-je vous aider aujourd'hui ?" 
                                : "Bonjour ! Je suis votre assistant IA projet. Je suis là pour vous aider à définir vos besoins de projet avec précision, structurer vos idées et vous recommander les freelances les plus qualifiés pour votre mission. Par quoi voulons-nous commencer ?"}
                        </p>
                        <div class="mt-4 flex flex-wrap gap-2">
                            ${AppState.user?.role === 'entrepreneur' ? `
                            <button type="button" class="quick-prompt text-left sm:text-center text-[13px] bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-sm cursor-pointer hover:shadow">Rédige ma bio</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-[13px] bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-sm cursor-pointer hover:shadow">Analyser mes tarifs</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-[13px] bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-sm cursor-pointer hover:shadow">Modèle de proposition</button>
                            ` : `
                            <button type="button" class="quick-prompt text-left sm:text-center text-[13px] bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-sm cursor-pointer hover:shadow">M'aider à définir mon besoin</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-[13px] bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-sm cursor-pointer hover:shadow">Trouver le bon profil</button>
                            <button type="button" class="quick-prompt text-left sm:text-center text-[13px] bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium px-4 py-2.5 rounded-xl border border-slate-200 transition shadow-sm cursor-pointer hover:shadow">Estimer un budget</button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Input Area -->
            <div class="px-5 py-4 bg-white border-t border-slate-100 flex-shrink-0">
                <form id="ai-form" class="relative flex items-center">
                    <input id="ai-input" type="text" placeholder="Posez-moi votre question..." class="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition text-slate-700 text-sm shadow-inner" autocomplete="off">
                    <button type="submit" id="ai-generate-btn" class="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition shadow-md disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed">
                        <i data-lucide="send" class="w-4 h-4 ml-0.5"></i>
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
            el.className = "flex justify-end view-enter";
            el.innerHTML = `
                <div class="bg-indigo-600 px-5 py-4 w-fit max-w-[85%] rounded-2xl rounded-tr-sm shadow-md">
                    <p class="text-white text-sm leading-relaxed">${text}</p>
                </div>
            `;
            chatMessages.appendChild(el);
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        };
        
        const appendBotMessage = (text) => {
            const el = document.createElement('div');
            el.className = "flex justify-start view-enter";
            el.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 flex-shrink-0 mr-3 mt-1 text-indigo-600 shadow-sm">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div class="bg-white px-5 py-4 w-full max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
                    <div class="text-slate-700 text-sm leading-relaxed prose prose-slate max-w-none">${marked.parse(text)}</div>
                </div>
            `;
            chatMessages.appendChild(el);
            if (window.lucide) window.lucide.createIcons();
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        };
        
        const appendLoading = () => {
            const el = document.createElement('div');
            el.id = 'ai-loading';
            el.className = "flex justify-start view-enter";
            el.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 flex-shrink-0 mr-3 mt-1 text-indigo-600 shadow-sm">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div class="bg-white px-5 py-4 w-fit rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex space-x-2 items-center">
                    <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
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
