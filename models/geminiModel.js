// models/enhancedGeminiModel.js - ULTIMATE UNIVERSAL AI WITH ELITE CODING SKILLS
const axios = require('axios');
const config = require('../config/config');

class UltimateUniversalGeminiModel {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        this.apiKey = config.GEMINI_API_KEY;

        // ULTIMATE: Balanced universal knowledge + elite coding expertise
        this.masterSystemPrompt = `Anda adalah AnaphygonAsk AI - asisten virtual yang sangat cerdas dan mahir dalam SEMUA bidang, dengan keahlian programming tingkat EXPERT.

🌟 **IDENTITAS CORE:**
- Universal Knowledge Master dengan coding expertise yang luar biasa
- Responsif dalam Bahasa Indonesia dengan pendekatan natural dan friendly
- Memberikan solusi praktis, code yang working, dan insights mendalam
- Memahami context dengan sempurna dan memberikan value maksimal

💡 **FILOSOFI RESPONS:**
"Setiap pertanyaan pantas mendapat jawaban yang comprehensive, actionable, dan inspiring!"

🎯 **UNIVERSAL EXPERTISE AREAS:**

**📚 GENERAL KNOWLEDGE (MASTER LEVEL):**
• **Sains & Teknologi**: Fisika, Kimia, Biologi, Matematika, Astronomi, Quantum Computing
• **Sejarah & Budaya**: World history, Indonesian culture, anthropologi, arkeologi
• **Ekonomi & Bisnis**: Finance, marketing, startup strategies, investment analysis
• **Kesehatan & Lifestyle**: Nutrition, fitness, mental health, wellness tips
• **Seni & Kreativitas**: Design principles, music theory, literature, creative writing
• **Bahasa & Komunikasi**: Linguistics, translation, copywriting, public speaking
• **Current Affairs**: Global trends, politik, social issues, environmental topics

**💻 CODING & TECH EXPERTISE (ELITE LEVEL):**

*Frontend Mastery:*
• **Modern Frameworks**: React 18+, Vue 3, Angular, Svelte, SolidJS
• **Meta-Frameworks**: Next.js 14, Nuxt 3, SvelteKit, Remix, Astro
• **Styling**: Tailwind CSS, CSS-in-JS, SCSS, Styled Components, Emotion
• **Build Tools**: Vite, Webpack, Rollup, Parcel, Turbopack
• **State Management**: Redux Toolkit, Zustand, Jotai, Pinia, Context API

*Backend Excellence:*
• **Node.js Ecosystem**: Express, Fastify, Koa, NestJS, Hapi
• **Modern Runtimes**: Deno, Bun (ultra-fast JS runtime)
• **Python Powerhouse**: Django, FastAPI, Flask, SQLAlchemy, Pydantic
• **Other Languages**: Go (Gin, Fiber), Rust (Actix, Axum), Java (Spring Boot)
• **API Design**: RESTful, GraphQL, tRPC, gRPC, WebSockets

*Database & Storage:*
• **SQL**: PostgreSQL, MySQL, SQLite, advanced queries, performance tuning
• **NoSQL**: MongoDB, Redis, CouchDB, DynamoDB, Cassandra
• **Modern**: Supabase, PlanetScale, FaunaDB, EdgeDB, Prisma ORM
• **Vector DBs**: Pinecone, Weaviate, Chroma (for AI applications)

*DevOps & Cloud:*
• **Cloud Platforms**: AWS (Lambda, EC2, S3), Google Cloud, Azure, DigitalOcean
• **Containerization**: Docker, Kubernetes, Docker Compose, Helm charts
• **CI/CD**: GitHub Actions, GitLab CI, Jenkins, CircleCI, Vercel, Netlify
• **Infrastructure**: Terraform, Ansible, CloudFormation, Pulumi

*AI/ML Development:*
• **Frameworks**: TensorFlow, PyTorch, Scikit-learn, Hugging Face Transformers
• **Computer Vision**: OpenCV, YOLO, MediaPipe, image processing
• **NLP**: NLTK, spaCy, sentiment analysis, text classification
• **Deployment**: MLflow, Kubeflow, AWS SageMaker, Google AI Platform

*Mobile Development:*
• **Cross-Platform**: React Native, Flutter, Ionic, Capacitor
• **Native**: Swift/SwiftUI, Kotlin/Jetpack Compose, native performance optimization

*Emerging Tech:*
• **Web3**: Blockchain development, smart contracts, DeFi, NFT platforms
• **Edge Computing**: Cloudflare Workers, Deno Deploy, edge functions
• **Serverless**: AWS Lambda, Vercel Functions, Netlify Functions
• **Micro-frontends**: Module federation, single-spa, micro-app architectures

🎨 **RESPONSE STYLE & FORMAT:**
- **Structure**: Logical flow dengan headers yang jelas (gunakan **Bold:** bukan markdown #)
- **Code Quality**: Selalu berikan working code dengan comments dan best practices
- **Practical Focus**: Real-world applications, deployment tips, performance considerations
- **Indonesian Natural**: Friendly tapi professional, seperti berbicara dengan expert colleague
- **Value-Driven**: Setiap respons harus memberikan insight atau knowledge baru
- **Emoji Strategic**: Gunakan emoji untuk visual clarity dan engagement (tapi tidak berlebihan)

📝 **RESPONSE GUIDELINES:**

*Untuk Programming Questions:*
1. **Understand Context** - Clarify requirements dan use case
2. **Provide Working Code** - Complete examples dengan error handling
3. **Explain Concepts** - Why this approach, alternatives, trade-offs
4. **Best Practices** - Security, performance, maintainability
5. **Deployment Tips** - How to run in production
6. **Next Steps** - Improvements, scaling considerations

*Untuk General Knowledge:*
1. **Clear Explanation** - Break down complex concepts
2. **Real Examples** - Concrete cases, analogies, scenarios
3. **Multiple Perspectives** - Different viewpoints or approaches
4. **Practical Application** - How to use this knowledge
5. **Follow-up Value** - Related topics, further learning

*Universal Principles:*
• **Accuracy First**: Informasi yang benar dan up-to-date
• **Actionable Insights**: Solutions yang bisa langsung diterapkan
• **Progressive Disclosure**: Start simple, add complexity as needed
• **Context Awareness**: Understand user's level dan goals
• **Indonesian Context**: Local examples, cultural considerations when relevant

🚀 **ADVANCED CAPABILITIES:**
- Code review dan optimization suggestions
- Architecture design untuk complex systems
- Troubleshooting dan debugging assistance
- Technology selection guidance
- Performance analysis dan tuning
- Security best practices implementation
- Cross-platform development strategies
- Modern development workflow setup

🌟 **INTERACTION STYLE:**
- Enthusiastic tapi tidak overwhelming
- Technical precision dengan human warmth
- Encourage learning dan exploration
- Provide alternatives dan explain trade-offs
- Ask clarifying questions when needed
- Celebrate user progress dan achievements

RESPOND DALAM BAHASA INDONESIA DENGAN NATURAL FLOW!`;

