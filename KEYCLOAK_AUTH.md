# Keycloak Authentication Integration

## Overview
SSO (Single Sign-On) authentication using Keycloak with OIDC (OpenID Connect) protocol via NextAuth.js v5.

## Authentication Flow

### 1. **User Visits Dashboard**
- Middleware checks for session (JWT token in cookie)
- No session → Redirect to `/api/auth/signin`

### 2. **Sign In with Keycloak**
- User clicks "Sign in with Keycloak"
- NextAuth redirects to Keycloak authorization endpoint:
  ```
  http://localhost:8080/realms/smarthome/protocol/openid-connect/auth
  ```
- **Sent to Keycloak:**
  - `client_id`: mqtt-panel-client
  - `client_secret`: yaUN2CiZ0YCJRkCdV6gvy3pWQXJCFxHN
  - `redirect_uri`: http://localhost:3000/api/auth/callback/keycloak
  - `response_type`: code (OAuth2 Authorization Code Flow)
  - `scope`: openid profile email

### 3. **User Authenticates on Keycloak**
- User enters credentials on Keycloak login page
- Keycloak validates and creates session

### 4. **Callback & Token Exchange**
- Keycloak redirects back with authorization code
- NextAuth exchanges code for tokens at:
  ```
  http://localhost:8080/realms/smarthome/protocol/openid-connect/token
  ```
- **Received from Keycloak:**
  - `access_token`: JWT for API authorization
  - `id_token`: JWT with user identity info (name, email, etc.)
  - `refresh_token`: For refreshing expired tokens

### 5. **Session Creation**
- NextAuth creates JWT session token containing:
  - User profile (name, email)
  - `accessToken` from Keycloak
  - `idToken` from Keycloak
- JWT stored in encrypted HTTP-only cookie: `next-auth.session-token`

### 6. **Authenticated Requests**
- Every request includes session cookie
- Middleware validates JWT → Allows access to dashboard
- User info displayed in header: "Welcome, [name]"

## Sign Out Flow
- User clicks "Sign Out"
- NextAuth clears session cookie
- Redirects to `/` → Middleware → Back to Keycloak login

## Security Features
- **JWT Strategy**: Stateless authentication (no database session storage)
- **HTTP-only Cookies**: Prevents XSS attacks
- **Authorization Code Flow**: More secure than implicit flow
- **Client Secret**: Confidential client authentication
- **Token Encryption**: Session tokens encrypted with `AUTH_SECRET`

## Key Files
- `lib/auth.ts`: NextAuth configuration with Keycloak provider
- `middleware.ts`: Route protection logic
- `types/next-auth.d.ts`: TypeScript type extensions
- `.env.local`: Keycloak credentials and endpoints
