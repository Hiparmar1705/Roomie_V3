# Frontend Structure Guide

This project is intentionally frontend-first. Backend implementation is handled by a separate team member.

## Folder Responsibilities

- `features/`
  - Feature modules grouped by domain: `auth`, `listings`, `chat`, `profile`.
  - Each feature owns its own screens/services/components/constants where applicable.
- `shared/`
  - Cross-feature reusable modules:
    - `shared/components`
    - `shared/constants`
    - `shared/utils`
- `navigation/`
  - App-level navigator composition only.

## Scalability Rules

1. Add route names in `shared/constants/navigation.js` first.
2. Add role/type enums in `shared/constants` or feature `constants` instead of hardcoded strings.
3. Keep screens calling service methods, not in-memory stores directly.
4. Keep service method signatures backward-compatible to avoid screen rewrites.
5. When backend is ready, replace service internals, not screen behavior.

## Current Mock-to-Backend Boundary

- `features/auth/services/authService.js`
- `features/listings/services/listingService.js`
- `features/chat/services/chatService.js`

These are the only files that should need significant backend rewiring later.
