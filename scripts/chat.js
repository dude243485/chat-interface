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
            id: 'aeolus',
            name: 'Aeolus',
            profileImage: '../assets/aeolus.jpg',
            lastMessage: 'You dare summon me, Aeolus, Master of the Four Winds, for this... mortal trifle?',
            lastMessageTime: '2 min ago',
            unreadCount: 2,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'eleanor',
            name: 'Eleanor',
            profileImage: '../assets/Eleanor.jpg',
            lastMessage: 'Sweetheart, have you eaten? You sound thin. I\'m sending soup.',
            lastMessageTime: '5 min ago',
            unreadCount: 0,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'dennis',
            name: 'Dennis',
            profileImage: '../assets/dennis.jpg',
            lastMessage: 'Hey buddy! Long time no see. So, how\'s the new job treating you?',
            lastMessageTime: '10 min ago',
            unreadCount: 1,
            isOnline: false,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'pierre',
            name: 'Pierre',
            profileImage: '../assets/pierre.jpg',
            lastMessage: 'Bonjour. Forgive me, but the sun seemed less bright before you arrived.',
            lastMessageTime: '15 min ago',
            unreadCount: 0,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'chloe',
            name: 'Chloe',
            profileImage: '../assets/Chloe.jpg',
            lastMessage: 'Oh, hi. Sorry to bother you. I was just... wondering.',
            lastMessageTime: '20 min ago',
            unreadCount: 0,
            isOnline: true,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'gary',
            name: 'Gary',
            profileImage: '../assets/Gary.jpg',
            lastMessage: 'So. Your mother says you\'re \'seeing someone.\'',
            lastMessageTime: '1 hour ago',
            unreadCount: 0,
            isOnline: false,
            isBlocked: false,
            isMuted: false
        },
        {
            id: 'calypso',
            name: 'Calypso',
            profileImage: '../assets/calypso.jpg',
            lastMessage: 'Morning, sleepyhead',
            lastMessageTime: '2 hours ago',
            unreadCount: 3,
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
        
        // Initialize dark mode on page load
        initializeDarkMode();
        
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
        
        // Check for desktop view (>= 1024px)
        if (window.innerWidth >= 1024) {
             const chatFrame = document.getElementById('chat-frame');
             const placeholder = document.getElementById('emptyStatePlaceholder');
             
             if (chatFrame && placeholder) {
                 // Add embedded=true param
                 chatFrame.src = 'interface.html?embedded=true';
                 placeholder.style.display = 'none';
                 chatFrame.style.display = 'block';
                 
                 // Highlight active chat item
                 document.querySelectorAll('.chat-item').forEach(item => {
                     item.classList.remove('active-chat');
                     if (item.dataset.contactId === contactId) {
                         item.classList.add('active-chat');
                     }
                 });
             }
        } else {
            // Navigate to interface on mobile
            window.location.href = 'interface.html';
        }
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
            if (tab === 'settings') {
                openSettingsModal();
            } else if (tab !== 'messages') {
                // For now, just show alert for other tabs
                alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} feature coming soon!`);
                // Reset to messages tab
                document.querySelector('[data-tab="messages"]').classList.add('active');
                btn.classList.remove('active');
            }
        });
    });

    // ========================================
    // SETTINGS MODAL FUNCTIONALITY
    // ========================================

    /**
     * OPEN SETTINGS MODAL
     * Shows the settings modal with all configuration options
     */
    function openSettingsModal() {
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Load current settings
        loadCurrentSettings();
        
        // Set up event listeners for settings
        setupSettingsEventListeners();
    }

    /**
     * SETUP SETTINGS EVENT LISTENERS
     * Sets up all event listeners for settings modal controls
     */
    function setupSettingsEventListeners() {
        console.log('Setting up settings event listeners'); // Debug log
        
        // Dark Mode Toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            console.log('Setting up dark mode toggle'); // Debug log
            // Remove existing event listener to prevent duplicates
            darkModeToggle.removeEventListener('change', handleDarkModeToggle);
            // Add new event listener
            darkModeToggle.addEventListener('change', handleDarkModeToggle);
        } else {
            console.warn('Dark mode toggle not found'); // Debug log
        }

        // Online Status Toggle
        const onlineStatusToggle = document.getElementById('onlineStatusToggle');
        if (onlineStatusToggle) {
            console.log('Setting up online status toggle'); // Debug log
            // Remove existing event listener to prevent duplicates
            onlineStatusToggle.removeEventListener('change', handleOnlineStatusToggle);
            // Add new event listener
            onlineStatusToggle.addEventListener('change', handleOnlineStatusToggle);
        } else {
            console.warn('Online status toggle not found'); // Debug log
        }

        // Wallpaper Option
        const wallpaperOption = document.getElementById('wallpaperOption');
        if (wallpaperOption) {
            console.log('Setting up wallpaper option'); // Debug log
            // Remove existing event listener to prevent duplicates
            wallpaperOption.removeEventListener('click', handleWallpaperOption);
            // Add new event listener
            wallpaperOption.addEventListener('click', handleWallpaperOption);
        } else {
            console.warn('Wallpaper option not found'); // Debug log
        }

        // Clear History Option
        const clearHistoryOption = document.getElementById('clearHistoryOption');
        if (clearHistoryOption) {
            console.log('Setting up clear history option'); // Debug log
            // Remove existing event listener to prevent duplicates
            clearHistoryOption.removeEventListener('click', handleClearHistoryOption);
            // Add new event listener
            clearHistoryOption.addEventListener('click', handleClearHistoryOption);
        } else {
            console.warn('Clear history option not found'); // Debug log
        }
        
        console.log('Settings event listeners setup complete'); // Debug log
    }

    /**
     * HANDLE DARK MODE TOGGLE
     * Event handler for dark mode toggle switch
     */
    function handleDarkModeToggle(event) {
        const isDarkMode = event.target.checked;
        toggleDarkMode(isDarkMode);
    }

    /**
     * HANDLE ONLINE STATUS TOGGLE
     * Event handler for online status toggle switch
     */
    function handleOnlineStatusToggle(event) {
        const isOnlineStatusEnabled = event.target.checked;
        localStorage.setItem('onlineStatus', isOnlineStatusEnabled);
        
        // Update all contacts' online status visibility
        updateOnlineStatusVisibility(isOnlineStatusEnabled);
    }

    /**
     * HANDLE WALLPAPER OPTION
     * Event handler for wallpaper selection option
     */
    function handleWallpaperOption() {
        openWallpaperModal();
    }

    /**
     * HANDLE CLEAR HISTORY OPTION
     * Event handler for clear history option
     */
    function handleClearHistoryOption() {
        console.log('Clear history option clicked'); // Debug log
        showClearHistoryConfirmation();
    }

    /**
     * CLOSE SETTINGS MODAL
     * Hides the settings modal and restores scrolling
     */
    window.closeSettingsModal = function() {
        const settingsModal = document.getElementById('settingsModal');
        settingsModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Ensure dark mode is properly applied when closing
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        applyDarkMode(isDarkMode);
        
        // Reset to messages tab
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="messages"]').classList.add('active');
    };

    /**
     * LOAD CURRENT SETTINGS
     * Loads saved settings from localStorage and updates UI
     */
    function loadCurrentSettings() {
        // Load dark mode setting
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = isDarkMode;
        }
        
        // Load online status setting
        const isOnlineStatusEnabled = localStorage.getItem('onlineStatus') !== 'false';
        const onlineStatusToggle = document.getElementById('onlineStatusToggle');
        if (onlineStatusToggle) {
            onlineStatusToggle.checked = isOnlineStatusEnabled;
        }
        
        // Apply dark mode if enabled
        applyDarkMode(isDarkMode);
    }

    /**
     * INITIALIZE DARK MODE
     * Applies dark mode on page load based on saved preference
     */
    function initializeDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        applyDarkMode(isDarkMode);
    }

    /**
     * APPLY DARK MODE
     * Applies or removes dark mode styling
     */
    function applyDarkMode(isDarkMode) {
        console.log('Applying dark mode:', isDarkMode); // Debug log
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            // Also apply to html element for complete coverage
            document.documentElement.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-mode');
        }
        
        // Force a style recalculation
        window.getComputedStyle(document.body).backgroundColor;
        
        // Update online status visibility based on current setting
        const isOnlineStatusEnabled = localStorage.getItem('onlineStatus') !== 'false';
        updateOnlineStatusVisibility(isOnlineStatusEnabled);
        
        console.log('Dark mode classes applied:', document.body.classList.contains('dark-mode')); // Debug log
    }

    /**
     * TOGGLE DARK MODE
     * Switches between light and dark mode with smooth transition
     */
    function toggleDarkMode(enabled) {
        // Save preference immediately
        localStorage.setItem('darkMode', enabled);
        
        // Apply the mode immediately
        applyDarkMode(enabled);
        
        // Force a repaint to ensure changes are visible
        document.body.offsetHeight;
        
        // Show feedback to user
        const mode = enabled ? 'Dark' : 'Light';
        showDarkModeNotification(`${mode} mode activated`);
        
        // Also update the toggle state in case it gets out of sync
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle && darkModeToggle.checked !== enabled) {
            darkModeToggle.checked = enabled;
        }
    }

    /**
     * SHOW DARK MODE NOTIFICATION
     * Shows a brief notification when dark mode is toggled
     */
    function showDarkModeNotification(message) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.dark-mode-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'dark-mode-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Settings event listeners are now set up in setupSettingsEventListeners() function
    // This ensures they work properly when the settings modal is opened

    /**
     * UPDATE ONLINE STATUS VISIBILITY
     * Shows or hides online status indicators based on setting
     */
    function updateOnlineStatusVisibility(isVisible) {
        const onlineIndicators = document.querySelectorAll('.online-status');
        onlineIndicators.forEach(indicator => {
            indicator.style.display = isVisible ? 'block' : 'none';
        });
        
        // Update contacts data
        const contacts = getContacts();
        contacts.forEach(contact => {
            contact.showOnlineStatus = isVisible;
        });
        saveContacts(contacts);
    }

    /**
     * SHOW CLEAR HISTORY CONFIRMATION
     * Shows enhanced confirmation dialog before clearing all chat history
     */
    function showClearHistoryConfirmation() {
        console.log('Showing clear history confirmation'); // Debug log
        
        try {
            // Create custom confirmation modal for better UX
            const confirmationModal = createConfirmationModal();
            document.body.appendChild(confirmationModal);
            
            // Show the modal
            setTimeout(() => {
                confirmationModal.classList.add('active');
            }, 10);
        } catch (error) {
            console.error('Error showing confirmation modal:', error);
            // Fallback to simple confirm dialog
            const confirmed = confirm(
                'Are you sure you want to clear all chat history?\n\n' +
                'This action cannot be undone and will delete all conversations permanently.'
            );
            
            if (confirmed) {
                clearAllChatHistory();
            }
        }
    }

    /**
     * CREATE CONFIRMATION MODAL
     * Creates a custom confirmation dialog for clearing chat history
     */
    function createConfirmationModal() {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="confirmation-overlay">
                <div class="confirmation-content">
                    <div class="confirmation-icon">
                        <img src="../assets/bin.png" alt="Delete" class="delete-icon">
                    </div>
                    <h3 class="confirmation-title">Clear All Chat History?</h3>
                    <p class="confirmation-message">
                        This action will permanently delete all your conversations and messages. 
                        This cannot be undone.
                    </p>
                    <div class="confirmation-stats" id="confirmationStats">
                        <p>Loading chat statistics...</p>
                    </div>
                    <div class="confirmation-buttons">
                        <button class="cancel-btn" onclick="cancelClearHistory()">Cancel</button>
                        <button class="confirm-btn" onclick="confirmClearHistory()">Clear All</button>
                    </div>
                </div>
            </div>
        `;
        
        // Load and display statistics
        setTimeout(() => {
            loadChatStatistics(modal);
        }, 100);
        
        return modal;
    }

    /**
     * LOAD CHAT STATISTICS
     * Displays statistics about what will be deleted
     */
    function loadChatStatistics(modal) {
        const contacts = getContacts();
        const allHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
        const history = allHistory ? JSON.parse(allHistory) : {};
        
        let totalMessages = 0;
        let totalContacts = contacts.length;
        
        // Count total messages across all contacts
        Object.keys(history).forEach(contactId => {
            const messages = history[contactId] || [];
            totalMessages += messages.length;
        });
        
        const statsElement = modal.querySelector('#confirmationStats');
        statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${totalContacts}</span>
                <span class="stat-label">Conversations</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${totalMessages}</span>
                <span class="stat-label">Messages</span>
            </div>
        `;
    }

    /**
     * CANCEL CLEAR HISTORY
     * Closes the confirmation modal without clearing history
     */
    window.cancelClearHistory = function() {
        const modal = document.querySelector('.confirmation-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
    };

    /**
     * CONFIRM CLEAR HISTORY
     * Proceeds with clearing all chat history after confirmation
     */
    window.confirmClearHistory = function() {
        // Close confirmation modal
        const modal = document.querySelector('.confirmation-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }
        
        // Show loading state
        showClearingProgress();
        
        // Clear history with delay for better UX
        setTimeout(() => {
            clearAllChatHistory();
        }, 1000);
    };

    /**
     * SHOW CLEARING PROGRESS
     * Shows a progress indicator while clearing history
     */
    function showClearingProgress() {
        const progressModal = document.createElement('div');
        progressModal.className = 'progress-modal active';
        progressModal.innerHTML = `
            <div class="progress-overlay">
                <div class="progress-content">
                    <div class="progress-spinner"></div>
                    <h3 class="progress-title">Clearing Chat History...</h3>
                    <p class="progress-message">Please wait while we delete all conversations</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(progressModal);
        
        // Store reference for later removal
        window.currentProgressModal = progressModal;
    }

    /**
     * CLEAR ALL CHAT HISTORY - Enhanced Version
     * Removes all chat history and resets contacts with better feedback
     */
    function clearAllChatHistory() {
        console.log('Starting to clear all chat history'); // Debug log
        
        try {
            // Get current statistics for feedback
            const contacts = getContacts();
            const allHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
            const history = allHistory ? JSON.parse(allHistory) : {};
            
            console.log('Current contacts:', contacts.length); // Debug log
            console.log('Current history keys:', Object.keys(history)); // Debug log
            
            let totalMessages = 0;
            Object.keys(history).forEach(contactId => {
                const messages = history[contactId] || [];
                totalMessages += messages.length;
            });
            
            console.log('Total messages to clear:', totalMessages); // Debug log
            
            // Clear all chat history from localStorage
            localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
            localStorage.removeItem('chatMessages'); // Legacy storage
            localStorage.removeItem('currentChatContact'); // Clear current selection
            
            console.log('Cleared localStorage items'); // Debug log
            
            // Reset contacts' last messages to default state
            contacts.forEach(contact => {
                contact.lastMessage = 'No messages yet';
                contact.lastMessageTime = '';
                contact.unreadCount = 0;
            });
            saveContacts(contacts);
            
            console.log('Reset contacts data'); // Debug log
            
            // Refresh the chat list to show updated state
            renderChatList();
            
            console.log('Refreshed chat list'); // Debug log
            
            // Hide progress modal
            if (window.currentProgressModal) {
                window.currentProgressModal.classList.remove('active');
                setTimeout(() => {
                    if (window.currentProgressModal && document.body.contains(window.currentProgressModal)) {
                        document.body.removeChild(window.currentProgressModal);
                    }
                    window.currentProgressModal = null;
                }, 300);
            }
            
            // Show success message with statistics
            setTimeout(() => {
                showClearSuccessMessage(contacts.length, totalMessages);
            }, 500);
            
            // Close settings modal
            setTimeout(() => {
                closeSettingsModal();
            }, 2000);
            
            console.log('Clear chat history completed successfully'); // Debug log
            
        } catch (error) {
            console.error('Error clearing chat history:', error);
            
            // Hide progress modal
            if (window.currentProgressModal) {
                window.currentProgressModal.classList.remove('active');
                setTimeout(() => {
                    if (window.currentProgressModal && document.body.contains(window.currentProgressModal)) {
                        document.body.removeChild(window.currentProgressModal);
                    }
                    window.currentProgressModal = null;
                }, 300);
            }
            
            // Show error message
            alert('An error occurred while clearing chat history. Please try again.');
        }
    }

    /**
     * SHOW CLEAR SUCCESS MESSAGE
     * Displays a success message with statistics about what was cleared
     */
    function showClearSuccessMessage(contactCount, messageCount) {
        const successModal = document.createElement('div');
        successModal.className = 'success-modal active';
        successModal.innerHTML = `
            <div class="success-overlay">
                <div class="success-content">
                    <div class="success-icon">
                        <div class="checkmark">✓</div>
                    </div>
                    <h3 class="success-title">Chat History Cleared!</h3>
                    <p class="success-message">
                        Successfully cleared ${messageCount} messages from ${contactCount} conversations.
                    </p>
                    <div class="success-note">
                        Your contacts are still available for new conversations.
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(successModal);
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            successModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(successModal)) {
                    document.body.removeChild(successModal);
                }
            }, 300);
        }, 3000);
    }

    // ========================================
    // WALLPAPER MODAL FUNCTIONALITY
    // ========================================

    /**
     * OPEN WALLPAPER MODAL
     * Shows the wallpaper selection modal
     */
    function openWallpaperModal() {
        const wallpaperModal = document.getElementById('wallpaperModal');
        wallpaperModal.classList.add('active');
        
        // Load current wallpaper selection
        loadCurrentWallpaper();
        
        // Add wallpaper option event listeners
        const wallpaperOptions = document.querySelectorAll('.wallpaper-option');
        wallpaperOptions.forEach(option => {
            option.addEventListener('click', function() {
                const wallpaper = this.dataset.wallpaper;
                selectWallpaper(wallpaper);
            });
        });
    }

    /**
     * CLOSE WALLPAPER MODAL
     * Hides the wallpaper selection modal
     */
    window.closeWallpaperModal = function() {
        const wallpaperModal = document.getElementById('wallpaperModal');
        wallpaperModal.classList.remove('active');
    };

    /**
     * LOAD CURRENT WALLPAPER
     * Highlights the currently selected wallpaper
     */
    function loadCurrentWallpaper() {
        const currentWallpaper = localStorage.getItem('chatWallpaper') || 'default';
        const wallpaperOptions = document.querySelectorAll('.wallpaper-option');
        
        wallpaperOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.wallpaper === currentWallpaper) {
                option.classList.add('selected');
            }
        });
    }

    /**
     * SELECT WALLPAPER
     * Applies the selected wallpaper and saves the preference
     */
    function selectWallpaper(wallpaper) {
        // Save wallpaper preference
        localStorage.setItem('chatWallpaper', wallpaper);
        
        // Apply wallpaper to interface (this will be used in interface.js)
        localStorage.setItem('interfaceWallpaper', wallpaper);
        
        // Update selection UI
        loadCurrentWallpaper();
        
        // Show confirmation
        setTimeout(() => {
            alert(`Wallpaper changed to ${wallpaper}. You'll see the change in chat conversations.`);
            closeWallpaperModal();
        }, 300);
    }

    // Load settings on page load
    loadCurrentSettings();

    // Global function to manually refresh dark mode (for debugging)
    window.refreshDarkMode = function() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        console.log('Manually refreshing dark mode:', isDarkMode);
        applyDarkMode(isDarkMode);
    };

    // Global function to check dark mode status (for debugging)
    window.checkDarkMode = function() {
        const stored = localStorage.getItem('darkMode');
        const bodyHasClass = document.body.classList.contains('dark-mode');
        const htmlHasClass = document.documentElement.classList.contains('dark-mode');
        
        console.log('Dark mode status:');
        console.log('- Stored in localStorage:', stored);
        console.log('- Body has dark-mode class:', bodyHasClass);
        console.log('- HTML has dark-mode class:', htmlHasClass);
        
        return {
            stored: stored,
            bodyClass: bodyHasClass,
            htmlClass: htmlHasClass
        };
    };

    // Global function to test clear history (for debugging)
    window.testClearHistory = function() {
        console.log('Testing clear history functionality');
        showClearHistoryConfirmation();
    };

    // Global function to force clear history (for debugging)
    window.forceClearHistory = function() {
        console.log('Force clearing chat history');
        clearAllChatHistory();
    };

    // Export functions for global access
    window.chatApp = {
        getContacts,
        saveContacts,
        getChatHistory,
        saveChatHistory,
        renderChatList
    };
});