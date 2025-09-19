const axios = require('axios');
const chatConfig = require('../config/chat.config');

/**
 * Chat Service - Handles chat/completions API requests
 * Manages conversation history and system prompts for AI assistant
 */
class ChatService {
    constructor() {
        // Load configuration
        this.config = chatConfig;
        this.apiEndpoint = this.config.api.endpoint;
        this.apiKey = this.config.api.apiKey;
        this.model = this.config.api.model;

        
        // Conversation history storage (in production, this should be persistent)
        this.conversations = new Map();
    }

    /**
     * Get or create conversation history for a user session
     * @param {string} sessionId - Unique session identifier
     * @returns {Array} Array of conversation messages
     */
    getConversationHistory(sessionId) {
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, []);
        }
        return this.conversations.get(sessionId);
    }

    /**
     * Add message to conversation history
     * @param {string} sessionId - Unique session identifier
     * @param {Object} message - Message object with role and content
     */
    addToConversation(sessionId, message) {
        const history = this.getConversationHistory(sessionId);
        history.push(message);
        
        // Keep only last N messages to prevent token limit issues
        const maxMessages = this.config.chat.maxHistoryMessages;
        if (history.length > maxMessages) {
            history.splice(0, history.length - maxMessages);
        }
    }

    /**
     * Build system prompt based on context
     * @param {string} context - Context type (travel, general, booking)
     * @param {Object} userInfo - Additional user context information
     * @returns {Object} System message object
     */
    buildSystemPrompt(context = 'travel', userInfo = {}) {
        const promptConfig = this.config.systemPrompts[context] || this.config.systemPrompts.general;
        let systemContent = promptConfig.content;
        
        // Add user-specific context if available
        if (userInfo.name) {
            systemContent += `\n\nThe customer's name is ${userInfo.name}.`;
        }
        
        if (userInfo.location) {
            systemContent += `\nThe customer is located in ${userInfo.location}.`;
        }
        
        if (userInfo.preferredLanguage && userInfo.preferredLanguage !== 'en') {
            systemContent += `\nPlease respond in ${userInfo.preferredLanguage} if the customer writes in that language.`;
        }

        return {
            role: 'system',
            content: systemContent
        };
    }

    /**
     * Create chat/completions API request payload
     * @param {string} userMessage - User's input message
     * @param {string} sessionId - Unique session identifier
     * @param {Object} options - Additional options
     * @returns {Object} API request payload
     */
    createChatRequest(userMessage, sessionId, options = {}) {
        const {
            context = 'travel',
            userInfo = {},
            temperature = 0.7,
            maxTokens = 500,
            includeHistory = true
        } = options;

        // Build messages array
        const messages = [];
        
        // Add system prompt
        messages.push(this.buildSystemPrompt(context, userInfo));
        
        // Add conversation history if requested
        if (includeHistory) {
            const history = this.getConversationHistory(sessionId);
            messages.push(...history);
        }
        
        // Add current user message
        const userMsg = {
            role: 'user',
            content: userMessage.trim()
        };
        messages.push(userMsg);
        
        // Store user message in conversation history
        this.addToConversation(sessionId, userMsg);

        // Create the API request payload
        return {
            model: this.model,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };
    }

    /**
     * Send chat request to API endpoint
     * @param {Object} requestPayload - Chat completion request payload
     * @returns {Promise<Object>} API response
     */
    async sendChatRequest(requestPayload) {
        try {
            const response = await axios.post(this.apiEndpoint, requestPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                timeout: 30000 // 30 second timeout
            });

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Chat API Error:', error.message);
            
            if (error.response) {
                return {
                    success: false,
                    error: `API Error: ${error.response.status} - ${error.response.statusText}`,
                    details: error.response.data
                };
            } else if (error.request) {
                return {
                    success: false,
                    error: 'Network error: Unable to reach chat API service'
                };
            } else {
                return {
                    success: false,
                    error: `Request error: ${error.message}`
                };
            }
        }
    }

    /**
     * Process user message and get AI response
     * @param {string} userMessage - User's input message
     * @param {string} sessionId - Unique session identifier
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Processed response
     */
    async processMessage(userMessage, sessionId, options = {}) {
        if (!userMessage || !userMessage.trim()) {
            return {
                success: false,
                error: 'Message cannot be empty'
            };
        }

        if (!sessionId) {
            return {
                success: false,
                error: 'Session ID is required'
            };
        }

        try {
            // Create the chat request
            const requestPayload = this.createChatRequest(userMessage, sessionId, options);
            
            // Send to API
            const response = await this.sendChatRequest(requestPayload);
            
            if (!response.success) {
                return response;
            }

            // Extract assistant response
            const assistantMessage = response.data.choices?.[0]?.message;
            
            if (!assistantMessage) {
                return {
                    success: false,
                    error: 'Invalid response format from chat API'
                };
            }

            // Store assistant response in conversation history
            this.addToConversation(sessionId, assistantMessage);

            return {
                success: true,
                message: assistantMessage.content,
                usage: response.data.usage,
                model: response.data.model,
                conversationLength: this.getConversationHistory(sessionId).length
            };

        } catch (error) {
            console.error('Chat processing error:', error);
            return {
                success: false,
                error: 'Failed to process chat message'
            };
        }
    }

    /**
     * Clear conversation history for a session
     * @param {string} sessionId - Session to clear
     */
    clearConversation(sessionId) {
        this.conversations.delete(sessionId);
    }

    /**
     * Get conversation statistics
     * @param {string} sessionId - Session ID
     * @returns {Object} Conversation stats
     */
    getConversationStats(sessionId) {
        const history = this.getConversationHistory(sessionId);
        const userMessages = history.filter(msg => msg.role === 'user').length;
        const assistantMessages = history.filter(msg => msg.role === 'assistant').length;
        
        return {
            totalMessages: history.length,
            userMessages,
            assistantMessages,
            sessionId
        };
    }
}

module.exports = ChatService;