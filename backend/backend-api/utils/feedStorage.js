/**
 * FEED STORAGE - Database Operations for Feeds
 * 
 * This file handles reading and writing feed data to/from the JSON file.
 * It's like a simple database layer for feeds (posts).
 * 
 * The "database" is just a JSON file: db/feed.json
 */

const fs = require('fs').promises;  // File system operations (async)
const path = require('path');        // Handle file paths

// Path to the feeds JSON file (our "database table")
const FEEDS_TABLE = path.join(__dirname, '../db/feed.json');

/**
 * Make sure the db folder exists before reading/writing
 */
const ensureDatabaseDirectory = async () => {
  const dbDir = path.dirname(FEEDS_TABLE);
  try {
    await fs.access(dbDir);  // Check if folder exists
  } catch {
    // Folder doesn't exist, create it
    await fs.mkdir(dbDir, { recursive: true });
  }
};

/**
 * Read all feeds from the JSON file
 * @returns {Array} Array of feed objects
 */
const readFeeds = async () => {
  try {
    await ensureDatabaseDirectory();
    const data = await fs.readFile(FEEDS_TABLE, 'utf8');
    return JSON.parse(data);  // Convert JSON string to JavaScript array
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

/**
 * Write feeds array to the JSON file
 * @param {Array} feeds - Array of feed objects to save
 */
const writeFeeds = async (feeds) => {
  await ensureDatabaseDirectory();
  // Convert array to JSON string with pretty formatting
  await fs.writeFile(FEEDS_TABLE, JSON.stringify(feeds, null, 2), 'utf8');
};

/**
 * Get all feeds from database
 * @returns {Array} All feeds
 */
const getAllFeeds = async () => {
  return await readFeeds();
};

/**
 * Find a feed by its ID
 * @param {string} id - Feed ID
 * @returns {Object|null} Feed object or null if not found
 */
const getFeedById = async (id) => {
  const feeds = await readFeeds();
  // Find first feed with matching ID
  return feeds.find(feed => feed.id === id);
};

/**
 * Get all feeds by a specific username
 * @param {string} username - Username to filter by
 * @returns {Array} Array of feeds from that user
 */
const getFeedsByUsername = async (username) => {
  const feeds = await readFeeds();
  // Filter: keep only feeds where username matches
  return feeds.filter(feed => feed.username === username);
};

/**
 * Create a new feed and save it to database
 * @param {Object} feed - Feed object to save
 * @returns {Object} The saved feed
 */
const createFeed = async (feed) => {
  // Read existing feeds
  const feeds = await readFeeds();
  
  // Add new feed to the array
  feeds.push(feed);
  
  // Save updated array back to file
  await writeFeeds(feeds);
  
  // Return the saved feed
  return feed;
};

/**
 * Update an existing feed
 * @param {string} id - Feed ID to update
 * @param {Object} updatedFeed - Object with fields to update
 * @returns {Object|null} Updated feed or null if not found
 */
const updateFeed = async (id, updatedFeed) => {
  const feeds = await readFeeds();
  
  // Find the index of the feed to update
  const index = feeds.findIndex(feed => feed.id === id);
  
  // If feed not found, return null
  if (index === -1) {
    return null;
  }
  
  // Merge old feed with new data (spread operator)
  // This keeps existing fields and updates only provided ones
  feeds[index] = { ...feeds[index], ...updatedFeed };
  
  // Save updated array
  await writeFeeds(feeds);
  
  // Return the updated feed
  return feeds[index];
};

/**
 * Delete a feed from database
 * @param {string} id - Feed ID to delete
 * @returns {Object|null} Deleted feed or null if not found
 */
const deleteFeed = async (id) => {
  const feeds = await readFeeds();
  
  // Find the index of the feed to delete
  const index = feeds.findIndex(feed => feed.id === id);
  
  // If feed not found, return null
  if (index === -1) {
    return null;
  }
  
  // Remove feed from array (splice removes and returns the item)
  const deletedFeed = feeds.splice(index, 1)[0];
  
  // Save updated array (without the deleted feed)
  await writeFeeds(feeds);
  
  // Return the deleted feed
  return deletedFeed;
};

// Export all functions so other files can use them
module.exports = {
  getAllFeeds,          // Get all feeds
  getFeedById,          // Get one feed by ID
  getFeedsByUsername,   // Get feeds by username
  createFeed,           // Create new feed
  updateFeed,           // Update existing feed
  deleteFeed            // Delete feed
};
