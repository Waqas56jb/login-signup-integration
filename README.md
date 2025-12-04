# Login/Signup Integration API

A complete backend API for user authentication (signup, login, logout) built with Node.js, Express, and PostgreSQL (Vercel Neon).

## Features

- ✅ User registration (signup)
- ✅ User login with session management
- ✅ User logout
- ✅ Get current user information
- ✅ Session verification
- ✅ Password hashing with bcrypt
- ✅ Secure session tokens
- ✅ Input validation
- ✅ CORS support
- ✅ Cookie-based authentication

## API Endpoints

### Base URL
```
http://localhost:3000/api/auth
```

### 1. Signup
**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "sessionToken": "abc123..."
}
```

### 2. Login
**POST** `/api/auth/login`

Authenticate user and create session.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "sessionToken": "abc123..."
}
```

### 3. Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <session_token>
```
OR
```
Cookie: session_token=<session_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Get Current User
**GET** `/api/auth/me`

Get information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <session_token>
```
OR
```
Cookie: session_token=<session_token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Verify Session
**GET** `/api/auth/verify`

Check if the current session is valid.

**Headers:**
```
Authorization: Bearer <session_token>
```
OR
```
Cookie: session_token=<session_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Session is valid",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 6. Health Check
**GET** `/health`

Check if the server is running.

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration (from Vercel Neon Postgres)
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**To get your DATABASE_URL:**
1. Go to your Vercel Neon Postgres dashboard
2. Navigate to your database
3. Copy the connection string
4. It should look like: `postgresql://user:password@hostname.neon.tech/dbname?sslmode=require`

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

## Frontend Integration Examples

### Using Fetch API

#### Signup
```javascript
const response = await fetch('http://localhost:3000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Store sessionToken if needed
localStorage.setItem('sessionToken', data.sessionToken);
```

#### Login
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('sessionToken', data.sessionToken);
```

#### Get Current User
```javascript
const sessionToken = localStorage.getItem('sessionToken');

const response = await fetch('http://localhost:3000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
  credentials: 'include',
});

const data = await response.json();
console.log(data.user);
```

#### Logout
```javascript
const sessionToken = localStorage.getItem('sessionToken');

const response = await fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
  credentials: 'include',
});

localStorage.removeItem('sessionToken');
```

### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  withCredentials: true, // Important for cookies
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sessionToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Signup
const signup = async (name, email, password) => {
  const response = await api.post('/signup', { name, email, password });
  localStorage.setItem('sessionToken', response.data.sessionToken);
  return response.data;
};

// Login
const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  localStorage.setItem('sessionToken', response.data.sessionToken);
  return response.data;
};

// Get current user
const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data;
};

// Logout
const logout = async () => {
  await api.post('/logout');
  localStorage.removeItem('sessionToken');
};
```

## Project Structure

```
login-signup-integration/
├── config/
│   └── database.js          # Database connection configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   └── auth.js             # Authentication routes
├── utils/
│   └── auth.js             # Authentication utilities (hashing, tokens)
├── server.js                # Main server file
├── package.json
├── .env                     # Environment variables (not in git)
├── .env.example            # Example environment variables
└── README.md
```

## Security Features

- Passwords are hashed using bcrypt (10 salt rounds)
- Session tokens are cryptographically secure random strings
- Sessions expire after 7 days (configurable)
- HTTP-only cookies for session storage
- Input validation using express-validator
- SQL injection protection via parameterized queries
- CORS configured for frontend origin

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional: validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (signup)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or expired session)
- `404` - Not Found
- `409` - Conflict (user already exists)
- `500` - Internal Server Error

## Notes

- Sessions are stored in the database and automatically expire
- The `updated_at` field in the users table is automatically updated via database trigger
- Make sure your frontend sends credentials (cookies) by setting `credentials: 'include'` in fetch or `withCredentials: true` in axios
- In production, set `NODE_ENV=production` for secure cookies