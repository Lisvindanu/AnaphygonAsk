/**
 * Enhanced Chat functionality untuk AnaphygonAsk
 * UPGRADED: Added New Chat feature + Code Block Copy functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // UPGRADED: State management dengan chat sessions
    let conversationHistory = [];
    let chatSessions = []; // Store multiple chat sessions
    let currentSessionId = null;
    let isProcessing = false;

    // UPGRADED: Initialize dengan session management
    initializeChatSessions();
    loadCurrentSession();

    // Fungsi untuk logging
    function logDebug(message, data = null) {
        if (data) {
            console.log(`[Debug] ${message}`, data);
        } else {
            console.log(`[Debug] ${message}`);
        }
    }

    // UPGRADED: Chat session management
    function initializeChatSessions() {
        try {
            const savedSessions = localStorage.getItem('anaphygon_chat_sessions');
            if (savedSessions) {
                chatSessions = JSON.parse(savedSessions);
            }

            // If no sessions exist, create first session
            if (chatSessions.length === 0) {
                createNewChatSession();
            } else {
                // Load the most recent session
                currentSessionId = chatSessions[chatSessions.length - 1].id;
            }

        } catch (err) {
            logDebug('Failed to initialize chat sessions:', err);
            createNewChatSession();
        }
    }

    // UPGRADED: Create new chat session
    function createNewChatSession() {
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newSession = {
            id: sessionId,
            title: 'Chat Baru',
            messages: [],
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        chatSessions.push(newSession);
        currentSessionId = sessionId;
        conversationHistory = [];

        saveChatSessions();
        updateChatUI();
        updateSessionSelector();

        logDebug('Created new chat session:', sessionId);
    }

    // UPGRADED: Load current session
    function loadCurrentSession() {
        const currentSession = getCurrentSession();
        if (currentSession) {
            conversationHistory = currentSession.messages || [];
            restoreMessagesFromHistory();
        }
    }

    // UPGRADED: Get current session
    function getCurrentSession() {
        return chatSessions.find(session => session.id === currentSessionId);
    }

    // UPGRADED: Save chat sessions
    function saveChatSessions() {
        try {
            // Update current session
            const currentSession = getCurrentSession();
            if (currentSession) {
                currentSession.messages = conversationHistory;
                currentSession.lastActive = new Date().toISOString();

                // Auto-generate title from first user message
                if (currentSession.title === 'Chat Baru' && conversationHistory.length > 0) {
                    const firstUserMessage = conversationHistory.find(msg => msg.isUser);
                    if (firstUserMessage) {
                        currentSession.title = firstUserMessage.text.substring(0, 30) +
                            (firstUserMessage.text.length > 30 ? '...' : '');
                    }
                }
            }

            localStorage.setItem('anaphygon_chat_sessions', JSON.stringify(chatSessions));
            updateSessionSelector();
        } catch (err) {
            logDebug('Failed to save chat sessions:', err);
        }
    }

    // UPGRADED: Switch to different session
    function switchToSession(sessionId) {
        if (sessionId === currentSessionId) return;

        // Save current session first
        saveChatSessions();

        // Switch to new session
        currentSessionId = sessionId;
        loadCurrentSession();
        updateSessionSelector();

        logDebug('Switched to session:', sessionId);
    }

    // UPGRADED: Delete chat session
    function deleteChatSession(sessionId) {
        if (chatSessions.length <= 1) {
            showNotification('Tidak bisa menghapus satu-satunya chat', 'warning');
            return;
        }

        const sessionIndex = chatSessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) return;

        const sessionTitle = chatSessions[sessionIndex].title;

        if (confirm(`Hapus chat "${sessionTitle}"?`)) {
            chatSessions.splice(sessionIndex, 1);

            // If deleted current session, switch to another
            if (sessionId === currentSessionId) {
                currentSessionId = chatSessions[chatSessions.length - 1].id;
                loadCurrentSession();
            }

            saveChatSessions();
            showNotification('Chat berhasil dihapus', 'success');
        }
    }

    // UPGRADED: Update session selector UI
    function updateSessionSelector() {
        let sessionSelector = document.getElementById('sessionSelector');

        if (!sessionSelector) {
            // Create session selector if doesn't exist
            sessionSelector = createSessionSelector();
        }

        // Update session list
        const sessionList = sessionSelector.querySelector('.session-list');
        sessionList.innerHTML = '';

        chatSessions.slice().reverse().forEach(session => { // Reverse to show newest first
            const sessionItem = document.createElement('div');
            sessionItem.className = `session-item ${session.id === currentSessionId ? 'active' : ''}`;
            sessionItem.innerHTML = `
                <div class="session-info" onclick="switchToSession('${session.id}')">
                    <div class="session-title">${session.title}</div>
                    <div class="session-time">${formatTime(session.lastActive)}</div>
                </div>
                <button class="session-delete" onclick="deleteChatSession('${session.id}')" title="Hapus chat">
                    🗑️
                </button>
            `;
            sessionList.appendChild(sessionItem);
        });

        // Update active session count
        const sessionCount = sessionSelector.querySelector('.session-count');
        if (sessionCount) {
            sessionCount.textContent = `${chatSessions.length} chat`;
        }
    }

    // UPGRADED: Create session selector UI
    function createSessionSelector() {
        const selectorContainer = document.createElement('div');
        selectorContainer.id = 'sessionSelector';
        selectorContainer.className = 'session-selector';
        selectorContainer.innerHTML = `
            <div class="session-header">
                <div class="session-title-bar">
                    <span class="session-label">💬 Chat Sessions</span>
                    <span class="session-count">${chatSessions.length} chat</span>
                </div>
                <div class="session-actions">
                    <button id="newChatBtn" class="btn-new-chat" title="Mulai chat baru">
                        ➕ New Chat
                    </button>
                    <button id="toggleSessions" class="btn-toggle" title="Toggle chat list">
                        📋
                    </button>
                </div>
            </div>
            <div class="session-list-container">
                <div class="session-list"></div>
            </div>
        `;

        // Insert before chat container
        const chatContainer = document.querySelector('.chat-container');
        chatContainer.parentNode.insertBefore(selectorContainer, chatContainer);

        // Add event listeners
        document.getElementById('newChatBtn').addEventListener('click', startNewChat);
        document.getElementById('toggleSessions').addEventListener('click', toggleSessionList);

        return selectorContainer;
    }

    // UPGRADED: Start new chat
    function startNewChat() {
        createNewChatSession();
        clearChatUI();
        showWelcomeMessage();
        userInput.focus();
        showNotification('Chat baru dimulai! 🎉', 'success');
    }

    // UPGRADED: Toggle session list visibility
    function toggleSessionList() {
        const sessionList = document.querySelector('.session-list-container');
        const toggleBtn = document.getElementById('toggleSessions');

        if (sessionList.style.display === 'none' || !sessionList.style.display) {
            sessionList.style.display = 'block';
            toggleBtn.textContent = '🔼';
            toggleBtn.title = 'Sembunyikan daftar chat';
        } else {
            sessionList.style.display = 'none';
            toggleBtn.textContent = '📋';
            toggleBtn.title = 'Tampilkan daftar chat';
        }
    }

    // UPGRADED: Clear chat UI
    function clearChatUI() {
        chatMessages.innerHTML = '';
    }

    // UPGRADED: Update chat UI after session change
    function updateChatUI() {
        clearChatUI();
        restoreMessagesFromHistory();
        if (conversationHistory.length === 0) {
            showWelcomeMessage();
        }
    }

    // UPGRADED: Restore messages from history
    function restoreMessagesFromHistory() {
        conversationHistory.forEach(msg => {
            addMessage(msg.text, msg.isUser, false); // false = don't save again
        });
    }

    // UPGRADED: Format time for display
    function formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;

        return date.toLocaleDateString('id-ID');
    }

    // ENHANCED: Markdown parser with proper code block support
    function parseMarkdown(text) {
        // Escape HTML first
        text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // ENHANCED: Code blocks with language detection and copy button
        text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, function(match, language, code) {
            const lang = language || 'text';
            const codeId = 'code-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const cleanCode = code.trim();

            return `<div class="code-block-container" data-language="${lang}">
                <div class="code-block-header">
                    <span class="code-language">${lang.toUpperCase()}</span>
                    <button class="copy-code-btn" onclick="copyCodeBlock('${codeId}')">
                        <span class="copy-icon">📋</span>
                        <span class="copy-text">Copy</span>
                    </button>
                </div>
                <pre><code id="${codeId}">${cleanCode}</code></pre>
            </div>`;
        });

        // Inline code (`code`)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold (**text** or __text__)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic (*text* or _text_)
        text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

        // Links [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Headings
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Lists
        text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
        text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
        text = text.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');

        // Wrap consecutive <li> elements in <ul>
        text = text.replace(/(<li>.*<\/li>)/gs, function(match) {
            return '<ul>' + match + '</ul>';
        });

        // Line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // NEW: Copy code block functionality
    async function copyCodeBlock(codeId) {
        try {
            const codeElement = document.getElementById(codeId);
            if (!codeElement) {
                console.error('Code element not found:', codeId);
                return;
            }

            const codeText = codeElement.textContent || codeElement.innerText;
            await navigator.clipboard.writeText(codeText);

            // Visual feedback
            const copyBtn = codeElement.closest('.code-block-container').querySelector('.copy-code-btn');
            if (copyBtn) {
                const originalText = copyBtn.querySelector('.copy-text').textContent;
                const originalIcon = copyBtn.querySelector('.copy-icon').textContent;

                copyBtn.classList.add('copied');
                copyBtn.querySelector('.copy-text').textContent = 'Copied!';
                copyBtn.querySelector('.copy-icon').textContent = '✅';

                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.querySelector('.copy-text').textContent = originalText;
                    copyBtn.querySelector('.copy-icon').textContent = originalIcon;
                }, 2000);
            }

            showNotification('Code copied to clipboard! 📋', 'success');

        } catch (err) {
            console.error('Failed to copy code:', err);
            showNotification('Failed to copy code', 'error');

            // Fallback for older browsers
            try {
                const codeElement = document.getElementById(codeId);
                const range = document.createRange();
                range.selectNode(codeElement);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                document.execCommand('copy');
                window.getSelection().removeAllRanges();
                showNotification('Code copied to clipboard! 📋', 'success');
            } catch (fallbackErr) {
                console.error('Fallback copy also failed:', fallbackErr);
            }
        }
    }

    // Create message element with actions
    function createMessageElement(text, isUser, messageId) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        messageDiv.setAttribute('data-message-id', messageId);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.innerHTML = isUser ? text : parseMarkdown(text);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('message-actions');

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.classList.add('action-btn', 'copy-btn');
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy message';
        copyBtn.onclick = () => copyMessage(text);

        actionsDiv.appendChild(copyBtn);

        // Delete button (only for user messages)
        if (isUser) {
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('action-btn', 'delete-btn');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Delete message';
            deleteBtn.onclick = () => deleteMessage(messageId);
            actionsDiv.appendChild(deleteBtn);
        }

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(actionsDiv);

        return messageDiv;
    }

    // UPGRADED: Add message to chat with session management
    function addMessage(text, isUser, save = true) {
        const messageId = Date.now() + Math.random();
        const messageElement = createMessageElement(text, isUser, messageId);

        chatMessages.appendChild(messageElement);
        scrollToBottom();

        if (save) {
            conversationHistory.push({
                id: messageId,
                text: text,
                isUser: isUser,
                timestamp: new Date().toISOString()
            });
            saveChatSessions(); // Save to current session
        }

        return messageId;
    }

    // Copy message to clipboard
    async function copyMessage(text) {
        try {
            // Strip HTML tags for plain text copy
            const plainText = text.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            await navigator.clipboard.writeText(plainText);
            showNotification('Message copied to clipboard!', 'success');
        } catch (err) {
            logDebug('Failed to copy message:', err);
            showNotification('Failed to copy message', 'error');
        }
    }

    // UPGRADED: Delete message with session update
    function deleteMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
            conversationHistory = conversationHistory.filter(msg => msg.id !== messageId);
            saveChatSessions();
            showNotification('Message deleted', 'info');
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;

        // Enhanced notification styling
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '10000',
            transition: 'all 0.3s ease',
            transform: 'translateX(100%)',
            opacity: '0'
        });

        // Type-specific styling
        const typeColors = {
            success: 'linear-gradient(135deg, #7bed9f, #7bed9f)',
            error: 'linear-gradient(135deg, #ff4757, #ff4757)',
            warning: 'linear-gradient(135deg, #ffa502, #ffa502)',
            info: 'linear-gradient(135deg, #4a9eff, #4a9eff)'
        };

        notification.style.background = typeColors[type] || typeColors.info;

        document.body.appendChild(notification);

        // Show animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Hide animation
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Smooth scroll to bottom
    function scrollToBottom() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Enhanced thinking animation
    function addThinkingAnimation() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('thinking');
        thinkingDiv.id = 'thinkingAnimation';

        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('dots-container');

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.style.animationDelay = `${i * 0.2}s`;
            dotsContainer.appendChild(dot);
        }

        thinkingDiv.appendChild(dotsContainer);
        chatMessages.appendChild(thinkingDiv);
        scrollToBottom();
    }

    function removeThinkingAnimation() {
        const thinkingDiv = document.getElementById('thinkingAnimation');
        if (thinkingDiv) {
            thinkingDiv.remove();
        }
    }

    // UPGRADED: Clear chat history for current session only
    function clearCurrentChatHistory() {
        if (confirm('Hapus semua pesan di chat ini?')) {
            conversationHistory = [];
            clearChatUI();
            showWelcomeMessage();
            saveChatSessions();
            showNotification('Chat history cleared', 'info');
        }
    }

    // Enhanced input validation
    function validateInput(text) {
        if (!text || text.trim().length === 0) {
            showNotification('Please enter a message', 'warning');
            return false;
        }

        if (text.length > 2000) {
            showNotification('Message too long (max 2000 characters)', 'warning');
            return false;
        }

        return true;
    }

    // Process user input with enhanced error handling
    async function processUserInput() {
        const text = userInput.value.trim();

        if (!validateInput(text) || isProcessing) return;

        isProcessing = true;
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';

        // Add user message
        addMessage(text, true);
        userInput.value = '';

        // Show thinking animation
        addThinkingAnimation();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: text,
                    context: conversationHistory.slice(-10) // Send last 10 messages for context
                })
            });

            const responseData = await response.json();
            removeThinkingAnimation();

            if (!response.ok) {
                throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
            }

            if (responseData.success) {
                addMessage(responseData.message, false);
            } else {
                throw new Error(responseData.message || 'Unknown error occurred');
            }

        } catch (error) {
            logDebug('Error:', error);
            removeThinkingAnimation();

            let errorMessage = 'Sorry, something went wrong. Please try again.';

            if (error.message.includes('429')) {
                errorMessage = 'You\'re sending messages too quickly. Please wait a moment before trying again.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            addMessage(errorMessage, false);
            showNotification(errorMessage, 'error');
        } finally {
            isProcessing = false;
            sendButton.disabled = false;
            sendButton.textContent = 'Kirim';
            userInput.focus();
        }
    }

    // UPGRADED: Show welcome message
    function showWelcomeMessage() {
        const welcomeMessage = `
            <div class="welcome-content">
                <h3>👋 Welcome to AnaphygonAsk!</h3>
                <p>Saya adalah asisten AI Anda. Saya dapat membantu dengan:</p>
                <ul>
                    <li>📚 Pertanyaan pengetahuan umum</li>
                    <li>💻 Programming dan teknologi</li>
                    <li>🌍 Informasi terkini</li>
                    <li>🎯 Problem solving dan analisis</li>
                </ul>
                <p><strong>Tips:</strong> Gunakan <kbd>Ctrl+K</kbd> untuk fokus ke input field!</p>
            </div>
        `;

        const welcomeDiv = document.createElement('div');
        welcomeDiv.classList.add('message', 'ai-message');
        welcomeDiv.innerHTML = welcomeMessage;
        chatMessages.appendChild(welcomeDiv);
    }

    // NEW: Test function for code block functionality
    function testCopyFunction() {
        const testMarkdown = `Berikut adalah contoh code block:

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
\`\`\`

Dan juga code JavaScript:

\`\`\`javascript
function greet(name) {
    console.log('Hello, ' + name + '!');
}

greet('World');
\`\`\`

Inline code juga berfungsi: \`console.log('Hello')\`
        `;

        addMessage(testMarkdown, false);
        showNotification('Test code blocks added! Try copying them.', 'info');
    }

    // Event listeners
    sendButton.addEventListener('click', processUserInput);

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            processUserInput();
        }
    });

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // UPGRADED: Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            userInput.focus();
        }

        // Ctrl/Cmd + N for new chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            startNewChat();
        }

        // Esc to clear input
        if (e.key === 'Escape') {
            userInput.value = '';
            userInput.blur();
        }
    });

    // Make functions globally accessible
    window.switchToSession = switchToSession;
    window.deleteChatSession = deleteChatSession;
    window.startNewChat = startNewChat;
    window.clearCurrentChatHistory = clearCurrentChatHistory;
    window.copyCodeBlock = copyCodeBlock;
    window.testCopyFunction = testCopyFunction;
    window.parseMarkdown = parseMarkdown;

    // Auto-focus input
    userInput.focus();

    // Show welcome message if no history
    if (conversationHistory.length === 0) {
        showWelcomeMessage();
    }
});