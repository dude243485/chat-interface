/**
 * ========================================
 * CHAT INTERFACE JAVASCRIPT - INTERFACE.JS
 * ========================================
 * 
 * This file handles all the functionality for the chat interface page (interface.html)
 * including messaging, file attachments, media modals, and local storage management.
 * 
 * MAIN FEATURES:
 * - Send and receive text messages
 * - File attachment support (images, videos, audio, documents)
 * - WhatsApp-style typing indicator with 3 dots animation
 * - Media modal for viewing images/videos in full screen
 * - Local storage integration for persistent chat history
 * - Contact-specific chat management
 * - Auto-reply simulation for realistic chat experience
 */

// Wait for the DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // DOM ELEMENT REFERENCES
    // ========================================
    // Get references to all the HTML elements we'll be working with
    
    const backButton = document.getElementById('back_button');           // Back arrow button in header
    const messageInput = document.getElementById('message-input');       // Text input field for typing messages
    const sendButton = document.getElementById('send-button');           // Send button (green circle with arrow)
    const chatMessages = document.getElementById('chat-messages');       // Container that holds all chat messages
    const emptyChat = document.getElementById('empty-chat');             // "No messages yet" placeholder
    const attachButton = document.querySelector('footer button:first-child'); // Paperclip attachment button
    
    // ========================================
    // STORAGE CONFIGURATION
    // ========================================
    // Local storage key for legacy message storage (kept for compatibility)
    const CHAT_STORAGE_KEY = 'chatMessages';
    
    // ========================================
    // INITIALIZATION
    // ========================================
    // Initialize the chat interface when page loads
    
    initializeChat();        // Load any existing messages from storage
    loadCurrentContact();    // Load the selected contact's information and chat history
    applyWallpaperSettings(); // Apply saved wallpaper settings
    applyDarkModeSettings(); // Apply saved dark mode settings
    
    // ========================================
    // NAVIGATION FUNCTIONALITY
    // ========================================
    
    /**
     * BACK BUTTON - Returns user to chat list page
     * When clicked, navigates back to chat.html where user can see all conversations
     */
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'chat.html';  // Go back to chat list page
        });
    }

    /**
     * MENU BUTTON - Shows menu options
     * When clicked, shows available menu options for the chat interface
     */
    const menuButton = document.getElementById('menu_button');
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            showInterfaceMenu();
        });
    }

    /**
     * SHOW INTERFACE MENU
     * Creates and displays a menu modal with chat-specific options
     */
    function showInterfaceMenu() {
        // Remove existing menu if any
        const existingMenu = document.querySelector('.interface-menu-modal');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menuModal = document.createElement('div');
        menuModal.className = 'interface-menu-modal';
        menuModal.innerHTML = `
            <div class="menu-overlay" onclick="closeInterfaceMenu()">
                <div class="menu-content" onclick="event.stopPropagation()">
                    <div class="menu-header">
                        <h3>Chat Options</h3>
                        <button class="menu-close-btn" onclick="closeInterfaceMenu()">
                            <img src="../assets/left.png" alt="Close" class="close-icon">
                        </button>
                    </div>
                    <div class="menu-options">
                        <div class="menu-option" onclick="showChatInfo()">
                            <div class="option-icon">
                                <img src="../assets/user.png" alt="Chat Info" class="menu-option-icon">
                            </div>
                            <div class="option-text">
                                <span class="option-title">Chat Info</span>
                                <span class="option-desc">View contact details</span>
                            </div>
                        </div>
                        
                        <div class="menu-option" onclick="toggleChatMute()">
                            <div class="option-icon">
                                <img src="../assets/disabled.png" alt="Mute" class="menu-option-icon">
                            </div>
                            <div class="option-text">
                                <span class="option-title">Mute Notifications</span>
                                <span class="option-desc">Turn off notifications</span>
                            </div>
                        </div>
                        
                        <div class="menu-option" onclick="openWallpaperSelector()">
                            <div class="option-icon">
                                <img src="../assets/setting.png" alt="Wallpaper" class="menu-option-icon">
                            </div>
                            <div class="option-text">
                                <span class="option-title">Change Wallpaper</span>
                                <span class="option-desc">Customize chat background</span>
                            </div>
                        </div>
                        
                        <div class="menu-option" onclick="clearCurrentChat()">
                            <div class="option-icon">
                                <img src="../assets/bin.png" alt="Clear Chat" class="menu-option-icon">
                            </div>
                            <div class="option-text">
                                <span class="option-title">Clear Chat</span>
                                <span class="option-desc">Delete this conversation</span>
                            </div>
                        </div>
                        
                        <div class="menu-option" onclick="openChatSettings()">
                            <div class="option-icon">
                                <img src="../assets/setting.png" alt="Settings" class="menu-option-icon">
                            </div>
                            <div class="option-text">
                                <span class="option-title">Settings</span>
                                <span class="option-desc">App preferences</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(menuModal);
        
        // Show menu with animation
        setTimeout(() => {
            menuModal.classList.add('active');
        }, 10);
    }

    /**
     * CLOSE INTERFACE MENU
     * Closes the interface menu modal
     */
    window.closeInterfaceMenu = function() {
        const menuModal = document.querySelector('.interface-menu-modal');
        if (menuModal) {
            menuModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(menuModal)) {
                    document.body.removeChild(menuModal);
                }
            }, 300);
        }
    };

    /**
     * CLEAR CURRENT CHAT
     * Clears the chat history for the current contact only
     */
    window.clearCurrentChat = function() {
        const currentContactId = localStorage.getItem('currentChatContact');
        if (!currentContactId) {
            alert('No active chat to clear.');
            return;
        }

        const confirmed = confirm(
            'Are you sure you want to clear this chat?\n\n' +
            'This will delete all messages in this conversation. This action cannot be undone.'
        );

        if (confirmed) {
            try {
                // Get current contact info
                const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
                const contact = contacts.find(c => c.id === currentContactId);
                
                // Clear chat history for this contact
                const allHistory = localStorage.getItem('chatHistory');
                if (allHistory) {
                    const history = JSON.parse(allHistory);
                    delete history[currentContactId];
                    localStorage.setItem('chatHistory', JSON.stringify(history));
                }

                // Update contact's last message
                if (contact) {
                    contact.lastMessage = 'No messages yet';
                    contact.lastMessageTime = '';
                    contact.unreadCount = 0;
                    localStorage.setItem('chatContacts', JSON.stringify(contacts));
                }

                // Clear the chat UI
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    chatMessages.innerHTML = '<div class="empty-chat" id="empty-chat"><p>No messages yet. Start chatting!</p></div>';
                }

                // Close menu and show success
                closeInterfaceMenu();
                
                setTimeout(() => {
                    alert('Chat cleared successfully!');
                }, 300);

            } catch (error) {
                console.error('Error clearing chat:', error);
                alert('An error occurred while clearing the chat. Please try again.');
            }
        }
    };

    /**
     * OPEN WALLPAPER SELECTOR
     * Opens the wallpaper selection modal for the chat interface
     */
    window.openWallpaperSelector = function() {
        closeInterfaceMenu();
        
        // Create wallpaper selector modal
        const wallpaperModal = document.createElement('div');
        wallpaperModal.className = 'wallpaper-selector-modal';
        wallpaperModal.innerHTML = `
            <div class="wallpaper-overlay" onclick="closeWallpaperSelector()">
                <div class="wallpaper-selector-content" onclick="event.stopPropagation()">
                    <div class="wallpaper-header">
                        <button class="wallpaper-back-btn" onclick="closeWallpaperSelector()">
                            <img src="../assets/left.png" alt="Back" class="wallpaper-back-icon">
                        </button>
                        <h3>Choose Wallpaper</h3>
                    </div>
                    <div class="wallpaper-grid">
                        <div class="wallpaper-item" data-wallpaper="default" onclick="selectInterfaceWallpaper('default')">
                            <div class="wallpaper-preview default-bg"></div>
                            <span class="wallpaper-label">Default</span>
                        </div>
                        <div class="wallpaper-item" data-wallpaper="dark" onclick="selectInterfaceWallpaper('dark')">
                            <div class="wallpaper-preview dark-bg"></div>
                            <span class="wallpaper-label">Dark</span>
                        </div>
                        <div class="wallpaper-item" data-wallpaper="blue" onclick="selectInterfaceWallpaper('blue')">
                            <div class="wallpaper-preview blue-bg"></div>
                            <span class="wallpaper-label">Blue</span>
                        </div>
                        <div class="wallpaper-item" data-wallpaper="green" onclick="selectInterfaceWallpaper('green')">
                            <div class="wallpaper-preview green-bg"></div>
                            <span class="wallpaper-label">Green</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(wallpaperModal);
        
        // Load current wallpaper selection
        loadCurrentInterfaceWallpaper();
        
        // Show modal
        setTimeout(() => {
            wallpaperModal.classList.add('active');
        }, 10);
    };

    /**
     * CLOSE WALLPAPER SELECTOR
     * Closes the wallpaper selection modal
     */
    window.closeWallpaperSelector = function() {
        const wallpaperModal = document.querySelector('.wallpaper-selector-modal');
        if (wallpaperModal) {
            wallpaperModal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(wallpaperModal)) {
                    document.body.removeChild(wallpaperModal);
                }
            }, 300);
        }
    };

    /**
     * LOAD CURRENT INTERFACE WALLPAPER
     * Highlights the currently selected wallpaper
     */
    function loadCurrentInterfaceWallpaper() {
        const currentWallpaper = localStorage.getItem('interfaceWallpaper') || 'default';
        const wallpaperItems = document.querySelectorAll('.wallpaper-item');
        
        wallpaperItems.forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.wallpaper === currentWallpaper) {
                item.classList.add('selected');
            }
        });
    }

    /**
     * SELECT INTERFACE WALLPAPER
     * Applies the selected wallpaper to the chat interface
     */
    window.selectInterfaceWallpaper = function(wallpaper) {
        // Save wallpaper preference
        localStorage.setItem('interfaceWallpaper', wallpaper);
        
        // Apply wallpaper immediately
        applyWallpaperSettings();
        
        // Update selection UI
        loadCurrentInterfaceWallpaper();
        
        // Show feedback and close
        setTimeout(() => {
            closeWallpaperSelector();
            setTimeout(() => {
                alert(`Wallpaper changed to ${wallpaper}!`);
            }, 300);
        }, 500);
    };

    // Placeholder functions for other menu options
    window.showChatInfo = function() {
        closeInterfaceMenu();
        const currentContactId = localStorage.getItem('currentChatContact');
        const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        const contact = contacts.find(c => c.id === currentContactId);
        
        if (contact) {
            alert(`Chat Info:\n\nName: ${contact.name}\nStatus: ${contact.isOnline ? 'Online' : 'Offline'}\nMuted: ${contact.isMuted ? 'Yes' : 'No'}`);
        } else {
            alert('No contact information available.');
        }
    };

    window.toggleChatMute = function() {
        closeInterfaceMenu();
        const currentContactId = localStorage.getItem('currentChatContact');
        const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        const contact = contacts.find(c => c.id === currentContactId);
        
        if (contact) {
            contact.isMuted = !contact.isMuted;
            localStorage.setItem('chatContacts', JSON.stringify(contacts));
            alert(`Notifications ${contact.isMuted ? 'muted' : 'unmuted'} for ${contact.name}`);
        }
    };

    window.openChatSettings = function() {
        closeInterfaceMenu();
        alert('Settings feature coming soon!\n\nFor now, you can access settings from the chat list page.');
    };

    // ========================================
    // MESSAGE SENDING FUNCTIONALITY
    // ========================================
    
    /**
     * SEND BUTTON & ENTER KEY SETUP
     * Allows users to send messages by clicking send button or pressing Enter
     */
    if (sendButton && messageInput) {
        // Send message when send button is clicked
        sendButton.addEventListener('click', sendMessage);
        
        // Send message when Enter key is pressed (but not Shift+Enter for new lines)
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();  // Prevent default Enter behavior (new line)
                sendMessage();       // Send the message instead
            }
        });
        
        // Automatically focus on the input field so user can start typing immediately
        messageInput.focus();
    }

    /**
     * SEND MESSAGE FUNCTION
     * Creates a message object and adds it to the chat, then triggers auto-reply
     */
    function sendMessage() {
        const messageText = messageInput.value.trim();  // Get text and remove whitespace
        
        if (messageText) {  // Only send if there's actual content
            // Create message object with all necessary data
            const message = {
                id: generateMessageId(),                    // Unique identifier for this message
                text: messageText,                          // The actual message content
                type: 'text',                              // Message type (text, file, etc.)
                sender: 'user',                            // Who sent it (user = you, contact = them)
                timestamp: new Date().toISOString(),       // Full timestamp for sorting/storage
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) // Display time (e.g., "2:30 PM")
            };
            
            addMessageToChat(message);              // Display the message in the chat UI
            saveMessageToContactStorage(message);   // Save to local storage for this specific contact
            messageInput.value = '';                // Clear the input field
            
            // Simulate a reply from the contact after 1-3 seconds (realistic delay)
            setTimeout(() => {
                simulateReceivedMessage();
            }, 1000 + Math.random() * 2000);  // Random delay between 1-3 seconds
        }
    }

    // ========================================
    // AUTO-REPLY SIMULATION SYSTEM
    // ========================================
    
    /**
     * SIMULATE RECEIVED MESSAGE
     * Creates realistic auto-replies to make the chat feel interactive
     * Shows typing indicator first, then sends a random response
     */
    function simulateReceivedMessage() {
        // Show the typing indicator (3 bouncing dots like WhatsApp)
        showTypingIndicator();
        
        // Array of possible responses - randomly selected to make conversation feel natural
        const responses = [
            "That's interesting!",
            "I see what you mean.",
            "Thanks for sharing that.",
            "Got it!",
            "That makes sense.",
            "I understand.",
            "Absolutely!",
            "Good point!",
            "I agree with you.",
            "Tell me more about that.",
            "How are you doing?",
            "That sounds great!",
            "I'm here if you need anything.",
            "What do you think about that?",
            "That's a good idea!"
        ];
        
        // Pick a random response from the array
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Wait 2-4 seconds (simulating typing time), then send the response
        setTimeout(() => {
            hideTypingIndicator();  // Remove the typing dots
            
            // Create the received message object
            const receivedMessage = {
                id: generateMessageId(),
                text: randomResponse,
                type: 'text',
                sender: 'contact',                          // This message is from the contact, not the user
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            addMessageToChat(receivedMessage);              // Display in chat
            saveMessageToContactStorage(receivedMessage);   // Save to storage
        }, 2000 + Math.random() * 2000);  // 2-4 second delay
    }

    // ========================================
    // TYPING INDICATOR (WhatsApp-style 3 dots)
    // ========================================
    
    /**
     * SHOW TYPING INDICATOR
     * Displays the animated 3-dot typing indicator when contact is "typing"
     */
    function showTypingIndicator() {
        hideEmptyChat();  // Hide "no messages" placeholder if visible
        
        // Remove any existing typing indicator to prevent duplicates
        const existingIndicator = document.querySelector('.typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create the typing indicator HTML with 3 animated dots
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message received typing-message';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);  // Add to chat
        scrollToBottom();                     // Scroll to show the indicator
    }

    /**
     * HIDE TYPING INDICATOR
     * Removes the typing indicator when contact finishes "typing"
     */
    function hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-message');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // ========================================
    // MESSAGE DISPLAY FUNCTIONS
    // ========================================
    
    /**
     * ADD MESSAGE TO CHAT UI
     * Takes a message object and creates the HTML to display it in the chat
     */
    function addMessageToChat(message) {
        hideEmptyChat();  // Hide "no messages" placeholder
        
        // Create the message container div
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;  // Style based on sender
        messageDiv.setAttribute('data-message-id', message.id);  // Store message ID for reference
        
        // Only handle text messages here (file messages are handled separately)
        if (message.type === 'text') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${escapeHtml(message.text)}</p>
                    </div>
                    <span class="message-time">${message.time}</span>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);  // Add to chat container
        scrollToBottom();                      // Scroll to show new message
    }

    // ========================================
    // CHAT INITIALIZATION & CONTACT LOADING
    // ========================================
    
    /**
     * INITIALIZE CHAT
     * Loads any existing messages from local storage when page first loads
     */
    function initializeChat() {
        const savedMessages = getMessagesFromStorage();
        if (savedMessages.length > 0) {
            hideEmptyChat();
            savedMessages.forEach(message => {
                addMessageToChat(message);
            });
        }
    }

    /**
     * LOAD CURRENT CONTACT
     * Gets the selected contact's info from storage and updates the header
     * Also loads the chat history specific to this contact
     */
    function loadCurrentContact() {
        // Get the ID of the currently selected contact (set when user clicked on them in chat list)
        const currentContactId = localStorage.getItem('currentChatContact');
        
        if (currentContactId) {
            // Get all contacts from storage
            const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
            const contact = contacts.find(c => c.id === currentContactId);
            
            if (contact) {
                // Update the header with this contact's information
                const profileName = document.querySelector('.profile-name-1');    // Contact name in header
                const profileImage = document.querySelector('.profile-image');    // Profile picture
                const status = document.querySelector('.status');                 // Online status text
                
                if (profileName) profileName.textContent = contact.name;
                if (profileImage) profileImage.src = contact.profileImage;
                if (status) status.textContent = contact.isOnline ? 'Active now' : 'Last seen recently';
                
                // Load this contact's chat history
                loadChatHistoryForContact(currentContactId);
            }
        }
    }

    /**
     * LOAD CHAT HISTORY FOR SPECIFIC CONTACT
     * Retrieves and displays all previous messages with this contact
     */
    function loadChatHistoryForContact(contactId) {
        const allHistory = localStorage.getItem('chatHistory');
        if (allHistory) {
            const history = JSON.parse(allHistory);
            const contactHistory = history[contactId] || [];  // Get messages for this contact only
            
            if (contactHistory.length > 0) {
                hideEmptyChat();
                // Display each message in chronological order
                contactHistory.forEach(message => {
                    addMessageToChat(message);
                });
            }
        }
    }

    // ========================================
    // LOCAL STORAGE MANAGEMENT
    // ========================================
    
    /**
     * SAVE MESSAGE TO CONTACT-SPECIFIC STORAGE
     * Saves messages organized by contact ID for proper chat separation
     */
    function saveMessageToContactStorage(message) {
        const currentContactId = localStorage.getItem('currentChatContact');
        if (currentContactId) {
            // Get existing chat history structure
            const allHistory = localStorage.getItem('chatHistory');
            const history = allHistory ? JSON.parse(allHistory) : {};
            
            // Create array for this contact if it doesn't exist
            if (!history[currentContactId]) {
                history[currentContactId] = [];
            }
            
            // Add the new message to this contact's history
            history[currentContactId].push(message);
            localStorage.setItem('chatHistory', JSON.stringify(history));
            
            // Update the contact's "last message" in the chat list
            updateContactLastMessage(currentContactId, message);
        }
    }

    /**
     * UPDATE CONTACT'S LAST MESSAGE
     * Updates the preview text shown in the chat list for this contact
     */
    function updateContactLastMessage(contactId, message) {
        const contacts = JSON.parse(localStorage.getItem('chatContacts') || '[]');
        const contact = contacts.find(c => c.id === contactId);
        
        if (contact) {
            // Update the last message preview and timestamp
            contact.lastMessage = message.text || 'File attachment';  // Show "File attachment" for non-text messages
            contact.lastMessageTime = 'now';
            localStorage.setItem('chatContacts', JSON.stringify(contacts));
        }
    }

    /**
     * GET MESSAGES FROM STORAGE (Legacy function)
     * Retrieves messages from the old storage format for compatibility
     */
    function getMessagesFromStorage() {
        const messages = localStorage.getItem(CHAT_STORAGE_KEY);
        return messages ? JSON.parse(messages) : [];
    }

    /**
     * CLEAR CHAT HISTORY
     * Removes all messages and shows empty state
     */
    function clearChatHistory() {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        chatMessages.innerHTML = '';
        showEmptyChat();
    }

    // ========================================
    // UI HELPER FUNCTIONS
    // ========================================
    
    /**
     * HIDE EMPTY CHAT MESSAGE
     * Hides the "No messages yet" placeholder when there are messages
     */
    function hideEmptyChat() {
        if (emptyChat) {
            emptyChat.style.display = 'none';
        }
    }

    /**
     * SHOW EMPTY CHAT MESSAGE
     * Shows the "No messages yet" placeholder when chat is empty
     */
    function showEmptyChat() {
        if (emptyChat) {
            emptyChat.style.display = 'block';
        }
    }

    /**
     * SCROLL TO BOTTOM
     * Automatically scrolls the chat to show the newest message
     */
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * GENERATE UNIQUE MESSAGE ID
     * Creates a unique identifier for each message using timestamp + random string
     */
    function generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    /**
     * ESCAPE HTML
     * Prevents XSS attacks by escaping HTML characters in user input
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // FILE ATTACHMENT SYSTEM
    // ========================================
    
    /**
     * FILE ATTACHMENT SETUP
     * Creates hidden file input and handles attachment button clicks
     */
    if (attachButton) {
        // Create a hidden file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';  // Allowed file types
        fileInput.style.display = 'none';  // Hide it from view
        document.body.appendChild(fileInput);

        // When attachment button is clicked, trigger the hidden file input
        attachButton.addEventListener('click', function() {
            fileInput.click();  // Opens the file selection dialog
        });

        // When user selects a file, handle the attachment
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];  // Get the selected file
            if (file) {
                handleFileAttachment(file);  // Process the file
            }
        });
    }

    /**
     * HANDLE FILE ATTACHMENT
     * Processes uploaded files and creates appropriate message display based on file type
     */
    function handleFileAttachment(file) {
        hideEmptyChat();

        // Create file message object with metadata
        const fileMessage = {
            id: generateMessageId(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            type: 'file',                                   // Mark as file message
            sender: 'user',
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        // Create the message container
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent file-message';
        messageDiv.setAttribute('data-message-id', fileMessage.id);
        
        const fileSize = formatFileSize(file.size);  // Convert bytes to readable format
        const fileName = file.name;
        const fileType = file.type;

        // Create different HTML based on file type
        let fileContent = '';
        
        // IMAGE FILES - Show thumbnail with click to open modal
        if (fileType.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);  // Create temporary URL for the file
            fileContent = `
                <div class="file-attachment image-attachment">
                    <img src="${imageUrl}" alt="${fileName}" class="attached-image" onclick="openMediaModal('${imageUrl}', 'image', '${fileName}')">
                    <div class="file-info">
                        <span class="file-name">${fileName}</span>
                        <span class="file-size">${fileSize}</span>
                    </div>
                </div>
            `;
        } 
        // VIDEO FILES - Show video player with click to open modal
        else if (fileType.startsWith('video/')) {
            const videoUrl = URL.createObjectURL(file);
            fileContent = `
                <div class="file-attachment video-attachment">
                    <video class="attached-video" onclick="openMediaModal('${videoUrl}', 'video', '${fileName}')">
                        <source src="${videoUrl}" type="${fileType}">
                        Your browser does not support the video tag.
                    </video>
                    <div class="file-info">
                        <span class="file-name">${fileName}</span>
                        <span class="file-size">${fileSize}</span>
                    </div>
                </div>
            `;
        } 
        // AUDIO FILES - Show audio player with controls
        else if (fileType.startsWith('audio/')) {
            const audioUrl = URL.createObjectURL(file);
            fileContent = `
                <div class="file-attachment audio-attachment">
                    <audio controls class="attached-audio">
                        <source src="${audioUrl}" type="${fileType}">
                        Your browser does not support the audio tag.
                    </audio>
                    <div class="file-info">
                        <span class="file-name">${fileName}</span>
                        <span class="file-size">${fileSize}</span>
                    </div>
                </div>
            `;
        } 
        // OTHER FILES - Show generic file icon with download button
        else {
            fileContent = `
                <div class="file-attachment document-attachment">
                    <div class="file-icon">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="file-info">
                        <span class="file-name">${fileName}</span>
                        <span class="file-size">${fileSize}</span>
                    </div>
                    <button class="download-btn" onclick="downloadFile('${fileName}', '${URL.createObjectURL(file)}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            `;
        }

        // Wrap the file content in message bubble
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble file-bubble">
                    ${fileContent}
                </div>
                <span class="message-time">${fileMessage.time}</span>
            </div>
        `;

        // Add to chat and save to storage
        chatMessages.appendChild(messageDiv);
        saveMessageToContactStorage(fileMessage);
        scrollToBottom();

        // Clear the file input so same file can be selected again
        fileInput.value = '';
    }

    /**
     * FORMAT FILE SIZE
     * Converts bytes to human-readable format (KB, MB, GB)
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ========================================
    // GLOBAL UTILITY FUNCTIONS
    // ========================================
    
    /**
     * DOWNLOAD FILE FUNCTION (Global)
     * Allows users to download attached files
     */
    window.downloadFile = function(fileName, url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();                    // Trigger download
        document.body.removeChild(a); // Clean up
    };

    /**
     * CLEAR CHAT FUNCTION (Global)
     * Utility function accessible from browser console for debugging
     */
    window.clearChat = function() {
        if (confirm('Are you sure you want to clear all chat messages?')) {
            clearChatHistory();
        }
    };

    // ========================================
    // MEDIA MODAL SYSTEM (Full-screen image/video viewer)
    // ========================================
    
    // Create the modal when page loads
    createMediaModal();

    /**
     * CREATE MEDIA MODAL
     * Creates the HTML structure for the full-screen media viewer
     */
    function createMediaModal() {
        const modal = document.createElement('div');
        modal.id = 'mediaModal';
        modal.className = 'media-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeMediaModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="closeMediaModal()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-header">
                        <h3 id="modalFileName">Media</h3>
                    </div>
                    <div class="modal-body">
                        <div id="modalMediaContainer"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * OPEN MEDIA MODAL (Global)
     * Opens full-screen viewer for images and videos
     */
    window.openMediaModal = function(url, type, fileName) {
        const modal = document.getElementById('mediaModal');
        const container = document.getElementById('modalMediaContainer');
        const fileNameElement = document.getElementById('modalFileName');
        
        fileNameElement.textContent = fileName || 'Media';
        
        // Display content based on media type
        if (type === 'image') {
            container.innerHTML = `<img src="${url}" alt="${fileName}" class="modal-image">`;
        } else if (type === 'video') {
            container.innerHTML = `
                <video controls class="modal-video" autoplay>
                    <source src="${url}">
                    Your browser does not support the video tag.
                </video>
            `;
        }
        
        modal.style.display = 'flex';           // Show the modal
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    /**
     * CLOSE MEDIA MODAL (Global)
     * Closes the full-screen media viewer
     */
    window.closeMediaModal = function() {
        const modal = document.getElementById('mediaModal');
        const container = document.getElementById('modalMediaContainer');
        
        modal.style.display = 'none';           // Hide the modal
        document.body.style.overflow = 'auto';  // Restore background scrolling
        container.innerHTML = '';               // Clear the content
    };

    /**
     * KEYBOARD SHORTCUT - Close modal with Escape key
     */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMediaModal();
        }
    });

    // ========================================
    // SETTINGS APPLICATION FUNCTIONS
    // ========================================

    /**
     * APPLY WALLPAPER SETTINGS
     * Applies the saved wallpaper to the chat interface
     */
    function applyWallpaperSettings() {
        const wallpaper = localStorage.getItem('interfaceWallpaper') || 'default';
        const chatMessages = document.getElementById('chat-messages');
        
        if (chatMessages) {
            // Remove existing wallpaper classes
            chatMessages.classList.remove('wallpaper-default', 'wallpaper-dark', 'wallpaper-blue', 'wallpaper-green');
            
            // Apply selected wallpaper
            chatMessages.classList.add(`wallpaper-${wallpaper}`);
        }
    }

    /**
     * APPLY DARK MODE SETTINGS
     * Applies dark mode if enabled in settings
     */
    function applyDarkModeSettings() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-mode');
        }
    }
});