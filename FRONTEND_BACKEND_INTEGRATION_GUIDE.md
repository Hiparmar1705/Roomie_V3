# Frontend-Backend Integration Guide

## Purpose

This file explains how the Roomie frontend talks to the backend, which frontend files make API calls, which backend routes answer them, and how data moves from a screen tap to storage in the backend JSON files.

## High-Level Integration

The integration is organized in four layers:

1. Frontend screens collect user input or request data.
2. Frontend service files turn that work into HTTP requests.
3. Backend routes and controllers receive the request and call backend services.
4. Backend services read or write data through models and storage helpers.

In this project, the frontend does not call backend files directly. It only communicates through HTTP requests like `GET /api/listings` or `POST /api/chat/messages`.

## Core Connection Point

### Frontend API client

File:
- `shared/services/apiClient.js`

This is the main bridge between frontend and backend.

What it does:
- builds the backend base URL
- uses `EXPO_PUBLIC_API_BASE_URL` if you set one manually
- otherwise tries to detect the current host from Expo/React Native
- falls back to `10.0.2.2` on Android emulator
- falls back to `localhost` on web/iOS/local environments
- sends `fetch()` requests
- parses JSON responses
- throws a frontend error if the backend returns `success: false` or a bad status code

Important result:
- every frontend service calls `apiRequest(...)`
- every request automatically goes to the backend base URL plus `/api/...`

Example:
- `apiRequest('/listings')`
- becomes something like `http://localhost:3000/api/listings`

### Backend entry point

File:
- `backend/backend-api/server.js`

This is where the backend mounts the active API route groups:

- `/api/auth`
- `/api/listings`
- `/api/chat`

So the frontend service layer is really talking to those route groups through the API client.

## Authentication Integration

### Frontend files involved

- `features/auth/context/AuthContext.js`
- `features/auth/services/authService.js`
- auth screens that call the context methods

### How it works

`AuthContext` is the frontend session layer. Screens do not call the backend themselves. Instead:

1. a screen calls `login`, `signup`, or `updateProfile` from `AuthContext`
2. `AuthContext` calls `authService`
3. `authService` calls `apiRequest`
4. the backend route receives the request
5. the backend returns the updated user
6. `AuthContext` stores that user in React state

### Auth request mapping

Frontend:
- `authService.login(...)`

Backend path:
- `POST /api/auth/login`

Backend files:
- `backend/backend-api/routes/auth.js`
- `backend/backend-api/controllers/authController.js`
- `backend/backend-api/services/userService.js`
- `backend/backend-api/models/UserModel.js`
- `backend/backend-api/utils/userStorage.js`

Flow:
1. frontend sends `identifier` and `password`
2. backend validates the request body
3. `authController.loginUser` calls `userService.getUserAuthByIdentifier`
4. bcrypt compares the entered password with the stored hash
5. backend returns user data and a token
6. frontend stores the returned user in `AuthContext`

Frontend:
- `authService.signup(...)`

Backend path:
- `POST /api/auth/register`

Flow:
1. signup screen collects identifier, role, password, and display name
2. frontend normalizes the identifier
3. backend validates the request
4. `authController.registerUser` hashes the password
5. `userService.createUser` saves the user
6. backend returns the created user
7. frontend immediately treats that user as the logged-in session

Frontend:
- `authService.updateProfile(...)`

Backend path:
- `PUT /api/auth/profile/:id`

Flow:
1. frontend sends only the changed profile fields
2. backend validates them
3. `userService.updateUser` merges changes into the stored user
4. backend returns the updated user
5. frontend updates `AuthContext` so the new profile shows everywhere

## Listings Integration

### Frontend files involved

- `features/listings/services/listingService.js`
- `features/listings/screens/HomeScreen.js`
- `features/listings/screens/SavedScreen.js`
- `features/listings/screens/DetailScreen.js`
- `features/listings/screens/AddScreen.js`

### Home feed flow

`HomeScreen` loads listings and favorite IDs together.

Frontend calls:
- `listingService.getListings()`
- `listingService.getFavoriteIds(user)`

