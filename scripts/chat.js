// Chat List Management with Local Storage
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const backBtn = document.getElementById('backBtn');
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const chatList = document.getElementById('chatList');
    const swipeActions = document.getElementById('swipeActions');
    const muteBtn = document.getElementById('muteBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    // Storage keys
    const CONTACTS_STORAGE_KEY = 'chatContacts';
    const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';

    // Sample contacts data
    const defaultContacts = [
        {
            id: 'alex_linderson',
            name: 'Alex Linderson',
            profileImage: '../assets/my headshot.png',
            lastMessage: 'How are you today?',
            lastMessageTime: '2 min ago',
            unreadCount: 3,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'team_align',
            name: 'Team Align',
            profileImage: '../assets/my headshot.png',
            lastMessage: "Don't miss to attend the meeting.",
            lastMessageTime: '2 min ago',
            unreadCount: 0,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'john_abraham',
            name: 'John Abraham',
            profileImage: '../assets/my headshot.png',
            lastMessage: 'Can you join the meeting?',
            lastMessageTime: '2 min ago',
            unreadCount: 0,
            isOnline: false,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'sabila_sayma',
            name: 'Sabila Sayma',
            profileImage: '../assets/my headshot.png',
            lastMessage: 'How are you today?',
            lastMessageTime: '2 min ago',
            unreadCount: 0,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'john_borino',
            name: 'John Borino',
            profileImage: '../assets/my headshot.png',
            lastMessage: 'Have a good day 🌸',
            lastMessageTime: '2 min ago',
            unreadCount: 0,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        }
    ];

    // Initialize app
    initializeApp();

    // Event listeners
    backBtn.addEventListener('click', goBack);
    searchToggle.addEventListener('click', toggleSearch);
    searchInput.addEventListener('input', handleSearch);
    muteBtn.addEventListener('click', handleMute);
    deleteBtn.addEventListener('click', handleDelete);

    // Touch/swipe variables
    let currentSwipeItem = null;
    let startX = 0;
    let currentX = 0;
    let isSwipeActive = false;

    function initializeApp() {
        // Initialize contacts if not exists
        if (!getContacts().length) {
            saveContacts(defaultContacts);
        }
        
        // Initialize chat history structure
        initializeChatHistory();
        
        // Render chat list
        renderChatList();
    }

    function getContacts() {
        const contacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
        return contacts ? JSON.parse(contacts) : [];
    }

    function saveContacts(contacts) {
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    }

    function getChatHistory(contactId) {
        const allHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
        const history = allHistory ? JSON.parse(allHistory) : {};
        return history[contactId] || [];
    }

    function saveChatHistory(contactId, messages) {
        const allHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
        const history = allHistory ? JSON.parse(allHistory) : {};
        history[contactId] = messages;
        localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
    }

    function initializeChatHistory() {
        const contacts = getContacts();
        contacts.forEach(contact => {
            const existingHistory = getChatHistory(contact.id);
            if (existingHistory.length === 0) {
                // Create sample chat history
                const sampleMessages = [
                    {
                        id: generateMessageId(),
                        text: contact.lastMessage,
                        type: 'text',
                        sender: 'contact',
                        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                        time: '2 min ago'
                    }
                ];
                saveChatHistory(contact.id, sampleMessages);
            }
        });
    }

    function renderChatList(filteredContacts = null) {
        const contacts = filteredContacts || getContacts().filter(contact => !contact.isBlocked);
        
        chatList.innerHTML = '';
        
        if (contacts.length === 0) {
            chatList.innerHTML = `
                <div class="empty-state">
                    <p>No conversations found</p>
                </div>
            `;
            return;
        }

        contacts.forEach((contact, index) => {
            const chatItem = createChatItem(contact, index);
            chatList.appendChild(chatItem);
        });
    }

    function createChatItem(contact, index) {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.contactId = contact.id;
        chatItem.style.animationDelay = `${index * 0.1}s`;

        chatItem.innerHTML = `
            <div class="profile-container">
                <img src="${contact.profileImage}" alt="${contact.name}" class="profile-image">
                <div class="online-status ${contact.isOnline ? '' : 'offline'}"></div>
            </div>
            <div class="chat-info">
                <div class="chat-name">${contact.name}</div>
                <div class="last-message">${contact.isMuted ? '🔇 ' : ''}${contact.lastMessage}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${contact.lastMessageTime}</div>
                ${contact.unreadCount > 0 ? `<div class="unread-badge">${contact.unreadCount}</div>` : ''}
            </div>
        `;

        // Add touch events for swipe
        addSwipeEvents(chatItem);

        // Add click event to open chat
        chatItem.addEventListener('click', (e) => {
            if (!isSwipeActive) {
                openChat(contact.id);
            }
        });

        return chatItem;
    }

    function addSwipeEvents(element) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Mouse events for desktop testing
        element.addEventListener('mousedown', handleMouseStart);
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseup', handleMouseEnd);
        element.addEventListener('mouseleave', handleMouseEnd);

        function handleTouchStart(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
            element.classList.add('swiping');
        }

        function handleMouseStart(e) {
            startX = e.clientX;
            isDragging = true;
            element.classList.add('swiping');
            e.preventDefault();
        }

        function handleTouchMove(e) {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            if (deltaX < -50) { // Swipe left threshold
                e.preventDefault();
                const translateX = Math.max(deltaX, -120);
                element.style.transform = `translateX(${translateX}px)`;
                isSwipeActive = true;
                currentSwipeItem = element;
            }
        }

        function handleMouseMove(e) {
            if (!isDragging) return;
            
            currentX = e.clientX;
            const deltaX = currentX - startX;
            
            if (deltaX < -50) {
                const translateX = Math.max(deltaX, -120);
                element.style.transform = `translateX(${translateX}px)`;
                isSwipeActive = true;
                currentSwipeItem = element;
            }
        }

        function handleTouchEnd(e) {
            handleEnd();
        }

        function handleMouseEnd(e) {
            handleEnd();
        }

        function handleEnd() {
            if (!isDragging) return;
            
            isDragging = false;
            element.classList.remove('swiping');
            
            const deltaX = currentX - startX;
            
            if (deltaX < -80) {
                // Show swipe actions
                element.style.transform = 'translateX(-120px)';
                showSwipeActions(element);
            } else {
                // Reset position
                element.style.transform = 'translateX(0)';
                hideSwipeActions();
            }
        }
    }

    function showSwipeActions(element) {
        currentSwipeItem = element;
        swipeActions.classList.add('active');
        
        // Position swipe actions
        const rect = element.getBoundingClientRect();
        swipeActions.style.top = `${rect.top}px`;
        swipeActions.style.height = `${rect.height}px`;
    }

    function hideSwipeActions() {
        swipeActions.classList.remove('active');
        if (currentSwipeItem) {
            currentSwipeItem.style.transform = 'translateX(0)';
            currentSwipeItem = null;
        }
        isSwipeActive = false;
    }

    function handleMute() {
        if (!currentSwipeItem) return;
        
        const contactId = currentSwipeItem.dataset.contactId;
        const contacts = getContacts();
        const contact = contacts.find(c => c.id === contactId);
        
        if (contact) {
            contact.isMuted = !contact.isMuted;
            saveContacts(contacts);
            renderChatList();
            hideSwipeActions();
        }
    }

    function handleDelete() {
        if (!currentSwipeItem) return;
        
        const contactId = currentSwipeItem.dataset.contactId;
        
        if (confirm('Are you sure you want to delete this conversation?')) {
            // Remove from contacts
            let contacts = getContacts();
            contacts = contacts.filter(c => c.id !== contactId);
            saveContacts(contacts);
            
            // Remove chat history
            const allHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
            if (allHistory) {
                const history = JSON.parse(allHistory);
                delete history[contactId];
                localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
            }
            
            renderChatList();
            hideSwipeActions();
        }
    }

    function openChat(contactId) {
        // Store current contact ID for the interface
        localStorage.setItem('currentChatContact', contactId);
        
        // Navigate to interface
        window.location.href = 'interface.html';
    }

    function goBack() {
        window.location.href = '../index.html';
    }

    function toggleSearch() {
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            renderChatList();
        }
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            renderChatList();
            return;
        }
        
        const contacts = getContacts();
        const filteredContacts = contacts.filter(contact => 
            contact.name.toLowerCase().includes(query) ||
            contact.lastMessage.toLowerCase().includes(query)
        );
        
        renderChatList(filteredContacts);
    }

    function generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Close swipe actions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.chat-item') && !e.target.closest('.swipe-actions')) {
            hideSwipeActions();
        }
    });

    // Handle navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            if (tab !== 'messages') {
                // For now, just show alert for other tabs
                alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} feature coming soon!`);
                // Reset to messages tab
                document.querySelector('[data-tab="messages"]').classList.add('active');
                btn.classList.remove('active');
            }
        });
    });

    // Export functions for global access
    window.chatApp = {
        getContacts,
        saveContacts,
        getChatHistory,
        saveChatHistory,
        renderChatList
    };
});