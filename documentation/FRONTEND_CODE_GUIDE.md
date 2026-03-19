# Frontend Code Guide

This file explains how the Roomie frontend is organized, what each frontend function does, how data moves through the app, and what each file is responsible for.

The frontend lives mainly in:

- `App.js`
- `navigation/`
- `features/`
- `shared/`

This guide is intentionally written as a practical walkthrough. For very large React component files, the "what each line does" explanation is written block-by-block instead of literally one sentence per line so it stays readable.

## 1. Frontend Architecture

The frontend is an Expo / React Native app with these main layers:

- Entry layer: boots React Native, gesture handling, safe areas, navigation, and auth context.
- Navigation layer: decides whether the user sees auth screens or the main app.
- Feature layer: auth, listings, chat, and profile screens/services.
- Shared layer: constants, validation helpers, reusable UI, and API requests.

The general flow is:

1. `App.js` wraps the app in providers.
2. `AuthProvider` stores the current logged-in user in React state.
3. `AppNavigator` checks whether `user` exists.
4. If there is no user, the auth stack is shown.
5. If there is a user, the main tab/stack navigation is shown.
6. Screens call frontend service files.
7. Service files call the backend API through `shared/services/apiClient.js`.

## 2. Entry File

### `App.js`

#### Purpose

This is the root React component for the whole app.

#### Functions and blocks

##### `App()`

- Returns the top-level provider tree.
- Makes sure every screen has:
  - safe area support
  - access to auth state
  - navigation
  - gesture support

##### `navigationTheme`

- Overrides the default navigation colors so the app matches Roomie's theme.

#### Block-by-block explanation

- Import lines: load React, navigation, safe area, gesture handling, status bar, auth provider, navigator, and colors.
- `navigationTheme`: builds a custom React Navigation theme using shared colors.
- `GestureHandlerRootView`: required for gesture-based navigation.
- `SafeAreaProvider`: ensures layout respects notches and device safe zones.
- `AuthProvider`: injects auth state into the component tree.
- `NavigationContainer`: enables routing between screens.
- `StatusBar`: chooses dark system status styling.
- `AppNavigator`: renders either auth flow or main app flow.

## 3. Navigation Files

### `navigation/AppNavigator.js`

#### Function

##### `AppNavigator()`

- Reads `user` from auth context.
- Returns `MainNavigator` when logged in.
- Returns `AuthNavigator` when logged out.

### `navigation/AuthNavigator.js`

#### Function

##### `AuthNavigator()`

- Creates a hidden-header stack navigator.
- Registers:
  - `Login`
  - `Signup`

### `navigation/MainNavigator.js`

#### Important constant

##### `iconMap`

- Maps tab names to focused and unfocused tab icons.

#### Functions

##### `BottomTabs()`

- Reads the current user.
- Checks whether the user is a student.
- Builds bottom tabs for:
  - Home
  - Add
  - Chat
  - Account
- Only students get the `Saved` tab.

##### `MainNavigator()`

- Creates the logged-in stack.
- Uses `BottomTabs` as the base screen.
- Adds overlay screens:
  - Details
  - ListingComparison
  - ChatRoom
  - EditProfile
  - AppSettings
  - Privacy
  - Support

#### Block-by-block explanation

- Imports load navigators, icons, colors, routes, roles, screens, and auth hook.
- `Stack` and `Tab` create navigator instances.
- `iconMap` centralizes icon selection.
- `BottomTabs()` computes `isStudent` and conditionally renders the `Saved` tab.
- `MainNavigator()` defines higher-level stack routes above the tabs.

## 4. Shared Constants and Helpers

### `shared/constants/navigation.js`

#### Exports

- `AUTH_ROUTES`
- `TAB_ROUTES`
- `STACK_ROUTES`

#### Purpose

- Stores all route names in one place.
- Prevents typo bugs.

### `shared/constants/roles.js`

#### Exports

- `USER_ROLES`
- `USER_ROLE_OPTIONS`

#### Purpose