Backend paths:
- `GET /api/listings`
- `GET /api/listings/favorites?userIdentifier=...`

Backend files:
- `backend/backend-api/routes/listings.js`
- `backend/backend-api/controllers/listingController.js`
- `backend/backend-api/services/listingService.js`
- `backend/backend-api/services/userService.js`
- `backend/backend-api/models/ListingModel.js`
- `backend/backend-api/utils/listingStorage.js`
- `backend/backend-api/utils/userStorage.js`

Flow:
1. Home screen opens
2. frontend fetches listing data and favorite IDs
3. backend returns all listings from listing storage
4. backend returns the logged-in student's `favoriteListingIds`
5. frontend combines them to render bookmarks correctly

### Listing detail flow

`DetailScreen` does two backend-related things:

- checks or toggles favorites
- starts a conversation with a landlord

Favorite check:
- frontend calls `listingService.isFavorite(room.id, user)`
- that internally calls `GET /api/listings/favorites`

Favorite toggle:
- frontend calls `listingService.toggleFavorite(listingId, user)`
- backend route is `POST /api/listings/:id/favorite`

Flow:
1. frontend sends the listing ID and current user identifier
2. backend confirms the listing exists
3. `userService.toggleFavoriteListing` adds or removes the listing ID from the user record
4. backend returns whether the listing is now favorited
5. frontend updates the bookmark state

### Saved listings flow

`SavedScreen` loads the student’s saved listings.

Frontend calls:
- `listingService.getFavoriteListings(user)`
- `listingService.getFavoriteIds(user)`

Backend paths:
- `GET /api/listings/favorites/listings?userIdentifier=...`
- `GET /api/listings/favorites?userIdentifier=...`

Flow:
1. frontend asks for the saved listing IDs and the full saved listing objects
2. backend reads the user’s favorite listing IDs
3. backend filters all listings to only those IDs
4. frontend renders the full saved list and uses the IDs for compare selection state

### Landlord posting flow

`AddScreen` is the frontend form that creates a listing.

Frontend call:
- `listingService.createListing(payload)`

Backend path:
- `POST /api/listings`

Important frontend preparation:
- image picker loads a photo
- frontend stores it as a `data:image/...` string when base64 is available
- frontend normalizes price into `priceAmount`
- frontend sends landlord identity and creator identity

Backend flow:
1. route validation checks required listing fields
2. `listingController.createListing` forwards the body to `listingService.createListing`
3. backend service normalizes the listing shape
4. backend adds generated fields like ID and timestamps
5. backend persists the listing through `ListingModel` and storage helpers
6. frontend receives the created listing and shows a success alert

### Landlord-owned listing management

Frontend function:
- `listingService.getListingsCreatedByUser(user)`

Backend path:
- `GET /api/listings/user?createdByKey=...`

Purpose:
- lets the app load listings created by the current landlord account

Related cleanup function:
- `listingService.removeListingsByUser(user)`
- backend route `DELETE /api/listings/user?createdByKey=...`

## Chat Integration

### Frontend files involved

- `features/chat/services/chatService.js`
- `features/chat/screens/ChatListScreen.js`
- `features/chat/screens/ChatScreen.js`
- `features/listings/screens/DetailScreen.js`

### Starting a conversation

The conversation is created from `DetailScreen` when a student taps `Contact Landlord`.

Frontend call:
- `chatService.ensureConversationForListing(...)`

Backend path:
- `POST /api/chat/conversations/ensure`

Flow:
1. frontend sends listing info, landlord info, and requester info
2. backend checks if a conversation already exists for that listing/student pair
3. if one exists, backend returns it
4. if not, backend creates a new conversation and a system starter message
5. frontend navigates into the chat room using the returned conversation ID

This is why the listing screen is one of the strongest frontend-backend integration points: it connects the listing system directly to the chat system.

### Loading the inbox

`ChatListScreen` loads conversations whenever the screen gets focus.

Frontend call:
- `chatService.getConversations(user)`

Backend path:
- `GET /api/chat/conversations?userIdentifier=...`

Flow:
1. frontend sends the current user identifier
2. backend finds conversations visible to that user
3. backend sorts them by `lastMessageAt`
4. frontend renders the newest conversations at the top

