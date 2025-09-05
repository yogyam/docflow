const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs-extra');
const path = require('path');

class ChatService {
  constructor() {
    // Make Gemini AI optional during development
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('✅ Gemini AI initialized for chat');
    } else {
      console.warn('⚠️  Gemini API key missing - chat will use fallback responses');
      this.model = null;
    }
    this.sessions = new Map(); // In-memory storage for hackathon (would use DB in production)
  }

  async createSession(repositoryId) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Load documentation context
    const documentationContext = await this.loadDocumentationContext(repositoryId);
    
    const session = {
      id: sessionId,
      repositoryId,
      messages: [],
      context: documentationContext,
      createdAt: new Date().toISOString()
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async sendMessage(sessionId, userMessage) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message to history
    const userMsg = {
      id: `msg_${Date.now()}`,
      content: userMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    session.messages.push(userMsg);

    try {
      let assistantMessage;

      if (this.model) {
        // Use Gemini AI for real responses
        const systemPrompt = this.buildSystemPrompt(session.context);
        const conversationHistory = session.messages.slice(-10).map(msg => 
          `${msg.role}: ${msg.content}`
        ).join('\n');
        
        const prompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nUser: ${userMessage}\n\nAssistant:`;

        const result = await this.model.generateContent(prompt);

        assistantMessage = {
          id: `msg_${Date.now()}_assistant`,
          content: result.response.text(),
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
      } else {
        // Fallback response when Gemini AI is not available
        assistantMessage = {
          id: `msg_${Date.now()}_assistant`,
          content: this.generateFallbackResponse(userMessage, session.context),
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
      }

      session.messages.push(assistantMessage);
      return assistantMessage;

    } catch (error) {
      throw new Error(`Failed to get chat response: ${error.message}`);
    }
  }

  async loadDocumentationContext(repositoryId) {
    try {
      const docsPath = path.join(
        process.env.DOCS_OUTPUT_DIR || './generated-docs', 
        repositoryId.replace('/', '_')
      );
      
      const context = [];
      
      if (await fs.pathExists(docsPath)) {
        const files = await fs.readdir(docsPath, { recursive: true });
        
        for (const file of files) {
          if (file.endsWith('.mdx')) {
            const filePath = path.join(docsPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            context.push({
              file: file,
              content: content.slice(0, 2000) // Truncate for token limits
            });
          }
        }
      }
      
      return context;
    } catch (error) {
      console.error('Failed to load documentation context:', error);
      return [];
    }
  }

  buildSystemPrompt(documentationContext) {
    const contextText = documentationContext
      .map(doc => `File: ${doc.file}\n${doc.content}`)
      .join('\n\n---\n\n');

    return `You are a helpful documentation assistant for a software project. You have access to the project's documentation and should answer questions based on this information.

Documentation Context:
${contextText}

Instructions:
- Answer questions based on the provided documentation
- Be concise and helpful
- If you don't know something based on the docs, say so
- Provide code examples when relevant
- Focus on practical, actionable advice
- If asked about setup or installation, refer to the quick start guide
- For API questions, refer to the API reference documentation`;
  }

  generateFallbackResponse(userMessage, context) {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based responses for demo
    if (message.includes('setup') || message.includes('install')) {
      return "To set up this project:\n1. Clone the repository\n2. Run `npm install`\n3. Configure environment variables\n4. Start with `npm run dev`\n\n*Note: Connect OpenAI API key for AI-powered responses*";
    } else if (message.includes('api') || message.includes('endpoint')) {
      return "This project includes several API endpoints. Check the generated documentation for detailed API reference including endpoints, parameters, and examples.\n\n*Note: Connect OpenAI API key for detailed API assistance*";
    } else if (message.includes('help') || message.includes('how')) {
      return "I'm here to help with questions about this project! You can ask about:\n- Setup and installation\n- API endpoints and usage\n- Project structure\n- Development workflow\n\n*Note: Connect OpenAI API key for more detailed assistance*";
    } else {
      return "I'd be happy to help! However, I need an OpenAI API key to provide detailed responses. For now, please check the generated documentation or ask about setup, API endpoints, or general project questions.\n\n*Tip: Add OPENAI_API_KEY to your .env file for full AI assistance*";
    }
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  async getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

module.exports = ChatService;
