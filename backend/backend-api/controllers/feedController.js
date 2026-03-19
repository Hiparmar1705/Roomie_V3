const feedService = require('../services/feedService');

const getFeeds = async (req, res) => {
  try {
    console.log(`[API] ${new Date().toISOString()} - GET /api/feeds - Query:`, req.query);
    const result = await feedService.getFeeds(req.query);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving feeds',
      error: error.message
    });
  }
};

const getFeedById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[API] ${new Date().toISOString()} - GET /api/feeds/${id}`);
    const result = await feedService.getFeedById(id);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving feed',
      error: error.message
    });
  }
};

const getFeedsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`[API] ${new Date().toISOString()} - GET /api/feeds/user/${username}`);
    const result = await feedService.getFeedsByUsername(username);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving feeds',
      error: error.message
    });
  }
};

const createFeed = async (req, res) => {
  try {
    const userId = req.user?.userId || 'unknown';
    console.log(`[API] ${new Date().toISOString()} - POST /api/feeds - User: ${userId} - Username: ${req.body.username}`);
    const result = await feedService.createFeed(req.body);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating feed',
      error: error.message
    });
  }
};

const updateFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || 'unknown';
    console.log(`[API] ${new Date().toISOString()} - PUT /api/feeds/${id} - User: ${userId}`);
    const result = await feedService.updateFeed(id, req.body);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating feed',
      error: error.message
    });
  }
};

const deleteFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || 'unknown';
    console.log(`[API] ${new Date().toISOString()} - DELETE /api/feeds/${id} - User: ${userId}`);
    const result = await feedService.deleteFeed(id);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feed',
      error: error.message
    });
  }
};

module.exports = {
  getFeeds,
  getFeedById,
  getFeedsByUsername,
  createFeed,
  updateFeed,
  deleteFeed
};
