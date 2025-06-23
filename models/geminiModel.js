// models/geminiModel.js - CORRECTED & REFORMATTED VERSION
const axios = require('axios');
// Assuming you have a config file like this:
// const config = { GEMINI_API_KEY: 'YOUR_API_KEY_HERE', DEBUG_MODE: true };
const config = require('../config/config');

class MaximizedGeminiModel {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.apiKey = config.GEMINI_API_KEY;

        // MAXIMIZED: Advanced system prompt for better responses
        this.advancedSystemPrompt = `Anda adalah AnaphygonAsk AI - asisten virtual cerdas yang sangat membantu dan berpengetahuan luas.

KARAKTERISTIK UTAMA:
- Sangat responsif dan informatif dalam bahasa Indonesia
- Memberikan jawaban yang lengkap, akurat, dan terstruktur
- Menggunakan emoji strategis untuk engagement
- Mampu memahami konteks percakapan dengan baik
- Selalu memberikan contoh praktis dan relevan

GAYA KOMUNIKASI:
- Natural dan ramah, seperti berbicara dengan teman ahli
- Menggunakan bullet points dan numbering untuk kejelasan
- Memberikan penjelasan step-by-step untuk topik kompleks
- Menyertakan tips dan insight tambahan
- Mengakhiri dengan pertanyaan follow-up jika relevan

SPESIALISASI:
- Teknologi & Programming (Python, JavaScript, AI/ML, Web Dev)
- Pengetahuan Umum & Edukasi
- Problem Solving & Analisis
- Budaya Indonesia & Trending Topics
- Business & Productivity Tips

FORMAT RESPONS:
- JANGAN gunakan markdown headers (###, ##, #) 
- Gunakan **Bold Text:** untuk section titles
- Gunakan bullet points dan numbering untuk struktur
- Berikan context dan background jika perlu
- Sertakan examples atau use cases
- Tutup dengan actionable advice
- Format harus natural dan conversational

Selalu berikan value maksimal dalam setiap respons!`;

