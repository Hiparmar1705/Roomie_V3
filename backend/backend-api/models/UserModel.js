/**
 * USER MODEL - Data Structure for Users
 * 
 * This class defines what a User looks like and provides helper methods.
 * It's like a blueprint for user data.
 * 
 * Purpose:
 * - Define user data structure
 * - Convert user data to safe response format (hides password)
 * - Validate user data before saving
 */

class UserModel {
  /**
   * Constructor - Create a new UserModel instance
   * @param {Object} data - User data (id, identifier, role, displayName, bio, location, profileImageUri, password, createdAt)
   */
  constructor(data) {
    this.id = data.id;
    this.identifier = data.identifier; // email for student, phone for landlord
    this.role = data.role; // 'Student' or 'Landlord'
    this.displayName = data.displayName;
    this.bio = data.bio || '';
    this.location = data.location || '';
    this.profileImageUri = data.profileImageUri || '';
    this.favoriteListingIds = Array.isArray(data.favoriteListingIds) ? data.favoriteListingIds : [];
    this.password = data.password;  // ⚠️ Never send this in responses!
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Convert user to response format
   * Removes sensitive data like password before sending to client
   * @returns {Object} User object without password
   */
  toResponse() {
    // Destructure: get password separately, everything else goes to response
    const { password, ...response } = this;
    return response;  // Returns user data without password
  }

  /**
   * Convert an array of users to response format
   * @param {Array} users - Array of user objects
   * @returns {Array} Array of user response objects (without passwords)
   */
  static toResponseList(users) {
    return users.map(user => {
      // If already a UserModel, use it; otherwise create new one
      const model = user instanceof UserModel ? user : new UserModel(user);
      return model.toResponse();  // Remove password from each user
    });
  }

  /**
   * Validate user data before saving
   * Checks if identifier, role, displayName are valid
   * @param {Object} data - User data to validate
   * @returns {Object} { valid: boolean, errors: Array }
   */
  static validate(data) {
    const errors = [];
    
    // Check identifier
    if (!data.identifier || data.identifier.trim().length === 0) {
      errors.push('Identifier required');
    } else {
      if (data.role === 'Student') {
        if (!data.identifier.trim().toLowerCase().endsWith('@unbc.ca')) {
          errors.push('Students must use @unbc.ca email');
        }
      } else if (data.role === 'Landlord') {
        // Basic phone validation - exactly 10 digits
        const digitsOnly = data.identifier.replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
          errors.push('Phone number must be exactly 10 digits');
        }
      }
    }
    
    // Check role
    if (!data.role || !['Student', 'Landlord'].includes(data.role)) {
      errors.push('Valid role required (Student or Landlord)');
    }
    
    // Check displayName
    if (!data.displayName || data.displayName.trim().length < 2) {
      errors.push('Display name must be at least 2 characters');
    }
    
    // Check password (only if provided)
    if (data.password && data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return {
      valid: errors.length === 0,  // true if no errors
      errors                        // array of error messages
    };
  }
}

// Export the class so other files can use it
module.exports = UserModel;
