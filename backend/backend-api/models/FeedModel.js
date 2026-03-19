/**
 * FEED MODEL - Data Structure for Feeds
 * 
 * This class defines what a Feed (post) looks like and provides helper methods.
 * 
 * Purpose:
 * - Define feed data structure
 * - Convert feed data to response format
 * - Validate feed data before saving
 * - Provide utility methods (sort, filter)
 */

class FeedModel {
  /**
   * Constructor - Create a new FeedModel instance
   * @param {Object} data - Feed data
   */
  constructor(data) {
    this.id = data.id;
    this.avatar = data.avatar;           // User's profile picture URL
    this.name = data.name;               // User's display name
    this.username = data.username;        // User's username
    this.image = data.image;             // Post image URL
    this.caption = data.caption;         // Post caption/title
    this.text = data.text || '';         // Post description (optional)
    this.datetime = data.datetime || new Date().toISOString();  // When posted
  }

  /**
   * Convert feed to response format
   * @returns {Object} Feed object ready to send to client
   */
  toResponse() {
    // Return all properties as-is (no sensitive data to hide)
    return { ...this };
  }

  /**
   * Convert an array of feeds to response format
   * @param {Array} feeds - Array of feed objects
   * @returns {Array} Array of feed response objects
   */
  static toResponseList(feeds) {
    return feeds.map(feed => {
      // If already a FeedModel, use it; otherwise create new one
      const model = feed instanceof FeedModel ? feed : new FeedModel(feed);
      return model.toResponse();
    });
  }

  /**
   * Validate feed data before saving
   * @param {Object} data - Feed data to validate
   * @returns {Object} { valid: boolean, errors: Array }
   */
  static validate(data) {
    const errors = [];
    
    // Check name
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    // Check username
    if (!data.username || data.username.trim().length < 2) {
      errors.push('Username must be at least 2 characters');
    }
    
    // Check image URL
    if (!data.image) {
      errors.push('Image URL required');
    }
    
    // Check caption
    if (!data.caption || !data.caption.trim()) {
      errors.push('Caption required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create feed object ready for database storage
   * Adds default values and generates ID if needed
   * @param {Object} data - Feed input data
   * @returns {Object} Feed object ready for database
   */
  static createForStorage(data) {
    return {
      id: data.id || Date.now().toString(),  // Generate ID if not provided
      avatar: data.avatar || null,
      name: data.name,
      username: data.username,
      image: data.image,
      caption: data.caption,
      text: data.text || '',  // Default to empty string
      datetime: data.datetime || new Date().toISOString()  // Current time if not provided
    };
  }

  /**
   * Sort feeds by datetime (newest or oldest first)
   * @param {Array} feeds - Array of feed objects
   * @param {string} order - 'asc' (oldest first) or 'desc' (newest first)
   * @returns {Array} Sorted feeds array
   */
  static sortByDatetime(feeds, order = 'desc') {
    // Create a copy of the array (don't modify original)
    return [...feeds].sort((a, b) => {
      const dateA = new Date(a.datetime || 0);  // Convert to Date object
      const dateB = new Date(b.datetime || 0);
      
      // Sort: desc = newest first, asc = oldest first
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  /**
   * Filter feeds by username
   * @param {Array} feeds - Array of feed objects
   * @param {string} username - Username to filter by
   * @returns {Array} Filtered feeds array
   */
  static filterByUsername(feeds, username) {
    // Return only feeds where username matches
    return feeds.filter(feed => feed.username === username);
  }
}

// Export the class so other files can use it
module.exports = FeedModel;
