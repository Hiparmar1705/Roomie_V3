# Backend Code Guide

This file explains how the Roomie backend is organized, what each backend function does, how requests move through the code, and what each file is responsible for.

The backend lives in:

- `backend/backend-api/`

Main backend layers:

- `server.js`: Express app setup
- `routes/`: HTTP endpoint definitions
- `controllers/`: request/response handling
- `services/`: business logic
- `models/`: response shaping and validation
- `utils/`: JSON-file storage access
- `db/`: JSON data files

This document explains large files block-by-block instead of writing one sentence for every literal line.

## 1. Backend Architecture

The backend request path is:

1. Request hits `server.js`
2. Express matches a route file
3. Route validation runs
4. Controller reads request data
5. Controller calls service
6. Service applies business rules
7. Service calls storage utility
8. Storage reads/writes JSON files
9. Service wraps result
10. Controller sends HTTP response

## 2. Server Entry

### `server.js`

#### Purpose

Bootstraps the Express backend.

#### Main blocks

- Loads `express`, `cors`, and `dotenv`
- Loads route modules and Swagger config
- Enables JSON/body parsing
- Enables request logging through `loggerMiddleware`
- Mounts route groups:
  - `/api/auth`
  - `/api/feeds`
  - `/api/users`
  - `/api/listings`
  - `/api/chat`
  - `/api/push`
- Exposes:
  - `/api/health`
  - `/api-docs`
- Adds 500 error middleware
- Adds 404 fallback middleware
- Starts server with `app.listen()`

## 3. Route Files

### `routes/auth.js`

#### Purpose

Defines auth/profile routes and request validation.

#### Validation blocks

- `validateRegister`
- `validateLogin`
- `validateUpdateProfile`
- `checkValidation`

#### Routes

- `POST /register` -> `registerUser`
- `POST /login` -> `loginUser`
- `PUT /profile/:id` -> `updateProfile`

### `routes/listings.js`

#### Purpose

Defines listing and favorites endpoints.

#### Validation blocks

- `validateListing`
- `validateToggleFavorite`
- `checkValidation`

#### Routes

- `GET /`
- `GET /user`
- `GET /favorites`
- `GET /favorites/listings`
- `GET /:id`
- `POST /:id/favorite`
- `POST /`
- `PUT /:id`
- `DELETE /user`

### `routes/chat.js`

#### Purpose

Defines chat endpoints and validation.

#### Validation blocks

- `validateConversation`
- `validateMessage`
- `checkValidation`

#### Routes

- `GET /conversations`
- `GET /conversations/:id`
- `GET /conversations/:id/messages`
- `POST /conversations/ensure`
- `POST /messages`
- `DELETE /data`

### `routes/users.js`

#### Purpose

Protected legacy profile/password routes.

#### Routes

- `GET /profile`
- `PUT /profile`
- `PUT /password`

### `routes/feeds.js`

#### Purpose

Legacy feed CRUD routes.

## 4. Controllers

### `controllers/authController.js`

#### Functions

##### `registerUser(req, res)`

- Hashes password.
- Builds a user object.
- Calls `userService.createUser`.
- Creates a JWT.
- Returns user + token.

##### `loginUser(req, res)`

- Reads identifier and password.
- Calls `userService.getUserAuthByIdentifier`.
- Uses bcrypt to compare password against stored hash.
- Creates JWT on success.
- Returns safe user data + token.

##### `updateProfile(req, res)`

- Reads route param user ID and update payload.
- Calls `userService.updateUser`.

### `controllers/listingController.js`

#### Functions

##### `getListings(req, res)`

- Returns all listings.

##### `getListingById(req, res)`

- Returns one listing by ID.

##### `getUserListings(req, res)`

- Returns listings by `createdByKey`.

##### `createListing(req, res)`

- Creates a new listing through listing service.

##### `updateListing(req, res)`

- Updates one listing.

##### `deleteUserListings(req, res)`

- Deletes listings by owner key.

##### `getFavoriteIds(req, res)`

- Returns one user's favorite listing IDs.

##### `toggleFavorite(req, res)`

- Toggles one favorite listing for one user.

##### `getFavoriteListings(req, res)`

- Returns full listing objects for one user's favorites.

### `controllers/chatController.js`

#### Functions

##### `getConversations(req, res)`

- Returns all conversations visible to one user.

##### `getConversationById(req, res)`

- Returns one conversation if the user can access it.

##### `getMessages(req, res)`

- Returns all messages in one conversation.

##### `ensureConversation(req, res)`

