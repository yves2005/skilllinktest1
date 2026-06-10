import { AppState } from '../state.js';
import { marked } from 'marked';
import { auth } from '../services/firebase.js';

export const AIAssistantView = {
    render: () => `
        <div class="max-w-4xl mx-auto h-[700px] flex flex-col bg-white dark:bg-slate-900 md:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 mt-8 overflow-hidden view-enter">
            <!-- Header -->
            <div class="bg-white dark:bg-slate-950 p-6 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                        <i data-lucide="sparkles" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Assistant IA</h2>
                        <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">La puissance de l'IA à votre service</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button id="clear-chat" class="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20" title="Effacer historique">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                    <button data-action="back" class="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" title="Fermer">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
            
            <!-- Chat Area -->
            <div class="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-950/20">
                <div class="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M20 20 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M50 15 h10 v10 h-10 z M80 20 l5 10 h10 z M100 10 c0 5 -4 9 -9 9 s-9 -4 -9 -9 s4 -9 9 -9 s9 4 9 9z M15 50 l10 -10 v20 z M55 45 a7 7 0 1 1 -14 0 a7 7 0 1 1 14 0 M85 55 l10 10 l-10 10 l-10 -10 z M110 50 h6 v6 h-6 z M25 85 h12 v8 H25z M60 90 l-5 15 l10 0 z M95 80 c0 4 -3 7 -7 7 s-7 -3 -7 -7 s3 -7 7 -7 s7 3 7 7z M10 110 h15 M110 110 v-15' /%3E%3Ccircle cx='40' cy='30' r='2' /%3E%3Ccircle cx='70' cy='60' r='3' /%3E%3Ccircle cx='20' cy='70' r='2' /%3E%3Ccircle cx='100' cy='95' r='2' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>
                <div id="chat-messages" class="absolute inset-0 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
                    <!-- Messages appended here -->
                </div>
            </div>
            
            <!-- Input Area -->
            <div class="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div class="px-4 pb-2 flex flex-wrap gap-2 max-w-4xl mx-auto overflow-x-auto no-scrollbar">
                    <button class="quick-pattern px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 transition-all whitespace-nowrap shadow-sm">
                        🚀 Optimiser mon profil
                    </button>
                    <button class="quick-pattern px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 transition-all whitespace-nowrap shadow-sm">
                        📄 Améliorer mon service
                    </button>
                    <button class="quick-pattern px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-500 transition-all whitespace-nowrap shadow-sm">
                        💡 Idées de marketing
                    </button>
                </div>
                <form id="ai-form" class="relative flex items-center max-w-4xl mx-auto gap-2">
                    <input id="ai-input" type="text" placeholder="Discuter avec l'IA..." class="flex-1 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-100 text-sm font-medium" autocomplete="off">
                    <input type="file" id="ai-file-input" class="hidden" accept="image/*,.pdf,.doc,.docx">
                    <button type="button" id="ai-attach-btn" class="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                        <i data-lucide="paperclip" class="w-5 h-5"></i>
                    </button>
                    <button type="submit" id="ai-generate-btn" class="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-indigo-600/20">
                        <i data-lucide="send" class="w-5 h-5"></i>
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

        if (!form || !input || !btn || !chatMessages) return;
        
        const updateBtnState = () => {
            btn.disabled = input.value.trim().length === 0;
        };
        
        input.addEventListener('input', updateBtnState);
        updateBtnState(); 

        document.querySelectorAll('.quick-pattern').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.textContent.trim().replace(/^[^ ]+ /, ''); // Remove emoji
                input.value = text;
                updateBtnState();
                handleSend(text);
            });
        });        
        const attachBtn = document.getElementById('ai-attach-btn');
        const fileInput = document.getElementById('ai-file-input');

        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) return alert('Erreur upload');
            
            const { url } = await response.json();
            handleSend(file.name, url, file.type);
            fileInput.value = '';
        });
        
        const appendUserMessage = (text, attachmentUrl, attachmentType) => {
            const el = document.createElement('div');
            el.className = "flex justify-end view-enter p-1";
            let content = text ? `<p class="text-white text-sm">${text}</p>` : '';
            if (attachmentUrl) {
                if (attachmentType?.startsWith('image/')) {
                    content += `<img src="${attachmentUrl}" class="rounded-2xl mt-2 max-w-full" />`;
                } else {
                    content += `<a href="${attachmentUrl}" target="_blank" class="text-indigo-100 underline text-xs mt-2 block">${text || 'Fichier joint'}</a>`;
                }
            }
            el.innerHTML = `
                <div class="bg-indigo-600 px-5 py-3 w-fit max-w-[80%] rounded-2xl rounded-tr-sm shadow-md">
                    ${content}
                </div>
            `;
            chatMessages.appendChild(el);
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        };
        
        const appendBotMessage = (text, attachmentUrl) => {
            const el = document.createElement('div');
            el.className = "flex justify-start view-enter p-1 w-full group";
            let contentBody = marked.parse(text || '');
            let contentHtml = `<div class="text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose prose-slate dark:prose-invert max-w-none">${contentBody}</div>`;
            
            if (attachmentUrl) {
                 contentHtml += `<a href="${attachmentUrl}" target="_blank" class="text-indigo-600 dark:text-indigo-400 underline text-xs mt-3 block">Voir fichier joint</a>`;
            }
            
            el.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mr-3 mt-1 text-slate-500 dark:text-slate-400">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div class="relative bg-white dark:bg-slate-800 p-5 w-fit max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                    ${contentHtml}
                    <button class="absolute -bottom-8 right-0 p-2 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 copy-btn" title="Copier">
                        <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
            chatMessages.appendChild(el);
            
            el.querySelector('.copy-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(text);
                const icon = el.querySelector('[data-lucide="copy"]');
                icon.setAttribute('data-lucide', 'check');
                window.lucide.createIcons();
                setTimeout(() => {
                    icon.setAttribute('data-lucide', 'copy');
                    window.lucide.createIcons();
                }, 2000);
            });
            
            if (window.lucide) window.lucide.createIcons();
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        };
        
        const appendLoading = () => {
            const el = document.createElement('div');
            el.id = 'ai-loading';
            el.className = "flex justify-start view-enter p-1";
            el.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mr-3 mt-1 text-slate-500 dark:text-slate-400">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div class="bg-white dark:bg-slate-800 p-5 w-fit rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm flex space-x-2 items-center">
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
                    <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
                </div>
            `;
            chatMessages.appendChild(el);
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
            return el;
        };

        const userId = auth.currentUser?.uid;
        
        const saveMessages = (msgs) => {
            if (userId) localStorage.setItem(`aiChatMessages_${userId}`, JSON.stringify(msgs));
        };
        
        const loadMessages = () => {
            if (!userId) return [];
            const saved = localStorage.getItem(`aiChatMessages_${userId}`);
            return saved ? JSON.parse(saved) : [];
        };

        const renderMessages = () => {
            const msgs = loadMessages();
            chatMessages.innerHTML = '';
            msgs.forEach(m => {
                if (m.sender === 'user') appendUserMessage(m.text, m.attachmentUrl, m.attachmentType);
                else appendBotMessage(m.text, m.attachmentUrl);
            });
        };
        
        renderMessages();
        
        const clearChatBtn = document.getElementById('clear-chat');
        clearChatBtn.addEventListener('click', () => {
            if (confirm('Effacer tout l\'historique ?')) {
                saveMessages([]);
                chatMessages.innerHTML = '';
            }
        });
        
        const handleSend = async (text, attachmentUrl = null, attachmentType = null) => {
            const queryText = text.trim();
            if(!queryText && !attachmentUrl) return;
            
            const msgs = loadMessages();
            const newUserMsg = {
                text: queryText,
                sender: 'user',
                timestamp: new Date().toISOString(),
                attachmentUrl,
                attachmentType
            };
            
            msgs.push(newUserMsg);
            saveMessages(msgs);
            appendUserMessage(newUserMsg.text, newUserMsg.attachmentUrl, newUserMsg.attachmentType);
            
            input.value = '';
            updateBtnState();
            
            // Container for streaming bot message
            const botMessageEl = document.createElement('div');
            botMessageEl.className = "flex justify-start view-enter p-1 w-full group";
            botMessageEl.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mr-3 mt-1 text-slate-500 dark:text-slate-400">
                    <i data-lucide="bot" class="w-5 h-5"></i>
                </div>
                <div class="relative bg-white dark:bg-slate-800 p-5 w-fit max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="bot-content prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed"></div>
                </div>
            `;
            chatMessages.appendChild(botMessageEl);
            const contentEl = botMessageEl.querySelector('.bot-content');
            window.lucide?.createIcons();

            let fullText = "";

            try {
                const response = await fetch('/api/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        query: queryText, 
                        role: AppState.user?.role || 'client',
                        provider: AppState.aiProvider || 'gemini',
                        attachmentUrl
                    })
                });

                if (!response.ok) throw new Error('Erreur serveur.');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ""; // Keep the last partial line in buffer
                    
                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
                        
                        const dataStr = trimmedLine.slice(6);
                        if (dataStr === '[DONE]') break;
                        
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.text) {
                                fullText += parsed.text;
                                contentEl.innerHTML = marked.parse(fullText);
                                chatMessages.scrollTo({ top: chatMessages.scrollHeight });
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        } catch (e) { 
                            console.error("Stream parse error", e, "Line:", trimmedLine); 
                        }
                    }
                }
                
                const currentMsgs = loadMessages();
                currentMsgs.push({
                    text: fullText,
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                });
                saveMessages(currentMsgs);
                
            } catch (e) {
                console.error("Chat error:", e);
                contentEl.innerHTML = `<span class="text-red-500">⚠️ ${e.message}</span>`;
            }
        };
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSend(input.value);
        });
    }
};
