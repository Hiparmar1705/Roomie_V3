# Backend API - Beginner's Guide

This is a simple REST API built with Node.js and Express. It uses JSON files as a database to store users and feeds.

## ⚡ Quick Start for Expo Go Users

**Important:** When connecting from Expo Go on a physical device, use your computer's IP address instead of `localhost`.

1. **Find your IP address:**
   - **Windows:** Open Command Prompt → Run `ipconfig` → Look for "IPv4 Address"
   - **Mac/Linux:** Open Terminal → Run `ifconfig` → Look for "inet" address

2. **Use IP in your Expo app:**
   ```javascript
   // ❌ Won't work from physical device
   const API_URL = 'http://localhost:3000';
   
   // ✅ Use your computer's IP
   const API_URL = 'http://192.168.1.100:3000'; // Replace with your IP
   ```

3. **Make sure:** Both your phone and computer are on the same Wi-Fi network!

## 📁 Project Structure

```
backend-api/
├── server.js              # Main server file - starts the Express app
├── controllers/          # Handle HTTP requests and responses
│   ├── authController.js # Authentication (register, login)
│   └── feedController.js # Feed operations (CRUD)
├── routes/               # Define API endpoints
│   ├── auth.js          # Auth routes: /api/auth/register, /api/auth/login
│   └── feeds.js         # Feed routes: /api/feeds/*
├── config/               # Configuration files
│   └── swagger.js       # Swagger/OpenAPI configuration
├── middleware/           # Custom middleware functions
│   └── authMiddleware.js # JWT token verification
├── services/             # Business logic layer
│   ├── userService.js   # User business logic
│   └── feedService.js   # Feed business logic
├── models/              # Data models (structure of User and Feed)
│   ├── UserModel.js     # User data structure and validation
│   └── FeedModel.js     # Feed data structure and validation
├── utils/               # Helper functions for database operations
│   ├── userStorage.js   # Read/write users from JSON file
│   └── feedStorage.js   # Read/write feeds from JSON file
└── db/                  # Database (JSON files)
    ├── user.json        # Users table (stored as JSON array)
    └── feed.json        # Feeds table (stored as JSON array)
```

## 🔄 How Data Flows

1. **Request comes in** → `server.js` receives it
2. **Route matches** → `routes/` file directs to controller
3. **Controller** → `controllers/` handles the request
4. **Service** → `services/` contains business logic
5. **Storage** → `utils/` reads/writes to JSON files
6. **Model** → `models/` formats the response
7. **Response sent back** → JSON response to client

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 3. Test the API
The server runs on `http://localhost:3000`

**📱 For Expo Go Users:** When connecting from a mobile device, use your computer's IP address instead of `localhost`. See the "Connecting from Expo Go App" section below for details.
When connecting from Expo Go on a physical device, use your computer's IP address instead of `localhost`:

**Find your IP address:**
- **Windows:** Open Command Prompt and run `ipconfig`, look for "IPv4 Address"
- **Mac/Linux:** Open Terminal and run `ifconfig` or `ip addr`, look for your network interface IP

**Example:**
- Instead of: `http://localhost:3000`
- Use: `http://192.168.1.100:3000` (replace with your actual IP)

**Important Notes:**
- Make sure your mobile device and computer are on the same Wi-Fi network
- The IP address might change if you reconnect to Wi-Fi
- If connection fails, check your firewall settings to allow port 3000

## 📡 API Endpoints

### Authentication (Public - No token required)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Feeds

**Public Endpoints (No token required):**
- `GET /api/feeds` - Get all feeds (with pagination)
- `GET /api/feeds/:id` - Get a specific feed
- `GET /api/feeds/user/:username` - Get feeds by username

**Protected Endpoints (Token required):**
- `POST /api/feeds` - Create a new feed 🔒
- `PUT /api/feeds/:id` - Update a feed 🔒
- `DELETE /api/feeds/:id` - Delete a feed 🔒

### API Documentation (Swagger)
- `GET /api-docs` - Interactive Swagger UI to test all endpoints

### Health Check
- `GET /api/health` - Check if server is running

## 🔐 Token-Based Authentication

This API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token.

### How It Works

