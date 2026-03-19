const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { registerUser, loginUser, updateProfile } = require('../controllers/authController');

const validateRegister = [
  body('identifier')
    .notEmpty()
    .withMessage('Identifier is required'),
  body('role')
    .isIn(['Student', 'Landlord'])
    .withMessage('Role must be Student or Landlord'),
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 2 })
    .withMessage('Display name must be at least 2 characters long'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('bio')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim(),
  body('profileImageUri')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => value.startsWith('file://') || /^https?:\/\//i.test(value))
    .withMessage('Profile image URI must be a valid file or web URL')
];

const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Identifier is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateUpdateProfile = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Display name must be at least 2 characters long'),
  body('bio')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim(),
  body('profileImageUri')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => value.startsWith('file://') || /^https?:\/\//i.test(value))
    .withMessage('Profile image URI must be a valid file or web URL')
];

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
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account and receive a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@unbc.ca
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: test123
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 description: Phone number (optional)
 *                 example: "+1 (250) 555-1234"
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: User avatar URL (optional)
 *                 example: "https://picsum.photos/400/400?random=1"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateRegister, checkValidation, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: |
 *       Authenticate user and receive a JWT token.
 *       
 *       **Important:** After login, copy the `token` from the response and use it in the "Authorize" button (🔒 at top right) to test protected endpoints.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@unbc.ca
 *               password:
 *                 type: string
 *                 example: test123
 *     responses:
 *       200:
 *         description: Login successful. Copy the `token` from `data.token` and use it in the Authorize button.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 user:
 *                   id: "1772672747057"
 *                   email: "student@unbc.ca"
 *                   name: "UNBC Student"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNzcyNjcyNzQ3MDU3IiwiZW1haWwiOiJzdHVkZW50QHVuYmMuY2EiLCJpYXQiOjE3MzU5NTg0MDAsImV4cCI6MTc0MTk1ODQwMH0..."
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateLogin, checkValidation, loginUser);

// PUT /api/auth/profile/:id - Update user profile
router.put('/profile/:id', validateUpdateProfile, checkValidation, updateProfile);

// Export router so server.js can use it
module.exports = router;
