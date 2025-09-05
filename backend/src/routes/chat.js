const express = require('express');
const ChatService = require('../services/chatService');

const router = express.Router();
const chatService = new ChatService();

// Start a new chat session
router.post('/session', async (req, res) => {
  try {
    const { repositoryId } = req.body;
    
    if (!repositoryId) {
      return res.status(400).json({ error: 'Repository ID is required' });
    }

    const session = await chatService.createSession(repositoryId);
    
    res.json({
      success: true,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Chat session creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create chat session',
      message: error.message 
    });
  }
});

// Send a message in a chat session
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const response = await chatService.sendMessage(sessionId, message);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
});

// Get chat session history
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await chatService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Chat session fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat session',
      message: error.message 
    });
  }
});

module.exports = router;
