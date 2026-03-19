/**
 * USER STORAGE - Database Operations for Users
 * 
 * This file handles reading and writing user data to/from the JSON file.
 * Think of it as a simple database layer.
 * 
 * The "database" is just a JSON file: db/user.json
 */

const fs = require('fs').promises;  // File system operations (async)
const path = require('path');       // Handle file paths

// Path to the users JSON file (our "database table")
const USERS_TABLE = path.join(__dirname, '../db/user.json');

const inferRoleFromUser = (user) => {
  if (user.role) {
    return user.role;
  }

  const identifier = user.identifier || user.email || '';
  return identifier.toLowerCase().endsWith('@unbc.ca') ? 'Student' : 'Landlord';
};

const normalizeStoredUser = (user = {}) => ({
  ...user,
  identifier: user.identifier || user.email || '',
  role: inferRoleFromUser(user),
  displayName: user.displayName || user.name || '',
  bio: user.bio || '',
  location: user.location || 'Prince George, BC',
  profileImageUri: user.profileImageUri || user.avatar || '',
  favoriteListingIds: Array.isArray(user.favoriteListingIds) ? user.favoriteListingIds : []
});

/**
 * Make sure the db folder exists before reading/writing
 * This prevents errors if the folder doesn't exist yet
 */
const ensureDatabaseDirectory = async () => {
  const dbDir = path.dirname(USERS_TABLE);  // Get the folder path
  try {
    await fs.access(dbDir);  // Check if folder exists
  } catch {
    // Folder doesn't exist, create it
    await fs.mkdir(dbDir, { recursive: true });
  }
};

/**
 * Read all users from the JSON file
 * @returns {Array} Array of user objects
 */
const readUsers = async () => {
  try {
    // Make sure folder exists
    await ensureDatabaseDirectory();
    
    // Read the file
    const data = await fs.readFile(USERS_TABLE, 'utf8');
    
    // Parse JSON string to JavaScript array
    return JSON.parse(data).map(normalizeStoredUser);
  } catch (error) {
    // If file doesn't exist, return empty array (no users yet)
    if (error.code === 'ENOENT') {
      return [];
    }
    // Other errors, throw them up
    throw error;
  }
};

/**
 * Write users array to the JSON file
 * @param {Array} users - Array of user objects to save
 */
const writeUsers = async (users) => {
  // Make sure folder exists
  await ensureDatabaseDirectory();
  
  // Convert array to JSON string and write to file
  // null, 2 means: format with 2-space indentation (pretty print)
  await fs.writeFile(USERS_TABLE, JSON.stringify(users, null, 2), 'utf8');
};

/**
 * Save a new user to the database
 * @param {Object} user - User object to save
 * @returns {Object} The saved user
 */
const saveUser = async (user) => {
  // Read existing users
  const users = await readUsers();
  
  // Add new user to the array
  users.push(normalizeStoredUser(user));
  
  // Save updated array back to file
  await writeUsers(users);
  
  // Return the saved user
  return normalizeStoredUser(user);
};

/**
 * Find a user by their identifier (email or phone)
 * @param {string} identifier - Identifier to search for
 * @returns {Object|null} User object or null if not found
 */
const findUserByIdentifier = async (identifier) => {
  const users = await readUsers();
  
  // Search for user with matching identifier (case-insensitive)
  return users.find(user => 
    user.identifier?.toLowerCase() === identifier.toLowerCase()
  );
};

/**
 * Find a user by their ID
 * @param {string} id - User ID to search for
 * @returns {Object|null} User object or null if not found
 */
const findUserById = async (id) => {
  const users = await readUsers();
  
  // Search for user with matching ID
  return users.find(user => user.id === id);
};

/**
 * Get all users (useful for testing or admin purposes)
 * @returns {Array} Array of all users
 */
const getAllUsers = async () => {
  return await readUsers();
};

/**
 * Update a user's information
 * @param {string} id - User ID to update
 * @param {Object} updates - Object with fields to update (name, phone, email)
 * @returns {Object|null} Updated user object or null if not found
 */
const updateUser = async (id, updates) => {
  const users = await readUsers();
  
  // Find the user index
  const userIndex = users.findIndex(user => user.id === id);
  
  // If user not found, return null
  if (userIndex === -1) {
    return null;
  }
  
  // Update only the provided fields (don't overwrite password or id)
  const allowedFields = ['identifier', 'role', 'displayName', 'bio', 'location', 'profileImageUri'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      users[userIndex][field] = updates[field];
    }
  });
  
  // Save updated users array
  await writeUsers(users);
  
  // Return the updated user
  return users[userIndex];
};

/**
 * Update a user's password
 * @param {string} id - User ID to update
 * @param {string} newPassword - New hashed password
 * @returns {Object|null} Updated user object or null if not found
 */
const updateUserPassword = async (id, newPassword) => {
  const users = await readUsers();
  
  // Find the user index
  const userIndex = users.findIndex(user => user.id === id);
  
  // If user not found, return null
  if (userIndex === -1) {
    return null;
  }
  
  // Update password
  users[userIndex].password = newPassword;
  
  // Save updated users array
  await writeUsers(users);
  
  // Return the updated user
  return users[userIndex];
};

const updateUserFavoriteListingIds = async (id, favoriteListingIds) => {
  const users = await readUsers();
  const userIndex = users.findIndex(user => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  users[userIndex].favoriteListingIds = favoriteListingIds;
  await writeUsers(users);
  return users[userIndex];
};

// Export functions so other files can use them
module.exports = {
  saveUser,           // Save a new user
  findUserByIdentifier,    // Find user by identifier
  findUserById,       // Find user by ID
  getAllUsers,        // Get all users
  updateUser,         // Update user information
  updateUserPassword,  // Update user password
  updateUserFavoriteListingIds
};
