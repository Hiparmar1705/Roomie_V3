/**
 * SWAGGER CONFIGURATION
 * 
 * This file sets up Swagger/OpenAPI documentation for the API.
 * Swagger provides an interactive UI to test all API endpoints.
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Backend API Documentation',
    version: '1.0.0',
    description: `
      A simple REST API built with Node.js and Express.
      
      ## Features
      - User authentication with JWT tokens
      - Feed (post) management with CRUD operations
      - Token-based security for protected routes
      - JSON file-based database
      
      ## Getting Started
      
      ### Step 1: Get a Token
      1. Scroll down to **Authentication** section
      2. Use /api/auth/login endpoint
      3. Click "Try it out"
      4. Enter credentials:
         - Email: student@unbc.ca
         - Password: test123
      5. Click "Execute"
      6. Copy the token from the response
      
      ### Step 2: Authorize
      1. Click the **🔒 Authorize** button at the top right
      2. In the "Value" field, paste your token (just the token, no "Bearer" prefix)
      3. Click "Authorize"
      4. Click "Close"
      
      ### Step 3: Test Protected Endpoints
      Now you can test protected endpoints like:
      - POST /api/feeds (Create feed)
      - PUT /api/feeds/:id (Update feed)
      - DELETE /api/feeds/:id (Delete feed)
      
      ## Sample Credentials
      - **Email:** student@unbc.ca
      - **Password:** test123
      
      **Note:** The token will be saved in your browser for this session.
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.example.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: `
          **How to get a token:**
          1. Use the /api/auth/login endpoint below
          2. Login with: email: student@unbc.ca, password: test123
          3. Copy the token from the response
          4. Click "Authorize" button (🔒 at top right)
          5. Paste your token (without "Bearer" prefix)
          6. Click "Authorize"
          7. Now you can test protected endpoints!
        `
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
            example: '1772672747057'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'student@unbc.ca'
          },
          name: {
            type: 'string',
            description: 'User display name',
            example: 'John Doe'
          },
          phone: {
            type: 'string',
            nullable: true,
            description: 'User phone number (optional)',
            example: '+1 (250) 555-1234'
          },
          avatar: {
            type: 'string',
            format: 'uri',
            nullable: true,
            description: 'User avatar URL (optional)',
            example: 'https://picsum.photos/400/400?random=1'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date'
          }
        }
      },
      Feed: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Feed ID',
            example: '1'
          },
          avatar: {
            type: 'string',
            format: 'uri',
            description: 'User avatar URL',
            example: 'https://i.pravatar.cc/150?img=1'
          },
          name: {
            type: 'string',
            description: 'User display name',
            example: 'Sarah Johnson'
          },
          username: {
            type: 'string',
            description: 'Username',
            example: 'nature_lover'
          },
          image: {
            type: 'string',
            format: 'uri',
            description: 'Post image URL',
            example: 'https://picsum.photos/400/400?random=1'
          },
          caption: {
            type: 'string',
            description: 'Post caption',
            example: 'Beautiful sunset view'
          },
          text: {
            type: 'string',
            description: 'Post description',
            example: 'Just captured this amazing sunset!'
          },
          datetime: {
            type: 'string',
            format: 'date-time',
            description: 'Post creation date'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Login successful'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User'
              },
              token: {
                type: 'string',
                description: 'JWT token for authentication',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message'
          },
          error: {
            type: 'string',
            example: 'Detailed error information'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User registration and login endpoints'
    },
    {
      name: 'Feeds',
      description: 'Feed (post) management endpoints'
    },
    {
      name: 'Users',
      description: 'User profile management endpoints'
    },
    {
      name: 'Push Notifications',
      description: 'Push notification device registration and sending endpoints'
    },
    {
      name: 'Health',
      description: 'Server health check'
    }
  ]
};

// Options for swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './server.js'
  ]
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
