/**
 * MESSAGE MODEL - Data Structure for Messages
 */

class MessageModel {
  /**
   * Constructor - Create a new MessageModel instance
   * @param {Object} data - Message data
   */
  constructor(data) {
    this.id = data.id;
    this.conversationId = data.conversationId;
    this.senderType = data.senderType; // 'student' or 'landlord' or 'system'
    this.senderName = data.senderName;
    this.text = data.text;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.createdByKey = data.createdByKey;
  }

  /**
   * Convert message to response format
   * @returns {Object} Message object ready to send to client
   */
  toResponse() {
    return { ...this };
  }

  /**
   * Convert an array of messages to response format
   * @param {Array} messages - Array of message objects
   * @returns {Array} Array of message response objects
   */
  static toResponseList(messages) {
    return messages.map(message => {
      const model = message instanceof MessageModel ? message : new MessageModel(message);
      return model.toResponse();
    });
  }

  /**
   * Validate message data
   * @param {Object} data - Message data to validate
   * @returns {Object} { valid: boolean, errors: Array }
   */
  static validate(data) {
    const errors = [];
    
    if (!data.conversationId) {
      errors.push('Conversation ID required');
    }
    
    if (!data.senderType || !['student', 'landlord', 'system'].includes(data.senderType)) {
      errors.push('Valid sender type required');
    }
    
    if (!data.senderName || data.senderName.trim().length < 1) {
      errors.push('Sender name required');
    }
    
    if (!data.text || data.text.trim().length === 0) {
      errors.push('Message text required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = MessageModel;