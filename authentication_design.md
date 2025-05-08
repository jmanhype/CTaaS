# Authentication Endpoints Design for CTaaS

## 1. Overview

This document outlines the design for implementing authentication endpoints for the CTaaS (Clinical Trials as a Service) platform. The authentication mechanism will be token-based, utilizing JSON Web Tokens (JWT) for securing API endpoints and managing user sessions. The backend is built with Phoenix (Elixir) and the frontend with Next.js.

The primary goal is to implement the following core authentication functionalities:
- User Registration (Signup)
- User Login
- User Logout
- Fetching User Profile (Protected Endpoint)

## 2. API Endpoint Specifications

All authentication-related API endpoints will be prefixed with `/api/v1/auth` or `/api/v1/users` where appropriate.

### 2.1. User Registration

- **Endpoint:** `POST /api/v1/auth/register`
- **Description:** Allows new users to create an account.
- **Request Body:**
  ```json
  {
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (Success - 201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "uuid-string",
      "username": "newuser",
      "email": "user@example.com",
      "roles": ["user"] 
    }
  }
  ```
- **Response (Failure):
    - `400 Bad Request` for validation errors (e.g., missing fields, invalid email format, password too short).
    - `409 Conflict` if email or username already exists.

### 2.2. User Login

- **Endpoint:** `POST /api/v1/auth/login`
- **Description:** Authenticates a user and returns a JWT.
- **Request Body:**
  ```json
  {
    "email": "user@example.com", // or "username": "testuser"
    "password": "securepassword123"
  }
  ```
- **Response (Success - 200 OK):**
  ```json
  {
    "access_token": "your_jwt_access_token_here",
    "token_type": "bearer",
    "expires_in": 3600, // Optional: token lifetime in seconds
    "user": { // Optional: include basic user info
        "id": "uuid-string",
        "username": "testuser",
        "email": "user@example.com",
        "roles": ["user"]
    }
  }
  ```
- **Response (Failure):
    - `400 Bad Request` for missing fields.
    - `401 Unauthorized` for invalid credentials.

### 2.3. Fetch User Profile

- **Endpoint:** `GET /api/v1/users/me/profile`
- **Description:** Retrieves the profile of the currently authenticated user. This is a protected endpoint.
- **Headers:**
  ```
  Authorization: Bearer <your_jwt_access_token_here>
  ```
- **Response (Success - 200 OK):** (Matches frontend `UserProfile` interface)
  ```json
  {
    "user": {
      "id": "uuid-string",
      "username": "testuser",
      "email": "user@example.com",
      "roles": ["user", "admin"] // Example roles
    }
  }
  ```
- **Response (Failure):
    - `401 Unauthorized` if token is missing, invalid, or expired.

### 2.4. User Logout

- **Endpoint:** `POST /api/v1/auth/logout`
- **Description:** Logs out the user. For stateless JWTs, this endpoint primarily serves to allow the client to confirm logout and potentially for the server to add the token to a denylist if such a mechanism is implemented.
- **Headers:**
  ```
  Authorization: Bearer <your_jwt_access_token_here>
  ```
- **Response (Success - 200 OK or 204 No Content):
  ```json
  {
    "message": "Logout successful"
  }
  ```
- **Response (Failure):
    - `401 Unauthorized` if token is missing or invalid.

## 3. User Model/Schema (Elixir - Ecto)

A `User` schema will be created to store user information in the database.

- **Module:** `A2aAgentWeb.Accounts.User` (or similar, e.g., `A2aAgentWeb.Users.User`)
- **Table Name:** `users`
- **Fields:**
    - `id`: `:binary_id` (UUID, primary key)
    - `username`: `:string` (unique, optional or required based on final decision)
    - `email`: `:string` (unique, required)
    - `hashed_password`: `:string` (required)
    - `roles`: `{:array, :string}` (stores user roles, e.g., ["user", "admin"])
    - `inserted_at`: `:naive_datetime`
    - `updated_at`: `:naive_datetime`

## 4. Password Management

- **Hashing Algorithm:** `Argon2` will be used for password hashing, via the `argon2_elixir` library (which typically works with `comeonin`).
- **Storage:** Only hashed passwords will be stored in the database.

## 5. JWT Strategy

- **Library:** `Joken` will be used for generating and verifying JWTs.
- **Token Type:** Access Token.
- **Payload Claims (Standard):**
    - `iss` (Issuer): Application identifier
    - `sub` (Subject): User ID
    - `aud` (Audience): Application identifier
    - `exp` (Expiration Time): Timestamp for token expiry (e.g., 1 hour, 24 hours)
    - `iat` (Issued At): Timestamp for token issuance
    - `jti` (JWT ID): Unique token identifier (optional, for denylisting)
- **Custom Claims:**
    - `roles`: User roles (if needed directly in token, otherwise fetched from DB)
- **Token Transmission:** Tokens will be sent in the `Authorization` header as `Bearer <token>`.
- **Token Refresh:** Initially, only access tokens will be implemented. Refresh tokens can be added as a future enhancement if longer-lived sessions are required without frequent re-logins.

## 6. Required Elixir Libraries

- `ecto_sql` & `postgrex` (assuming PostgreSQL, as it's common with Phoenix)
- `comeonin` (password hashing interface)
- `argon2_elixir` (Argon2 hashing implementation)
- `joken` (JWT library)

These will need to be added to `mix.exs` for the `a2a_agent_web` app.

## 7. High-Level Backend Implementation Steps (Phoenix/Elixir)

1.  **Add Dependencies:** Update `mix.exs` with `argon2_elixir`, `comeonin`, and `joken`.
2.  **Database Setup (if not already fully configured for Ecto):
    - Configure Ecto repo if needed.
3.  **User Schema & Migration:**
    - Create the `User` Ecto schema.
    - Generate and run a migration to create the `users` table.
4.  **Authentication Context/Module (e.g., `Accounts`):
    - Functions for user registration (`create_user/1`), fetching users (`get_user_by_email/1`, `get_user_by_id/1`).
    - Password verification logic.
5.  **JWT Service/Module (e.g., `TokenService`):
    - Functions for generating JWTs (`generate_token/1`) and verifying them (`verify_token/1`).
    - Configure Joken signers and verifiers.
6.  **Controllers:**
    - `AuthController` (for `/register`, `/login`, `/logout`).
    - `UserController` (for `/users/me/profile`, potentially other user-related actions).
7.  **Router:**
    - Add new routes in `A2aAgentWebWeb.Router` for the authentication endpoints.
8.  **Plugs:**
    - Create an authentication plug (e.g., `EnsureAuthenticated`) to protect routes by verifying the JWT in the `Authorization` header.
    - This plug will fetch the user based on the token and can put the `current_user` into `conn.assigns`.
9.  **Configuration:**
    - Add JWT secret key and other relevant settings to `config/config.exs` (and runtime/prod/dev specifics).

## 8. Frontend Considerations (Recap)

The frontend `AuthContext.tsx` already expects:
- `loginUser` to return `{ access_token: string }`.
- `getUserProfile` to return `{ user: { id, username, email, roles } }`.
- Token to be stored in `localStorage`.

This design aims to fulfill these frontend expectations.