- Keeps role names consistent across auth, navigation, listings, and chat.

### `shared/constants/colors.js`

#### Export

- default `colors` object

#### Purpose

- Central theme tokens for the app.

### `shared/components/CustomButton.js`

#### Function

##### `CustomButton({ title, onPress, variant = 'filled', disabled = false, style, textStyle })`

- Renders a reusable themed button.
- Supports `filled` and `outline` variants.
- Applies disabled styling.
- Allows style overrides.

#### Block-by-block explanation

- Imports React Native touch/text/styling tools.
- `filled` and `outline` are derived booleans.
- Outer `TouchableOpacity` merges button styles.
- Inner `Text` merges text styles.
- `styles` defines common button appearance.

### `shared/services/apiClient.js`

#### Exports

- `API_BASE_URL`
- `apiRequest(path, options = {})`

#### Functions

##### `getScriptHost()`

- Reads the running bundle URL from React Native internals.
- Extracts the host name if available.

##### `buildDefaultBaseUrl()`

- Returns:
  - the detected script host when possible
  - `10.0.2.2` for Android emulator
  - `localhost` otherwise

##### `apiRequest(path, options = {})`

- Sends a `fetch()` request.
- Reads the raw response body.
- Attempts JSON parsing.
- Throws helpful errors when the HTTP status or backend payload indicates failure.
- Returns parsed payload on success.

### `shared/utils/validation.js`

#### Functions

##### `sanitizePhone(value = '')`

- Removes non-digit characters from a phone number.

##### `isValidStudentEmail(value = '')`

- Accepts only `@unbc.ca` email format.

##### `isValidLandlordPhone(value = '')`

- Requires a 10-digit cleaned phone number.

##### `validateIdentifierForRole({ role, identifier })`

- Validates login/signup identifier based on selected role.

##### `validateSignupFields({ displayName, role, identifier, password, confirmPassword })`

- Validates the whole signup form.

##### `validateListingForm(payload)`

- Validates the Add Listing form before submission.

## 5. Auth Feature

### `features/auth/context/AuthContext.js`

#### Functions

##### `AuthProvider({ children })`

- Stores `user` state.
- Exposes auth actions through context.

##### `login(identifier, role, password = '')`

- Calls frontend auth service login.
- Saves the returned user.

##### `signup(identifier, role, password, displayName)`

- Calls signup service.
- Saves the returned user to log in immediately.

##### `updateProfile(updates)`

- Sends profile changes to backend.
- Replaces local `user` with updated response.

##### `logout()`

- Clears current user after calling auth service logout.

##### `useAuth()`

- Returns `useContext(AuthContext)`.

### `features/auth/hooks/useAuth.js`

#### Function

##### `useAuth()`

- Tiny wrapper around auth context hook.

### `features/auth/services/authService.js`

#### Functions

##### `normalizeIdentifierForRole({ identifier, role })`

- Lowercases student identifiers.
- Sanitizes landlord phone numbers.

##### `login({ identifier, role, password = '' })`

- Calls `POST /auth/login`.
- Returns backend user.

##### `signup({ identifier, role, password, displayName })`

- Calls `POST /auth/register`.
- Returns created backend user.

##### `updateProfile({ user, updates })`

- Calls `PUT /auth/profile/:id`.

##### `logout()`

- Local async placeholder that currently just waits briefly.

### `features/auth/screens/LoginScreen.js`

#### Main function

##### `LoginScreen({ navigation })`

- Stores role, identifier, password, loading state, and compact-layout state.
- Renders the login UI.

#### Handlers

##### `handleLogin()`

- Validates identifier.
- Requires password.
- Calls context login.
- Shows alert on failure.

##### `handleSignup()`

- Opens signup and carries current role forward.

### `features/auth/screens/SignupScreen.js`

#### Main function

##### `SignupScreen({ navigation, route })`

- Stores role, display name, identifier, password, confirm password, and loading.

#### Handler

##### `handleSignup()`

- Validates all fields.
- Calls context signup.
- Shows alert on failure.

