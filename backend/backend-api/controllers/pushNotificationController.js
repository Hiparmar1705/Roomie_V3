/**
 * PUSH NOTIFICATION CONTROLLER & ROUTES
 * 
 * This file contains both the controller logic and routes for push notifications.
 * It sends push notifications directly to devices using Expo Push Notification service.
 * No device registration required - just pass deviceToken and message.
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Expo } = require('expo-server-sdk');
const { authenticateToken } = require('../middleware/authMiddleware');

// Initialize Expo SDK
const expo = new Expo();

/**
 * Send push notification directly to device
 * POST /api/push/send
 */
const sendPushNotification = async (req, res) => {
  try {
    const { deviceToken, title, body: message, data } = req.body;

    console.log(`[API] ${new Date().toISOString()} - POST /api/push/send - DeviceToken: ${deviceToken?.substring(0, 20)}...`);

    // Validate device token
    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required'
      });
    }

    // Validate Expo push token format
    if (!Expo.isExpoPushToken(deviceToken)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Expo push token format. Token should start with ExponentPushToken[...]'
      });
    }

    // Prepare message
    const pushMessage = {
      to: deviceToken,
      sound: 'default',
      title: title || 'Notification',
      body: message || 'You have a new notification',
      data: data || { timestamp: new Date().toISOString() }
    };

    // Send notification
    let ticket;
    try {
      const tickets = await expo.sendPushNotificationsAsync([pushMessage]);
      ticket = tickets[0];
    } catch (error) {
      console.error('Error sending push notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending push notification',
        error: error.message
      });
    }

    // Check if there was an error
    if (ticket.status === 'error') {
      return res.status(400).json({
        success: false,
        message: 'Failed to send push notification',
        error: ticket.message || 'Unknown error',
        details: ticket.details || null
      });
    }

    res.json({
      success: true,
      message: 'Push notification sent successfully',
      data: {
        ticketId: ticket.id,
        status: ticket.status,
        message: {
          title: pushMessage.title,
          body: pushMessage.body
        }
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending push notification',
      error: error.message
    });
  }
};

/**
 * Validation middleware
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

/**
 * Validate send push notification request
 */
const validateSendNotification = [
  body('deviceToken')
    .trim()
    .notEmpty()
    .withMessage('Device token is required')
    .matches(/^ExponentPushToken\[.+\]$/)
    .withMessage('Invalid Expo push token format. Must start with ExponentPushToken followed by brackets'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('body')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Body must be less than 500 characters')
];

// ============================================
// ROUTES
// ============================================

/**
 * @swagger
 * /api/push/send:
 *   post:
 *     summary: Send push notification to device
 *     description: Send a push notification directly to a device using its token. No registration required.
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceToken
 *             properties:
 *               deviceToken:
 *                 type: string
 *                 description: Expo push token format ExponentPushToken followed by brackets with token
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *               title:
 *                 type: string
 *                 description: Notification title
 *                 example: "New Message"
 *               body:
 *                 type: string
 *                 description: Notification message body
 *                 example: "You have a new message"
 *               data:
 *                 type: object
 *                 description: Additional data to send with notification
 *                 example: { "type": "message", "id": "123" }
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Push notification sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticketId:
 *                       type: string
 *                       description: Receipt ID for verification
 *                     status:
 *                       type: string
 *                       example: ok
 *       400:
 *         description: Validation error or invalid token
 *       401:
 *         description: Unauthorized
 */
router.post('/send', authenticateToken, validateSendNotification, checkValidation, sendPushNotification);

module.exports = router;