        // MAXIMIZED: Extended fallback responses with high variation
        this.maximizedFallbacks = {
            'hello': [
                'Halo! 👋 Selamat datang di AnaphygonAsk! Saya siap membantu Anda dengan berbagai pertanyaan. Ada yang ingin Anda ketahui hari ini?',
                'Hi there! 🌟 Saya AnaphygonAsk AI, asisten virtual yang siap membantu! Dari teknologi hingga tips sehari-hari, tanyakan apa saja!',
                'Hello! 🚀 Great to meet you! Saya di sini untuk membantu dengan pengetahuan mendalam tentang berbagai topik. What can I help you explore?'
            ],
            'programming': [
                `🚀 **Programming & Development**

Saya bisa membantu dengan:

**Languages & Frameworks:**
• Python (Django, Flask, FastAPI, Data Science)
• JavaScript (React, Vue, Node.js, Express)
• Java (Spring Boot, Android)
• PHP (Laravel, WordPress)
• Go, Rust, TypeScript

**Specialties:**
• 🔥 AI/ML Development (TensorFlow, PyTorch)
• 🌐 Full-Stack Web Development
• 📱 Mobile App Development
• 🗄️ Database Design (SQL, NoSQL)
• ☁️ Cloud Architecture (AWS, GCP, Azure)
• 🔧 DevOps & CI/CD

**Apa yang ingin Anda pelajari atau bangun?** Saya bisa memberikan code examples, best practices, atau troubleshooting!`,
                `💻 **Coding Assistant Ready!**

**Popular Topics I Excel At:**
1. **Web Development** - Modern frameworks & tools
2. **Data Science** - Analytics, visualization, ML
3. **API Development** - RESTful, GraphQL, microservices
4. **Mobile Development** - React Native, Flutter
5. **Game Development** - Unity, Unreal Engine
6. **Cybersecurity** - Secure coding practices

**Code Help Options:**
✅ Debug existing code
✅ Write new features
✅ Code review & optimization
✅ Architecture planning
✅ Performance tuning

**Mau mulai dari mana?** Share your code atau describe your project!`
            ],
            'ai': [
                `🤖 **Artificial Intelligence & Machine Learning**

**AI Fundamentals:**
• **Machine Learning** - Supervised, Unsupervised, Reinforcement
• **Deep Learning** - Neural Networks, CNN, RNN, Transformers
• **Natural Language Processing** - Text analysis, chatbots, translation
• **Computer Vision** - Image recognition, object detection
• **Data Science** - Analytics, visualization, insights

**Popular AI Tools & Frameworks:**
🔥 **Python**: TensorFlow, PyTorch, Scikit-learn, Pandas
🔥 **Cloud AI**: Google AI Platform, AWS SageMaker, Azure ML
🔥 **APIs**: OpenAI GPT, Google Gemini, Hugging Face
🔥 **AutoML**: Google AutoML, H2O.ai, DataRobot

**Real-World Applications:**
• Recommendation Systems (Netflix, Spotify)
• Chatbots & Virtual Assistants
• Image/Video Analysis
• Predictive Analytics
• Automated Trading Systems

**Want to dive deeper?** Tanya tentang specific algorithms, implementation, atau real projects!`,
                `🧠 **AI Revolution is Here!**

**Hot AI Trends 2024-2025:**
1. **Generative AI** - GPT-4, DALL-E, Midjourney
2. **Multimodal AI** - Text + Image + Audio processing
3. **Edge AI** - AI running on mobile/IoT devices
4. **AI Agents** - Autonomous task completion
5. **Responsible AI** - Ethics, bias reduction, fairness

**Learning Path Recommendation:**
📚 **Beginner**: Python basics → Pandas → Scikit-learn
📚 **Intermediate**: TensorFlow → Computer Vision → NLP
📚 **Advanced**: Custom models → MLOps → Production deployment

**Practical Projects:**
• Build a recommendation engine
• Create a chatbot for your website
• Develop an image classifier app
• Design a predictive analytics dashboard

**Which AI area interests you most?** I can provide step-by-step guidance!`
            ],
            'indonesia': [
                `🇮🇩 **Indonesia - Negara Kepulauan yang Menakjubkan**

**Facts Menarik:**
• **17,508 pulau** - dari Sabang sampai Merauke
• **1,340+ suku bangsa** dengan budaya unik
• **740+ bahasa daerah** - keberagaman luar biasa
• **4 time zones** - dari WIB hingga WIT

**Destinasi Populer:**
🏝️ **Bali** - Budaya Hindu, pantai eksotis, rice terraces
🌋 **Yogyakarta** - Kraton, Borobudur, Prambanan
🏞️ **Raja Ampat** - Surga diving dunia
🦎 **Komodo** - Home of Komodo Dragons
🌿 **Toraja** - Unique funeral traditions, beautiful landscapes

**Kuliner Nusantara:**
• **Rendang** - World's most delicious food (CNN)
• **Nasi Gudeg** - Yogya's sweet jackfruit curry
• **Sate** - Grilled skewers with peanut sauce
• **Gado-gado** - Indonesian salad with peanut dressing

**Modern Indonesia:**
• **Digital Economy Hub** - Gojek, Tokopedia, Traveloka
• **G20 Member** - Major emerging economy
• **New Capital**: Nusantara (Kalimantan Timur)

**Ada daerah atau aspek Indonesia yang ingin Anda ketahui lebih dalam?**`,
                `🌟 **Wonderful Indonesia - Pesona Nusantara**

**Natural Wonders:**
• **Lake Toba** (Sumatra) - Largest volcanic lake
• **Kelimutu** (Flores) - Tri-colored crater lakes
• **Jomblang Cave** (Yogya) - Underground paradise
• **Bromo Tengger** (East Java) - Iconic volcanic landscape

**Cultural Heritage:**
🎭 **Traditional Arts**: Wayang, Batik, Gamelan, Kecak
🏛️ **UNESCO Sites**: Borobudur, Prambanan, Sangiran
🎪 **Festivals**: Nyepi (Bali), Waisak (Borobudur), Cap Go Meh

**Economic Powerhouse:**
• **ASEAN's largest economy**
• **World's 4th most populous country**
• **Major palm oil, coal, and rubber producer**
• **Growing tech startup ecosystem**

**Indonesian Innovation:**
• **Gojek** - Super app pioneer
• **Bukalapak** - E-commerce unicorn
• **Tzu Chi** - Humanitarian organization

**Language Learning:**
Basic Bahasa: "Apa kabar?" (How are you?)
Fun fact: Indonesian is one of the easiest Asian languages to learn!

**Mau explore aspek apa dari Indonesia?** Budaya, ekonomi, teknologi, atau wisata?`
            ],
            'teknologi': [
                `💡 **Teknologi Terkini & Future Tech**

**Hot Tech Trends 2024-2025:**

🚀 **Artificial Intelligence**
• Generative AI (ChatGPT, Gemini, Claude)
• AI Agents & Automation
• Computer Vision advances
• Edge AI deployment

🌐 **Web Development**
• **Frontend**: React 18+, Next.js 14, Astro
• **Backend**: Node.js, Deno, Bun (ultra-fast runtime)
• **Full-Stack**: T3 Stack, SvelteKit, Remix
• **Styling**: Tailwind CSS, CSS-in-JS evolution

📱 **Mobile Development**
• **Cross-Platform**: Flutter 3.0, React Native
• **Native**: SwiftUI, Kotlin Multiplatform
• **Progressive Web Apps** - Near-native experience

☁️ **Cloud & Infrastructure**
• **Serverless**: AWS Lambda, Vercel Functions
• **Containers**: Docker, Kubernetes evolution
• **Edge Computing**: Cloudflare Workers, Deno Deploy
• **AI Cloud**: Vector databases, GPU clusters

🔐 **Cybersecurity**
• Zero-trust architecture
• AI-powered threat detection
• Quantum-resistant cryptography

**Mana yang paling menarik buat Anda?** Saya bisa deep dive ke any of these!`,
                `🔥 **Tech Stack Recommendations 2025**

**For Beginners:**
\`\`\`
Frontend: HTML/CSS → JavaScript → React
Backend: Node.js → Express → MongoDB
Tools: VS Code → Git → Netlify/Vercel
\`\`\`

**For Professionals:**
\`\`\`
Full-Stack: TypeScript → Next.js → PostgreSQL
Mobile: React Native → Expo → Firebase
AI/ML: Python → TensorFlow → Google Colab
DevOps: Docker → AWS → Terraform
\`\`\`

**Emerging Technologies:**
• **WebAssembly** - Near-native web performance
• **Quantum Computing** - IBM, Google progress
• **Blockchain 3.0** - Sustainable, scalable solutions
• **Augmented Reality** - Apple Vision Pro impact
• **6G Research** - Ultra-low latency networks

**Indonesian Tech Scene:**
• **Gojek SuperApp** - Inspiration for global companies
• **Tokopedia** - E-commerce innovation
• **Bukalapak** - Rural digitalization pioneer
• **Blibli** - Omnichannel retail leader

**Learning Resources:**
• **Free**: freeCodeCamp, MDN, YouTube
• **Paid**: Pluralsight, Udemy, Frontend Masters
• **Practice**: LeetCode, HackerRank, Codewars

**Teknologi apa yang ingin Anda kuasai tahun ini?**`
            ],
            'default': [
                `🌟 **AnaphygonAsk AI at Your Service!**

Saya bisa membantu dengan berbagai topik:

📚 **Knowledge & Learning**
• Science, History, Geography
• Current events & trends
• Academic research assistance
• Fact-checking & explanations

💻 **Technology & Programming** • All programming languages
• Web & mobile development
• AI/ML implementation
• Tech career guidance

🎯 **Problem Solving**
• Analytical thinking frameworks
• Step-by-step solutions
• Creative brainstorming
• Decision-making support

🇮🇩 **Indonesia Expertise**
• Culture, tourism, business
• Local insights & recommendations
• Language learning support
• Economic & political analysis

✨ **And Much More:**
• Productivity tips
• Writing assistance
• Math & calculations
• Health & lifestyle advice

**Just ask anything!** Semakin spesifik pertanyaan Anda, semakin detailed dan helpful jawaban saya.

**Contoh pertanyaan yang bisa Anda ajukan:**
• "Bagaimana cara deploy React app ke Vercel?"
• "Jelaskan perbedaan supervised vs unsupervised learning"
• "Rekomendasi itinerary 3 hari di Yogyakarta"
• "Tips produktivitas untuk developer"

**Apa yang ingin kita explore hari ini?** 🚀`
            ]
        };

