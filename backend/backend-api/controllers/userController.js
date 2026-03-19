const userService = require('../services/userService');

/**
 * Update user information
 * Protected route - requires authentication
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, email, avatar } = req.body;

    console.log(`[API] ${new Date().toISOString()} - PUT /api/users/profile - User: ${userId}`);

    // Only allow updating name, phone, email, and avatar
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;

    // If no updates provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update. Provide at least one field: name, phone, email, or avatar'
      });
    }

    const result = await userService.updateUser(userId, updates);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

/**
 * Change user password
 * Protected route - requires authentication
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    console.log(`[API] ${new Date().toISOString()} - PUT /api/users/password - User: ${userId}`);

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required'
      });
    }

    const result = await userService.changePassword(userId, oldPassword, newPassword);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * Protected route - requires authentication
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`[API] ${new Date().toISOString()} - GET /api/users/profile - User: ${userId}`);

    const result = await userService.getUserById(userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

module.exports = {
  updateUser,
  changePassword,
  getCurrentUser
};
