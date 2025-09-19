const express = require('express');
const router = express.Router();
const ChatService = require('../services/chat.service');

// Initialize chat service
const chatService = new ChatService();

/**
 * POST /api/chat/message
 * Process a chat message and return AI response
 */
router.post('/message', async (req, res) => {
    try {
        const { message, sessionId, context, userInfo } = req.body;

        // Validate required fields
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Generate session ID if not provided
        const actualSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Process the message
        const response = await chatService.processMessage(message, actualSessionId, {
            context: context || 'travel',
            userInfo: userInfo || {}
        });

        if (!response.success) {
            return res.status(500).json(response);
        }

        // Return successful response
        res.json({
            success: true,
            response: response.message,
            sessionId: actualSessionId,
            usage: response.usage,
            model: response.model,
            conversationStats: chatService.getConversationStats(actualSessionId)
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error processing chat message'
        });
    }
});

/**
 * GET /api/chat/conversation/:sessionId
 * Get conversation history for a session
 */
router.get('/conversation/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = chatService.getConversationHistory(sessionId);
        const stats = chatService.getConversationStats(sessionId);

        res.json({
            success: true,
            history,
            stats
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversation history'
        });
    }
});

/**
 * DELETE /api/chat/conversation/:sessionId
 * Clear conversation history for a session
 */
router.delete('/conversation/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        chatService.clearConversation(sessionId);

        res.json({
            success: true,
            message: 'Conversation cleared successfully'
        });
    } catch (error) {
        console.error('Clear conversation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear conversation'
        });
    }
});

/**
 * POST /api/chat/test
 * Test endpoint to verify chat service functionality
 */
router.post('/test', async (req, res) => {
    try {
        const testMessage = req.body.message || "Hello, I need help with booking a flight";
        const testSessionId = `test_${Date.now()}`;

        // Test the chat service with a simple request
        const response = await chatService.processMessage(testMessage, testSessionId, {
            context: 'travel'
        });

        res.json({
            success: true,
            testMessage,
            testSessionId,
            response,
            note: "This is a test endpoint. In production, replace the placeholder API endpoint with actual chat service."
        });
    } catch (error) {
        console.error('Chat test error:', error);
        res.status(500).json({
            success: false,
            error: 'Chat service test failed',
            details: error.message
        });
    }
});

/**
 * GET /api/chat/health
 * Health check endpoint for chat service
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'Chat API',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoint: chatService.apiEndpoint,
        model: chatService.model
    });
});

module.exports = router;