        // MAXIMIZED: Performance tracking
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastRequestTime: null
        };

        console.log('🚀 MAXIMIZED GeminiModel initialized with advanced features');
    }

    /**
     * MAXIMIZED: Enhanced prompt building with context optimization
     */
    buildMaximizedPrompt(question, context = []) {
        let prompt = this.advancedSystemPrompt + '\n\n';

        // MAXIMIZED: Smart context processing
        if (context && context.length > 0) {
            prompt += '📋 **CONTEXT PERCAKAPAN:**\n';

            // Take last 6 messages for better context
            const recentContext = context.slice(-6);

            recentContext.forEach((msg) => {
                const role = msg.isUser ? 'USER' : 'ASSISTANT';
                const text = msg.text.substring(0, 200); // Truncate for brevity
                const timestamp = msg.timestamp ? ` (${new Date(msg.timestamp).toLocaleTimeString('id-ID')})` : '';
                prompt += `${role}${timestamp}: ${text}\n`;
            });

            prompt += '\n';
        }

        // MAXIMIZED: Enhanced question processing
        prompt += `🎯 **PERTANYAAN SAAT INI:**\n${question}\n\n`;

        // MAXIMIZED: Advanced response instructions
        prompt += `📝 **INSTRUKSI RESPONS:**
- Berikan jawaban yang comprehensive dan well-structured
- Gunakan markdown formatting untuk readability (bold, bullets, etc.)
- Sertakan examples atau code snippets jika relevan
- Tambahkan emojis strategis untuk engagement
- Akhiri dengan pertanyaan follow-up atau actionable advice
- Prioritize practical value dan actionable insights
- Jika topik programming, berikan code examples
- Jika topik Indonesia, berikan context lokal
- Maximum quality, maximum helpfulness!

RESPOND IN BAHASA INDONESIA:`;

        return prompt;
    }

    /**
     * MAXIMIZED: Advanced API request with retry logic
     */
    async askQuestion(question, context = []) {
        const startTime = Date.now();
        this.stats.totalRequests++;

        try {
            console.log(`🚀 Sending MAXIMIZED question to Gemini: ${question.substring(0, 100)}...`);

            const url = `${this.apiUrl}?key=${this.apiKey}`;
            const maximizedPrompt = this.buildMaximizedPrompt(question, context);

            // MAXIMIZED: Optimal configuration for best results
            const payload = {
                contents: [{
                    parts: [{
                        text: maximizedPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,       // Higher for creativity
                    maxOutputTokens: 4000,  // Increased token limit
                    topP: 0.9,              // Higher for diversity
                    topK: 40,               // More candidate selection
                    candidateCount: 1,
                    stopSequences: ["<|END|>", "---STOP---"]
                },
                safetySettings: [{
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }, {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }, {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }, {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }]
            };

            // MAXIMIZED: Retry logic for reliability
            let response;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    response = await axios.post(url, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'AnaphygonAsk-MaximizedClient/2.0'
                        },
                        timeout: 30000 // 30 seconds timeout
                    });
                    break; // Success, exit retry loop
                } catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) throw error;

                    console.warn(`Retry attempt ${attempts}/${maxAttempts} after error:`, error.message);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
                }
            }

            // MAXIMIZED: Enhanced response processing
            if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('No response candidates received from API');
            }

            const candidate = response.data.candidates[0];

            // Handle safety filtering
            if (candidate.finishReason === 'SAFETY') {
                return this.getMaximizedFallbackResponse(question, {
                    type: 'safety_filter',
                    message: 'Content filtered for safety'
                });
            }

            if (candidate.finishReason === 'RECITATION') {
                return this.getMaximizedFallbackResponse(question, {
                    type: 'recitation',
                    message: 'Content blocked due to recitation'
                });
            }

            if (!candidate.content?.parts?.[0]?.text) {
                return this.getMaximizedFallbackResponse(question, {
                    type: 'empty_response',
                    message: 'Received an empty response from the API.'
                });
            }

            const generatedText = candidate.content.parts[0].text;
            const responseTime = Date.now() - startTime;

            // Update stats
            this.stats.successfulRequests++;
            this.stats.lastRequestTime = responseTime;
            this.stats.averageResponseTime =
                (this.stats.averageResponseTime * (this.stats.successfulRequests - 1) + responseTime) /
                this.stats.successfulRequests;

            console.log(`✅ MAXIMIZED response received in ${responseTime}ms: ${generatedText.substring(0, 100)}...`);

            return {
                success: true,
                message: this.postProcessMaximizedResponse(generatedText),
                metadata: {
                    model: 'gemini-2.0-flash-maximized',
                    finishReason: candidate.finishReason,
                    responseTime: responseTime,
                    promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
                    completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
                    version: 'maximized-v2.0',
                    performance: this.getPerformanceStats()
                }
            };

        } catch (error) {
            this.stats.failedRequests++;
            console.error('❌ Error in MAXIMIZED Gemini API call:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                responseTime: Date.now() - startTime
            });

            return this.getMaximizedFallbackResponse(question, error);
        }
    }

    /**
     * MAXIMIZED: Advanced response post-processing
     */
    postProcessMaximizedResponse(text) {
        text = text.trim();
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/ +/g, ' ');
        text = text.replace(/^\s+|\s+$/gm, '');
        text = text.replace(/\n-\s/g, '\n• ');
        text = text.replace(/\n\*\s/g, '\n• ');

        // HEADER FIX: Convert markdown headers to bold format
        text = text.replace(/^### (.+)$/gm, '**$1:**');
        text = text.replace(/^## (.+)$/gm, '**$1:**');
        text = text.replace(/^# (.+)$/gm, '**$1:**');

        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `\`\`\`${lang || ''}\n${code.trim()}\n\`\`\``;
        });

        text = this.enhanceEmojiUsage(text);
        return text;
    }

    /**
     * MAXIMIZED: Smart emoji enhancement
     */
    enhanceEmojiUsage(text) {
        const emojiMappings = {
            'Python': '🐍', 'JavaScript': '⚡', 'React': '⚛️', 'Node.js': '🟢',
            'AI': '🤖', 'Machine Learning': '🧠', 'Database': '🗄️', 'API': '🔗',
            'Web': '🌐', 'Mobile': '📱', 'Cloud': '☁️', 'Security': '🔐',
            'Performance': '🚀', 'Indonesia': '🇮🇩', 'Tips': '💡', 'Important': '⚠️',
            'Success': '✅', 'Warning': '⚠️', 'Error': '❌'
        };

        for (const [keyword, emoji] of Object.entries(emojiMappings)) {
            const regex = new RegExp(`\\b${keyword}\\b(?!.*${emoji})`, 'gi');
            if (regex.test(text)) {
                text = text.replace(regex, `${keyword} ${emoji}`);
            }
        }
        return text;
    }

    /**
     * MAXIMIZED: Intelligent fallback response system
     */
    getMaximizedFallbackResponse(question, error) {
        const lowerQuestion = question.toLowerCase();

        const keywordMappings = {
            'hello': ['hai', 'halo', 'hello', 'hi', 'hey'],
            'programming': ['coding', 'program', 'development', 'developer', 'code', 'javascript', 'python', 'react', 'node'],
            'ai': ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'ai'],
            'indonesia': ['indonesia', 'indonesian', 'jakarta', 'bali', 'java', 'nusantara', 'garuda'],
            'teknologi': ['teknologi', 'technology', 'tech', 'digital', 'software', 'hardware']
        };

        for (const [category, keywords] of Object.entries(keywordMappings)) {
            if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
                const responses = this.maximizedFallbacks[category] || this.maximizedFallbacks['default'];
                const selectedResponse = Array.isArray(responses) ?
                    responses[Math.floor(Math.random() * responses.length)] :
                    responses;

                return {
                    success: true, message: selectedResponse, fallback: true,
                    fallbackType: 'keyword_match', keyword: category,
                    metadata: { model: 'fallback-maximized', version: 'maximized-v2.0' }
                };
            }
        }

        let errorMessage;
        let fallbackType = 'error_recovery';

        if (error.response?.status === 429) {
            errorMessage = `⏰ **Rate Limit Reached**
Whoa! Sepertinya Anda sangat antusias bertanya! 😄
**Yang bisa dilakukan:**
• Tunggu sekitar 1-2 menit lalu coba lagi.
• Pertanyaan yang lebih pendek cenderung lebih cepat diproses.
**Coba lagi sebentar ya!** 🚀`;
            fallbackType = 'rate_limit_educational';
        } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            errorMessage = `🌐 **Connection Issue Detected**
Sepertinya ada gangguan koneksi sementara.
**Quick Solutions:**
1. **Check Internet** - Pastikan koneksi internet stabil.
2. **Try Again** - Coba kirim ulang.
**Ready to try again?** 🔄`;
            fallbackType = 'connection_troubleshooting';
        } else {
            errorMessage = `🤖 **AI Assistant Temporarily Unavailable**
Oops! Sepertinya saya sedang mengalami gangguan teknis kecil.
**Alternative Approaches:**
1. **Rephrase Question** - Coba dengan kata-kata yang berbeda.
2. **Break Down Complex Topics** - Bagi pertanyaan kompleks jadi beberapa bagian.
**Let's try again!** Apa yang ingin Anda ketahui? 🌟`;
            fallbackType = 'comprehensive_recovery';
        }

        return {
            success: true, message: errorMessage, fallback: true,
            fallbackType, error: config.DEBUG_MODE ? error.message : undefined,
            metadata: { model: 'fallback-maximized', version: 'maximized-v2.0', errorHandling: 'advanced' }
        };
    }

    /**
     * MAXIMIZED: Performance monitoring
     */
    getPerformanceStats() {
        return {
            totalRequests: this.stats.totalRequests,
            successfulRequests: this.stats.successfulRequests,
            failedRequests: this.stats.failedRequests,
            successRate: this.stats.totalRequests > 0 ?
                ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(2) + '%' :
                '0%',
            averageResponseTime: Math.round(this.stats.averageResponseTime) + 'ms',
            lastRequestTime: this.stats.lastRequestTime ? this.stats.lastRequestTime + 'ms' : 'N/A'
        };
    }

    /**
     * MAXIMIZED: Advanced validation with detailed feedback
     */
    validateQuestion(question) {
        if (!question || typeof question !== 'string') {
            return { isValid: false, message: 'Pertanyaan harus berupa text yang valid.', suggestion: 'Coba ketik pertanyaan Anda.' };
        }
        const trimmed = question.trim();
        if (trimmed.length === 0) {
            return { isValid: false, message: 'Pertanyaan tidak boleh kosong.', suggestion: 'Mulai dengan "Bagaimana...", "Apa itu...", atau "Jelaskan..."' };
        }
        if (trimmed.length > 5000) {
            return { isValid: false, message: 'Pertanyaan terlalu panjang (maksimal 5000 karakter).', suggestion: 'Coba pecah menjadi beberapa pertanyaan yang lebih spesifik.' };
        }
        if (/(.{5,})\1{5,}/.test(trimmed)) {
            return { isValid: false, message: 'Format pertanyaan terdeteksi sebagai spam.', suggestion: 'Gunakan kalimat yang natural dan bervariasi.' };
        }
        return { isValid: true };
    }

    /**
     * MAXIMIZED: Health check with detailed diagnostics
     */
    getMaximizedStats() {
        return {
            model: 'gemini-2.0-flash-maximized',
            version: 'maximized-v2.0',
            features: [
                'Advanced system prompting', 'Smart context processing', 'Intelligent fallback responses',
                'Performance monitoring', 'Retry logic with exponential backoff', 'Enhanced markdown processing',
                'Smart emoji enhancement', 'Context-aware error handling', 'Header format fix'
            ],
            configuration: {
                temperature: 0.7, maxOutputTokens: 4000, topP: 0.9, topK: 40,
                contextWindow: 6, timeout: 30000
            },
            performance: this.getPerformanceStats(),
            status: 'maximized_operational'
        };
    }
}

module.exports = new MaximizedGeminiModel();