## 6. Listings Feature

### `features/listings/constants/listings.js`

#### Exports

- `ROOM_TYPES`
- `ROOM_TYPE_FILTER_OPTIONS`
- `ROOM_TYPE_CREATE_OPTIONS`

### `features/listings/services/listingService.js`

#### Functions

##### `normalizePrice(value = '')`

- Converts mixed price input into a number.

##### `normalizeIdentifierForRole({ identifier, role })`

- Normalizes identifiers before sending to backend.

##### `buildOwnerKey({ identifier, role })`

- Builds stable owner key strings.

##### `getListings()`

- Loads all listings from backend.

##### `getListingsCreatedByUser(user)`

- Loads listings created by a specific user.

##### `getListingById(listingId)`

- Loads one listing.

##### `createListing(payload)`

- Formats listing form data and posts to backend.

##### `getFavoriteIds(user)`

- Loads favorite listing IDs for the user.

##### `toggleFavorite(listingId, user)`

- Toggles one favorite listing.

##### `isFavorite(listingId, user)`

- Checks if a listing is currently favorited.

##### `getFavoriteListings(user)`

- Loads full listing objects for favorites.

##### `removeListingsByUser(user)`

- Removes listings by user owner key.

##### `filterListings({ listings, search, type, maxPrice, maxDistance })`

- Applies client-side filtering for feed display.

### `features/listings/components/ListingCard.js`

#### Function

##### `ListingCard({ room, isFavorite, onPress, onToggleFavorite, showFavoriteButton = true })`

- Renders listing image, price, title, metadata, location, and landlord.

### `features/listings/screens/HomeScreen.js`

#### Functions

##### `HomeScreen({ navigation })`

- Stores filter UI state, feed items, and favorite IDs.

##### `resetFilters()`

- Clears all active filters.

##### `loadData()`

- Loads listings and favorite IDs together.

##### `handleToggleFavorite(listingId)`

- Toggles a favorite listing for students.

### `features/listings/screens/SavedScreen.js`

#### Functions

##### `SavedScreen({ navigation })`

- Stores saved listings, favorite IDs, and comparison selection.

##### `loadSaved()`

- Loads saved listings and favorite IDs.

##### `handleToggleFavorite(listingId)`

- Saves/unsaves a listing.

##### `handleToggleSelection(listingId)`

- Adds/removes listing from compare selection.

##### `handleCompare()`

- Opens comparison screen with selected listings.

### `features/listings/screens/AddScreen.js`

#### Functions

##### `AddScreen()`

- Stores the listing form state.

##### `resetForm()`

- Clears the form.

##### `pickImage()`

- Requests media permission.
- Opens image picker.
- Converts selected image to a persistent `data:image/...` URL when base64 data exists.

##### `handleCreateListing()`

- Validates the form.
- Sends the listing to backend.
- Shows success/failure alerts.

### `features/listings/screens/DetailScreen.js`

#### Functions

##### `DetailScreen({ route, navigation })`

- Reads the selected listing.
- Loads favorite state.

##### `loadFavoriteStatus()`

- Checks if listing is saved for the current user.

##### `openMap()`

- Opens Google Maps search for listing location.

##### `handleToggleFavorite()`

- Toggles favorite state.

##### `handleContactLandlord()`

- Ensures a conversation exists.
- Navigates to chat room.
- Passes student name for better landlord-side chat labels.
- Prevents landlords from contacting themselves.

### `features/listings/screens/ListingComparisonScreen.js`

#### Functions

##### `ComparisonField({ label, value })`

- Renders one comparison row.

##### `ListingComparisonScreen({ route })`

- Displays selected listings side-by-side.

## 7. Chat Feature

### `features/chat/services/chatService.js`

#### Functions

##### `buildUserKey(user)`

- Builds sender ownership key.

##### `getConversations(user)`

- Loads inbox conversations.

##### `getConversationById(conversationId, user)`

- Loads one conversation.

##### `getMessages(conversationId, user)`

