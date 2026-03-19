const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const registerUser = async (req, res) => {
  try {
    console.log(`[API] ${new Date().toISOString()} - POST /api/auth/register - Identifier: ${req.body.identifier}`);
    const { identifier, role, displayName, bio, location, profileImageUri, password } = req.body;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      id: Date.now().toString(),
      identifier,
      role,
      displayName,
      bio: bio || '',
      location: location || '',
      profileImageUri: profileImageUri || '',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    const result = await userService.createUser(userData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    const token = jwt.sign(
      { userId: result.data.id, identifier: result.data.identifier },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.data,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log(`[API] ${new Date().toISOString()} - POST /api/auth/login - Identifier: ${req.body.identifier}`);
    const { identifier, password } = req.body;

    const userResult = await userService.getUserAuthByIdentifier(identifier);
    if (!userResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid identifier or password'
      });
    }

    const user = userResult.data;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid identifier or password'
      });
    }

    const token = jwt.sign(
      { userId: user.id, identifier: user.identifier },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          identifier: user.identifier,
          role: user.role,
          displayName: user.displayName,
          bio: user.bio,
          location: user.location,
          profileImageUri: user.profileImageUri
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log(`[API] ${new Date().toISOString()} - PUT /api/auth/profile/${id}`);
    
    const result = await userService.updateUser(id, updates);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile
};
