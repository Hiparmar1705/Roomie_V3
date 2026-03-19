const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getConversations,
  getConversationById,
  getMessages,
  ensureConversation,
  sendMessage,
  clearChatData
} = require('../controllers/chatController');

const validateConversation = [
  body('listingId')
    .notEmpty()
    .withMessage('Listing ID is required'),
  body('listingTitle')
    .trim()
    .notEmpty()
    .withMessage('Listing title is required')
    .isLength({ min: 3 })
    .withMessage('Listing title must be at least 3 characters long'),
  body('landlordName')
    .trim()
    .notEmpty()
    .withMessage('Landlord name is required')
    .isLength({ min: 2 })
    .withMessage('Landlord name must be at least 2 characters long'),
  body('landlordIdentifier')
    .notEmpty()
    .withMessage('Landlord identifier is required'),
  body('requesterIdentifier')
    .notEmpty()
    .withMessage('Requester identifier is required'),
  body('requesterName')
    .optional()
    .trim()
];

const validateMessage = [
  body('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required'),
  body('senderType')
    .isIn(['student', 'landlord', 'system'])
    .withMessage('Sender type must be student, landlord, or system'),
  body('senderName')
    .trim()
    .notEmpty()
    .withMessage('Sender name is required'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Message text is required'),
  body('createdByKey')
    .optional()
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/chat/conversations - Get conversations for user
router.get('/conversations', getConversations);

// GET /api/chat/conversations/:id - Get conversation by ID
router.get('/conversations/:id', getConversationById);

// GET /api/chat/conversations/:id/messages - Get messages for conversation
router.get('/conversations/:id/messages', getMessages);

// POST /api/chat/conversations/ensure - Ensure conversation exists
router.post('/conversations/ensure', validateConversation, checkValidation, ensureConversation);

// POST /api/chat/messages - Send message
router.post('/messages', validateMessage, checkValidation, sendMessage);

// DELETE /api/chat/data - Clear chat data for user
router.delete('/data', clearChatData);

module.exports = router;
