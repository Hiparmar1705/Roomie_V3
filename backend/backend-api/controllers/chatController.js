const chatService = require('../services/chatService');

const getConversations = async (req, res) => {
  try {
    const { userIdentifier } = req.query;
    console.log(`[API] ${new Date().toISOString()} - GET /api/chat/conversations - userIdentifier: ${userIdentifier}`);
    const result = await chatService.getConversations(userIdentifier);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIdentifier } = req.query;
    console.log(`[API] ${new Date().toISOString()} - GET /api/chat/conversations/${id} - userIdentifier: ${userIdentifier}`);
    const result = await chatService.getConversationById(id, userIdentifier);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIdentifier } = req.query;
    console.log(`[API] ${new Date().toISOString()} - GET /api/chat/conversations/${id}/messages - userIdentifier: ${userIdentifier}`);
    const result = await chatService.getMessages(id, userIdentifier);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const ensureConversation = async (req, res) => {
  try {
    console.log(`[API] ${new Date().toISOString()} - POST /api/chat/conversations/ensure`);
    const conversationData = req.body;
    const result = await chatService.ensureConversation(conversationData);
    
    if (result.success) {
      res.status(result.data ? 200 : 201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    console.log(`[API] ${new Date().toISOString()} - POST /api/chat/messages`);
    const messageData = req.body;
    const result = await chatService.sendMessage(messageData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const clearChatData = async (req, res) => {
  try {
    const { userKey } = req.query;
    console.log(`[API] ${new Date().toISOString()} - DELETE /api/chat/data - userKey: ${userKey}`);
    const result = await chatService.clearChatDataForUser(userKey);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getConversations,
  getConversationById,
  getMessages,
  ensureConversation,
  sendMessage,
  clearChatData
};