# Contoso Air Chat Service

A comprehensive chat library for handling AI-powered customer support conversations using OpenAI's chat/completions API format.

## Features

- ✅ OpenAI chat/completions API integration
- ✅ Conversation history management
- ✅ Custom system prompts for travel context
- ✅ Session-based conversations
- ✅ Error handling and fallbacks
- ✅ Configurable settings
- ✅ Multiple conversation contexts (travel, booking, support)
- ✅ Real-time chat UI with loading states

## Setup

### 1. Environment Configuration

Create a `.env` file or set environment variables:

```bash
# Required: Chat API Configuration
CHAT_API_ENDPOINT=https://api.openai.com/v1/chat/completions
CHAT_API_KEY=your-openai-api-key-here
CHAT_MODEL=gpt-3.5-turbo

# Optional: Chat Behavior Settings
CHAT_TEMPERATURE=0.7
CHAT_MAX_TOKENS=500
CHAT_MAX_HISTORY=20
CHAT_DEFAULT_CONTEXT=travel
CHAT_API_TIMEOUT=30000
```

### 2. API Endpoints

The service provides several REST endpoints:

#### Send Message
```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "I need help booking a flight to Barcelona",
  "sessionId": "optional-session-id",
  "context": "travel",
  "userInfo": {
    "name": "John Doe",
    "location": "New York"
  }
}
```

#### Get Conversation History
```http
GET /api/chat/conversation/:sessionId
```

#### Clear Conversation
```http
DELETE /api/chat/conversation/:sessionId
```

#### Health Check
```http
GET /api/chat/health
```

#### Test Endpoint
```http
POST /api/chat/test
Content-Type: application/json

{
  "message": "Hello, test message"
}
```

## Usage Examples

### Basic Chat Integration

```javascript
// Frontend JavaScript example
async function sendMessage(userMessage) {
    const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: userMessage,
            sessionId: 'user_session_123',
            context: 'travel'
        })
    });
    
    const data = await response.json();
    return data.response;
}
```

### Backend Service Usage

```javascript
const ChatService = require('./services/chat.service');
const chatService = new ChatService();

// Process a message
const result = await chatService.processMessage(
    "I want to book a flight to Paris",
    "session_123",
    { context: 'booking' }
);

console.log(result.message); // AI response
```

## Configuration

### System Prompts

Customize AI behavior by editing `/config/chat.config.js`:

```javascript
systemPrompts: {
    travel: {
        content: "Your custom travel assistant prompt...",
        temperature: 0.7,
        maxTokens: 500
    },
    booking: {
        content: "Your custom booking specialist prompt...",
        temperature: 0.6,
        maxTokens: 400
    }
}
```

### Available Contexts

- **travel**: General travel assistance and information
- **booking**: Flight booking and reservations
- **support**: Customer support and issue resolution
- **general**: General-purpose assistance

## API Providers

### OpenAI
```bash
CHAT_API_ENDPOINT=https://api.openai.com/v1/chat/completions
CHAT_API_KEY=sk-your-openai-key
CHAT_MODEL=gpt-3.5-turbo
```

### Azure OpenAI
```bash
CHAT_API_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
CHAT_API_KEY=your-azure-key
CHAT_MODEL=gpt-35-turbo
```

### Other Providers
Any API compatible with OpenAI's chat/completions format should work.

## Error Handling

The service includes comprehensive error handling:

- Network timeouts
- API rate limits
- Invalid responses
- Authentication failures
- Service unavailability

## Frontend Integration

The chat UI is integrated into the navbar and includes:

- Slide-out chat panel
- Real-time messaging
- Loading indicators
- Error states
- Responsive design
- Conversation persistence

## Development

### Testing the Service

```bash
# Start the application
npm start

# Test the chat endpoint
curl -X POST http://localhost:3000/api/chat/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test message"}'

# Check service health
curl http://localhost:3000/api/chat/health
```

### File Structure

```
src/web/
├── config/
│   └── chat.config.js       # Chat service configuration
├── services/
│   └── chat.service.js      # Main chat service class
├── routes/
│   └── chat.js              # Express routes for chat API
└── views/partials/common/
    └── navbar.hbs           # Frontend chat UI
```

## Security Considerations

1. **API Keys**: Store in environment variables, never in code
2. **Rate Limiting**: Implement rate limiting for production use
3. **Input Validation**: Validate and sanitize all user inputs
4. **Session Management**: Implement proper session security
5. **HTTPS**: Always use HTTPS in production

## Production Deployment

1. Set proper environment variables
2. Configure your chat API endpoint and credentials
3. Implement rate limiting and monitoring
4. Set up proper logging and error tracking
5. Configure HTTPS and security headers

## Troubleshooting

### Common Issues

1. **"Network error" messages**: Check API endpoint and connectivity
2. **"Invalid API key"**: Verify CHAT_API_KEY environment variable
3. **Slow responses**: Adjust CHAT_API_TIMEOUT or check API performance
4. **Empty responses**: Verify API model and token limits

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## License

This project is part of the Contoso Air application.