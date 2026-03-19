# Backend Active Usage Guide

This file lists the backend files that are actually being used by the current Roomie application flow.

This is different from the full backend code guide:

- `BACKEND_CODE_GUIDE.md` explains the full backend structure.
- `BACKEND_ACTIVE_USAGE_GUIDE.md` explains only the backend pieces currently active in the Roomie app.

## 1. What The Current App Actually Uses

The Roomie frontend currently uses these backend feature areas:

- health/server startup
- auth
- profile update through auth
- listings
- favorites
- chat
- JSON storage for users, listings, conversations, and messages

The frontend does **not** currently depend on:

- feeds
- protected `/api/users` routes
- push notifications
- manual backend scripts

## 2. Active Backend Request Paths

These are the backend endpoint groups actively used by the app:

- `/api/auth`
- `/api/listings`
- `/api/chat`

These are mounted in:

- [server.js](/c:/Users/HP/roomie_v3/backend/backend-api/server.js)

## 3. Core Backend Files In Use

### Server Entry

- [server.js](/c:/Users/HP/roomie_v3/backend/backend-api/server.js)

#### Why it is used

- Starts the Express server
- Mounts the auth, listings, and chat routes
- Enables JSON parsing and CORS
- Runs request logging

## 4. Auth Files In Use

### Routes

- [routes/auth.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/auth.js)

#### Used endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `PUT /api/auth/profile/:id`

### Controller

- [controllers/authController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/authController.js)

#### Used functions

- `registerUser(req, res)`
- `loginUser(req, res)`
- `updateProfile(req, res)`

### Service

- [services/userService.js](/c:/Users/HP/roomie_v3/backend/backend-api/services/userService.js)

#### Used functions from current app flow

- `createUser(userData)`
- `getUserAuthByIdentifier(identifier)`
- `updateUser(id, updates)`
- `getFavoriteListingIds(identifier)`
- `toggleFavoriteListing(identifier, listingId)`

### Model

- [models/UserModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/UserModel.js)

#### Why it is used

- validates user data
- removes password from API responses
- normalizes user response shape

### Storage

- [utils/userStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/userStorage.js)

#### Why it is used

- reads and writes `db/user.json`
- loads users by identifier
- updates profile info
- updates password
- updates favorite listing IDs

### Database file

- [db/user.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/user.json)

#### Why it is used

- stores registered users
- stores hashed passwords
- stores favorite listing IDs

## 5. Listings Files In Use

### Routes

- [routes/listings.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/listings.js)

#### Used endpoints

- `GET /api/listings`
- `GET /api/listings/user`
- `GET /api/listings/favorites`
- `GET /api/listings/favorites/listings`
- `GET /api/listings/:id`
- `POST /api/listings/:id/favorite`
- `POST /api/listings`
- `DELETE /api/listings/user`

### Controller

- [controllers/listingController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/listingController.js)

#### Used functions

- `getListings(req, res)`
- `getListingById(req, res)`
- `getUserListings(req, res)`
- `createListing(req, res)`
- `deleteUserListings(req, res)`
- `getFavoriteIds(req, res)`
- `toggleFavorite(req, res)`
- `getFavoriteListings(req, res)`

### Service

- [services/listingService.js](/c:/Users/HP/roomie_v3/backend/backend-api/services/listingService.js)

#### Used functions

- `getAllListings()`
- `getListingById(id)`
- `getListingsByUserKey(createdByKey)`
- `createListing(listingData)`
- `deleteListingsByUserKey(createdByKey)`

### Model

- [models/ListingModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/ListingModel.js)

#### Why it is used

- validates listing payloads
- normalizes image URLs
- normalizes `distanceKm`
- shapes listing responses

### Storage

- [utils/listingStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/listingStorage.js)

#### Why it is used

- reads and writes `db/listing.json`
- saves landlord listings
- loads feed data for frontend
- filters listings by owner key

### Database file

- [db/listing.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/listing.json)

#### Why it is used

- stores all visible housing listings

## 6. Chat Files In Use

### Routes

- [routes/chat.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/chat.js)

#### Used endpoints

- `GET /api/chat/conversations`
- `GET /api/chat/conversations/:id`
- `GET /api/chat/conversations/:id/messages`
- `POST /api/chat/conversations/ensure`
- `POST /api/chat/messages`
- `DELETE /api/chat/data`

### Controller

- [controllers/chatController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/chatController.js)

#### Used functions

- `getConversations(req, res)`
- `getConversationById(req, res)`
- `getMessages(req, res)`
- `ensureConversation(req, res)`
- `sendMessage(req, res)`
- `clearChatData(req, res)`

### Service

- [services/chatService.js](/c:/Users/HP/roomie_v3/backend/backend-api/services/chatService.js)

#### Used functions

- `getConversations(userIdentifier)`
- `getConversationById(conversationId, userIdentifier)`
- `getMessages(conversationId, userIdentifier)`
- `ensureConversation(conversationData)`
- `sendMessage(messageData)`
- `clearChatDataForUser(userKey)`

#### Why it is important

- builds the landlord/student inbox
- ensures conversations exist before opening a chat
- stores messages
- sorts conversations by newest activity
- filters landlord self-chats
- supports role-aware chat access

### Models

- [models/ConversationModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/ConversationModel.js)
- [models/MessageModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/MessageModel.js)

#### Why they are used

- validate and shape conversation/message responses