1. **Register or Login** to get a JWT token
2. **Include the token** in the `Authorization` header for protected routes
3. **Token expires** after 7 days (you'll need to login again)

### Getting a Token

**Step 1: Register or Login**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "student@unbc.ca",
  "password": "test123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1234567890",
      "email": "student@unbc.ca",
      "name": "UNBC Student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Step 2: Use the token in protected routes**
Include the token in the `Authorization` header:
```
Authorization: Bearer <your-token-here>
```

### Protected vs Public Routes

#### ✅ Public Routes (No Token Required)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/feeds` - Get all feeds
- `GET /api/feeds/:id` - Get specific feed
- `GET /api/feeds/user/:username` - Get feeds by username
- `GET /api/health` - Health check

#### 🔒 Protected Routes (Token Required)

**1. Create New Feed**
```bash
POST /api/feeds
Headers:
  Authorization: Bearer <your-token>
  Content-Type: application/json

Body:
{
  "name": "John Doe",
  "username": "johndoe",
  "image": "https://example.com/image.jpg",
  "caption": "My first post!",
  "text": "Post description",
  "avatar": "https://example.com/avatar.jpg"
}
```

**2. Update Feed**
```bash
PUT /api/feeds/:id
Headers:
  Authorization: Bearer <your-token>
  Content-Type: application/json

Body (all fields optional):
{
  "caption": "Updated caption",
  "text": "Updated text"
}
```

**3. Delete Feed**
```bash
DELETE /api/feeds/:id
Headers:
  Authorization: Bearer <your-token>
```

**Format:** `Authorization: Bearer <your-token-here>`

### Error Responses

**No Token Provided**
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "hint": "Include token in Authorization header: Bearer <token>"
}
```

**Invalid Token**
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid token. Please login again."
}
```

**Expired Token**
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Token has expired. Please login again."
}
```

## 👥 Sample User Credentials

All test users have the same password: `test123`

### User 1
- **Email:** `student@unbc.ca`
- **Password:** `test123`
- **Name:** UNBC Student

### User 2
- **Email:** `john.doe@unbc.ca`
- **Password:** `test123`
- **Name:** John Doe

### User 3
- **Email:** `jane.smith@unbc.ca`
- **Password:** `test123`
- **Name:** Jane Smith

**Note:** All passwords are hashed using bcrypt (salt rounds: 10) and stored securely in `db/user.json`

## 📝 Example Requests

### Register User (Public)
```bash
POST http://localhost:3000/api/auth/register
# For Expo Go: Replace localhost with your IP (e.g., http://192.168.1.100:3000)
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1 (250) 555-1234"
}
```

**Note:** The `phone` field is optional. If not provided, it will be set to `null`.

### Login (Public)
```bash
POST http://localhost:3000/api/auth/login
# For Expo Go: Replace localhost with your IP (e.g., http://192.168.1.100:3000)
Content-Type: application/json

{
  "email": "student@unbc.ca",
  "password": "test123"
}
```

### Create Feed (Protected - Requires Token)
```bash
POST http://localhost:3000/api/feeds
# For Expo Go: Replace localhost with your IP (e.g., http://192.168.1.100:3000)
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "John Doe",
  "username": "johndoe",
  "image": "https://example.com/image.jpg",
  "caption": "My first post!",
  "text": "This is the description",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Update Feed (Protected - Requires Token)
```bash
PUT http://localhost:3000/api/feeds/123
# For Expo Go: Replace localhost with your IP (e.g., http://192.168.1.100:3000)
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "caption": "Updated caption"
}
```

