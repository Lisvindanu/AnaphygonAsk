/**
 * Enhanced Chat functionality untuk AnaphygonAsk with local highlight.js
 * Complete Working Version - Uses existing files
 */
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // State management
    let conversationHistory = [];
    let chatSessions = [];
    let currentSessionId = null;
    let isProcessing = false;

    // Initialize everything
    initializeChatSessions();
    loadCurrentSession();
    
    // Wait for highlight.js to load
    setTimeout(() => {
        if (typeof window.hljs !== 'undefined') {
            console.log('✅ highlight.js loaded successfully from local files');
        } else {
            console.warn('⚠️ highlight.js not loaded, using fallback parser');
        }
    }, 200);


    function parseMarkdown(text) {
        if (!text || typeof text !== 'string') return '';

        try {
            // Decode HTML entities terlebih dahulu jika sudah ter-encode
            text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

            // Use highlight.js if available, otherwise fallback
            if (typeof window.hljs !== 'undefined') {
                return parseMarkdownWithHighlightJS(text);
            } else {
                return basicMarkdownParse(text);
            }
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return basicMarkdownParse(text);
        }
    }


    function parseMarkdownWithHighlightJS(text) {
        // Store original line breaks dalam code blocks
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        const codeBlocks = [];
        let codeBlockIndex = 0;

        // Extract dan preserve code blocks
        text = text.replace(codeBlockRegex, function(match, language, code) {
            const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;

            // 🔑 PRESERVE ORIGINAL FORMATTING - jangan trim berlebihan
            const cleanCode = code.replace(/^\n/, '').replace(/\n$/, ''); // Remove only leading/trailing newlines

            codeBlocks[codeBlockIndex] = {
                language: language || 'text',
                code: cleanCode,
                originalMatch: match
            };

            codeBlockIndex++;
            return placeholder;
        });

        // Escape HTML in remaining text (non-code content)
        text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Restore dan process code blocks
        for (let i = 0; i < codeBlocks.length; i++) {
            const placeholder = `__CODE_BLOCK_${i}__`;
            const block = codeBlocks[i];
            const lang = block.language.toLowerCase();
            const codeId = generateCodeId();

            let highlightedCode = block.code;

            // Try highlight.js dengan better error handling
            if (lang && window.hljs && hljs.getLanguage && hljs.getLanguage(lang)) {
                try {
                    const result = hljs.highlight(block.code, { language: lang, ignoreIllegals: true });
                    highlightedCode = result.value;
                } catch (error) {
                    console.warn('Highlighting failed for', lang, ':', error);
                    // Escape HTML for plain code
                    highlightedCode = block.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
            } else if (window.hljs && hljs.highlightAuto) {
                try {
                    const result = hljs.highlightAuto(block.code);
                    highlightedCode = result.value;
                } catch (error) {
                    console.warn('Auto-highlighting failed:', error);
                    highlightedCode = block.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
            } else {
                // Plain text - escape HTML
                highlightedCode = block.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            // 🎯 ENHANCED CODE BLOCK HTML - dengan data attributes untuk better copying
            const processedCodeBlock = `<div class="code-block-container" data-language="${lang}" data-original-code="${encodeURIComponent(block.code)}">
            <div class="code-block-header">
                <span class="code-language">${(lang || 'TEXT').toUpperCase()}</span>
                <button class="copy-code-btn" onclick="copyCodeBlock('${codeId}')" title="Copy code with proper formatting">
                    <span class="copy-icon">📋</span>
                    <span class="copy-text">Copy</span>
                </button>
            </div>
            <pre><code id="${codeId}" class="hljs" data-original="${encodeURIComponent(block.code)}">${highlightedCode}</code></pre>
        </div>`;

            text = text.replace(placeholder, processedCodeBlock);
        }

        return processOtherMarkdown(text);
    }

    function basicMarkdownParse(text) {
        // Escape HTML first
        text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Code blocks without highlighting
        text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, function(match, language, code) {
            const lang = language || 'text';
            const codeId = generateCodeId();
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

        return processOtherMarkdown(text);
    }

    function processOtherMarkdown(text) {
        // Inline code
        text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        
        // Bold and italic
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
        text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_\n]+)_/g, '<em>$1</em>');

        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Headings
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Lists
        text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
        text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
        text = text.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
        
        // Wrap consecutive <li> elements in <ul>
        text = text.replace(/(<li>.*?<\/li>[\s\S]*?)+/g, function(match) {
            return '<ul>' + match + '</ul>';
        });

        // Blockquotes
        text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

        // Horizontal rules
        text = text.replace(/^---$/gm, '<hr>');

        // Line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    function generateCodeId() {
        return 'code-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ========================================================================
    // CHAT SESSION MANAGEMENT
    // ========================================================================

    function initializeChatSessions() {
        try {
            const savedSessions = localStorage.getItem('anaphygon_chat_sessions');
            if (savedSessions) {
                chatSessions = JSON.parse(savedSessions);
            }

            if (chatSessions.length === 0) {
                createNewChatSession();
            } else {
                currentSessionId = chatSessions[chatSessions.length - 1].id;
            }
        } catch (err) {
            console.error('Failed to initialize chat sessions:', err);
            createNewChatSession();
        }
    }

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
    }

    function loadCurrentSession() {
        const currentSession = getCurrentSession();
        if (currentSession) {
            conversationHistory = currentSession.messages || [];
            restoreMessagesFromHistory();
        }
    }

    function getCurrentSession() {
        return chatSessions.find(session => session.id === currentSessionId);
    }

    function saveChatSessions() {
        try {
            const currentSession = getCurrentSession();
            if (currentSession) {
                currentSession.messages = conversationHistory;
                currentSession.lastActive = new Date().toISOString();

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
            console.error('Failed to save chat sessions:', err);
        }
    }

    function switchToSession(sessionId) {
        if (sessionId === currentSessionId) return;

        saveChatSessions();
        currentSessionId = sessionId;
        loadCurrentSession();
        updateSessionSelector();
    }

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

            if (sessionId === currentSessionId) {
                currentSessionId = chatSessions[chatSessions.length - 1].id;
                loadCurrentSession();
            }

            saveChatSessions();
            showNotification('Chat berhasil dihapus', 'success');
        }
    }

    function updateSessionSelector() {
        let sessionSelector = document.getElementById('sessionSelector');

        if (!sessionSelector) {
            sessionSelector = createSessionSelector();
        }

        const sessionList = sessionSelector.querySelector('.session-list');
        sessionList.innerHTML = '';

        chatSessions.slice().reverse().forEach(session => {
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

        const sessionCount = sessionSelector.querySelector('.session-count');
        if (sessionCount) {
            sessionCount.textContent = `${chatSessions.length} chat`;
        }
    }

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

        const chatContainer = document.querySelector('.chat-container');
        chatContainer.parentNode.insertBefore(selectorContainer, chatContainer);

        document.getElementById('newChatBtn').addEventListener('click', startNewChat);
        document.getElementById('toggleSessions').addEventListener('click', toggleSessionList);

        return selectorContainer;
    }

    function startNewChat() {
        createNewChatSession();
        clearChatUI();
        showWelcomeMessage();
        userInput.focus();
        showNotification('Chat baru dimulai! 🎉', 'success');
    }

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

    function clearChatUI() {
        chatMessages.innerHTML = '';
    }

    function updateChatUI() {
        clearChatUI();
        restoreMessagesFromHistory();
        if (conversationHistory.length === 0) {
            showWelcomeMessage();
        }
    }

    function restoreMessagesFromHistory() {
        conversationHistory.forEach(msg => {
            addMessage(msg.text, msg.isUser, false);
        });
    }

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

    // ========================================================================
    // MESSAGE HANDLING
    // ========================================================================

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
            saveChatSessions();
        }

        return messageId;
    }


    async function copyMessage(text) {
        try {
            // Decode HTML entities dan tambahkan word wrapping
            let plainText = text
                .replace(/<[^>]*>/g, '')           // Remove HTML tags
                .replace(/&lt;/g, '<')            // Decode &lt;
                .replace(/&gt;/g, '>')            // Decode &gt;
                .replace(/&amp;/g, '&')           // Decode &amp; (harus terakhir)
                .replace(/&quot;/g, '"')          // Decode &quot;
                .replace(/&#x27;/g, "'")          // Decode &#x27;
                .replace(/&#x2F;/g, '/');         // Decode &#x2F;

            // Add line breaks untuk mencegah teks terlalu panjang
            // Break setiap 80 karakter pada space terdekat
            plainText = addWordWrap(plainText, 80);

            await navigator.clipboard.writeText(plainText);
            showNotification('Message copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy message:', error);
            showNotification('Failed to copy message', 'error');

            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = plainText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

// Function untuk menambahkan word wrap
    function addWordWrap(text, maxLength = 80) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            // Jika menambah word ini akan melebihi maxLength, buat line baru
            if (currentLine.length + word.length + 1 > maxLength && currentLine.length > 0) {
                lines.push(currentLine.trim());
                currentLine = word;
            } else {
                currentLine += (currentLine.length > 0 ? ' ' : '') + word;
            }
        }

        // Tambahkan line terakhir
        if (currentLine.length > 0) {
            lines.push(currentLine.trim());
        }

        return lines.join('\n');
    }

    function deleteMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
            conversationHistory = conversationHistory.filter(msg => msg.id !== messageId);
            saveChatSessions();
            showNotification('Message deleted', 'info');
        }
    }

    // ========================================================================
    // CODE BLOCK FUNCTIONALITY
    // ========================================================================

    async function copyCodeBlock(codeId) {
        try {
            const codeElement = document.getElementById(codeId);
            if (!codeElement) {
                console.error('Code element not found:', codeId);
                showNotification('Error: Code block not found', 'error');
                return;
            }

            // 🔑 SOLUSI UTAMA: Ambil teks dari innerHTML dan preserve line breaks
            let codeText = '';

            // Method 1: Cek apakah ada highlight.js (lebih complex HTML structure)
            if (codeElement.classList.contains('hljs') || codeElement.querySelector('.hljs-')) {
                // Untuk highlighted code, kita perlu extract teks dari struktur HTML highlight.js
                codeText = extractTextFromHighlightedCode(codeElement);
            } else {
                // Untuk plain code block, ambil dari textContent tapi preserve line breaks
                codeText = codeElement.textContent || codeElement.innerText;
            }

            // Method 2: Jika masih dalam satu line, coba alternative extraction
            if (!codeText.includes('\n') && codeText.length > 100) {
                codeText = extractTextFromCodeElement(codeElement);
            }

            // Method 3: Last resort - manual line break detection
            if (!codeText.includes('\n')) {
                codeText = addLineBreaksToCode(codeText);
            }

            // Clean up dan trim
            codeText = codeText.trim();

            // Copy ke clipboard
            await navigator.clipboard.writeText(codeText);

            // Update UI feedback
            updateCopyButtonState(codeElement);

            showNotification('Code copied with proper formatting! 🎉', 'success');
            console.log('✅ Copied code preview:', codeText.substring(0, 100) + '...');

        } catch (error) {
            console.error('Failed to copy code:', error);
            showNotification('Failed to copy code to clipboard', 'error');

            // Fallback method
            fallbackCopyMethod(codeId);
        }
    }

