# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **assistants-admin** frontend - a React admin dashboard for managing AI assistants, WhatsApp conversations, orders, products, and appointments. It's part of the CondaMind ecosystem and connects to the `assistants-api` backend.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Run tests (vanilla Node.js tests for interceptor + SSE)
npm run preview      # Preview production build
```

## Architecture

### Provider Hierarchy (src/App.tsx)
The app wraps components in this order:
1. `QueryClientProvider` - React Query for server state
2. `BrowserRouter` - React Router
3. `TenantProvider` - Multi-tenant org ID context (persisted in localStorage)
4. `AuthProvider` - Auth0 authentication (or DevAuthProvider in dev mode)
5. `BusinessTypeProvider` - Business type context (gym/hotel/habits, per-user in localStorage)
6. `ThemeProvider` - Dark/light theme (`condamind-theme` in localStorage)
7. `NotificationsProvider` - SSE-based human-needed notification counter

### Authentication Flow
- **Production**: Auth0 via `@auth0/auth0-react`
- **Development bypass**: Set `VITE_SKIP_AUTH=true` in `.env.local` to use DevAuthProvider, which prompts for a JWT token manually (useful for testing against real API without Auth0 flow)
- `useAuth()` hook abstracts both providers with identical interface
- `useAuthApi()` hook returns an axios client with auto-injected Bearer token

### API Client Pattern (src/api/client.ts)
- `apiClient` - Basic axios instance (no auth)
- `useAuthApi()` - Hook returning authenticated axios with token interceptor
- Base URL from `VITE_API_URL` env var

### Real-time Notifications (src/hooks/notifications/)
- SSE connection to `/notifications/sse/human-needed`
- Auto-reconnect with exponential backoff (1s to 60s, max 10 retries)
- Token refresh on connection errors
- `eventSourceWithHeaders.ts` polyfill for sending Bearer token in SSE

### Route Organization
- Main routes: `/`, `/calendar`, `/orders`, `/products`, `/assistant`, `/settings`, etc.
- Gym-specific routes: `/gym/dashboard`, `/gym/members`, `/gym/classes`, `/gym/payments`, `/gym/plans`, `/gym/checkins`
- Payment callbacks: `/payments/mercadopago/{success,failure,pending}`
- Auth routes: `/login`, `/signup`, `/callback`, `/auth-error`, `/onboarding`

### State Management
- **Server state**: React Query (`@tanstack/react-query`)
- **Auth state**: Auth0 context or DevAuth context
- **Tenant state**: TenantContext (orgId in localStorage)
- **Business type**: BusinessTypeContext (gym/hotel/habits per user in localStorage)
- **Assistant selection**: localStorage + useAssistants hook
- **Theme**: localStorage (`condamind-theme`)

## Environment Variables

Required in `.env.local`:
```
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
VITE_AUTH0_CALLBACK_URL=
VITE_API_URL=https://api.condamind.com
VITE_SKIP_AUTH=true  # Optional: bypass Auth0 in development
```

## Path Alias

`@/` resolves to `./src/` (configured in vite.config.ts and tsconfig)
