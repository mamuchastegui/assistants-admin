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
npm run test         # Run tests (interceptor + eventSourceSubscriber)
npm run preview      # Preview production build
```

## Architecture

### Provider Hierarchy (src/App.tsx)
The app wraps components in this order:
1. `QueryClientProvider` - React Query for server state
2. `TenantProvider` - Multi-tenant org ID context (persisted in localStorage)
3. `AuthProvider` - Auth0 authentication (or DevAuthProvider in dev mode)
4. `ThemeProvider` - Dark/light theme
5. `NotificationsProvider` - SSE-based human-needed notification counter

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

### Key Directories
- `src/pages/` - Route components (Index, Calendar, Orders, Products, Assistant, etc.)
- `src/components/` - UI components organized by feature (whatsapp/, orders/, calendar/, etc.)
- `src/components/ui/` - shadcn/ui primitives
- `src/hooks/` - Custom hooks (useAssistants, useOrders, useProducts, chat/, notifications/)
- `src/services/` - API service modules (airtable, appointment, payment, supabase)
- `src/providers/` - Context providers
- `src/devAuth/` - Development-only auth bypass system

### State Management
- **Server state**: React Query (`@tanstack/react-query`)
- **Auth state**: Auth0 context or DevAuth context
- **Tenant state**: TenantContext (orgId in localStorage)
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
