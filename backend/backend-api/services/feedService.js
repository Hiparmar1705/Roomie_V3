/**
 * FEED SERVICE - Business Logic for Feeds
 * 
 * This file contains the business logic for feed operations.
 * It processes data, applies business rules, and formats responses.
 * 
 * Responsibilities:
 * - Handle pagination (splitting results into pages)
 * - Handle sorting (ordering results)
 * - Handle filtering (finding specific results)
 * - Validate data
 * - Format responses
 */

const feedStorage = require('../utils/feedStorage');  // Database operations
const FeedModel = require('../models/FeedModel');     // Feed data structure

class FeedService {
  /**
   * Get all feeds with optional filtering, sorting, and pagination
   * 
   * @param {Object} queryParams - Query parameters from URL
   *   - page: Page number (default: 1)
   *   - limit: Items per page (default: 10, max: 100)
   *   - username: Filter by username (optional)
   *   - sortBy: Field to sort by (default: 'datetime')
   *   - order: 'asc' or 'desc' (default: 'desc')
   * @returns {Object} Response with feeds and pagination info
   */
  async getFeeds(queryParams) {
    try {
      // Parse and validate query parameters
      const page = Math.max(1, parseInt(queryParams.page) || 1);  // At least page 1
      const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 10));  // Between 1 and 100
      const username = queryParams.username || null;  // Optional filter
      const sortBy = queryParams.sortBy || 'datetime';  // Default sort by date
      const order = queryParams.order || 'desc';  // Default: newest first

      // Get all feeds from database
      let feeds = await feedStorage.getAllFeeds();

      // Filter by username if provided
      if (username) {
        feeds = FeedModel.filterByUsername(feeds, username);
      }

      // Sort feeds
      if (sortBy === 'datetime') {
        // Use model's built-in datetime sorting
        feeds = FeedModel.sortByDatetime(feeds, order);
      } else {
        // Sort by other fields (name, caption, etc.)
        feeds = feeds.sort((a, b) => {
          const aValue = a[sortBy];  // Get value from feed object
          const bValue = b[sortBy];
          
          // Compare values
          if (order === 'desc') {
            return bValue > aValue ? 1 : -1;  // Descending: bigger first
          }
          return aValue > bValue ? 1 : -1;  // Ascending: smaller first
        });
      }

      // Apply pagination (split into pages)
      // Example: page 2, limit 10 = skip first 10, take next 10
      const startIndex = (page - 1) * limit;  // Where to start
      const endIndex = startIndex + limit;     // Where to end
      const paginatedFeeds = feeds.slice(startIndex, endIndex);  // Get only this page's feeds

      // Convert to response format
      const feedResponses = FeedModel.toResponseList(paginatedFeeds);
      
      // Return response with feeds and pagination info
      return {
        success: true,
        message: 'Feeds retrieved successfully',
        data: {
          data: feedResponses,  // The actual feeds
          pagination: {
            page,                    // Current page number
            limit,                   // Items per page
            total: feeds.length,     // Total number of feeds (before pagination)
            totalPages: Math.ceil(feeds.length / limit)  // Total number of pages
          }
        }
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error retrieving feeds', 
        error: error.message 
      };
    }
  }

  /**
   * Get a single feed by ID
   * @param {string} id - Feed ID
   * @returns {Object} Response with feed data
   */
  async getFeedById(id) {
    try {
      const feed = await feedStorage.getFeedById(id);
      
      if (!feed) {
        return { 
          success: false, 
          message: 'Feed not found' 
        };
      }
      
      return { 
        success: true, 
        message: 'Feed retrieved successfully', 
        data: new FeedModel(feed).toResponse() 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error retrieving feed', 
        error: error.message 
      };
    }
  }

  /**
   * Get all feeds by a specific username
   * @param {string} username - Username to filter by
   * @returns {Object} Response with array of feeds
   */
  async getFeedsByUsername(username) {
    try {
      const feeds = await feedStorage.getFeedsByUsername(username);
      return { 
        success: true, 
        message: 'Feeds retrieved successfully', 
        data: FeedModel.toResponseList(feeds) 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error retrieving feeds', 
        error: error.message 
      };
    }
  }

  /**
   * Create a new feed
   * @param {Object} feedData - Feed data from request
   * @returns {Object} Response with created feed
   */
  async createFeed(feedData) {
    try {
      // Validate the data first
      const validation = FeedModel.validate(feedData);
      if (!validation.valid) {
        return { 
          success: false, 
          message: 'Validation failed', 
          error: validation.errors 
        };
      }

      // Prepare feed for storage (add defaults, generate ID)
      const feed = FeedModel.createForStorage(feedData);
      
      // Save to database
      const createdFeed = await feedStorage.createFeed(feed);
      
      // Return success response
      return { 
        success: true, 
        message: 'Feed created successfully', 
        data: new FeedModel(createdFeed).toResponse() 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error creating feed', 
        error: error.message 
      };
    }
  }

  /**
   * Update an existing feed
   * @param {string} id - Feed ID to update
   * @param {Object} feedData - Fields to update (only provided fields will be updated)
   * @returns {Object} Response with updated feed
   */
  async updateFeed(id, feedData) {
    try {
      // Check if feed exists
      const existingFeed = await feedStorage.getFeedById(id);
      if (!existingFeed) {
        return { 
          success: false, 
          message: 'Feed not found' 
        };
      }

      // Build update object - only include fields that were provided
      // This allows partial updates (update only name, or only caption, etc.)
      const updateObject = {};
      if (feedData.avatar !== undefined) updateObject.avatar = feedData.avatar;
      if (feedData.name !== undefined) updateObject.name = feedData.name;
      if (feedData.username !== undefined) updateObject.username = feedData.username;
      if (feedData.image !== undefined) updateObject.image = feedData.image;
      if (feedData.caption !== undefined) updateObject.caption = feedData.caption;
      if (feedData.text !== undefined) updateObject.text = feedData.text;
      if (feedData.datetime !== undefined) updateObject.datetime = feedData.datetime;
      
      // Check if there's anything to update
      if (Object.keys(updateObject).length === 0) {
        return { 
          success: false, 
          message: 'No fields to update' 
        };
      }

      // Update the feed in database
      const updatedFeed = await feedStorage.updateFeed(id, updateObject);
      
      // Return success response
      return { 
        success: true, 
        message: 'Feed updated successfully', 
        data: new FeedModel(updatedFeed).toResponse() 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error updating feed', 
        error: error.message 
      };
    }
  }

  /**
   * Delete a feed
   * @param {string} id - Feed ID to delete
   * @returns {Object} Success/error response
   */
  async deleteFeed(id) {
    try {
      // Check if feed exists
      const feed = await feedStorage.getFeedById(id);
      if (!feed) {
        return { 
          success: false, 
          message: 'Feed not found' 
        };
      }

      // Delete from database
      await feedStorage.deleteFeed(id);
      
      // Return success (no data needed, just confirmation)
      return { 
        success: true, 
        message: 'Feed deleted successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error deleting feed', 
        error: error.message 
      };
    }
  }
}

// Export a single instance (singleton pattern)
module.exports = new FeedService();
