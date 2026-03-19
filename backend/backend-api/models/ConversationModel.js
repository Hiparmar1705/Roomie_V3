/**
 * CONVERSATION MODEL - Data Structure for Conversations
 */

class ConversationModel {
  /**
   * Constructor - Create a new ConversationModel instance
   * @param {Object} data - Conversation data
   */
  constructor(data) {
    this.id = data.id;
    this.listingId = data.listingId;
    this.listingTitle = data.listingTitle;
    this.landlordName = data.landlordName;
    this.landlordIdentifier = data.landlordIdentifier;
    this.requesterIdentifier = data.requesterIdentifier;
    this.requesterName = data.requesterName;
    this.lastMessageText = data.lastMessageText;
    this.lastMessageAt = data.lastMessageAt || data.updatedAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Convert conversation to response format
   * @returns {Object} Conversation object ready to send to client
   */
  toResponse() {
    return { ...this };
  }

  /**
   * Convert an array of conversations to response format
   * @param {Array} conversations - Array of conversation objects
   * @returns {Array} Array of conversation response objects
   */
  static toResponseList(conversations) {
    return conversations.map(conversation => {
      const model = conversation instanceof ConversationModel ? conversation : new ConversationModel(conversation);
      return model.toResponse();
    });
  }

  /**
   * Validate conversation data
   * @param {Object} data - Conversation data to validate
   * @returns {Object} { valid: boolean, errors: Array }
   */
  static validate(data) {
    const errors = [];
    
    if (!data.listingId) {
      errors.push('Listing ID required');
    }
    
    if (!data.listingTitle || data.listingTitle.trim().length < 3) {
      errors.push('Listing title required');
    }
    
    if (!data.landlordName || data.landlordName.trim().length < 2) {
      errors.push('Landlord name required');
    }
    
    if (!data.landlordIdentifier) {
      errors.push('Landlord identifier required');
    }
    
    if (!data.requesterIdentifier) {
      errors.push('Requester identifier required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = ConversationModel;
