/**
 * LISTING MODEL - Data Structure for Listings
 * 
 * This class defines what a Listing looks like and provides helper methods.
 */

const FALLBACK_LISTING_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800';

class ListingModel {
  /**
   * Constructor - Create a new ListingModel instance
   * @param {Object} data - Listing data
   */
  constructor(data) {
    const normalizedImageUrl =
      typeof data.imageUrl === 'string' && /^(https?:\/\/|data:image\/)/i.test(data.imageUrl.trim())
        ? data.imageUrl.trim()
        : FALLBACK_LISTING_IMAGE;

    this.id = data.id;
    this.title = data.title;
    this.price = data.price;
    this.priceAmount = data.priceAmount;
    this.imageUrl = normalizedImageUrl;
    this.type = data.type;
    this.description = data.description;
    this.location = data.location;
    this.distanceKm = Number.isFinite(Number(data.distanceKm)) ? Number(data.distanceKm) : 0;
    this.landlordName = data.landlordName;
    this.landlordIdentifier = data.landlordIdentifier;
    this.createdByKey = data.createdByKey;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Convert listing to response format
   * @returns {Object} Listing object ready to send to client
   */
  toResponse() {
    return { ...this };
  }

  /**
   * Convert an array of listings to response format
   * @param {Array} listings - Array of listing objects
   * @returns {Array} Array of listing response objects
   */
  static toResponseList(listings) {
    return listings.map(listing => {
      const model = listing instanceof ListingModel ? listing : new ListingModel(listing);
      return model.toResponse();
    });
  }

  /**
   * Validate listing data before saving
   * @param {Object} data - Listing data to validate
   * @returns {Object} { valid: boolean, errors: Array }
   */
  static validate(data) {
    const errors = [];
    
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    
    if (!data.priceAmount || data.priceAmount <= 0) {
      errors.push('Valid price required');
    }
    
    if (!data.type) {
      errors.push('Type required');
    }
    
    if (!data.description || data.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }
    
    if (!data.location || data.location.trim().length < 3) {
      errors.push('Location required');
    }
    
    if (!data.landlordName || data.landlordName.trim().length < 2) {
      errors.push('Landlord name required');
    }
    
    if (!data.landlordIdentifier) {
      errors.push('Landlord identifier required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = ListingModel;