### Storage

- [utils/conversationStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/conversationStorage.js)
- [utils/messageStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/messageStorage.js)

#### Why they are used

- conversations are stored in `db/conversation.json`
- messages are stored in `db/message.json`

### Database files

- [db/conversation.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/conversation.json)
- [db/message.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/message.json)

## 7. Shared Backend Helpers Still Active

### Middleware

- [middleware/loggerMiddleware.js](/c:/Users/HP/roomie_v3/backend/backend-api/middleware/loggerMiddleware.js)

#### Why it is used

- logs incoming requests for all mounted routes

### Swagger Config

- [config/swagger.js](/c:/Users/HP/roomie_v3/backend/backend-api/config/swagger.js)

#### Why it is used

- only if you open `/api-docs`
- not needed for core app behavior, but still mounted by the server

## 8. Backend Files Present But Not Used By Current Roomie App Flow

These exist in the backend repo, but the current frontend does not rely on them:

- [routes/feeds.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/feeds.js)
- [controllers/feedController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/feedController.js)
- [services/feedService.js](/c:/Users/HP/roomie_v3/backend/backend-api/services/feedService.js)
- [models/FeedModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/FeedModel.js)
- [utils/feedStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/feedStorage.js)
- [db/feed.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/feed.json)
- [routes/users.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/users.js)
- [controllers/userController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/userController.js)
- [middleware/authMiddleware.js](/c:/Users/HP/roomie_v3/backend/backend-api/middleware/authMiddleware.js)
- [controllers/pushNotificationController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/pushNotificationController.js)
- [scripts/createSampleUsers.js](/c:/Users/HP/roomie_v3/backend/backend-api/scripts/createSampleUsers.js)
- [scripts/generateFeeds.js](/c:/Users/HP/roomie_v3/backend/backend-api/scripts/generateFeeds.js)
- [scripts/cleanInvalidFeeds.js](/c:/Users/HP/roomie_v3/backend/backend-api/scripts/cleanInvalidFeeds.js)

Important:

- some of these are still imported by `server.js`
- so “not used by the current app” does **not** always mean “safe to delete immediately”

## 9. Real Request Flow Used By Roomie

### Signup

1. Frontend calls `POST /api/auth/register`
2. `routes/auth.js` validates the request
3. `authController.registerUser()` hashes the password
4. `userService.createUser()` validates and saves the user
5. `userStorage.saveUser()` writes to `db/user.json`
6. safe user data is returned

### Login

1. Frontend calls `POST /api/auth/login`
2. `routes/auth.js` validates the request
3. `authController.loginUser()` calls `getUserAuthByIdentifier()`
4. bcrypt compares raw password with stored hash
5. JWT and safe user data are returned

### Create Listing

1. Frontend calls `POST /api/listings`
2. `routes/listings.js` validates the request
3. `listingController.createListing()` forwards the payload
4. `listingService.createListing()` normalizes image, distance, ID, and owner key
5. `listingStorage.saveListing()` writes to `db/listing.json`
6. `ListingModel` shapes the response

### Toggle Favorite

1. Frontend calls `POST /api/listings/:id/favorite`
2. `listingController.toggleFavorite()` checks the listing exists
3. `userService.toggleFavoriteListing()` edits the user’s `favoriteListingIds`
4. `userStorage.updateUserFavoriteListingIds()` writes to `db/user.json`

### Send Message

1. Frontend calls `POST /api/chat/messages`
2. `routes/chat.js` validates the payload
3. `chatController.sendMessage()` calls `chatService.sendMessage()`
4. `messageStorage.saveMessage()` writes the new message
5. `conversationStorage.updateConversation()` updates `updatedAt`
6. inbox order changes because conversations are sorted by newest activity

## 10. Short Version

If you only want the backend files that matter most to the current Roomie app, these are the key ones:

- [server.js](/c:/Users/HP/roomie_v3/backend/backend-api/server.js)
- [routes/auth.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/auth.js)
- [routes/listings.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/listings.js)
- [routes/chat.js](/c:/Users/HP/roomie_v3/backend/backend-api/routes/chat.js)
- [controllers/authController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/authController.js)
- [controllers/listingController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/listingController.js)
- [controllers/chatController.js](/c:/Users/HP/roomie_v3/backend/backend-api/controllers/chatController.js)
- [services/userService.js](/c:/Users/HP/roomie_v3/backend/backend-api/services/userService.js)
- [services/listingService.js](/c:/Users/HP/roomie_v3/backend/backend-api/services/listingService.js)
- [services/chatService.js](/c:/Users/HP/roomie_v3/backend/backend-api/services/chatService.js)
- [models/UserModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/UserModel.js)
- [models/ListingModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/ListingModel.js)
- [models/ConversationModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/ConversationModel.js)
- [models/MessageModel.js](/c:/Users/HP/roomie_v3/backend/backend-api/models/MessageModel.js)
- [utils/userStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/userStorage.js)
- [utils/listingStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/listingStorage.js)
- [utils/conversationStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/conversationStorage.js)
- [utils/messageStorage.js](/c:/Users/HP/roomie_v3/backend/backend-api/utils/messageStorage.js)
- [db/user.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/user.json)
- [db/listing.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/listing.json)
- [db/conversation.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/conversation.json)
- [db/message.json](/c:/Users/HP/roomie_v3/backend/backend-api/db/message.json)