This is why the chat list behaves like a normal inbox even without realtime sockets.

### Opening a chat room

`ChatScreen` loads both the conversation metadata and the messages.

Frontend calls:
- `chatService.getConversationById(conversationId, user)`
- `chatService.getMessages(conversationId, user)`

Backend paths:
- `GET /api/chat/conversations/:id?userIdentifier=...`
- `GET /api/chat/conversations/:id/messages?userIdentifier=...`

Flow:
1. frontend opens the screen
2. frontend fetches conversation info and messages in parallel
3. backend verifies the user is allowed to see that conversation
4. backend returns the conversation shell and message list
5. frontend renders the header and bubbles

### Sending a message

Frontend call:
- `chatService.sendMessage({ conversationId, text, user })`

Backend path:
- `POST /api/chat/messages`

Flow:
1. frontend builds a message payload with `senderType`, `senderName`, and `createdByKey`
2. backend validates the message
3. `chatService.sendMessage` creates a stored message record
4. backend updates the parent conversation’s last-message preview fields
5. frontend reloads the conversation so the new message appears

## Storage Integration

The frontend does not know anything about backend JSON files directly. It only knows about API responses.

The backend stores active Roomie data in:

- `backend/backend-api/db/user.json`
- `backend/backend-api/db/listing.json`
- `backend/backend-api/db/conversation.json`
- `backend/backend-api/db/message.json`

The backend service layer is responsible for translating frontend-friendly requests into persisted records.

Examples:
- frontend sends `POST /api/listings`
- backend eventually writes to `listing.json`

- frontend sends `POST /api/chat/messages`
- backend eventually writes to `message.json` and updates `conversation.json`

- frontend sends `POST /api/listings/:id/favorite`
- backend eventually updates the matching user in `user.json`

## Why This Architecture Works Well

This integration style keeps responsibilities separated:

- screens focus on UI and user interaction
- frontend services focus on HTTP requests
- backend routes focus on validation and routing
- backend controllers focus on request/response formatting
- backend services focus on business rules
- models and storage helpers focus on persistence

That makes it easier to change one layer without rewriting everything else.

Examples:
- you can move backend storage from JSON files to MongoDB later without rewriting every screen
- you can swap the frontend UI layout without changing the backend route structure
- you can add auth tokens later inside the API client instead of touching every screen

## Current Active Integration Map

### Auth

- Frontend `authService.login` -> `POST /api/auth/login`
- Frontend `authService.signup` -> `POST /api/auth/register`
- Frontend `authService.updateProfile` -> `PUT /api/auth/profile/:id`

### Listings

- Frontend `listingService.getListings` -> `GET /api/listings`
- Frontend `listingService.getListingById` -> `GET /api/listings/:id`
- Frontend `listingService.getListingsCreatedByUser` -> `GET /api/listings/user`
- Frontend `listingService.createListing` -> `POST /api/listings`
- Frontend `listingService.getFavoriteIds` -> `GET /api/listings/favorites`
- Frontend `listingService.getFavoriteListings` -> `GET /api/listings/favorites/listings`
- Frontend `listingService.toggleFavorite` -> `POST /api/listings/:id/favorite`
- Frontend `listingService.removeListingsByUser` -> `DELETE /api/listings/user`

### Chat

- Frontend `chatService.getConversations` -> `GET /api/chat/conversations`
- Frontend `chatService.getConversationById` -> `GET /api/chat/conversations/:id`
- Frontend `chatService.getMessages` -> `GET /api/chat/conversations/:id/messages`
- Frontend `chatService.ensureConversationForListing` -> `POST /api/chat/conversations/ensure`
- Frontend `chatService.sendMessage` -> `POST /api/chat/messages`
- Frontend `chatService.clearChatDataForUser` -> `DELETE /api/chat/data`

## Best Short Summary

If you need one sentence for class or documentation:

The Roomie frontend integrates with the backend through a shared API client and feature-based service files, which send HTTP requests to Express route groups for auth, listings, and chat; those backend routes validate input, run business logic in services, and persist data in JSON-backed storage.