- Creates or reuses a listing conversation.

##### `sendMessage(req, res)`

- Saves a chat message.

##### `clearChatData(req, res)`

- Deletes messages owned by one user key.

### `controllers/userController.js`

#### Functions

- `updateUser`
- `changePassword`
- `getCurrentUser`

### `controllers/feedController.js`

#### Functions

- `getFeeds`
- `getFeedById`
- `getFeedsByUsername`
- `createFeed`
- `updateFeed`
- `deleteFeed`

### `controllers/pushNotificationController.js`

#### Main function

- `sendPushNotification`

## 5. Services

### `services/userService.js`

#### Functions

##### `getUserById(id)`

- Loads one user and returns safe response shape.

##### `getUserByIdentifier(identifier)`

- Loads one user by identifier and returns safe response shape.

##### `getAllUsers()`

- Returns all users in safe response form.

##### `createUser(userData)`

- Validates user data.
- Rejects duplicate identifiers.
- Saves the user.

##### `userExists(identifier)`

- Boolean existence helper.

##### `updateUser(id, updates)`

- Loads existing user.
- Prevents identifier collisions.
- Validates merged user data.
- Saves allowed fields.

##### `changePassword(id, oldPassword, newPassword)`

- Verifies current password.
- Validates new password.
- Hashes and stores it.

##### `getUserAuthByIdentifier(identifier)`

- Loads raw stored user including password hash.
- Used for login only.

##### `getFavoriteListingIds(identifier)`

- Returns favorite listing IDs from user record.

##### `toggleFavoriteListing(identifier, listingId)`

- Adds or removes listing ID from `favoriteListingIds`.

### `services/listingService.js`

#### Helper pieces

##### `FALLBACK_LISTING_IMAGE`

- Safe image fallback for broken or non-portable listing image URLs.

##### `buildOwnerKey({ identifier, role })`

- Builds keys such as `Landlord:1234567890`.

#### Functions

##### `getAllListings()`

- Loads all listings and shapes them with `ListingModel`.

##### `getListingById(id)`

- Loads one listing.

##### `getListingsByUserKey(createdByKey)`

- Loads listings created by a specific user key.

##### `createListing(listingData)`

- Validates listing data.
- Normalizes image URL and distance.
- Stamps ID, owner key, and creation timestamp.
- Saves listing.

##### `updateListing(id, updates)`

- Validates and updates a listing.

##### `deleteListingsByUserKey(createdByKey)`

- Deletes listings by owner key.

### `services/chatService.js`

#### Helper

##### `canUserAccessConversation(conversation, userIdentifier)`

- Grants access if user is requester, landlord, or the conversation is unrestricted.

#### Functions

##### `getConversations(userIdentifier)`

- Loads all conversations visible to one user.
- Filters out self-chats.
- Loads latest message text/time.
- Infers `requesterName` when needed.
- Sorts newest activity first.

##### `getConversationById(conversationId, userIdentifier)`

- Returns one conversation if the user can access it.

##### `getMessages(conversationId, userIdentifier)`

- Returns messages only if the user can access the parent conversation.

##### `ensureConversation(conversationData)`

- Finds an existing conversation for listing + requester.
- If none exists:
  - validates payload
  - saves new conversation
  - stores `requesterName`
  - adds system starter message

##### `sendMessage(messageData)`

- Validates the message.
- Generates message ID and timestamp.
- Saves message.
- Updates conversation `updatedAt`.

##### `clearChatDataForUser(userKey)`

- Deletes messages created by one user key.

### `services/feedService.js`

#### Functions

- `getFeeds`
- `getFeedById`
- `getFeedsByUsername`
- `createFeed`
- `updateFeed`
- `deleteFeed`

## 6. Models

### `models/UserModel.js`

#### Purpose

Shapes user data and validates it.

#### Constructor fields

- `id`
- `identifier`
- `role`
- `displayName`
- `bio`
- `location`
- `profileImageUri`
- `favoriteListingIds`
- `password`
- `createdAt`

#### Functions

##### `toResponse()`

- Removes password before returning user data to clients.

##### `toResponseList(users)`

- Converts user array into safe response array.

##### `validate(data)`

- Validates identifier rules, role, display name, and optional password length.

### `models/ListingModel.js`

#### Purpose

Shapes and validates listing data.

#### Constructor behavior

- Normalizes image URL to safe fallback if invalid.
- Converts `distanceKm` into a number.

#### Functions

##### `toResponse()`

- Returns listing response object.