// 🛠️ HELPER FUNCTIONS untuk extract text dengan proper formatting

    function extractTextFromHighlightedCode(codeElement) {
        // Clone element to avoid modifying original
        const clonedElement = codeElement.cloneNode(true);

        // Remove highlight.js specific elements yang tidak perlu
        const elementsToRemove = clonedElement.querySelectorAll('.hljs-comment, .hljs-meta');
        elementsToRemove.forEach(el => {
            // Keep the text content but remove styling
            const textNode = document.createTextNode(el.textContent);
            el.parentNode.replaceChild(textNode, el);
        });

        // Convert <br> tags to line breaks
        const brElements = clonedElement.querySelectorAll('br');
        brElements.forEach(br => {
            br.replaceWith('\n');
        });

        // Convert block elements to line breaks
        const blockElements = clonedElement.querySelectorAll('div, p');
        blockElements.forEach(block => {
            block.appendChild(document.createTextNode('\n'));
        });

        return clonedElement.textContent || clonedElement.innerText;
    }

    function extractTextFromCodeElement(codeElement) {
        // Jika element memiliki childNodes, iterate dan build text manually
        let text = '';

        function walkNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Add line break untuk certain elements
                if (['DIV', 'P', 'BR'].includes(node.tagName)) {
                    text += '\n';
                }

                // Recursively process child nodes
                for (let child of node.childNodes) {
                    walkNodes(child);
                }

                // Add line break after block elements
                if (['DIV', 'P'].includes(node.tagName)) {
                    text += '\n';
                }
            }
        }

        walkNodes(codeElement);

        // Clean up multiple consecutive line breaks
        return text.replace(/\n{3,}/g, '\n\n').trim();
    }

    function addLineBreaksToCode(text) {
        // Heuristic untuk menambah line breaks pada common code patterns

        // JavaScript/TypeScript patterns
        text = text.replace(/;(?!\s*$)/g, ';\n');
        text = text.replace(/{(?!\s*})/g, '{\n');
        text = text.replace(/}(?!\s*[,;)])/g, '\n}');

        // HTML patterns
        text = text.replace(/>/g, '>\n');
        text = text.replace(/<(?!\/)/g, '\n<');

        // CSS patterns
        text = text.replace(/}/g, '\n}\n');
        text = text.replace(/{/g, ' {\n');

        // Python patterns
        text = text.replace(/:/g, ':\n');

        // Clean up excessive line breaks
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/^\n+/, ''); // Remove leading newlines

        return text.trim();
    }

    function updateCopyButtonState(codeElement) {
        const copyBtn = codeElement.closest('.code-block-container')?.querySelector('.copy-code-btn');

        if (copyBtn) {
            const originalText = copyBtn.querySelector('.copy-text')?.textContent || 'Copy';
            const originalIcon = copyBtn.querySelector('.copy-icon')?.textContent || '📋';

            copyBtn.classList.add('copied');
            if (copyBtn.querySelector('.copy-text')) {
                copyBtn.querySelector('.copy-text').textContent = 'Copied!';
            }
            if (copyBtn.querySelector('.copy-icon')) {
                copyBtn.querySelector('.copy-icon').textContent = '✅';
            }

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                if (copyBtn.querySelector('.copy-text')) {
                    copyBtn.querySelector('.copy-text').textContent = originalText;
                }
                if (copyBtn.querySelector('.copy-icon')) {
                    copyBtn.querySelector('.copy-icon').textContent = originalIcon;
                }
            }, 2000);
        }
    }

    function fallbackCopyMethod(codeId) {
        try {
            const codeElement = document.getElementById(codeId);
            if (codeElement) {
                // Create a temporary textarea dengan value yang sudah di-format
                const tempTextarea = document.createElement('textarea');
                tempTextarea.value = extractTextFromCodeElement(codeElement);
                tempTextarea.style.position = 'fixed';
                tempTextarea.style.left = '-9999px';
                tempTextarea.style.top = '-9999px';

                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                tempTextarea.setSelectionRange(0, 99999); // For mobile

                const successful = document.execCommand('copy');
                document.body.removeChild(tempTextarea);

                if (successful) {
                    showNotification('Code copied using fallback method! 📋', 'info');
                    updateCopyButtonState(codeElement);
                } else {
                    showNotification('Please manually select and copy the code', 'warning');
                }
            }
        } catch (fallbackError) {
            console.error('Fallback copy also failed:', fallbackError);
            showNotification('Copy failed. Please select text manually and use Ctrl+C', 'error');
        }
    }

    // ========================================================================
    // UI UTILITIES
    // ========================================================================

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;

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

        const typeColors = {
            success: 'linear-gradient(135deg, #2ea043, #2ea043)',
            error: 'linear-gradient(135deg, #da3633, #da3633)',
            warning: 'linear-gradient(135deg, #fb8500, #fb8500)',
            info: 'linear-gradient(135deg, #58a6ff, #58a6ff)'
        };

        notification.style.background = typeColors[type] || typeColors.info;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

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

    function scrollToBottom() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

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

    function clearCurrentChatHistory() {
        if (confirm('Hapus semua pesan di chat ini?')) {
            conversationHistory = [];
            clearChatUI();
            showWelcomeMessage();
            saveChatSessions();
            showNotification('Chat history cleared', 'info');
        }
    }

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

    // ========================================================================
    // MAIN CHAT FUNCTIONALITY
    // ========================================================================

    async function processUserInput() {
        const text = userInput.value.trim();

        if (!validateInput(text) || isProcessing) return;

        isProcessing = true;
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';

        addMessage(text, true);
        userInput.value = '';
        addThinkingAnimation();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: text,
                    context: conversationHistory.slice(-10)
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
            console.error('Error:', error);
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
                <p><strong>Test:</strong> Ketik <code>testCopyFunction()</code> di console untuk test markdown!</p>
            </div>
        `;

        const welcomeDiv = document.createElement('div');
        welcomeDiv.classList.add('message', 'ai-message');
        welcomeDiv.innerHTML = welcomeMessage;
        chatMessages.appendChild(welcomeDiv);
    }

    function testCopyFunction() {
        const testMarkdown = `# Test Enhanced Markdown dengan highlight.js

## Fitur yang ditest:

### 1. Code Blocks dengan Syntax Highlighting
\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return true;
}

