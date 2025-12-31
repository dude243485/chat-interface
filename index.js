// Index Page Javascript - Handles local storage cleanup and initialization

// Wait for the DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', function () {

    // Local Storage Cleanup

    // Clear local storage for fresh start
    function clearStorageForFreshStart() {
        // Clear all chat-related local storage keys
        localStorage.removeItem('chatContacts');        // Contact list data
        localStorage.removeItem('chatHistory');         // All chat message history
        localStorage.removeItem('chatMessages');        // Legacy message storage
        localStorage.removeItem('currentChatContact');  // Currently selected contact

        console.log('Local storage cleared for fresh start');
    }

    // Initialization

    // Clear storage when page loads
    clearStorageForFreshStart();

    // Initialize dark mode on landing page
    initializeDarkMode();

    // Dark Mode Initialization

    // Initialize Dark Mode
    function initializeDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
        }
    }

    // Future Enhancements

    // Potential future features: animations, validation, etc.

});