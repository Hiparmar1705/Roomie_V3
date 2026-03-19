/**
 * AUTHENTICATION MIDDLEWARE - Token Verification
 * 
 * This middleware protects routes by verifying JWT tokens.
 * It checks if the user is authenticated before allowing access to protected routes.
 * 
 * How it works:
 * 1. Client sends JWT token in Authorization header
 * 2. Middleware verifies the token
 * 3. If valid, adds user info to request object and continues
 * 4. If invalid, returns 401 Unauthorized error
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * 
 * Usage: Add this middleware to any route that requires authentication
 * Example: router.post('/protected', authenticateToken, controllerFunction)
 * 
 * The token should be sent in the Authorization header:
 * Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    // Extract the token (remove "Bearer " prefix)
    // If no header, token will be undefined
    const token = authHeader && authHeader.split(' ')[1];  // Split by space, get second part
    
    // If no token provided, return 401 Unauthorized
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        hint: 'Include token in Authorization header: Bearer <token>'
      });
    }

    // Verify the token using the secret key
    // If token is invalid or expired, this will throw an error
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // Token is valid! Add user info to request object
    // Now controllers can access req.user.userId and req.user.email
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // Continue to the next middleware/controller
    next();
  } catch (error) {
    // Token verification failed (invalid, expired, or tampered with)
    let message = 'Invalid or expired token';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please login again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token. Please login again.';
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: message
    });
  }
};

/**
 * Optional middleware: Check if user owns the resource
 * Use this when you want to ensure users can only modify their own data
 * 
 * @param {Function} getOwnerId - Function that gets the owner ID from request
 *                                Example: (req) => req.params.userId
 */
const authorizeOwner = (getOwnerId) => {
  return (req, res, next) => {
    // First, make sure user is authenticated (should run after authenticateToken)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get the owner ID of the resource being accessed
    const ownerId = getOwnerId(req);

    // Check if the authenticated user owns this resource
    if (req.user.userId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only access your own resources.'
      });
    }

    // User owns the resource, allow access
    next();
  };
};

// Export middleware functions
module.exports = {
  authenticateToken,  // Verify JWT token
  authorizeOwner      // Check if user owns resource (optional)
};
