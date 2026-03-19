/**
 * FEED ROUTES - Define Feed (Post) Endpoints
 * 
 * Routes define the URL paths and HTTP methods for your API.
 * 
 * This file defines all feed-related endpoints:
 * - GET /api/feeds - Get all feeds
 * - GET /api/feeds/:id - Get a specific feed
 * - GET /api/feeds/user/:username - Get feeds by username
 * - POST /api/feeds - Create a new feed
 * - PUT /api/feeds/:id - Update a feed
 * - DELETE /api/feeds/:id - Delete a feed
 */

const express = require('express');
const router = express.Router();  // Create a router for feed routes
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');  // Authentication middleware
const {
  getFeeds,
  getFeedById,
  getFeedsByUsername,
  createFeed,
  updateFeed,
  deleteFeed
} = require('../controllers/feedController');

// ============================================
// VALIDATION RULES
// ============================================

/**
 * Validation rules for creating a feed
 * All fields are required when creating
 */
const validateCreateFeed = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters long'),
  
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('caption')
    .trim()
    .notEmpty()
    .withMessage('Caption is required'),
  
  body('text')
    .optional()  // Optional field
    .trim(),
  
  body('avatar')
    .optional()  // Optional field
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

/**
 * Validation rules for updating a feed
 * All fields are optional when updating (you can update just one field)
 */
const validateUpdateFeed = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters long'),
  
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('caption')
    .optional()
    .trim(),
  
  body('text')
    .optional()
    .trim(),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

/**
 * Check if validation passed
 * If validation fails, send error response
 * If validation passes, continue to controller
 */
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// ROUTE DEFINITIONS
// ============================================

/**
 * @swagger
 * /api/feeds:
 *   get:
 *     summary: Get all feeds
 *     description: Retrieve all feeds with optional pagination, filtering, and sorting
 *     tags: [Feeds]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: datetime
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Feeds retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Feed'
 *                     pagination:
 *                       type: object
 */
router.get('/', getFeeds);

/**
 * @swagger
 * /api/feeds/{id}:
 *   get:
 *     summary: Get feed by ID
 *     description: Retrieve a specific feed by its ID
 *     tags: [Feeds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feed ID
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feed'
 *       404:
 *         description: Feed not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getFeedById);

/**
 * @swagger
 * /api/feeds/user/{username}:
 *   get:
 *     summary: Get feeds by username
 *     description: Retrieve all feeds posted by a specific username
 *     tags: [Feeds]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to filter by
 *     responses:
 *       200:
 *         description: Feeds retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feed'
 */
router.get('/user/:username', getFeedsByUsername);

/**
 * @swagger
 * /api/feeds:
 *   post:
 *     summary: Create a new feed
 *     description: |
 *       Create a new feed post (requires authentication).
 *       
 *       **⚠️ You must authorize first!** Click the 🔒 "Authorize" button at the top right and enter your JWT token.
 *     tags: [Feeds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - image
 *               - caption
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 minLength: 2
 *                 example: johndoe
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image.jpg
 *               caption:
 *                 type: string
 *                 example: My first post!
 *               text:
 *                 type: string
 *                 example: This is the description
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       201:
 *         description: Feed created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feed'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, validateCreateFeed, checkValidation, createFeed);

/**
 * @swagger
 * /api/feeds/{id}:
 *   put:
 *     summary: Update a feed
 *     description: |
 *       Update an existing feed (requires authentication).
 *       
 *       **⚠️ You must authorize first!** Click the 🔒 "Authorize" button at the top right and enter your JWT token.
 *     tags: [Feeds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feed ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               username:
 *                 type: string
 *                 minLength: 2
 *               image:
 *                 type: string
 *                 format: uri
 *               caption:
 *                 type: string
 *               text:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Feed updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Feed'
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Feed not found
 */
router.put('/:id', authenticateToken, validateUpdateFeed, checkValidation, updateFeed);

/**
 * @swagger
 * /api/feeds/{id}:
 *   delete:
 *     summary: Delete a feed
 *     description: |
 *       Delete an existing feed (requires authentication).
 *       
 *       **⚠️ You must authorize first!** Click the 🔒 "Authorize" button at the top right and enter your JWT token.
 *     tags: [Feeds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feed ID to delete
 *     responses:
 *       200:
 *         description: Feed deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: Feed not found
 */
router.delete('/:id', authenticateToken, deleteFeed);

// Export router so server.js can use it
module.exports = router;
