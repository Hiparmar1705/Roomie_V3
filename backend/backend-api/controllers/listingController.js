const listingService = require('../services/listingService');
const userService = require('../services/userService');

const getListings = async (req, res) => {
  try {
    console.log(`[API] ${new Date().toISOString()} - GET /api/listings`);
    const result = await listingService.getAllListings();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[API] ${new Date().toISOString()} - GET /api/listings/${id}`);
    const result = await listingService.getListingById(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getUserListings = async (req, res) => {
  try {
    const { createdByKey } = req.query;
    console.log(`[API] ${new Date().toISOString()} - GET /api/listings/user - createdByKey: ${createdByKey}`);
    const result = await listingService.getListingsByUserKey(createdByKey);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const createListing = async (req, res) => {
  try {
    console.log(`[API] ${new Date().toISOString()} - POST /api/listings`);
    const listingData = req.body;
    const result = await listingService.createListing(listingData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log(`[API] ${new Date().toISOString()} - PUT /api/listings/${id}`);
    const result = await listingService.updateListing(id, updates);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const deleteUserListings = async (req, res) => {
  try {
    const { createdByKey } = req.query;
    console.log(`[API] ${new Date().toISOString()} - DELETE /api/listings/user - createdByKey: ${createdByKey}`);
    const result = await listingService.deleteListingsByUserKey(createdByKey);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getFavoriteIds = async (req, res) => {
  try {
    const { userIdentifier } = req.query;
    console.log(`[API] ${new Date().toISOString()} - GET /api/listings/favorites - userIdentifier: ${userIdentifier}`);
    const result = await userService.getFavoriteListingIds(userIdentifier);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIdentifier } = req.body;
    console.log(`[API] ${new Date().toISOString()} - POST /api/listings/${id}/favorite - userIdentifier: ${userIdentifier}`);

    const listingResult = await listingService.getListingById(id);
    if (!listingResult.success) {
      return res.status(404).json(listingResult);
    }

    const result = await userService.toggleFavoriteListing(userIdentifier, id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getFavoriteListings = async (req, res) => {
  try {
    const { userIdentifier } = req.query;
    console.log(`[API] ${new Date().toISOString()} - GET /api/listings/favorites/listings - userIdentifier: ${userIdentifier}`);

    const favoriteIdsResult = await userService.getFavoriteListingIds(userIdentifier);
    if (!favoriteIdsResult.success) {
      return res.status(404).json(favoriteIdsResult);
    }

    const listingsResult = await listingService.getAllListings();
    if (!listingsResult.success) {
      return res.status(500).json(listingsResult);
    }

    const favoriteIdSet = new Set(favoriteIdsResult.data);
    const favoriteListings = listingsResult.data.filter((listing) => favoriteIdSet.has(listing.id));

    res.json({
      success: true,
      message: 'Favorite listings retrieved successfully',
      data: favoriteListings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getListings,
  getListingById,
  getUserListings,
  createListing,
  updateListing,
  deleteUserListings,
  getFavoriteIds,
  toggleFavorite,
  getFavoriteListings
};
