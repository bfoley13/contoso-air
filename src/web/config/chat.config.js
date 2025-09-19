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
        endpoint: process.env.CHAT_API_ENDPOINT || 'http://<YOUR_RAG_URL>/v1/chat/completions',
        
        // Your API key - store in environment variables for security
        apiKey: process.env.CHAT_API_KEY || 'placeholder-api-key',
        
        // Model to use for chat completions
        model: process.env.CHAT_MODEL || 'deepseek-r1',
        
        // Request timeout in milliseconds
        timeout: parseInt(process.env.CHAT_API_TIMEOUT) || 120000
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
- Flight bookings and reservations through ContosoAir
- Travel planning and destination recommendations with ContosoAir in mind
- Airport information and travel tips based on user preferences
- Flight status and schedule information
- Travel policies and procedures

Always be friendly, professional, and focused on providing excellent customer service. 
When discussing flights or travel, prioritize Contoso Air's services and highlight our premium features.
Keep responses concise but informative. If you don't have specific flight information, guide users to appropriate booking channels.
Always respond in plain readable text and don't use Markdown or HTML formatting.`,
            temperature: 0.7,
            maxTokens: 16000
        },
        
        booking: {
            content: `You are a flight booking specialist for Contoso Air. 
Help users find and book the perfect flights for their travel needs.
Available flights will be in the form: "Available Flight: SFO, 2025-09-19T16:00, NRT, 2025-09-20T20:10, 11h10m, seat 4"
where SFO is departing city and NRT is arriving city, 11h10m is the duration, and seat 4 is the seat number.
Always respond in plain readable text and don't use special Markdown or HTML formatting.
Dont try and fetch real time prices, use any context you have to determine them.`,
            temperature: 0.6,
            maxTokens: 16000
        },
        
        support: {
            content: `You are a customer support representative for Contoso Air.
Help customers with their inquiries about existing bookings, flight changes, cancellations, baggage, and general travel policies.
Be empathetic, professional, and solution-oriented.
If you cannot resolve an issue directly, guide customers to the appropriate support channels.`,
            temperature: 0.5,
            maxTokens: 16000
        },
        
        general: {
            content: `You are a helpful AI assistant for Contoso Air's website. 
Provide helpful, accurate, and friendly responses to user queries. 
Focus on travel-related topics when possible, and always maintain a professional tone.`,
            temperature: 0.7,
            maxTokens: 16000
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