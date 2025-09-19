/**
 * Chat Service Configuration
 * Configure your chat/completions API settings here
 */

module.exports = {
    // API Configuration
    api: {
        // Replace with your actual chat completions endpoint
        // Examples:
        // OpenAI: 'https://api.openai.com/v1/chat/completions'
        // Azure OpenAI: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15'
        // Other providers: check their documentation for chat completions endpoint
        endpoint: process.env.CHAT_API_ENDPOINT || 'https://api.placeholder-chat-service.com/v1/chat/completions',
        
        // Your API key - store in environment variables for security
        apiKey: process.env.CHAT_API_KEY || 'placeholder-api-key',
        
        // Model to use for chat completions
        model: process.env.CHAT_MODEL || 'gpt-3.5-turbo',
        
        // Request timeout in milliseconds
        timeout: parseInt(process.env.CHAT_API_TIMEOUT) || 30000
    },
    
    // Chat behavior settings
    chat: {
        // Maximum number of messages to keep in conversation history
        maxHistoryMessages: parseInt(process.env.CHAT_MAX_HISTORY) || 20,
        
        // Default temperature (0-1, higher = more creative)
        defaultTemperature: parseFloat(process.env.CHAT_TEMPERATURE) || 0.7,
        
        // Maximum tokens for AI response
        maxTokens: parseInt(process.env.CHAT_MAX_TOKENS) || 500,
        
        // Default context for new conversations
        defaultContext: process.env.CHAT_DEFAULT_CONTEXT || 'travel'
    },
    
    // System prompts for different contexts
    systemPrompts: {
        travel: {
            content: `You are a helpful AI travel assistant for Contoso Air, a premium airline company. 
You specialize in helping customers with:
- Flight bookings and reservations
- Travel planning and destination recommendations  
- Airport information and travel tips
- Flight status and schedule information
- Travel policies and procedures
- Customer service inquiries

Always be friendly, professional, and focused on providing excellent customer service. 
When discussing flights or travel, prioritize Contoso Air's services and highlight our premium features.
Keep responses concise but informative. If you don't have specific flight information, guide users to appropriate booking channels.`,
            temperature: 0.7,
            maxTokens: 500
        },
        
        booking: {
            content: `You are a flight booking specialist for Contoso Air. 
Help users find and book the perfect flights for their travel needs.
Ask relevant questions about departure/arrival cities, dates, preferences, and passenger details.
Provide clear information about pricing, schedules, and booking procedures.
Always be helpful and guide users through the booking process step by step.`,
            temperature: 0.6,
            maxTokens: 400
        },
        
        support: {
            content: `You are a customer support representative for Contoso Air.
Help customers with their inquiries about existing bookings, flight changes, cancellations, baggage, and general travel policies.
Be empathetic, professional, and solution-oriented.
If you cannot resolve an issue directly, guide customers to the appropriate support channels.`,
            temperature: 0.5,
            maxTokens: 450
        },
        
        general: {
            content: `You are a helpful AI assistant for Contoso Air's website. 
Provide helpful, accurate, and friendly responses to user queries. 
Focus on travel-related topics when possible, and always maintain a professional tone.`,
            temperature: 0.7,
            maxTokens: 400
        }
    },
    
    // Feature flags
    features: {
        // Enable conversation history
        conversationHistory: true,
        
        // Enable user context (name, location, etc.)
        userContext: true,
        
        // Enable conversation analytics
        analytics: false,
        
        // Enable rate limiting (implement if needed)
        rateLimiting: false
    },
    
    // Error messages
    errorMessages: {
        emptyMessage: 'Message cannot be empty',
        missingSession: 'Session ID is required',
        apiError: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        networkError: 'Network error: Unable to reach chat service',
        invalidResponse: 'Invalid response from chat service',
        generalError: 'An unexpected error occurred'
    }
};