greet('World');
\`\`\`

### 2. Python Code
\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

print(calculate_fibonacci(10))
\`\`\`

### 3. HTML Code
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is a test page.</p>
</body>
</html>
\`\`\`

### 4. CSS Code
\`\`\`css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
}
\`\`\`

### 5. Inline Code
Ini adalah \`console.log('inline code')\` dalam kalimat.

### 6. Table
| Language | Extension | Highlighted |
|----------|-----------|-------------|
| JavaScript | .js | ✅ |
| Python | .py | ✅ |
| HTML | .html | ✅ |
| CSS | .css | ✅ |

### 7. Links dan Formatting
Ini adalah **bold text** dan *italic text*.

Link ke [Google](https://google.com) dan auto-link: https://github.com

### 8. Lists
- Item 1
- Item 2
- Item 3

1. Numbered item 1
2. Numbered item 2

### 9. Blockquote
> Ini adalah blockquote yang di-enhance
> dengan styling yang lebih baik.

---

✨ **Semua fitur di atas menggunakan highlight.js lokal!** ✨

🔥 **Try copying the code blocks above!** 🔥
`;

        addMessage(testMarkdown, false);
        showNotification('Test markdown dengan highlight.js berhasil ditambahkan!', 'success');
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    sendButton.addEventListener('click', processUserInput);

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            processUserInput();
        }
    });

    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            userInput.focus();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            startNewChat();
        }

        if (e.key === 'Escape') {
            userInput.value = '';
            userInput.blur();
        }
    });

    // ========================================================================
    // GLOBAL FUNCTIONS
    // ========================================================================

    // Make functions globally accessible
    window.switchToSession = switchToSession;
    window.deleteChatSession = deleteChatSession;
    window.startNewChat = startNewChat;
    window.clearCurrentChatHistory = clearCurrentChatHistory;
    window.copyCodeBlock = copyCodeBlock;
    window.testCopyFunction = testCopyFunction;
    window.parseMarkdown = parseMarkdown;

    // Initialize
    userInput.focus();
    if (conversationHistory.length === 0) {
        showWelcomeMessage();
    }

    console.log('🚀 AnaphygonAsk Chat System Loaded with highlight.js integration');
    console.log('📝 Available test function: testCopyFunction()');
    console.log('💡 Keyboard shortcuts: Ctrl+K (focus), Ctrl+N (new chat), Esc (clear input)');
});