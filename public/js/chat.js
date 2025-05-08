/**
 * Chat functionality untuk AnaphygonAsk
 */
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Fungsi untuk logging
    function logDebug(message, data = null) {
        if (data) {
            console.log(`[Debug] ${message}`, data);
        } else {
            console.log(`[Debug] ${message}`);
        }
    }

    // Fungsi untuk menambahkan pesan ke chat
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');

        // Mengganti newline dengan <br> untuk tampilan yang lebih baik
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Fungsi untuk menambahkan animasi "sedang mengetik"
    function addThinkingAnimation() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('thinking');
        thinkingDiv.id = 'thinkingAnimation';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            thinkingDiv.appendChild(dot);
        }

        chatMessages.appendChild(thinkingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Fungsi untuk menghapus animasi "sedang mengetik"
    function removeThinkingAnimation() {
        const thinkingDiv = document.getElementById('thinkingAnimation');
        if (thinkingDiv) {
            thinkingDiv.remove();
        }
    }

    // Fungsi untuk memproses input pengguna
    async function processUserInput() {
        const text = userInput.value.trim();

        if (text === '') return;

        // Tambahkan pesan pengguna ke chat
        addMessage(text, true);

        // Reset input
        userInput.value = '';

        // Tampilkan animasi AI sedang berpikir
        addThinkingAnimation();

        try {
            // API endpoint untuk chat
            const apiEndpoint = '/api/chat';
            logDebug('Sending request to:', apiEndpoint);

            // Kirim permintaan ke server
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: text })
            });

            // Cek status response
            if (!response.ok) {
                const errorText = await response.text();
                logDebug('Response not OK. Status:', response.status);
                logDebug('Error response text:', errorText);

                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse response sebagai JSON
            const responseData = await response.json();
            logDebug('Received response:', responseData);

            // Hapus animasi berpikir
            removeThinkingAnimation();

            // Cek apakah respons berhasil
            if (responseData.success) {
                // Tambahkan jawaban AI ke chat
                addMessage(responseData.message, false);
            } else {
                // Jika gagal, tampilkan pesan error
                const errorMessage = responseData.message || 'Terjadi kesalahan pada server';
                addMessage(`Error: ${errorMessage}`, false);
            }
        } catch (error) {
            logDebug('Caught error:', error);

            // Hapus animasi berpikir
            removeThinkingAnimation();

            // Tampilkan pesan error
            addMessage(`Terjadi kesalahan: ${error.message}. Silakan coba lagi nanti.`, false);
        }
    }

    // Event listener untuk tombol kirim
    sendButton.addEventListener('click', processUserInput);

    // Event listener untuk enter key
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            processUserInput();
        }
    });

    // Auto-focus input
    userInput.focus();

    // Pesan selamat datang yang lebih informatif
    const welcomeMessage = document.querySelector('.ai-message');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = 'Halo! Saya asisten AI dari AnaphygonAsk yang ditenagai oleh Gemini. Silakan tanyakan apa saja, dan saya akan coba menjawabnya. <br><br>Contoh pertanyaan yang bisa Anda ajukan:<br>- "Apa itu kecerdasan buatan?"<br>- "Bagaimana cara membuat website?"<br>- "Ceritakan tentang Bandung"';
    }
});