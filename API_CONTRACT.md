# Roomie Frontend API Contract (Sprint 2)

This document defines the request/response shapes expected by frontend service adapters.
Current services are mocked in-app. Backend can replace internals without changing screen code.

## Auth Service

### `login({ identifier, role })`
- Request:
  - `identifier: string` (`@unbc.ca` email for Student, 10-digit phone for Landlord)
  - `role: "Student" | "Landlord"`
- Response:
  - `identifier: string`
  - `role: "Student" | "Landlord"`
  - `displayName: string`
  - `location: string`
  - `bio: string`

### `signup({ identifier, role, password })`
- Request:
  - `identifier: string`
  - `role: "Student" | "Landlord"`
  - `password: string`
- Response:
  - Same as `login`

### `updateProfile({ user, updates })`
- Request:
  - `user`: current user object
  - `updates`:
    - `displayName?: string`
    - `location?: string`
    - `bio?: string`
- Response:
  - Updated user object

## Listing Service

### `getListings()`
- Response:
  - `Listing[]`

### `createListing(payload)`
- Request:
  - `title: string`
  - `price: string | number` (monthly CAD)
  - `type: "Shared" | "Private Room" | "Full Suite"`
  - `description: string`
  - `location: string`
  - `distanceKm: string | number`
  - `imageUrl: string`
  - `landlordName?: string`
  - `landlordIdentifier?: string`
  - `createdByIdentifier?: string`
  - `createdByRole?: "Student" | "Landlord"`
- Response:
  - Created `Listing`

### `getFavoriteIds(user)`
- Response:
  - `string[]` listing ids

### `toggleFavorite(listingId, user)`
- Request:
  - `listingId: string`
  - `user: User`
- Response:
  - `boolean` (`true` if now favorited, `false` if removed)

### `isFavorite(listingId, user)`
- Request:
  - `listingId: string`
  - `user: User`
- Response:
  - `boolean`

### `getFavoriteListings(user)`
- Request:
  - `user: User`
- Response:
  - `Listing[]`

### `Listing` shape
- `id: string`
- `title: string`
- `price: string`
- `priceAmount: number`
- `imageUrl: string`
- `type: string`
- `description: string`
- `location: string`
- `distanceKm: number`
- `landlordName: string`
- `landlordIdentifier: string`

## Chat Service

### `getConversations()`
- Response:
  - `Conversation[]` sorted by last message date descending

### `getConversationById(conversationId)`
- Request:
  - `conversationId: string`
- Response:
  - `Conversation | null`

### `getMessages(conversationId)`
- Request:
  - `conversationId: string`
- Response:
  - `Message[]`

### `ensureConversationForListing(payload)`
- Request:
  - `listingId: string`
  - `listingTitle: string`
  - `landlordName: string`
  - `landlordIdentifier: string`
  - `requesterIdentifier: string`
- Response:
  - `Conversation`

### `Conversation` shape
- `id: string`
- `listingId: string`
- `listingTitle: string`
- `landlordName: string`
- `landlordIdentifier: string`
- `requesterIdentifier?: string`
- `updatedAt: string` (ISO)

### `Message` shape
- `id: string`
- `senderType: "student" | "landlord" | "system"`
- `senderName: string`
- `text: string`
- `createdAt: string` (ISO)