        // Enhanced fallback responses with more variety and depth
        this.expertFallbacks = {
            'programming': [
                `🚀 **Elite Coding Assistant Ready!**

**Apa yang ingin kita build hari ini?**

**Popular Development Areas:**
• **Full-Stack Web Apps** - React/Next.js + Node.js/Python backend
• **Mobile Development** - React Native, Flutter untuk cross-platform
• **AI/ML Projects** - TensorFlow, PyTorch, computer vision, NLP
• **API Development** - RESTful, GraphQL, microservices architecture
• **DevOps & Cloud** - Docker, Kubernetes, AWS deployment
• **Database Design** - SQL optimization, NoSQL strategies
• **Performance Optimization** - Frontend/backend tuning
• **Modern Tech Stack** - Latest frameworks dan best practices

**Code Examples I Can Provide:**
✅ Working implementations dengan detailed comments
✅ Error handling dan edge cases
✅ Performance optimizations
✅ Security best practices
✅ Deployment configurations
✅ Testing strategies

**Share your challenge!** Specific problem, tech stack, atau concept yang ingin dipelajari?`,

                `💻 **Master Developer at Your Service!**

**Today's Hot Topics:**
• **Modern JavaScript** - ES2024 features, async patterns, performance
• **React Ecosystem** - Hooks, state management, SSR/SSG
• **Backend Excellence** - APIs, databases, caching, security
• **Cloud Native** - Serverless, containers, edge computing
• **AI Integration** - LLM APIs, vector databases, RAG systems

**Development Workflows:**
1. **Planning** - Requirements analysis, architecture design
2. **Implementation** - Clean code, testing, documentation  
3. **Optimization** - Performance, security, scalability
4. **Deployment** - CI/CD, monitoring, maintenance

**Indonesian Tech Scene Integration:**
• Gojek-style super app architectures
• E-commerce platforms like Tokopedia
• Fintech solutions for Indonesian market
• Local compliance dan regulations

**Ready to code?** Describe your project atau specific challenge!`
            ],
            'ai': [
                `🤖 **AI/ML Expert Ready!**

**Hot AI Trends 2025:**
• **Generative AI** - GPT, Claude, Gemini integration
• **Multimodal AI** - Vision + Language + Audio processing
• **Edge AI** - Running models on mobile/IoT devices
• **RAG Systems** - Retrieval-Augmented Generation
• **AI Agents** - Autonomous task completion
• **Computer Vision** - Real-time object detection, recognition

**Practical AI Applications:**
🔥 **Business Solutions:**
• Intelligent chatbots dan customer service
• Document processing dan analysis
• Predictive analytics untuk business insights
• Recommendation systems
• Automated content generation

🔥 **Technical Implementation:**
• Python: TensorFlow, PyTorch, Hugging Face
• APIs: OpenAI, Google AI, Anthropic Claude
• Deployment: Docker, Kubernetes, cloud platforms
• Data: Vector databases, embedding strategies

**Learning Path:**
1. **Foundations** - Math, statistics, Python
2. **Classical ML** - Supervised/unsupervised learning
3. **Deep Learning** - Neural networks, CNNs, RNNs
4. **Modern AI** - Transformers, LLMs, multimodal
5. **Production** - MLOps, monitoring, scaling

**Indonesian AI Opportunities:**
• Local language processing (Bahasa Indonesia)
• Cultural context understanding
• Regional business applications
• Government digitalization projects

**Which AI area interests you most?**`,

                `🧠 **Advanced AI Consultant Here!**

**AI Development Stack 2025:**
\`\`\`
Data Science: Python + Pandas + NumPy + Matplotlib
Classical ML: Scikit-learn + XGBoost + LightGBM  
Deep Learning: PyTorch/TensorFlow + Transformers
LLM Integration: OpenAI API + LangChain + Vector DBs
Deployment: FastAPI + Docker + AWS/GCP
\`\`\`

**Real-World AI Projects:**
• **Smart Document Processing** - OCR + NLP untuk automation
• **Intelligent Search** - Semantic search dengan embeddings
• **Predictive Maintenance** - IoT data analysis
• **Content Personalization** - User behavior analysis
• **Fraud Detection** - Anomaly detection systems

**Indonesian Market Focus:**
• Bahasa Indonesia language models
• Local e-commerce recommendations  
• Financial inclusion solutions
• Healthcare accessibility
• Education technology

**Research to Production Pipeline:**
1. **Data Collection** - Cleaning, preprocessing, validation
2. **Model Development** - Training, validation, testing
3. **Integration** - APIs, real-time inference
4. **Monitoring** - Performance, drift detection
5. **Scaling** - Load balancing, optimization

**What AI challenge are you working on?**`
            ],
            'indonesia': [
                `🇮🇩 **Indonesia Expert & Cultural Guide**

**Keajaiban Nusantara:**
• **17,508 pulau** - Dari Sabang sampai Merauke
• **1,340+ suku bangsa** - Keberagaman luar biasa
• **740+ bahasa daerah** - Kekayaan linguistik
• **300+ juta penduduk** - Pasar terbesar ASEAN

**Tech & Innovation Scene:**
🚀 **Startup Ecosystem:**
• **Gojek** - Super app pioneer yang menginspirasi dunia
• **Tokopedia** - E-commerce platform terbesar
• **Bukalapak** - Digitalisasi UMKM dan rural areas
• **Traveloka** - OTA leader dengan tech excellence

🚀 **Emerging Tech Hubs:**
• **Jakarta** - Financial & startup center
• **Bandung** - Tech talent dan creative industries  
• **Yogyakarta** - Education & cultural tech
• **Bali** - Digital nomad destination

**Cultural Treasures:**
🏛️ **UNESCO Heritage:**
• **Borobudur** - Buddhist architectural masterpiece
• **Prambanan** - Hindu temple complex
• **Sangiran** - Early human fossils
• **Komodo National Park** - Unique ecosystem

🎭 **Living Traditions:**
• **Batik** - UNESCO Intangible Heritage
• **Wayang** - Shadow puppet storytelling
• **Gamelan** - Traditional orchestra
• **Traditional Dances** - Kecak, Saman, Tor-Tor

**Modern Indonesia:**
• **G20 Member** - Major emerging economy
• **Digital Economy** - Fastest growing in ASEAN
• **New Capital** - Nusantara (Kalimantan Timur)
• **Green Energy** - Renewable energy initiatives

**What aspect of Indonesia interests you most?**`,

                `🌟 **Wonderful Indonesia - Deep Insights**

**Natural Wonders:**
🌋 **Volcanic Landscapes:**
• **Mount Bromo** - Iconic sunrise views
• **Mount Rinjani** - Sacred mountain in Lombok
• **Kawah Ijen** - Blue fire phenomenon
• **Lake Toba** - Supervolcano caldera lake

🏝️ **Marine Paradise:**
• **Raja Ampat** - Biodiversity hotspot
• **Bunaken** - World-class diving
• **Wakatobi** - Pristine coral reefs
• **Derawan Islands** - Manta ray sanctuary

**Economic Powerhouse:**
📈 **Key Industries:**
• **Palm Oil** - World's largest producer
• **Coal & Minerals** - Major natural resources
• **Manufacturing** - Automotive, textiles, electronics
• **Tourism** - Pre-pandemic: 16+ million visitors

💰 **Investment Opportunities:**
• **Digital Infrastructure** - 5G, fiber optic expansion
• **Renewable Energy** - Solar, geothermal, hydro
• **Electric Vehicles** - Government push for EVs
• **Smart Cities** - Jakarta, Surabaya initiatives

**Cultural Business Insights:**
• **Gotong Royong** - Community cooperation principle
• **Bapakisme** - Respect for hierarchy
• **Relationship Building** - Trust-based business culture
• **Halal Market** - World's largest Muslim population

**Indonesian Language Learning:**
• **Grammar** - No tenses, gender, or complex conjugations
• **Pronunciation** - Phonetic spelling system
• **Cultural Context** - Formal vs informal speech levels

**Explore deeper into which area?**`
            ],
            'teknologi': [
                `⚡ **Technology Trends & Innovation Hub**

**🔥 Hottest Tech 2025:**

**Frontend Revolution:**
• **React 19** - Server Components, Suspense improvements
• **Vue 4** - Composition API evolution, better TypeScript
• **Svelte 5** - Runes system, enhanced reactivity
• **Astro 4** - Islands architecture, performance focus
• **Web Components** - Native browser support expansion

**Backend Innovation:**
• **Bun** - Ultra-fast JavaScript runtime (3x faster than Node.js)
• **Deno 2.0** - Built-in TypeScript, modern APIs
• **Rust** - Memory safety, performance for system programming
• **Go** - Microservices, cloud-native development
• **Python 3.12** - Performance improvements, better typing

**AI-Powered Development:**
🤖 **Coding Assistants:**
• **GitHub Copilot** - AI pair programming
• **Cursor** - AI-first code editor
• **v0.dev** - AI UI component generation
• **Claude/ChatGPT** - Code review, debugging assistance

🤖 **No-Code/Low-Code:**
• **Vercel v0** - AI-generated React components
• **Supabase** - Backend-as-a-Service with AI features
• **Railway** - Simplified deployment platform
• **Cloudflare** - Edge computing revolution

**Indonesian Tech Ecosystem:**
🇮🇩 **Local Innovations:**
• **Gojek** - Super app model adopted globally
• **Tokopedia** - E-commerce platform excellence
• **Dana** - Digital wallet innovation
• **Xendit** - Payment infrastructure for SEA

🇮🇩 **Government Initiatives:**
• **Digital Indonesia 2045** - National digitalization
• **Gerakan Nasional 1000 Startup** - Startup ecosystem
• **Making Indonesia 4.0** - Industry transformation

**Emerging Technologies:**
• **Quantum Computing** - IBM, Google breakthroughs
• **Web3 & Blockchain** - Sustainable solutions
• **Edge Computing** - 5G network optimization
• **Augmented Reality** - Apple Vision Pro impact

**Which tech area excites you most?**`,

                `🚀 **Advanced Technology Deep Dive**

**Development Paradigm Shifts:**

**Modern Architecture Patterns:**
\`\`\`
Monolith → Microservices → Serverless → Edge Functions
MVC → Component-Based → Islands → Server Components
REST → GraphQL → tRPC → Real-time subscriptions
\`\`\`

**Performance-First Development:**
• **Core Web Vitals** - LCP, FID, CLS optimization
• **Edge-Side Rendering** - Cloudflare Workers, Deno Deploy
• **Streaming SSR** - React 18, Next.js App Router
• **Islands Architecture** - Astro, Fresh, partial hydration

**AI Integration in Development:**
🔮 **Code Generation:**
• **GitHub Copilot** - Context-aware suggestions
• **Tabnine** - AI code completion
• **Amazon CodeWhisperer** - AWS-optimized suggestions
• **Replit Ghostwriter** - Collaborative AI coding

🔮 **AI-Powered Tools:**
• **Automated Testing** - AI test case generation
• **Code Review** - AI-powered PR analysis
• **Documentation** - Auto-generated API docs
• **Debugging** - AI error diagnosis

**Cloud-Native Excellence:**
☁️ **Modern Deployment:**
• **Serverless First** - AWS Lambda, Vercel Functions
• **Container Orchestration** - Kubernetes, Docker Swarm
• **Infrastructure as Code** - Terraform, Pulumi, CDK
• **GitOps** - ArgoCD, Flux, automated deployments

**Security-First Development:**
🔐 **Modern Security:**
• **Zero Trust Architecture** - Never trust, always verify
• **Supply Chain Security** - Dependency scanning, SBOM
• **API Security** - OAuth 2.1, JWT best practices
• **Container Security** - Image scanning, runtime protection

**Indonesian Developer Community:**
• **Tech Conferences** - DevFest, JSConf Indonesia, PyCon ID
• **Learning Platforms** - Dicoding, BuildWith Angga
• **Developer Groups** - Facebook Developer Circle, Google Developer Group

**Ready to explore cutting-edge tech?**`
            ],
            'default': [
                `🌟 **Universal AI Assistant - Ready for Anything!**

**🎯 What Can I Help With Today?**

**💻 Programming & Technology:**
• Full-stack development (React, Node.js, Python, Go)
• AI/ML implementation dan integration
• Cloud architecture dan DevOps
• Mobile app development
• Database design dan optimization
• API development dan best practices
• Code review, debugging, performance tuning

**📚 Knowledge & Learning:**
• Science explanations (Physics, Chemistry, Biology)
• Mathematics problem solving
• Historical analysis dan context
• Current events dan trend analysis
• Academic research assistance
• Language learning support
• Creative writing dan content creation

**🇮🇩 Indonesia Expertise:**
• Cultural insights dan traditions
• Tourism recommendations
• Business landscape analysis
• Local language nuances
• Economic trends dan opportunities
• Tech ecosystem updates

**🎨 Creative & Practical:**
• Design principles dan UI/UX guidance
• Content strategy dan copywriting
• Problem-solving frameworks
• Productivity tips dan life hacks
• Health dan wellness advice
• Financial planning dan investment insights

**🔍 Analysis & Research:**
• Data interpretation dan visualization
• Competitive analysis
• Market research dan trends
• Technical documentation
• Strategic planning
• Risk assessment

**💡 How I Approach Every Question:**
1. **Understand Context** - What's your goal dan current situation?
2. **Provide Clear Answers** - Step-by-step, actionable solutions
3. **Share Best Practices** - Professional insights dan tips
4. **Give Examples** - Real-world applications dan use cases
5. **Suggest Next Steps** - How to implement dan improve further

**🚀 Recent Capabilities:**
• Advanced code generation dengan modern frameworks
• AI/ML integration strategies
• Cloud-native architecture design
• Indonesian market analysis
• Multilingual content creation
• Complex problem decomposition

**Ask me anything!** The more specific your question, the more detailed dan helpful my response will be.

**Popular conversation starters:**
• "How do I build a [specific app/feature]?"
• "Explain [concept] in simple terms"
• "What's the best approach for [challenge]?"
• "Compare [option A] vs [option B]"
• "Help me troubleshoot [specific problem]"

**What would you like to explore today?** 🚀`
            ]
        };

        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastRequestTime: null,
            complexityHandled: {
                simple: 0,
                intermediate: 0,
                complex: 0,
                expert: 0
            }
        };

        console.log('🚀 Ultimate Universal Gemini Model initialized');
    }

    /**
     * Enhanced prompt building with context optimization
     */
    buildMasterPrompt(question, context = []) {
        let prompt = this.masterSystemPrompt + '\n\n';

        // Smart context processing
        if (context && context.length > 0) {
            prompt += '📋 **CONVERSATION CONTEXT:**\n';
            const recentContext = context.slice(-10); // More context for better understanding

            recentContext.forEach((msg) => {
                const role = msg.isUser ? 'USER' : 'ASSISTANT';
                const text = msg.text.substring(0, 400); // More context per message
                const timestamp = msg.timestamp ?
                    ` (${new Date(msg.timestamp).toLocaleTimeString('id-ID')})` : '';
                prompt += `${role}${timestamp}: ${text}\n`;
            });
            prompt += '\n';
        }

        // Question complexity analysis
        const complexity = this.analyzeQuestionComplexity(question);
        this.stats.complexityHandled[complexity]++;

        prompt += `🎯 **CURRENT QUESTION:**\n${question}\n\n`;

        prompt += `📊 **DETECTED COMPLEXITY:** ${complexity.toUpperCase()}\n\n`;

        // Enhanced response instructions
        prompt += `📝 **RESPONSE INSTRUCTIONS:**

**For ${complexity.toUpperCase()} Level Questions:**
${this.getComplexityInstructions(complexity)}

**Universal Guidelines:**
• Provide comprehensive, well-structured answers
• Use strategic markdown formatting (bold, bullets, code blocks)
• For coding: Always include working examples with detailed comments
• For general topics: Use analogies, examples, and practical applications
• Add strategic emojis for visual clarity and engagement
• End with actionable advice or thoughtful follow-up questions
• Leverage Gemini 2.5 Flash's adaptive capabilities
• Balance technical depth with accessibility
• Prioritize practical value and real-world applicability

**Quality Standards:**
✅ Accuracy and up-to-date information
✅ Actionable insights and solutions
✅ Clear explanations with examples
✅ Best practices and modern approaches
✅ Indonesian context when relevant
✅ Professional yet friendly tone

RESPOND IN NATURAL BAHASA INDONESIA WITH EXPERT-LEVEL INSIGHTS!`;

        return prompt;
    }

    /**
     * Question complexity analysis
     */
    analyzeQuestionComplexity(question) {
        const lowerQuestion = question.toLowerCase();

        // Expert level indicators
        const expertKeywords = [
            'architecture', 'scalability', 'microservices', 'kubernetes', 'devops',
            'machine learning', 'deep learning', 'neural network', 'algorithm optimization',
            'distributed systems', 'performance optimization', 'security implementation',
            'complex analysis', 'advanced', 'enterprise', 'production-ready'
        ];

        // Complex level indicators
        const complexKeywords = [
            'implement', 'integrate', 'deploy', 'build', 'create', 'develop',
            'database design', 'api development', 'full-stack', 'framework comparison',
            'best practices', 'troubleshoot', 'optimize', 'analyze'
        ];

        // Intermediate level indicators
        const intermediateKeywords = [
            'how to', 'tutorial', 'guide', 'learn', 'understand', 'explain',
            'difference between', 'comparison', 'examples', 'getting started'
        ];

        if (expertKeywords.some(keyword => lowerQuestion.includes(keyword))) {
            return 'expert';
        } else if (complexKeywords.some(keyword => lowerQuestion.includes(keyword))) {
            return 'complex';
        } else if (intermediateKeywords.some(keyword => lowerQuestion.includes(keyword))) {
            return 'intermediate';
        } else {
            return 'simple';
        }
    }

    /**
     * Complexity-specific instructions
     */
    getComplexityInstructions(complexity) {
        const instructions = {
            'simple': `
• Provide clear, concise answers with basic examples
• Use simple language and analogies
• Include fundamental concepts and definitions
• Offer next learning steps`,

            'intermediate': `
• Give detailed explanations with multiple examples
• Include step-by-step instructions
• Provide context and background information
• Suggest related topics and resources`,

            'complex': `
• Offer comprehensive solutions with code examples
• Include best practices and alternative approaches
• Discuss trade-offs and considerations
• Provide implementation details and deployment guidance`,

            'expert': `
• Deliver in-depth technical analysis
• Include architecture patterns and design decisions
• Discuss scalability, performance, and security implications
• Provide production-ready solutions with advanced optimizations`
        };

        return instructions[complexity] || instructions['simple'];
    }

    /**
     * Enhanced API request
     */
    async askQuestion(question, context = []) {
        const startTime = Date.now();
        this.stats.totalRequests++;

        try {
            console.log(`🚀 Processing ${this.analyzeQuestionComplexity(question)} question: ${question.substring(0, 100)}...`);

            const url = `${this.apiUrl}?key=${this.apiKey}`;
            const masterPrompt = this.buildMasterPrompt(question, context);

            const payload = {
                contents: [{
                    parts: [{
                        text: masterPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.75,           // Slightly higher for creativity
                    maxOutputTokens: 8192,       // Maximum for 2.5 Flash
                    topP: 0.9,
                    topK: 40,
                    candidateCount: 1,
                    stopSequences: ["<|END|>", "---COMPLETE---"]
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

            // Enhanced retry logic
            let response;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    response = await axios.post(url, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'AnaphygonAsk-Ultimate/3.0'
                        },
                        timeout: 50000 // 50 seconds
                    });
                    break;
                } catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) throw error;

                    console.warn(`Retry ${attempts}/${maxAttempts} after error:`, error.message);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }

            // Enhanced response processing
            if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new Error('No response candidates received');
            }

            const candidate = response.data.candidates[0];

            if (candidate.finishReason === 'SAFETY') {
                return this.getIntelligentFallbackResponse(question, {
                    type: 'safety_filter',
                    message: 'Content filtered for safety'
                });
            }

            if (!candidate.content?.parts?.[0]?.text) {
                return this.getIntelligentFallbackResponse(question, {
                    type: 'empty_response',
                    message: 'Empty response received'
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

            console.log(`✅ Response generated in ${responseTime}ms`);

            return {
                success: true,
                message: this.enhanceResponse(generatedText),
                metadata: {
                    model: 'gemini-2.5-flash-ultimate',
                    complexity: this.analyzeQuestionComplexity(question),
                    finishReason: candidate.finishReason,
                    responseTime: responseTime,
                    promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
                    completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
                    version: '3.0-ultimate',
                    performance: this.getPerformanceStats()
                }
            };

        } catch (error) {
            this.stats.failedRequests++;
            console.error('❌ API Error:', error.message);
            return this.getIntelligentFallbackResponse(question, error);
        }
    }

    /**
     * Advanced response enhancement
     */
    enhanceResponse(text) {
        // Clean up formatting
        text = text.trim();
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/ +/g, ' ');
        text = text.replace(/^\s+|\s+$/gm, '');

        // Convert markdown headers to bold format (sesuai requirement)
        text = text.replace(/^### (.+)$/gm, '**$1:**');
        text = text.replace(/^## (.+)$/gm, '**$1:**');
        text = text.replace(/^# (.+)$/gm, '**$1:**');

        // Enhance list formatting
        text = text.replace(/\n-\s/g, '\n• ');
        text = text.replace(/\n\*\s/g, '\n• ');

        // Code block enhancement
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const cleanCode = code.trim();
            const language = lang || 'javascript';
            return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
        });

        // Strategic emoji enhancement
        text = this.addContextualEmojis(text);

        // Add quality indicators for code examples
        text = this.enhanceCodeExamples(text);

        return text;
    }

    /**
     * Contextual emoji enhancement
     */
    addContextualEmojis(text) {
        const emojiEnhancements = {
            // Programming languages
            'Python': '🐍', 'JavaScript': '⚡', 'TypeScript': '🔷', 'React': '⚛️',
            'Vue': '💚', 'Angular': '🅰️', 'Node.js': '🟢', 'Next.js': '▲',
            'Django': '🎸', 'Flask': '🌶️', 'FastAPI': '🚀',

            // Technologies
            'Docker': '🐳', 'Kubernetes': '☸️', 'AWS': '☁️', 'MongoDB': '🍃',
            'PostgreSQL': '🐘', 'Redis': '🔴', 'GraphQL': '🌸',

            // AI/ML
            'AI': '🤖', 'Machine Learning': '🧠', 'Deep Learning': '🧠',
            'TensorFlow': '📊', 'PyTorch': '🔥', 'Neural Network': '🧠',

            // General concepts
            'Performance': '🚀', 'Security': '🔐', 'Database': '🗄️',
            'API': '🔗', 'Frontend': '🎨', 'Backend': '⚙️',
            'Mobile': '📱', 'Web': '🌐', 'Cloud': '☁️',

            // Indonesian context
            'Indonesia': '🇮🇩', 'Jakarta': '🏙️', 'Bali': '🏝️',
            'Gojek': '🛵', 'Tokopedia': '🛒',

            // Learning & development
            'Tutorial': '📚', 'Guide': '📖', 'Tips': '💡',
            'Best Practices': '⭐', 'Example': '📝',
            'Important': '⚠️', 'Note': '📌', 'Warning': '⚠️'
        };

        for (const [keyword, emoji] of Object.entries(emojiEnhancements)) {
            // Only add emoji if not already present
            const regex = new RegExp(`\\b${keyword}\\b(?![^\\[]*\\])(?![^<]*>)(?!.*${emoji})`, 'gi');
            if (regex.test(text)) {
                text = text.replace(regex, `${keyword} ${emoji}`);
            }
        }

        return text;
    }

    /**
     * Enhance code examples with quality indicators
     */
    enhanceCodeExamples(text) {
        // Add quality badges to code blocks
        text = text.replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
            const hasComments = /\/\/|\/\*|\#|<!--/.test(code);
            const hasErrorHandling = /try|catch|except|error|Error/.test(code);
            const hasTypes = /interface|type|:.*=|<.*>/.test(code);

            let qualityIndicators = [];
            if (hasComments) qualityIndicators.push('📝 Well-documented');
            if (hasErrorHandling) qualityIndicators.push('🛡️ Error handling');
            if (hasTypes) qualityIndicators.push('🔷 Type-safe');

            const indicators = qualityIndicators.length > 0 ?
                `\n*${qualityIndicators.join(' • ')}*\n` : '\n';

            return `\`\`\`${lang}\n${code.trim()}\n\`\`\`${indicators}`;
        });

        return text;
    }

    /**
     * Intelligent fallback response system
     */
    getIntelligentFallbackResponse(question, error) {
        const lowerQuestion = question.toLowerCase();

        // Advanced keyword mapping with more categories
        const keywordMappings = {
            'programming': [
                'coding', 'program', 'development', 'code', 'javascript', 'python',
                'react', 'node', 'api', 'database', 'frontend', 'backend', 'mobile',
                'web', 'app', 'software', 'algorithm', 'framework', 'library'
            ],
            'ai': [
                'artificial intelligence', 'machine learning', 'deep learning',
                'neural network', 'ai', 'ml', 'tensorflow', 'pytorch', 'model',
                'training', 'prediction', 'classification', 'nlp', 'computer vision'
            ],
            'indonesia': [
                'indonesia', 'indonesian', 'jakarta', 'bali', 'java', 'sumatra',
                'kalimantan', 'sulawesi', 'papua', 'nusantara', 'garuda', 'borobudur',
                'yogyakarta', 'surabaya', 'bandung', 'medan', 'makassar'
            ],
            'teknologi': [
                'teknologi', 'technology', 'tech', 'digital', 'software', 'hardware',
                'startup', 'innovation', 'future', 'trend', 'gadget', 'internet'
            ]
        };

        // Find best matching category
        let bestMatch = 'default';
        let maxMatches = 0;

        for (const [category, keywords] of Object.entries(keywordMappings)) {
            const matches = keywords.filter(keyword => lowerQuestion.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = category;
            }
        }

        const responses = this.expertFallbacks[bestMatch] || this.expertFallbacks['default'];
        const selectedResponse = Array.isArray(responses) ?
            responses[Math.floor(Math.random() * responses.length)] :
            responses;

        // Enhanced error handling with specific solutions
        if (error.response?.status === 429) {
            return {
                success: true,
                message: `⏰ **Rate Limit - Mari Optimasi!**

Wah, antusiasme Anda luar biasa! 🚀 Server sedang overload dengan request.

**Smart Solutions:**
• **Wait Strategy**: Tunggu 60-90 detik untuk reset
• **Question Optimization**: Pertanyaan lebih spesifik = response lebih cepat
• **Batch Approach**: Gabungkan beberapa pertanyaan kecil

**Pro Tips:**
• Gunakan pertanyaan yang focused dan actionable
• Hindari pertanyaan yang terlalu general atau panjang
• Consider breaking complex topics into smaller chunks

**Ready to continue?** 💡`,
                fallback: true,
                fallbackType: 'rate_limit_optimized'
            };
        }

        return {
            success: true,
            message: selectedResponse,
            fallback: true,
            fallbackType: 'intelligent_keyword_match',
            matchedCategory: bestMatch,
            matchScore: maxMatches,
            metadata: {
                model: 'gemini-2.5-flash-ultimate-fallback',
                version: '3.0-ultimate'
            }
        };
    }

    /**
     * Enhanced performance statistics
     */
    getPerformanceStats() {
        const total = this.stats.totalRequests;
        return {
            totalRequests: total,
            successfulRequests: this.stats.successfulRequests,
            failedRequests: this.stats.failedRequests,
            successRate: total > 0 ? ((this.stats.successfulRequests / total) * 100).toFixed(2) + '%' : '0%',
            averageResponseTime: Math.round(this.stats.averageResponseTime) + 'ms',
            lastRequestTime: this.stats.lastRequestTime ? this.stats.lastRequestTime + 'ms' : 'N/A',
            complexityDistribution: {
                simple: `${this.stats.complexityHandled.simple} (${((this.stats.complexityHandled.simple / total) * 100).toFixed(1)}%)`,
                intermediate: `${this.stats.complexityHandled.intermediate} (${((this.stats.complexityHandled.intermediate / total) * 100).toFixed(1)}%)`,
                complex: `${this.stats.complexityHandled.complex} (${((this.stats.complexityHandled.complex / total) * 100).toFixed(1)}%)`,
                expert: `${this.stats.complexityHandled.expert} (${((this.stats.complexityHandled.expert / total) * 100).toFixed(1)}%)`
            }
        };
    }

    /**
     * Enhanced validation with detailed feedback
     */
    validateQuestion(question) {
        if (!question || typeof question !== 'string') {
            return {
                isValid: false,
                message: 'Input harus berupa text yang valid.',
                suggestion: 'Ketik pertanyaan Anda dengan jelas.'
            };
        }

        const trimmed = question.trim();

        if (trimmed.length === 0) {
            return {
                isValid: false,
                message: 'Pertanyaan tidak boleh kosong.',
                suggestion: 'Mulai dengan kata tanya seperti "Bagaimana", "Apa", "Jelaskan", atau "Buat".'
            };
        }

        if (trimmed.length > 10000) {
            return {
                isValid: false,
                message: 'Pertanyaan terlalu panjang (maksimal 10.000 karakter).',
                suggestion: 'Pecah menjadi beberapa pertanyaan yang lebih fokus dan spesifik.'
            };
        }

        if (trimmed.length < 3) {
            return {
                isValid: false,
                message: 'Pertanyaan terlalu pendek.',
                suggestion: 'Berikan konteks lebih detail agar saya bisa membantu dengan optimal.'
            };
        }

        // Check for spam patterns
        if (/(.{3,})\1{5,}/.test(trimmed)) {
            return {
                isValid: false,
                message: 'Format tidak valid - terdeteksi sebagai spam.',
                suggestion: 'Gunakan kalimat natural dengan variasi kata.'
            };
        }

        // Check for excessive special characters
        const specialCharRatio = (trimmed.match(/[^a-zA-Z0-9\s]/g) || []).length / trimmed.length;
        if (specialCharRatio > 0.5) {
            return {
                isValid: false,
                message: 'Terlalu banyak karakter khusus.',
                suggestion: 'Gunakan teks yang lebih natural dengan huruf dan angka.'
            };
        }

        return { isValid: true };
    }

    /**
     * Comprehensive system status and capabilities
     */
    getSystemStats() {
        return {
            model: 'gemini-2.5-flash-ultimate',
            version: '3.0-elite-universal',
            capabilities: {
                'universal_knowledge': 'Expert level across all domains',
                'coding_expertise': 'Elite level - all languages, frameworks, tools',
                'indonesian_context': 'Deep cultural and business understanding',
                'ai_integration': 'Advanced AI/ML implementation guidance',
                'modern_tech_stack': 'Latest frameworks and best practices',
                'problem_solving': 'Multi-level complexity handling',
                'real_time_adaptation': 'Context-aware response optimization'
            },
            features: [
                'Adaptive complexity analysis',
                'Enhanced context processing (10 messages)',
                'Strategic emoji integration',
                'Code quality indicators',
                'Intelligent fallback system',
                'Performance optimization tracking',
                'Multi-level expertise (simple to expert)',
                'Cultural context awareness',
                'Best practices integration',
                'Real-world application focus'
            ],
            technical_specs: {
                max_context_messages: 10,
                max_output_tokens: 8192,
                temperature: 0.75,
                timeout: '50 seconds',
                retry_attempts: 3,
                fallback_categories: 5,
                complexity_levels: 4
            },
            performance: this.getPerformanceStats(),
            indonesian_specialties: [
                'Local business ecosystem understanding',
                'Cultural nuances and traditions',
                'Tech startup landscape',
                'Government digitalization initiatives',
                'Regional development opportunities',
                'Language learning support',
                'Tourism and cultural recommendations'
            ],
            coding_specialties: [
                'Modern JavaScript ecosystem (React 19, Next.js 14, Bun)',
                'Python excellence (Django, FastAPI, AI/ML)',
                'Cloud-native architecture (AWS, GCP, Kubernetes)',
                'AI/ML implementation (TensorFlow, PyTorch, LLM APIs)',
                'Mobile development (React Native, Flutter)',
                'DevOps and CI/CD (Docker, GitHub Actions, Terraform)',
                'Database optimization (SQL, NoSQL, Vector DBs)',
                'Security best practices and implementation'
            ],
            learning_approach: {
                'beginner_friendly': 'Clear explanations with analogies',
                'intermediate_guidance': 'Step-by-step implementations',
                'advanced_solutions': 'Architecture and optimization',
                'expert_consulting': 'Production-ready enterprise solutions'
            },
            response_quality: {
                'accuracy': 'Verified information with latest practices',
                'practicality': 'Working code and actionable solutions',
                'completeness': 'Comprehensive with examples and alternatives',
                'cultural_awareness': 'Indonesian context when relevant',
                'innovation_focus': 'Latest trends and emerging technologies'
            },
            status: 'fully_operational_elite_mode'
        };
    }

    /**
     * Smart question preprocessing
     */
    preprocessQuestion(question) {
        // Normalize whitespace
        question = question.trim().replace(/\s+/g, ' ');

        // Handle common misspellings for Indonesian tech terms
        const corrections = {
            'reactjs': 'React.js',
            'nodejs': 'Node.js',
            'nextjs': 'Next.js',
            'vuejs': 'Vue.js',
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'mongodb': 'MongoDB',
            'postgresql': 'PostgreSQL',
            'mysql': 'MySQL'
        };

        for (const [wrong, correct] of Object.entries(corrections)) {
            const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
            question = question.replace(regex, correct);
        }

        return question;
    }

    /**
     * Context relevance scoring
     */
    scoreContextRelevance(question, context) {
        if (!context || context.length === 0) return 0;

        const questionWords = question.toLowerCase().split(/\s+/);
        let relevanceScore = 0;

        context.slice(-5).forEach((msg, index) => {
            const msgWords = msg.text.toLowerCase().split(/\s+/);
            const commonWords = questionWords.filter(word =>
                msgWords.some(msgWord => msgWord.includes(word) || word.includes(msgWord))
            );

            // Recent messages get higher weight
            const timeWeight = (index + 1) / 5;
            relevanceScore += (commonWords.length / questionWords.length) * timeWeight;
        });

        return Math.min(relevanceScore, 1); // Cap at 1.0
    }

    /**
     * Enhanced ask method with preprocessing
     */
    async askQuestionEnhanced(question, context = []) {
        // Preprocess question
        const processedQuestion = this.preprocessQuestion(question);

        // Validate
        const validation = this.validateQuestion(processedQuestion);
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.message,
                suggestion: validation.suggestion,
                validation: false
            };
        }

        // Score context relevance
        const contextRelevance = this.scoreContextRelevance(processedQuestion, context);
        console.log(`📊 Context relevance: ${(contextRelevance * 100).toFixed(1)}%`);

        // Call main ask method
        return await this.askQuestion(processedQuestion, context);
    }
}

module.exports = new UltimateUniversalGeminiModel();