- Loads message list.

##### `ensureConversationForListing(payload)`

- Creates or reuses a conversation for a listing.

##### `sendMessage({ conversationId, text, user })`

- Sends a message with role-based sender type.

##### `clearChatDataForUser(user)`

- Clears chat data owned by a user key.

### `features/chat/components/MessageBubble.js`

#### Function

##### `MessageBubble({ message, userRole })`

- Detects whether the message belongs to the active role.
- Renders:
  - centered system note
  - right-side own message
  - left-side other message

### `features/chat/screens/ChatListScreen.js`

#### Functions

##### `ChatListScreen({ navigation })`

- Stores conversation list.
- Detects landlord/student mode.

##### `loadConversations()`

- Reloads conversations whenever the screen gains focus.

##### `renderItem({ item })`

- Shows landlord name for students.
- Shows requester/student name for landlords.
- Opens the chat room with `participantName`.

### `features/chat/screens/ChatScreen.js`

#### Functions

##### `ChatScreen({ route })`

- Stores conversation, messages, draft input, and sending state.
- Builds readable participant/listing header text.

##### `loadConversation()`

- Fetches conversation metadata and message list.

##### `handleSend()`

- Posts a new message and refreshes the conversation.

## 8. Profile Feature

### `features/profile/screens/ProfileScreen.js`

#### Functions

##### `ProfileLink({ icon, title, subtitle, onPress })`

- Renders one profile row link.

##### `StatCard({ value, label })`

- Renders one stat card.

##### `QuickAction({ icon, title, subtitle, onPress })`

- Renders one quick action tile.

##### `ProfileScreen({ navigation })`

- Shows user profile summary and shortcuts.

##### `loadDashboard()`

- Loads listing and favorites counts.

##### `handleLogout()`

- Logs the current user out.

### `features/profile/screens/EditProfileScreen.js`

#### Functions

##### `EditProfileScreen({ navigation })`

- Stores editable profile state.

##### `handlePickImage()`

- Selects a profile image.

##### `handleSave()`

- Sends profile updates to backend.

### `features/profile/screens/AppSettingsScreen.js`

#### Functions

##### `SettingRow({ title, description, value, onValueChange })`

- Renders a toggle row.

##### `AppSettingsScreen()`

- Displays local-only app setting toggles.

### `features/profile/screens/PrivacyScreen.js`

#### Functions

##### `PrivacyBlock({ title, description })`

- Renders one privacy section.

##### `PrivacyScreen()`

- Displays privacy information.

### `features/profile/screens/SupportScreen.js`

#### Functions

##### `SupportItem({ icon, title, description, onPress })`

- Renders one support item.

##### `SupportScreen()`

- Displays support/help actions.

## 9. Frontend Data Flow Summary

### Login flow

1. `LoginScreen` validates the form.
2. `AuthContext.login()` calls `authService.login()`.
3. `authService.login()` calls backend `/auth/login`.
4. Returned user is stored in context.
5. `AppNavigator` switches to the main app.

### Signup flow

1. `SignupScreen` validates the form.
2. `AuthContext.signup()` calls `authService.signup()`.
3. Backend creates the user.
4. Returned user is stored in context.
5. App enters the logged-in flow.

### Listing creation flow

1. Landlord fills the Add screen.
2. `pickImage()` creates a data URL when possible.
3. `handleCreateListing()` validates the form.
4. `listingService.createListing()` posts to backend.
5. Backend stores the listing.
6. Home feed shows the new listing.

### Chat flow

1. Student taps `Contact Landlord`.
2. `DetailScreen.handleContactLandlord()` ensures a conversation exists.
3. App navigates to `ChatScreen`.
4. `ChatScreen.loadConversation()` loads metadata + messages.
5. `handleSend()` posts messages and refreshes the room.

## 10. Frontend Notes

- Favorites are backend-persisted.
- Chat UI is now role-aware.
- New listing images are stored more persistently than before.
- Most feed/chat screens refresh on focus so users see new changes quickly.
