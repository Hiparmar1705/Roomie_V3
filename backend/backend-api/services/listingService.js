/**
 * LISTING SERVICE - Business Logic for Listings
 */

const listingStorage = require('../utils/listingStorage');
const ListingModel = require('../models/ListingModel');

const FALLBACK_LISTING_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800';

const buildOwnerKey = ({ identifier = '', role }) => {
  if (!identifier || !role) {
    return null;
  }

  const normalizedIdentifier =
    role === 'Landlord' ? String(identifier).replace(/\D/g, '') : String(identifier).trim().toLowerCase();

  return `${role}:${normalizedIdentifier}`;
};

class ListingService {
  async getAllListings() {
    try {
      const listings = await listingStorage.getAllListings();
      return {
        success: true,
        message: 'Listings retrieved successfully',
        data: ListingModel.toResponseList(listings)
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving listings',
        error: error.message
      };
    }
  }

  async getListingById(id) {
    try {
      const listing = await listingStorage.findListingById(id);
      if (!listing) {
        return {
          success: false,
          message: 'Listing not found'
        };
      }
      return {
        success: true,
        message: 'Listing retrieved successfully',
        data: new ListingModel(listing).toResponse()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving listing',
        error: error.message
      };
    }
  }

  async getListingsByUserKey(createdByKey) {
    try {
      const listings = await listingStorage.getListingsByUserKey(createdByKey);
      return {
        success: true,
        message: 'User listings retrieved successfully',
        data: ListingModel.toResponseList(listings)
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving user listings',
        error: error.message
      };
    }
  }

  async createListing(listingData) {
    try {
      const validation = ListingModel.validate(listingData);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        };
      }

      const normalizedDistanceKm = Number(listingData.distanceKm);
      const imageUrl =
        typeof listingData.imageUrl === 'string' &&
        /^(https?:\/\/|data:image\/)/i.test(listingData.imageUrl.trim())
          ? listingData.imageUrl.trim()
          : FALLBACK_LISTING_IMAGE;

      const listing = await listingStorage.saveListing({
        ...listingData,
        imageUrl,
        distanceKm: Number.isFinite(normalizedDistanceKm) ? normalizedDistanceKm : 0,
        id: listingData.id || Date.now().toString(),
        createdByKey:
          listingData.createdByKey ||
          buildOwnerKey({
            identifier: listingData.createdByIdentifier,
            role: listingData.createdByRole
          }),
        createdAt: listingData.createdAt || new Date().toISOString()
      });
      return {
        success: true,
        message: 'Listing created successfully',
        data: new ListingModel(listing).toResponse()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error creating listing',
        error: error.message
      };
    }
  }

  async updateListing(id, updates) {
    try {
      const validation = ListingModel.validate(updates);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        };
      }

      const updatedListing = await listingStorage.updateListing(id, updates);
      if (!updatedListing) {
        return {
          success: false,
          message: 'Listing not found'
        };
      }

      return {
        success: true,
        message: 'Listing updated successfully',
        data: new ListingModel(updatedListing).toResponse()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error updating listing',
        error: error.message
      };
    }
  }

  async deleteListingsByUserKey(createdByKey) {
    try {
      const deletedCount = await listingStorage.deleteListingsByUserKey(createdByKey);
      return {
        success: true,
        message: `${deletedCount} listings deleted successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error deleting listings',
        error: error.message
      };
    }
  }
}

module.exports = new ListingService();
