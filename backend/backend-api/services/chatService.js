/**
 * CHAT SERVICE - Business Logic for Chat
 */

const conversationStorage = require('../utils/conversationStorage');
const messageStorage = require('../utils/messageStorage');
const ConversationModel = require('../models/ConversationModel');
const MessageModel = require('../models/MessageModel');

const canUserAccessConversation = (conversation, userIdentifier) => {
  if (!conversation) {
    return false;
  }

  return (
    !conversation.requesterIdentifier ||
    conversation.requesterIdentifier === userIdentifier ||
    conversation.landlordIdentifier === userIdentifier
  );
};

class ChatService {
  async getConversations(userIdentifier) {
    try {
      const conversations = (await conversationStorage.getConversationsByUserIdentifier(userIdentifier)).filter(
        (conversation) => conversation.requesterIdentifier !== conversation.landlordIdentifier
      );
      
      // Get last message for each conversation
      const conversationsWithLastMessage = await Promise.all(
        conversations.map(async (conversation) => {
          const messages = await messageStorage.getMessagesByConversationId(conversation.id);
          const latestStudentMessage = messages
            .filter((message) => message.senderType === 'student')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          const lastMessage = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          return {
            ...conversation,
            requesterName:
              conversation.requesterName ||
              latestStudentMessage?.senderName ||
              conversation.requesterIdentifier ||
              'Student',
            lastMessageText: lastMessage?.text || 'No messages yet.',
            lastMessageAt: lastMessage?.createdAt || conversation.updatedAt
          };
        })
      );

      const sortedConversations = conversationsWithLastMessage.sort((a, b) => 
        new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );

      return {
        success: true,
        message: 'Conversations retrieved successfully',
        data: ConversationModel.toResponseList(sortedConversations)
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving conversations',
        error: error.message
      };
    }
  }

  async getConversationById(conversationId, userIdentifier) {
    try {
      const conversation = await conversationStorage.findConversationById(conversationId);
      if (!canUserAccessConversation(conversation, userIdentifier)) {
        return {
          success: false,
          message: 'Conversation not found'
        };
      }
      return {
        success: true,
        message: 'Conversation retrieved successfully',
        data: new ConversationModel({
          ...conversation,
          requesterName: conversation.requesterName || conversation.requesterIdentifier || 'Student'
        }).toResponse()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving conversation',
        error: error.message
      };
    }
  }

  async getMessages(conversationId, userIdentifier) {
    try {
      const conversation = await conversationStorage.findConversationById(conversationId);
      if (!canUserAccessConversation(conversation, userIdentifier)) {
        return {
          success: false,
          message: 'Conversation not found'
        };
      }

      const messages = await messageStorage.getMessagesByConversationId(conversationId);
      return {
        success: true,
        message: 'Messages retrieved successfully',
        data: MessageModel.toResponseList(messages)
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving messages',
        error: error.message
      };
    }
  }

  async ensureConversation(conversationData) {
    try {
      const existing = await conversationStorage.findConversationByListingAndRequester(
        conversationData.listingId, 
        conversationData.requesterIdentifier
      );
      
      if (existing) {
        return {
          success: true,
          message: 'Conversation already exists',
          data: new ConversationModel(existing).toResponse()
        };
      }

      const validation = ConversationModel.validate(conversationData);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        };
      }

      const conversation = await conversationStorage.saveConversation({
        ...conversationData,
        requesterName: conversationData.requesterName || conversationData.requesterIdentifier || 'Student',
        id: conversationData.id || `conv_${Date.now()}`,
        createdAt: conversationData.createdAt || new Date().toISOString(),
        updatedAt: conversationData.updatedAt || new Date().toISOString()
      });
      
      // Add initial system message
      const systemMessage = {
        id: `msg_${Date.now()}`,
        conversationId: conversation.id,
        senderType: 'system',
        senderName: 'Roomie',
        text: `Conversation started for "${conversationData.listingTitle}".`,
        createdAt: new Date().toISOString(),
        createdByKey: null
      };
      await messageStorage.saveMessage(systemMessage);

      return {
        success: true,
        message: 'Conversation created successfully',
        data: new ConversationModel(conversation).toResponse()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creating conversation',
        error: error.message
      };
    }
  }

  async sendMessage(messageData) {
    try {
      const validation = MessageModel.validate(messageData);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        };
      }

      const message = await messageStorage.saveMessage({
        ...messageData,
        id: messageData.id || `msg_${Date.now()}`,
        createdAt: messageData.createdAt || new Date().toISOString()
      });
      
      // Update conversation updatedAt
      await conversationStorage.updateConversation(messageData.conversationId, {
        updatedAt: message.createdAt
      });

      return {
        success: true,
        message: 'Message sent successfully',
        data: new MessageModel(message).toResponse()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error sending message',
        error: error.message
      };
    }
  }

  async clearChatDataForUser(userKey) {
    try {
      const deletedMessages = await messageStorage.deleteMessagesByUserKey(userKey);
      return {
        success: true,
        message: `${deletedMessages} messages deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error clearing chat data',
        error: error.message
      };
    }
  }
}

module.exports = new ChatService();