### Delete Feed (Protected - Requires Token)
```bash
DELETE http://localhost:3000/api/feeds/123
# For Expo Go: Replace localhost with your IP (e.g., http://192.168.1.100:3000)
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get All Feeds (Public - No Token Required)
```bash
GET http://localhost:3000/api/feeds
# For Expo Go: Replace localhost with your IP (e.g., http://192.168.1.100:3000)
```

## 📚 Swagger API Documentation

### Interactive API Testing

The easiest way to test the API is using Swagger UI:

1. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

2. **Open Swagger UI:**
   - On your computer: `http://localhost:3000/api-docs`
   - From mobile device: `http://YOUR_IP_ADDRESS:3000/api-docs` (replace YOUR_IP_ADDRESS with your computer's IP)

3. **Get a Token:**
   - Scroll to **Authentication** section
   - Use `/api/auth/login` endpoint
   - Click "Try it out"
   - Enter: email: `student@unbc.ca`, password: `test123`
   - Click "Execute"
   - **Copy the `token` from the response** (from `data.token` field)

4. **Authorize:**
   - Click the **🔒 Authorize** button at the top right of the page
   - In the "Value" field, paste your token (just the token, no "Bearer" prefix needed)
   - Click "Authorize"
   - Click "Close"
   - ✅ Now you can test protected endpoints!

5. **Test Protected Endpoints:**
   - Go to any protected endpoint (POST, PUT, DELETE /api/feeds)
   - Click "Try it out"
   - Fill in the parameters
   - Click "Execute" - the token will be automatically included!

### Sample Credentials for Swagger:
- **Email:** `student@unbc.ca`
- **Password:** `test123`

## 🧪 Testing the API

### Using Swagger UI (Recommended)

The easiest way to test the API is using Swagger UI:
- **On your computer:** `http://localhost:3000/api-docs`
- **From mobile device (Expo Go):** `http://YOUR_IP_ADDRESS:3000/api-docs`

See the Swagger API Documentation section above for details.

### 🔌 Connecting from Expo Go App

**Important:** When testing from Expo Go on a physical device, you must use your computer's IP address instead of `localhost`.

**Steps:**
1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   
   # Mac/Linux
   ifconfig
   # or
   ip addr
   # Look for inet address under your active network interface
   ```

2. **Use the IP address in your Expo app:**
   ```javascript
   // ❌ This won't work from a physical device
   const API_URL = 'http://localhost:3000';
   
   // ✅ Use your computer's IP address instead
   const API_URL = 'http://192.168.1.100:3000'; // Replace with your IP
   ```

3. **Make sure:**
   - Your phone and computer are on the **same Wi-Fi network**
   - Your firewall allows connections on port 3000
   - The server is running (`npm start` or `npm run dev`)

**Example IP addresses:**
- `http://192.168.1.100:3000`
- `http://192.168.0.105:3000`
- `http://10.0.0.50:3000`

**Troubleshooting:**
- Can't connect? Check that both devices are on the same Wi-Fi
- Still not working? Temporarily disable firewall to test
- IP changed? Run `ipconfig` or `ifconfig` again to get the new IP

### Testing with cURL

```bash
# Login and get token
# Replace localhost with your IP if testing from another device
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@unbc.ca",
    "password": "test123"
  }'

# Use token for protected route
curl -X POST http://localhost:3000/api/feeds \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "image": "https://example.com/image.jpg",
    "caption": "Test post"
  }'
```

**Note:** For Expo Go, replace `localhost` with your computer's IP address (e.g., `http://192.168.1.100:3000`)

### Testing with Postman

1. Create a new request
2. Go to "Headers" tab
3. Add header:
   - Key: `Authorization`
   - Value: `Bearer <your-token>`

### Testing with JavaScript (Fetch API)

```javascript
// For Expo Go: Use your computer's IP address instead of localhost
const API_URL = __DEV__ 
  ? 'http://192.168.1.100:3000'  // Replace with your computer's IP
  : 'http://localhost:3000';     // For web/development

const token = 'your-token-here';

fetch(`${API_URL}/api/feeds`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'John Doe',
    username: 'johndoe',
    image: 'https://example.com/image.jpg',
    caption: 'My post'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**For Expo Go:** Always use your computer's IP address (e.g., `192.168.1.100`) instead of `localhost`

## 🛡️ Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Secure token-based authentication
3. **Token Expiration**: Tokens expire after 7 days
4. **Protected Routes**: Create, Update, Delete operations require authentication
5. **Input Validation**: All inputs are validated before processing

## 🔐 Security Best Practices

1. **Never share your token** - Treat it like a password
2. **Store tokens securely** - Don't store in localStorage for production apps
3. **Use HTTPS in production** - Tokens should only be sent over encrypted connections
4. **Set strong JWT_SECRET** - Use a long, random string in production
5. **Token expiration** - Tokens expire after 7 days for security

## 🔐 Environment Variables

Create a `.env` file in the root directory:
```env
PORT=3000
JWT_SECRET=your-very-long-and-random-secret-key-here
NODE_ENV=development
```

**⚠️ Important**: Change the default secret key in production!

## 🎓 Learning Points

### What is a Controller?
Controllers handle HTTP requests. They receive data from the client, call services, and send responses back.

### What is a Service?
Services contain business logic - the "what" and "how" of your application. They don't know about HTTP, just the business rules.

### What is a Model?
Models define the structure of your data and provide methods to format it for responses.

### What is Storage?
Storage handles reading and writing data to files (or databases). It's the only part that knows about file operations.

## 📚 Technologies Used

- **Express** - Web framework for Node.js
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **swagger-ui-express** - Swagger UI for API documentation
- **swagger-jsdoc** - Generate Swagger specs from JSDoc comments

## 🐛 Troubleshooting

- **Port already in use?** Change PORT in `.env` file
- **JSON file errors?** Make sure `db/` folder exists
- **Module not found?** Run `npm install`
- **Tests failing?** Run `node scripts/createSampleUsers.js` to create test users
