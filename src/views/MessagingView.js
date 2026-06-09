import { NotificationService } from '../services/NotificationService.js';
import { db, auth, handleFirestoreError, OperationType } from '../services/firebase.js';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    doc, 
    getDoc, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp 
} from 'firebase/firestore';
import { DUMMY_FREELANCES, AppState } from '../state.js';

export const MessagingView = {
    render: () => `
        <div class="w-full h-[calc(100vh-130px)] md:max-w-6xl md:h-[650px] md:mx-auto bg-white md:rounded-3xl shadow-none md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden md:mt-6">
            <!-- Navigation Rapide (Hidden on mobile) -->
            <div class="hidden md:flex justify-center gap-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
                <button data-route="marketplace" class="flex items-center text-slate-500 hover:text-indigo-600 transition font-medium text-sm border-none bg-transparent cursor-pointer">
                    <i data-lucide="search" class="w-4 h-4 mr-1.5"></i> Explorer
                </button>
                <div class="w-px h-5 bg-slate-200"></div>
                <button data-route="ai" class="flex items-center text-slate-500 hover:text-indigo-600 transition font-medium text-sm border-none bg-transparent cursor-pointer">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-1.5"></i> Assistant IA
                </button>
            </div>
            
            <div class="flex flex-1 overflow-hidden font-sans">
                <!-- Sidebar contacts -->
                <div id="contacts-sidebar" class="w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50 md:flex">
                    <div class="p-3 border-b border-slate-100 bg-white">
                        <div class="flex items-center mb-4">
                            <button data-route="marketplace" class="text-slate-400 hover:text-slate-600 transition flex items-center justify-center p-1.5 rounded-full hover:bg-slate-100 mr-2 border-none bg-transparent cursor-pointer">
                                <i data-lucide="arrow-left" class="w-5 h-5"></i>
                            </button>
                            <h2 class="font-bold text-xl text-slate-900 flex items-center tracking-tight">
                                <i data-lucide="message-square" class="w-5 h-5 mr-2.5 text-indigo-600"></i> Messagerie
                            </h2>
                        </div>
                        <div class="flex items-center mt-2 space-x-2">
                            <div class="relative flex-grow">
                                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5 bg-transparent p-0 border-none"></i>
                                <input type="text" id="contact-search" placeholder="Rechercher / Nouveau..." class="w-full bg-slate-100 text-sm border border-slate-100 shadow-inner rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-indigo-600 outline-none placeholder-slate-400 transition">
                            </div>
                            <button id="btn-new-chat" class="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition cursor-pointer shadow-sm border-none shrink-0" title="Nouvelle discussion">
                                <i data-lucide="edit" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex border-b border-slate-100 bg-white" id="chat-tabs">
                        <button id="tab-active" class="flex-1 py-2 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 transition truncate px-2 cursor-pointer outline-none">Actives</button>
                        <button id="tab-archived" class="flex-1 py-2 text-sm font-medium text-slate-500 border-b-2 border-transparent hover:text-slate-700 transition truncate px-2 cursor-pointer outline-none">Archives</button>
                    </div>
                    <div class="flex-grow overflow-y-auto custom-scrollbar" id="contacts-list">
                        <div class="flex items-center justify-center h-48">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Chat Area -->
                <div id="chat-container" class="hidden md:flex w-full md:w-2/3 flex-col bg-white h-full relative border-none">
                    <div class="p-2 md:p-5 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur z-10 shrink-0">
                        <div class="flex items-center">
                            <button id="btn-back-to-contacts" class="md:hidden text-slate-600 p-2 mr-1 border-none bg-transparent cursor-pointer">
                                <i data-lucide="arrow-left" class="w-5 h-5"></i>
                            </button>
                            <div class="flex items-center space-x-2 md:space-x-3 cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-xl transition" data-route="profile" id="chat-header-user">
                                <!-- Header dynamic insertion -->
                            </div>
                        </div>
                        <div class="flex items-center space-x-0.5 md:space-x-1">
                            <button class="text-slate-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition border-none bg-transparent cursor-pointer"><i data-lucide="phone" class="w-4 h-4"></i></button>
                            <button class="text-slate-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition border-none bg-transparent cursor-pointer"><i data-lucide="video" class="w-4 h-4"></i></button>
                            <button id="btn-archive-chat" class="hidden text-slate-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition border-none bg-transparent cursor-pointer"><i data-lucide="archive" class="w-4 h-4"></i></button>
                            <button class="text-slate-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition border-none bg-transparent cursor-pointer"><i data-lucide="more-vertical" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                    
                    <div class="flex-grow p-2 md:p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 space-y-3" id="messages-list">
                        <div class="flex flex-col items-center justify-center h-full text-center p-8">
                            <div class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                                <i data-lucide="message-square" class="w-8 h-8 text-indigo-400"></i>
                            </div>
                            <h3 class="font-bold text-slate-800 text-base mb-1">Vos Messages en temps réel</h3>
                            <p class="text-xs text-slate-400 max-w-sm leading-relaxed">Sélectionnez une discussion active dans la barre de gauche, ou contactez directement un développeur depuis la plateforme.</p>
                        </div>
                    </div>
                    
                    <div class="p-3 border-t border-slate-100 bg-white shrink-0">
                        <form id="chat-form" class="flex items-end space-x-2 relative border-none">
                            <input type="file" id="chat-attachment" class="hidden">
                            <button type="button" id="btn-chat-attach" class="text-slate-400 hover:text-indigo-600 p-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-indigo-50 transition mb-0.5 cursor-pointer bg-white" title="Joindre un fichier">
                                <i data-lucide="paperclip" class="w-4 h-4"></i>
                            </button>
                            <div class="flex-grow relative border border-slate-200 rounded-xl bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent focus-within:bg-white transition-all">
                                <div id="recording-ui" class="hidden absolute inset-0 bg-red-50 flex items-center justify-between px-3 rounded-xl z-10">
                                    <div class="flex items-center text-red-500 font-medium text-xs animate-pulse">
                                        <div class="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                                        <span id="recording-time" class="font-mono">00:00</span>
                                    </div>
                                    <button type="button" id="btn-chat-stop-mic" class="text-slate-500 hover:text-red-600 bg-white p-1 rounded-full shadow-sm cursor-pointer transition border border-slate-200">
                                        <i data-lucide="square" class="w-3 h-3 fill-current"></i>
                                    </button>
                                </div>
                                <textarea id="chat-input" placeholder="Écrivez un message..." class="w-full bg-transparent border-none px-3 py-2.5 pr-10 outline-none resize-none custom-scrollbar text-sm" rows="1" disabled></textarea>
                                <button type="button" id="btn-chat-mic" class="absolute top-[8px] right-2 p-1 text-slate-400 hover:text-indigo-600 transition border-none bg-transparent cursor-pointer disabled:opacity-50" title="Message vocal" disabled>
                                    <i data-lucide="mic" class="w-4 h-4"></i>
                                </button>
                            </div>
                            <button type="submit" id="send-msg-btn" class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition shadow-md mb-0.5 cursor-pointer border-none" disabled>
                                <i data-lucide="send" class="w-4 h-4 translate-x-0.5"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    attachEvents: () => {
        // Safe global teardown to prevent zombie listeners
        if (window.activeMessagingTeardown) {
            window.activeMessagingTeardown();
            window.activeMessagingTeardown = null;
        }

        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) {
            const container = document.getElementById('chat-container');
            if (container) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
                        <div class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                            <i data-lucide="lock" class="w-8 h-8 text-indigo-500"></i>
                        </div>
                        <h3 class="font-bold text-slate-900 text-lg mb-1">Connexion requise</h3>
                        <p class="text-sm text-slate-500 max-w-sm mb-5">Veuillez vous connecter à votre compte pour accéder à vos messages en temps réel.</p>
                        <button data-route="login" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-md border-none cursor-pointer">
                            Se connecter
                        </button>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons({ root: container });
            }
            const contacts = document.getElementById('contacts-list');
            if (contacts) {
                contacts.innerHTML = `
                    <div class="text-center p-8 text-slate-400 text-sm">
                        Connectez-vous pour voir vos conversations.
                    </div>
                `;
            }
            return;
        }

        let activeConversationId = null;
        let unsubscribeConversations = null;
        let unsubscribeMessages = null;
        const cachedUsers = new Map();
        let convList = [];
        let searchQuery = "";
        let messageSearchQuery = "";
        let currentMessages = [];
        let currentTab = 'active'; // 'active' or 'archived'
        let archivedSet = new Set();
        let unsubscribeArchives = null;

        const contactsList = document.getElementById('contacts-list');
        const messagesList = document.getElementById('messages-list');
        const chatHeaderUser = document.getElementById('chat-header-user');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-msg-btn');
        const btnAttach = document.getElementById('btn-chat-attach');
        const chatAttachment = document.getElementById('chat-attachment');
        const contactSearch = document.getElementById('contact-search');
        const messageSearchInput = document.getElementById('message-search-input');
        const messageSearchContainer = document.getElementById('message-search-container');
        const btnArchiveChat = document.getElementById('btn-archive-chat');
        const tabActive = document.getElementById('tab-active');
        const tabArchived = document.getElementById('tab-archived');
        const contactsSidebar = document.getElementById('contacts-sidebar');
        const chatContainer = document.getElementById('chat-container');
        const btnBackToContacts = document.getElementById('btn-back-to-contacts');

        if (btnBackToContacts) {
            btnBackToContacts.addEventListener('click', () => {
                contactsSidebar.classList.remove('hidden');
                chatContainer.classList.add('hidden');
                chatContainer.classList.remove('flex');
            });
        }

        const updateTabUI = () => {
            if (currentTab === 'active') {
                tabActive.classList.replace('text-slate-500', 'text-indigo-600');
                tabActive.classList.replace('font-medium', 'font-bold');
                tabActive.classList.replace('border-transparent', 'border-indigo-600');
                tabArchived.classList.replace('text-indigo-600', 'text-slate-500');
                tabArchived.classList.replace('font-bold', 'font-medium');
                tabArchived.classList.replace('border-indigo-600', 'border-transparent');
            } else {
                tabArchived.classList.replace('text-slate-500', 'text-indigo-600');
                tabArchived.classList.replace('font-medium', 'font-bold');
                tabArchived.classList.replace('border-transparent', 'border-indigo-600');
                tabActive.classList.replace('text-indigo-600', 'text-slate-500');
                tabActive.classList.replace('font-bold', 'font-medium');
                tabActive.classList.replace('border-indigo-600', 'border-transparent');
            }
            renderContacts();
        };

        if (tabActive && tabArchived) {
            tabActive.addEventListener('click', () => { currentTab = 'active'; updateTabUI(); });
            tabArchived.addEventListener('click', () => { currentTab = 'archived'; updateTabUI(); });
        }

        // Check text length on typing
        if (input) {
            input.disabled = true; // wait until active convo
            input.addEventListener('input', () => {
                sendBtn.disabled = !input.value.trim();
                // auto-resize height up to max
                input.style.height = 'auto';
                input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
            });
        }

        if (messageSearchInput) {
            messageSearchInput.addEventListener('input', (e) => {
                messageSearchQuery = e.target.value.trim();
                renderMessages();
            });
        }

        const getPartnerProfile = async (partnerId) => {
            if (!partnerId) return { id: 'unknown', name: 'Utilisateur inconnu', initials: '?', color: 'slate', online: false, email: '', img: null };
            if (cachedUsers.has(partnerId)) {
                return cachedUsers.get(partnerId);
            }
            // Check original dummy freelances first
            const localFree = DUMMY_FREELANCES.find(f => f.id === partnerId);
            if (localFree) {
                const profile = {
                    id: partnerId,
                    name: localFree.name,
                    initials: localFree.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                    color: partnerId.charCodeAt(0) % 2 === 0 ? "indigo" : "amber",
                    online: localFree.isAvailable !== false,
                    email: localFree.email || "",
                    img: localFree.img || null
                };
                cachedUsers.set(partnerId, profile);
                return profile;
            }
            
            // Query Firestore
            try {
                const snap = await getDoc(doc(db, 'users', partnerId));
                if (snap.exists()) {
                    const data = snap.data();
                    const profile = {
                        id: partnerId,
                        name: data.displayName || data.email?.split('@')[0] || "Utilisateur",
                        initials: (data.displayName || data.email || "U").substring(0, 2).toUpperCase(),
                        color: partnerId.charCodeAt(0) % 2 === 0 ? "indigo" : "amber",
                        online: data.isAvailable !== false,
                        email: data.email || "",
                        img: data.avatarImage || data.img || null
                    };
                    cachedUsers.set(partnerId, profile);
                    return profile;
                }
            } catch (err) {
                handleFirestoreError(err, OperationType.GET, `users/${partnerId}`);
            }

            return {
                id: partnerId,
                name: "Utilisateur",
                initials: "U",
                color: "indigo",
                online: false,
                email: "",
                img: null
            };
        };

        const renderContacts = async () => {
            if (!contactsList) return;

            // Search filtering
            const filteredList = await Promise.all(convList.map(async (c) => {
                const partnerId = c.participants.find(p => p !== currentUserId);
                const partner = await getPartnerProfile(partnerId);
                return { c, partner };
            }));

            const finalDisplayList = filteredList.filter(item => {
                const isArchived = archivedSet.has(item.c.id);
                if (currentTab === 'active' && isArchived) return false;
                if (currentTab === 'archived' && !isArchived) return false;

                if (!searchQuery) return true;
                return item.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (item.c.lastMessageText || '').toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (finalDisplayList.length === 0) {
                contactsList.innerHTML = `
                    <div class="text-center p-8 text-slate-400 text-sm">
                        ${searchQuery ? 'Aucun résultat trouvé.' : 'Aucune discussion.'}
                    </div>
                `;
                return;
            }

            const itemsHtml = finalDisplayList.map(({ c, partner }) => {
                const isActive = c.id === activeConversationId;
                return `
                    <div class="contact-item p-4 border-b border-slate-100 cursor-pointer transition flex space-x-3 ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}" data-id="${c.id}">
                        <div class="relative flex-shrink-0">
                            ${partner.img ? `
                                <img src="${partner.img}" referrerpolicy="no-referrer" class="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-sm" />
                            ` : `
                                <div class="w-11 h-11 rounded-full bg-${partner.color}-100 flex items-center justify-center text-${partner.color}-700 font-bold text-sm border border-${partner.color}-200 shadow-sm">${partner.initials}</div>
                            `}
                            ${partner.online ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>' : ''}
                        </div>
                            <div class="overflow-hidden w-full pt-0.5">
                                <div class="flex justify-between w-full items-center">
                                    <h4 class="font-bold text-xs sm:text-sm ${isActive ? 'text-indigo-900' : 'text-slate-800'} truncate">${partner.name}</h4>
                                    <span class="text-[9px] sm:text-[10px] font-medium ${isActive ? 'text-indigo-600' : 'text-slate-400'}">${c.lastMessageTime || ''}</span>
                                </div>
                                <p class="text-[10px] sm:text-xs ${isActive ? 'text-indigo-700 font-medium' : 'text-slate-500'} truncate mt-1">
                                    ${c.lastMessageText || 'Aucun message'}
                                </p>
                            </div>
                    </div>
                `;
            }).join('');

            contactsList.innerHTML = itemsHtml;

            // Watch clicks
            document.querySelectorAll('.contact-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    selectConversation(id);
                });
            });
        };

        const selectConversation = async (convId) => {
            if (activeConversationId === convId && unsubscribeMessages) return;
            activeConversationId = convId;

            // Handle mobile layout
            if (window.innerWidth < 768) {
                contactsSidebar.classList.add('hidden');
                chatContainer.classList.remove('hidden');
                chatContainer.classList.add('flex');
            }

            // Visual active styles update
            document.querySelectorAll('.contact-item').forEach(item => {
                const itemId = item.getAttribute('data-id');
                if (itemId === convId) {
                    item.classList.add('bg-indigo-50', 'border-l-indigo-600');
                    item.classList.remove('hover:bg-slate-50', 'border-l-transparent');
                } else {
                    item.classList.remove('bg-indigo-50', 'border-l-indigo-600');
                    item.classList.add('hover:bg-slate-50', 'border-l-transparent');
                }
            });

            // Unlock and focus message input
            if (input) {
                input.disabled = false;
                input.placeholder = "Écrivez un message...";
                if (AppState.prefilledChatMessage) {
                    input.value = AppState.prefilledChatMessage;
                    AppState.prefilledChatMessage = null; // consume it
                    // Trigger text area height resize
                    input.style.height = 'auto';
                    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
                    if (sendBtn) sendBtn.disabled = false;
                }
                input.focus();
            }
            if (messageSearchInput && messageSearchContainer) {
                messageSearchInput.disabled = false;
                messageSearchInput.value = '';
                messageSearchQuery = '';
                messageSearchContainer.classList.remove('opacity-50', 'pointer-events-none');
            }
            const btnMic = document.getElementById('btn-chat-mic');
            if (btnMic) btnMic.disabled = false;
            
            if (btnArchiveChat) {
                btnArchiveChat.classList.remove('hidden');
                const isArchived = archivedSet.has(convId);
                btnArchiveChat.innerHTML = isArchived ? '<i data-lucide="archive-restore" class="w-4 h-4"></i>' : '<i data-lucide="archive" class="w-4 h-4"></i>';
                btnArchiveChat.title = isArchived ? "Désarchiver" : "Archiver";
                if (window.lucide) window.lucide.createIcons({ root: btnArchiveChat });
            }

            const currentConv = convList.find(c => c.id === convId);
            if (currentConv) {
                const partnerId = currentConv.participants.find(p => p !== currentUserId);
                const partner = await getPartnerProfile(partnerId);

                // Setup header
                if (chatHeaderUser) {
                    chatHeaderUser.setAttribute('data-id', partnerId);
                    chatHeaderUser.innerHTML = `
                        <div class="relative">
                            ${partner.img ? `
                                <img src="${partner.img}" referrerpolicy="no-referrer" class="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                            ` : `
                                <div class="w-10 h-10 rounded-full bg-${partner.color}-100 flex items-center justify-center text-${partner.color}-700 font-bold border border-${partner.color}-200 shadow-sm">${partner.initials}</div>
                            `}
                            ${partner.online ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>' : ''}
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-900 text-xs sm:text-sm leading-none">${partner.name}</h3>
                            <p class="text-[9px] sm:text-[10px] text-slate-500 mt-1">${partner.online ? 'En ligne' : 'Hors ligne'}</p>
                        </div>
                    `;
                    if (window.lucide) window.lucide.createIcons({ root: chatHeaderUser });
                }
            }

            // Clean previous message unsubscribe
            if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
            }

            // Put a lovely mini spinner inside message history
            if (messagesList) {
                messagesList.innerHTML = `
                    <div class="flex items-center justify-center h-full">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                `;
            }

            // Bind real-time snapshot message syncing
            const msgQuery = query(
                collection(db, 'conversations', convId, 'messages'),
                orderBy('timestamp', 'asc')
            );

            unsubscribeMessages = onSnapshot(msgQuery, (snapshot) => {
                if (!auth.currentUser) return; // Guard
                const msgsList = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    msgsList.push({ id: docSnap.id, ...data });
                    
                    // Mark as read if not sent by me and unread
                    if (data.senderId !== currentUserId && !data.read) {
                        updateDoc(doc(db, 'conversations', convId, 'messages', docSnap.id), { read: true })
                            .catch(e => console.warn("Could not mark message as read - requires rule update."));
                    }
                });
                currentMessages = msgsList;
                renderMessages();
            }, (error) => {
                if (!auth.currentUser) return; // Guard
                handleFirestoreError(error, OperationType.GET, `conversations/${convId}/messages`);
            });
        };

        const startOrGoToConversation = async (partnerId) => {
            const targetId = [currentUserId, partnerId].sort().join('_');
            const matchingConvo = convList.find(c => c.id === targetId);
            if (matchingConvo) {
                await selectConversation(matchingConvo.id);
            } else {
                try {
                    await setDoc(doc(db, 'conversations', targetId), {
                        participants: [currentUserId, partnerId],
                        lastMessageText: "Nouvelle discussion créée",
                        lastMessageTime: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                        updatedAt: serverTimestamp()
                    });
                    await selectConversation(targetId);
                } catch (err) {
                    handleFirestoreError(err, OperationType.WRITE, `conversations/${targetId}`);
                }
            }
        };

        const renderMessages = () => {
            if (!messagesList) return;

            let msgs = currentMessages;
            if (messageSearchQuery) {
                const q = messageSearchQuery.toLowerCase();
                msgs = msgs.filter(m => m.text?.toLowerCase().includes(q));
            }

            if (msgs.length === 0) {
                messagesList.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center p-8">
                        <p class="text-sm text-slate-400">${messageSearchQuery ? 'Aucun message ne correspond à votre recherche.' : 'Aucun message dans cette discussion.'}</p>
                        ${!messageSearchQuery ? `<p class="text-xs text-slate-400/80 mt-1">Écrivez un message ci-dessous pour démarrer l'échange.</p>` : ''}
                    </div>
                `;
                return;
            }

            messagesList.innerHTML = msgs.map(m => {
                const isSent = m.senderId === currentUserId;
                const readIconHtml = isSent ? (m.read ? '<i data-lucide="check-check" class="w-3 h-3 text-emerald-300 ml-1"></i>' : '<i data-lucide="check" class="w-3 h-3 text-indigo-300 ml-1"></i>') : '';
                return `
                    <div class="flex ${isSent ? 'justify-end' : 'justify-start'}">
                        <div class="max-w-[85%] rounded-2xl px-4 py-3 shadow-none text-xs sm:text-sm ${
                            isSent 
                                ? 'bg-indigo-500 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                        }">
                            <div class="font-medium text-[8px] sm:text-[9px] ${isSent ? 'text-indigo-200' : 'text-slate-400'} mb-1.5 flex items-center justify-between">
                                <span>${isSent ? 'Vous' : (m.senderName || 'Prestataire')}</span>
                            </div>
                            <div class="leading-relaxed break-words">${m.text}</div>
                            <div class="text-[8px] sm:text-[9px] ${isSent ? 'text-indigo-200' : 'text-slate-400'} flex justify-end items-center mt-1.5 font-medium">
                                <span>${m.time || ''}</span>
                                ${readIconHtml}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Clean scroll to bottom
            setTimeout(() => {
                messagesList.scrollTop = messagesList.scrollHeight;
            }, 60);

            if (window.lucide) window.lucide.createIcons({ root: messagesList });
        };

        const handleSend = async (attachmentUrl = null, attachmentName = null) => {
            const rawText = input.value.trim();
            if (!rawText && !attachmentUrl) return;

            if (!activeConversationId) return;

            let finalText = AppState.escapeHtml(rawText);
            if (attachmentUrl) {
                const isImg = attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);
                const isAudio = attachmentUrl.match(/\.(webm|ogg|mp3|wav|m4a)/i);
                
                let fileHtml = '';
                if (isImg) {
                    fileHtml = `<div class="mt-2 max-w-xs bg-white text-slate-800 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"><img src="${attachmentUrl}" referrerpolicy="no-referrer" class="w-full h-auto max-h-48 object-cover" /><div class="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between"><span class="text-xs text-slate-500 font-medium truncate mr-2" title="${AppState.escapeHtml(attachmentName || 'Image')}">${AppState.escapeHtml(attachmentName || 'Image')}</span><a href="${attachmentUrl}" download="${AppState.escapeHtml(attachmentName || 'image.png')}" target="_blank" class="flex items-center justify-center p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition cursor-pointer" title="Télécharger"><i data-lucide="download" class="w-4 h-4"></i></a></div></div>`;
                } else if (isAudio) {
                    fileHtml = `<div class="mt-2 max-w-xs bg-white text-slate-800 rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col"><div class="flex items-center space-x-2 mb-2"><i data-lucide="mic" class="w-4 h-4 text-indigo-500"></i><span class="text-xs font-semibold text-slate-700 truncate" title="${AppState.escapeHtml(attachmentName || 'Vocal')}">${AppState.escapeHtml(attachmentName || 'Vocal')}</span></div><audio controls src="${attachmentUrl}" class="w-full h-9 outline-none mb-2"></audio><a href="${attachmentUrl}" download="${AppState.escapeHtml(attachmentName || 'vocal.wav')}" target="_blank" class="flex items-center justify-center py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 transition text-[11px] font-bold gap-1 cursor-pointer"><i data-lucide="download" class="w-3.5 h-3.5"></i> Télécharger l'audio</a></div>`;
                } else {
                    fileHtml = `<div class="mt-2 max-w-xs bg-white text-slate-800 rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between gap-3"><div class="flex items-center gap-2 overflow-hidden"><div class="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><i data-lucide="file-text" class="w-5 h-5"></i></div><div class="overflow-hidden"><div class="text-xs font-bold text-slate-800 truncate" title="${AppState.escapeHtml(attachmentName || 'Fichier')}">${AppState.escapeHtml(attachmentName || 'Fichier')}</div><div class="text-[10px] text-slate-400 font-semibold">Pièce jointe</div></div></div><a href="${attachmentUrl}" download="${AppState.escapeHtml(attachmentName || 'fichier')}" target="_blank" class="flex items-center justify-center p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shrink-0 shadow-sm cursor-pointer" title="Télécharger"><i data-lucide="download" class="w-4 h-4"></i></a></div>`;
                }
                finalText = rawText ? `${finalText}\n${fileHtml}` : fileHtml;
            }

            // Optimistic reset input fields
            input.value = '';
            input.style.height = 'auto';
            sendBtn.disabled = true;

            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const userName = AppState.user?.nom || "Client";

            try {
                // Post to Firestore
                try {
                    await addDoc(collection(db, 'conversations', activeConversationId, 'messages'), {
                        text: finalText,
                        senderId: currentUserId,
                        senderName: userName,
                        time: timeStr,
                        timestamp: serverTimestamp()
                    });
                } catch (err) {
                    handleFirestoreError(err, OperationType.WRITE, `conversations/${activeConversationId}/messages`);
                }

                const textSummary = rawText 
                    ? (rawText.length > 50 ? rawText.substring(0, 47) + "..." : rawText) 
                    : (attachmentName ? `📁 ${attachmentName}` : "Fichier partagé");

                // Update metadata in conversation index
                try {
                    await updateDoc(doc(db, 'conversations', activeConversationId), {
                        lastMessageText: `Vous: ${textSummary}`,
                        lastMessageTime: timeStr,
                        updatedAt: serverTimestamp()
                    });
                } catch (err) {
                    handleFirestoreError(err, OperationType.WRITE, `conversations/${activeConversationId}`);
                }

                // Notify target via direct Email fallback and App Notification
                const convo = convList.find(c => c.id === activeConversationId);
                if (convo) {
                    const pId = convo.participants.find(p => p !== currentUserId);
                    const partner = await getPartnerProfile(pId);
                    if (partner) {
                        // Real-time app notification
                        AppState.createNotification(
                            pId,
                            'message',
                            `Nouveau message de ${userName}`,
                            textSummary
                        );

                        if (partner.email) {
                            NotificationService.sendEmail({
                                to: partner.email,
                                subject: `Nouveau message de ${userName}`,
                                body: `Bonjour ${partner.name},\n\nVous avez reçu un nouveau message de ${userName} sur SkillLink :\n\n"${rawText || 'Fichier joint'}"\n\nPour y répondre en temps réel, rendez-vous sur : ${window.location.origin}/#messaging\n\nL'équipe SkillLink`
                            });
                        }
                    }
                }

            } catch (err) {
                console.error("Failed to post message:", err);
            }
        };

        // Sync archives
        const archivesQuery = query(collection(db, `users/${currentUserId}/archives`));
        try {
            unsubscribeArchives = onSnapshot(archivesQuery, (snaps) => {
                archivedSet.clear();
                snaps.forEach(snap => archivedSet.add(snap.id));
                renderContacts();
                // Update archive button state if active conversation exists
                if (activeConversationId && btnArchiveChat) {
                    const isArchived = archivedSet.has(activeConversationId);
                    btnArchiveChat.innerHTML = isArchived ? '<i data-lucide="archive-restore" class="w-4 h-4"></i>' : '<i data-lucide="archive" class="w-4 h-4"></i>';
                    btnArchiveChat.title = isArchived ? "Désarchiver" : "Archiver";
                    if (window.lucide) window.lucide.createIcons({ root: btnArchiveChat });
                }
            }, (error) => {
                handleFirestoreError(error, OperationType.GET, `users/${currentUserId}/archives`);
            });
        } catch (e) {
            console.error(e);
        }

        // Realtime sync conversation collection
        const activeConversationsQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', currentUserId)
        );

        unsubscribeConversations = onSnapshot(activeConversationsQuery, async (snaps) => {
            const list = [];
            snaps.forEach(snap => {
                list.push({ id: snap.id, ...snap.data() });
            });

            // Sort by descending updatedAt
            list.sort((a, b) => {
                const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : new Date(a.updatedAt || 0).getTime();
                const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : new Date(b.updatedAt || 0).getTime();
                return tB - tA;
            });

            convList = list;
            await renderContacts();

            // Check if there is an active redirection request from profile profile view click
            if (AppState.activeConversationPartnerId) {
                const partnerId = AppState.activeConversationPartnerId;
                AppState.activeConversationPartnerId = null; // consume
                await startOrGoToConversation(partnerId);
            } else if (!activeConversationId && convList.length > 0) {
                // select the first most recent one by default
                await selectConversation(convList[0].id);
            }
        }, (err) => {
            handleFirestoreError(err, OperationType.LIST, 'conversations');
        });

        // Setup attachment upload triggers
        if (btnAttach && chatAttachment) {
            btnAttach.addEventListener('click', () => {
                chatAttachment.click();
            });

            chatAttachment.addEventListener('change', async (e) => {
                if (!chatAttachment.files.length) return;
                const file = chatAttachment.files[0];

                const origHtml = btnAttach.innerHTML;
                btnAttach.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin text-indigo-600"></i>`;
                btnAttach.disabled = true;
                if (window.lucide) window.lucide.createIcons({ root: btnAttach });

                try {
                    const fd = new FormData();
                    fd.append('file', file);

                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: fd
                    });

                    if (!res.ok) throw new Error("File upload failed");
                    const rData = await res.json();

                    await handleSend(rData.url, file.name);

                } catch (eErr) {
                    console.error("Error during file dispatch:", eErr);
                    alert("Une erreur est survenue lors du chargement de la pièce jointe.");
                } finally {
                    btnAttach.innerHTML = origHtml;
                    btnAttach.disabled = false;
                    if (window.lucide) window.lucide.createIcons({ root: btnAttach });
                    chatAttachment.value = '';
                }
            });
        }

        // Setup contact list search filter text typing
        if (contactSearch) {
            contactSearch.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim();
                renderContacts();
            });
        }

        // Handle standard message submission forms
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSend();
            });
        }

        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            });
        }

        if (btnArchiveChat) {
            btnArchiveChat.addEventListener('click', async () => {
                if (!activeConversationId) return;
                const isArchived = archivedSet.has(activeConversationId);
                try {
                    const docRef = doc(db, `users/${currentUserId}/archives`, activeConversationId);
                    if (isArchived) {
                        await deleteDoc(docRef);
                    } else {
                        await setDoc(docRef, { archivedAt: serverTimestamp() });
                    }
                } catch (e) {
                    console.error("Error archiving conversation:", e);
                    alert("Erreur lors de l'archivage.");
                }
            });
        }

        // Voice Message logic
        let mediaRecorder = null;
        let audioChunks = [];
        let recordTimerInterval = null;
        let recordStartTime = 0;
        let isSimulatedAudio = false;

        const btnMic = document.getElementById('btn-chat-mic');
        const btnStopMic = document.getElementById('btn-chat-stop-mic');
        const recordingUi = document.getElementById('recording-ui');
        const recordingTimeText = document.getElementById('recording-time');

        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        const createFakeWavBlob = (durationSeconds = 2) => {
            const sampleRate = 8000;
            const numChannels = 1;
            const bitsPerSample = 8;
            const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
            const blockAlign = numChannels * (bitsPerSample / 8);
            const dataSize = Math.max(1, durationSeconds) * byteRate;
            const buffer = new ArrayBuffer(44 + dataSize);
            const view = new DataView(buffer);
            
            writeString(view, 0, 'RIFF');
            view.setUint32(4, 36 + dataSize, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, byteRate, true);
            view.setUint16(32, blockAlign, true);
            view.setUint16(34, bitsPerSample, true);
            writeString(view, 36, 'data');
            view.setUint32(40, dataSize, true);
            
            const offset = 44;
            for (let i = 0; i < dataSize; i++) {
                const t = i / sampleRate;
                const sample = Math.sin(2 * Math.PI * 440 * t);
                const byteValue = Math.floor((sample + 1) * 127.5);
                view.setUint8(offset + i, byteValue);
            }
            
            return new Blob([buffer], { type: 'audio/wav' });
        };

        const uploadAudioFile = async (audioBlob, fileName) => {
            try {
                const origHtml = btnMic.innerHTML;
                btnMic.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin text-indigo-600"></i>`;
                btnMic.disabled = true;
                if (window.lucide) window.lucide.createIcons({ root: btnMic.parentElement });

                const file = new File([audioBlob], fileName, { type: audioBlob.type });
                const fd = new FormData();
                fd.append('file', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: fd
                });

                if (!res.ok) throw new Error("Audio upload failed");
                const rData = await res.json();

                await handleSend(rData.url, file.name);
            } catch (eErr) {
                console.warn("Error uploading audio:", eErr);
                alert("Une erreur est survenue lors de l'envoi du message vocal.");
            } finally {
                btnMic.innerHTML = `<i data-lucide="mic" class="w-5 h-5"></i>`;
                btnMic.disabled = false;
                if (window.lucide) window.lucide.createIcons({ root: btnMic.parentElement });
            }
        };

        if (btnMic && btnStopMic && recordingUi) {
            btnMic.addEventListener('click', async () => {
                isSimulatedAudio = false;
                audioChunks = [];
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);

                    mediaRecorder.ondataavailable = e => {
                        if (e.data.size > 0) audioChunks.push(e.data);
                    };

                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        audioChunks = [];
                        await uploadAudioFile(audioBlob, `vocal_${Date.now()}.webm`);
                    };

                    mediaRecorder.start();
                    recordingUi.classList.remove('hidden');
                    input.classList.add('opacity-0', 'pointer-events-none');
                    btnMic.classList.add('hidden');
                    
                    recordStartTime = Date.now();
                    recordTimerInterval = setInterval(() => {
                        const diff = Math.floor((Date.now() - recordStartTime) / 1000);
                        const mins = Math.floor(diff / 60).toString().padStart(2, '0');
                        const secs = (diff % 60).toString().padStart(2, '0');
                        recordingTimeText.textContent = `${mins}:${secs}`;
                    }, 1000);

                } catch (err) {
                    console.warn("Microphone access denied or unavailable, activating simulation mode:", err);
                    isSimulatedAudio = true;
                    mediaRecorder = null;
                    
                    recordingUi.classList.remove('hidden');
                    input.classList.add('opacity-0', 'pointer-events-none');
                    btnMic.classList.add('hidden');
                    
                    recordStartTime = Date.now();
                    recordTimerInterval = setInterval(() => {
                        const diff = Math.floor((Date.now() - recordStartTime) / 1000);
                        const mins = Math.floor(diff / 60).toString().padStart(2, '0');
                        const secs = (diff % 60).toString().padStart(2, '0');
                        recordingTimeText.textContent = `${mins}:${secs}`;
                    }, 1000);
                }
            });

            btnStopMic.addEventListener('click', async () => {
                const durationSeconds = Math.max(1, Math.floor((Date.now() - recordStartTime) / 1000));
                
                if (isSimulatedAudio) {
                    recordingUi.classList.add('hidden');
                    input.classList.remove('opacity-0', 'pointer-events-none');
                    btnMic.classList.remove('hidden');
                    if (recordTimerInterval) clearInterval(recordTimerInterval);
                    recordingTimeText.textContent = '00:00';
                    
                    const simulatedBlob = createFakeWavBlob(durationSeconds);
                    await uploadAudioFile(simulatedBlob, `vocal_simulated_${Date.now()}.wav`);
                } else {
                    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                        mediaRecorder.stream.getTracks().forEach(track => track.stop());
                    }
                    recordingUi.classList.add('hidden');
                    input.classList.remove('opacity-0', 'pointer-events-none');
                    btnMic.classList.remove('hidden');
                    if (recordTimerInterval) clearInterval(recordTimerInterval);
                    recordingTimeText.textContent = '00:00';
                }
            });
        }

        const btnNewChat = document.getElementById('btn-new-chat');
        if (btnNewChat) {
            btnNewChat.addEventListener('click', async () => {
                const modalHtml = `
                    <div id="new-chat-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 view-enter">
                        <div class="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col overflow-hidden max-h-[80vh]">
                            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 class="font-bold text-slate-900">Nouvelle discussion</h3>
                                <button id="close-new-chat" class="text-slate-400 hover:text-slate-700 transition p-1 rounded-full hover:bg-slate-200">
                                    <i data-lucide="x" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <div class="p-4 border-b border-slate-100">
                                <div class="relative">
                                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
                                    <input type="text" id="new-chat-search" class="w-full bg-slate-100 text-sm border-none rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition" placeholder="Chercher un utilisateur..." autofocus>
                                </div>
                            </div>
                            <div id="new-chat-results" class="flex-grow overflow-y-auto p-2 custom-scrollbar">
                                <div class="text-center p-8 text-slate-400 text-sm">
                                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                    Chargement des utilisateurs...
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = modalHtml;
                const modal = tempDiv.firstElementChild;
                document.body.appendChild(modal);
                if (window.lucide) window.lucide.createIcons({ root: modal });

                const closeBtn = document.getElementById('close-new-chat');
                const searchInput = document.getElementById('new-chat-search');
                const resultsContainer = document.getElementById('new-chat-results');

                const closeModal = () => modal.remove();
                closeBtn.addEventListener('click', closeModal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal();
                });

                // Load users
                try {
                    // Start by picking users from DUMMY_FREELANCES, and mix with firebase users if any
                    let allUsers = [];
                    // add dummies
                    DUMMY_FREELANCES.forEach(df => {
                        allUsers.push({
                            id: df.id,
                            name: df.name,
                            initials: df.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
                            role: 'freelance',
                            img: df.img || null
                        });
                    });

                    // Add from firestore
                    const { getDocs, collection } = await import('firebase/firestore');
                    try {
                        const usersSnap = await getDocs(collection(db, 'users'));
                        usersSnap.forEach(doc => {
                            if (doc.id !== currentUserId && !allUsers.find(u => u.id === doc.id)) {
                                const data = doc.data();
                                allUsers.push({
                                    id: doc.id,
                                    name: data.displayName || data.email?.split('@')[0] || "Utilisateur",
                                    initials: (data.displayName || data.email || "U").substring(0, 2).toUpperCase(),
                                    role: data.role || 'client',
                                    img: data.avatarImage || data.img || null
                                });
                            }
                        });
                    } catch (e) {
                        console.warn("Could not fetch remote users for messaging UI", e);
                    }

                    // Exclude self
                    allUsers = allUsers.filter(u => u.id !== currentUserId);

                    const renderUsers = (queryText = "") => {
                        const q = queryText.toLowerCase();
                        const filtered = allUsers.filter(u => u.name.toLowerCase().includes(q));
                        
                        if (filtered.length === 0) {
                            resultsContainer.innerHTML = '<div class="text-center p-8 text-slate-400 text-sm">Aucun utilisateur trouvé.</div>';
                            return;
                        }

                        resultsContainer.innerHTML = filtered.map(u => `
                            <div class="user-row flex items-center p-3 hover:bg-slate-50 cursor-pointer rounded-xl transition border border-transparent hover:border-slate-100" data-id="${u.id}">
                                <div class="relative mr-3 shrink-0">
                                    ${u.img ? `
                                        <img src="${u.img}" referrerpolicy="no-referrer" class="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                                    ` : `
                                        <div class="w-10 h-10 rounded-full bg-indigo-150 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm">
                                            ${u.initials}
                                        </div>
                                    `}
                                </div>
                                <div class="overflow-hidden">
                                    <h4 class="font-bold text-sm text-slate-900 truncate">${u.name}</h4>
                                    <p class="text-xs text-slate-500 capitalize">${u.role}</p>
                                </div>
                            </div>
                        `).join('');

                        resultsContainer.querySelectorAll('.user-row').forEach(row => {
                            row.addEventListener('click', async () => {
                                const targetPartnerId = row.getAttribute('data-id');
                                closeModal();
                                // Select it!
                                await startOrGoToConversation(targetPartnerId);
                            });
                        });
                    };

                    renderUsers();

                    searchInput.addEventListener('input', (e) => {
                        renderUsers(e.target.value.trim());
                    });

                } catch (e) {
                    console.error("Error loading chat modal users", e);
                    resultsContainer.innerHTML = '<div class="text-center p-8 text-red-500 text-sm">Erreur de chargement.</div>';
                }
            });
        }

        // Global Teardown hook
        window.activeMessagingTeardown = () => {
            if (unsubscribeConversations) unsubscribeConversations();
            if (unsubscribeMessages) unsubscribeMessages();
            if (unsubscribeArchives) unsubscribeArchives();
        };
    }
};