##### `toResponseList(listings)`

- Maps listing array to response objects.

##### `validate(data)`

- Validates required listing fields.

### `models/ConversationModel.js`

#### Constructor fields

- `id`
- `listingId`
- `listingTitle`
- `landlordName`
- `landlordIdentifier`
- `requesterIdentifier`
- `requesterName`
- `lastMessageText`
- `lastMessageAt`
- `updatedAt`
- `createdAt`

#### Functions

- `toResponse`
- `toResponseList`
- `validate`

### `models/MessageModel.js`

#### Functions

- `toResponse`
- `toResponseList`
- `validate`

Validation checks:

- conversation ID
- sender type
- sender name
- text

### `models/FeedModel.js`

#### Purpose

Legacy feed response/validation model.

## 7. Storage Utilities

### `utils/userStorage.js`

#### Helper functions

##### `inferRoleFromUser(user)`

- Infers role for older user records.

##### `normalizeStoredUser(user)`

- Converts older user shape into current Roomie schema.

##### `ensureDatabaseDirectory()`

- Makes sure the JSON database folder exists.

#### CRUD functions

- `readUsers`
- `writeUsers`
- `saveUser`
- `findUserByIdentifier`
- `findUserById`
- `getAllUsers`
- `updateUser`
- `updateUserPassword`
- `updateUserFavoriteListingIds`

### `utils/listingStorage.js`

#### Functions

- `ensureDatabaseDirectory`
- `readListings`
- `writeListings`
- `saveListing`
- `findListingById`
- `getAllListings`
- `getListingsByUserKey`
- `updateListing`
- `deleteListingsByUserKey`

### `utils/conversationStorage.js`

#### Functions

- `ensureDatabaseDirectory`
- `readConversations`
- `writeConversations`
- `saveConversation`
- `findConversationById`
- `findConversationByListingAndRequester`
- `getConversationsByUserIdentifier`
- `updateConversation`

### `utils/messageStorage.js`

#### Functions

- `ensureDatabaseDirectory`
- `readMessages`
- `writeMessages`
- `saveMessage`
- `getMessagesByConversationId`
- `getMessagesByUserKey`
- `deleteMessagesByUserKey`

### `utils/feedStorage.js`

#### Functions

- `ensureDatabaseDirectory`
- `readFeeds`
- `writeFeeds`
- `getAllFeeds`
- `getFeedById`
- `getFeedsByUsername`
- `createFeed`
- `updateFeed`
- `deleteFeed`

## 8. Middleware

### `middleware/loggerMiddleware.js`

#### Purpose

Logs each API request.

### `middleware/authMiddleware.js`

#### Main export

- `authenticateToken`

#### Purpose

Verifies JWT for protected routes.

## 9. Config, Scripts, and Data Files

### `config/swagger.js`

- Builds Swagger/OpenAPI docs config.

### Scripts

- `scripts/createSampleUsers.js`
- `scripts/generateFeeds.js`
- `scripts/cleanInvalidFeeds.js`

### Database files

- `db/user.json`
- `db/listing.json`
- `db/conversation.json`
- `db/message.json`
- `db/feed.json`

## 10. Request Flow Examples

### Login

1. Frontend sends `POST /api/auth/login`
2. `routes/auth.js` validates request
3. `authController.loginUser()` runs
4. `userService.getUserAuthByIdentifier()` loads raw user with password hash
5. bcrypt verifies password
6. JWT token is created
7. Safe user object is returned

### Create listing

1. Frontend sends `POST /api/listings`
2. `routes/listings.js` validates request
3. `listingController.createListing()` calls `listingService.createListing()`
4. Listing is normalized and saved
5. Response is shaped by `ListingModel`

### Toggle favorite

1. Frontend sends `POST /api/listings/:id/favorite`
2. Route validates `userIdentifier`
3. Controller checks listing exists
4. `userService.toggleFavoriteListing()` edits the user record
5. Updated favorite state is returned

### Send message

1. Frontend sends `POST /api/chat/messages`
2. Route validates message payload
3. `chatController.sendMessage()` calls `chatService.sendMessage()`
4. Message is stamped with ID/time and saved
5. Parent conversation `updatedAt` is refreshed

## 11. Current Backend Notes

- The current Roomie app mainly depends on auth, listings, favorites, chat, and profile update.
- Feeds, users protected routes, Swagger, and push endpoints still exist as supporting or legacy parts.
- Chat logic is role-aware and supports both students and landlords.
- Listing images are normalized so broken local-only image paths do not break rendering.
