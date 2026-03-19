const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const feedRoutes = require('./routes/feeds');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');
const chatRoutes = require('./routes/chat');
const pushRoutes = require('./controllers/pushNotificationController');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const loggerMiddleware = require('./middleware/loggerMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy to get correct IP address
app.set('trust proxy', true);

app.use(cors());
// Listing images are sent as base64 data URLs, so the default 100kb body limit is too small.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all API requests
app.use(loggerMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/push', pushRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Backend API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  },
  customCssUrl: null,
  customJs: null
}));
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📰 Feeds API: http://localhost:${PORT}/api/feeds`);
  console.log(`👤 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🏠 Listings API: http://localhost:${PORT}/api/listings`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🔔 Push Notifications API: http://localhost:${PORT}/api/push`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log('='.repeat(50));
});

module.exports = app;
