// Complete Chat Interface with Local Storage
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('back_button');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const emptyChat = document.getElementById('empty-chat');
    const attachButton = document.querySelector('footer button:first-child');
    
    // Chat storage key
    const CHAT_STORAGE_KEY = 'chatMessages';
    
    // Initialize chat
    initializeChat();
    
    // Back button functionality
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }

    // Send button functionality
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', sendMessage);
        
        // Send message on Enter key press
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-focus on message input
        messageInput.focus();
    }

    // Function to send message
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const message = {
                id: generateMessageId(),
                text: messageText,
                type: 'text',
                sender: 'user',
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            addMessageToChat(message);
            saveMessageToStorage(message);
            messageInput.value = '';
            
            // Simulate received message after a delay
            setTimeout(() => {
                simulateReceivedMessage(messageText);
            }, 1000 + Math.random() * 2000);
        }
    }

    // Function to simulate received messages
    function simulateReceivedMessage(originalMessage) {
        // Show typing indicator
        showTypingIndicator();
        
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
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Simulate typing delay (2-4 seconds)
        setTimeout(() => {
            // Hide typing indicator
            hideTypingIndicator();
            
            const receivedMessage = {
                id: generateMessageId(),
                text: randomResponse,
                type: 'text',
                sender: 'contact',
                timestamp: new Date().toISOString(),
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            addMessageToChat(receivedMessage);
            saveMessageToStorage(receivedMessage);
        }, 2000 + Math.random() * 2000);
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        hideEmptyChat();
        
        // Remove existing typing indicator if any
        const existingIndicator = document.querySelector('.typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
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
        
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }

    // Function to hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-message');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Function to add message to chat UI
    function addMessageToChat(message) {
        hideEmptyChat();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        messageDiv.setAttribute('data-message-id', message.id);
        
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
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Function to initialize chat from local storage
    function initializeChat() {
        const savedMessages = getMessagesFromStorage();
        if (savedMessages.length > 0) {
            hideEmptyChat();
            savedMessages.forEach(message => {
                addMessageToChat(message);
            });
        }
    }

    // Function to save message to local storage
    function saveMessageToStorage(message) {
        const messages = getMessagesFromStorage();
        messages.push(message);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }

    // Function to get messages from local storage
    function getMessagesFromStorage() {
        const messages = localStorage.getItem(CHAT_STORAGE_KEY);
        return messages ? JSON.parse(messages) : [];
    }

    // Function to clear chat history
    function clearChatHistory() {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        chatMessages.innerHTML = '';
        showEmptyChat();
    }

    // Function to hide empty chat message
    function hideEmptyChat() {
        if (emptyChat) {
            emptyChat.style.display = 'none';
        }
    }

    // Function to show empty chat message
    function showEmptyChat() {
        if (emptyChat) {
            emptyChat.style.display = 'block';
        }
    }

    // Function to scroll to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to generate unique message ID
    function generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Attach file functionality
    if (attachButton) {
        // Create hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // Handle attach button click
        attachButton.addEventListener('click', function() {
            fileInput.click();
        });

        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleFileAttachment(file);
            }
        });
    }

    // Function to handle file attachment
    function handleFileAttachment(file) {
        hideEmptyChat();

        const fileMessage = {
            id: generateMessageId(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            type: 'file',
            sender: 'user',
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        // Create file message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent file-message';
        messageDiv.setAttribute('data-message-id', fileMessage.id);
        
        const fileSize = formatFileSize(file.size);
        const fileName = file.name;
        const fileType = file.type;

        // Create different content based on file type
        let fileContent = '';
        
        if (fileType.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            fileContent = `
                <div class="file-attachment image-attachment">
                    <img src="${imageUrl}" alt="${fileName}" class="attached-image">
                    <div class="file-info">
                        <span class="file-name">${fileName}</span>
                        <span class="file-size">${fileSize}</span>
                    </div>
                </div>
            `;
        } else if (fileType.startsWith('video/')) {
            const videoUrl = URL.createObjectURL(file);
            fileContent = `
                <div class="file-attachment video-attachment">
                    <video controls class="attached-video">
                        <source src="${videoUrl}" type="${fileType}">
                        Your browser does not support the video tag.
                    </video>
                    <div class="file-info">
                        <span class="file-name">${fileName}</span>
                        <span class="file-size">${fileSize}</span>
                    </div>
                </div>
            `;
        } else if (fileType.startsWith('audio/')) {
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
        } else {
            // Generic file attachment
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

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble file-bubble">
                    ${fileContent}
                </div>
                <span class="message-time">${fileMessage.time}</span>
            </div>
        `;

        // Add message to chat
        chatMessages.appendChild(messageDiv);
        saveMessageToStorage(fileMessage);
        scrollToBottom();

        // Reset file input
        fileInput.value = '';
    }

    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Global function for downloading files
    window.downloadFile = function(fileName, url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Global function to clear chat (can be called from console)
    window.clearChat = function() {
        if (confirm('Are you sure you want to clear all chat messages?')) {
            clearChatHistory();
        }
    };
});