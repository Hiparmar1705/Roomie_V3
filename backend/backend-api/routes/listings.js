const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getListings,
  getListingById,
  getUserListings,
  createListing,
  updateListing,
  deleteUserListings,
  getFavoriteIds,
  toggleFavorite,
  getFavoriteListings
} = require('../controllers/listingController');

const validateListing = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  body('priceAmount')
    .isNumeric()
    .withMessage('Price amount must be a number')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('Price must be greater than 0');
      }
      return true;
    }),
  body('type')
    .notEmpty()
    .withMessage('Type is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 3 })
    .withMessage('Location must be at least 3 characters long'),
  body('landlordName')
    .trim()
    .notEmpty()
    .withMessage('Landlord name is required')
    .isLength({ min: 2 })
    .withMessage('Landlord name must be at least 2 characters long'),
  body('landlordIdentifier')
    .notEmpty()
    .withMessage('Landlord identifier is required'),
  body('createdByIdentifier')
    .notEmpty()
    .withMessage('Created by identifier is required'),
  body('createdByRole')
    .isIn(['Student', 'Landlord'])
    .withMessage('Created by role must be Student or Landlord')
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

const validateToggleFavorite = [
  body('userIdentifier')
    .notEmpty()
    .withMessage('User identifier is required')
];

// GET /api/listings - Get all listings
router.get('/', getListings);

// GET /api/listings/user - Get listings by user
router.get('/user', getUserListings);

// GET /api/listings/favorites - Get favorite listing ids by user
router.get('/favorites', getFavoriteIds);

// GET /api/listings/favorites/listings - Get full favorite listings by user
router.get('/favorites/listings', getFavoriteListings);

// GET /api/listings/:id - Get listing by ID
router.get('/:id', getListingById);

// POST /api/listings/:id/favorite - Toggle favorite listing for user
router.post('/:id/favorite', validateToggleFavorite, checkValidation, toggleFavorite);

// POST /api/listings - Create new listing
router.post('/', validateListing, checkValidation, createListing);

// PUT /api/listings/:id - Update listing
router.put('/:id', validateListing, checkValidation, updateListing);

// DELETE /api/listings/user - Delete listings by user
router.delete('/user', deleteUserListings);

module.exports = router;
