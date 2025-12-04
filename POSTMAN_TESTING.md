# Postman API Testing Guide

## Base URL
```
http://localhost:3000/api/auth
```

---

## 1. Signup (Create New User)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/signup`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
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
  "sessionToken": "abc123def456..."
}
```

---

## 2. Login

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
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
  "sessionToken": "abc123def456..."
}
```

**⚠️ Important:** Copy the `sessionToken` from the response. You'll need it for authenticated requests.

---

## 3. Get Current User (Me)

**Method:** `GET`  
**URL:** `http://localhost:3000/api/auth/me`  
**Headers:**
```
Authorization: Bearer YOUR_SESSION_TOKEN_HERE
```

**OR using Cookie:**
```
Cookie: session_token=YOUR_SESSION_TOKEN_HERE
```

**Body:** None (GET request)

**Expected Response (200):**
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

---

## 4. Verify Session

**Method:** `GET`  
**URL:** `http://localhost:3000/api/auth/verify`  
**Headers:**
```
Authorization: Bearer YOUR_SESSION_TOKEN_HERE
```

**Body:** None (GET request)

**Expected Response (200):**
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

---

## 5. Logout

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/logout`  
**Headers:**
```
Authorization: Bearer YOUR_SESSION_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**
```json
{}
```

**OR Body can be empty**

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 6. Health Check

**Method:** `GET`  
**URL:** `http://localhost:3000/health`  
**Headers:** None  
**Body:** None

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Postman Setup Instructions

### Step 1: Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Login/Signup API"

### Step 2: Set Collection Variables (Optional but Recommended)
1. Click on your collection
2. Go to "Variables" tab
3. Add a variable:
   - **Variable:** `base_url`
   - **Initial Value:** `http://localhost:3000/api/auth`
   - **Current Value:** `http://localhost:3000/api/auth`

4. Add another variable:
   - **Variable:** `session_token`
   - **Initial Value:** (leave empty)
   - **Current Value:** (leave empty)

### Step 3: Create Requests

#### Request 1: Signup
- **Name:** Signup
- **Method:** POST
- **URL:** `{{base_url}}/signup`
- **Headers:** `Content-Type: application/json`
- **Body:** Select "raw" → "JSON" → Paste signup JSON

#### Request 2: Login
- **Name:** Login
- **Method:** POST
- **URL:** `{{base_url}}/login`
- **Headers:** `Content-Type: application/json`
- **Body:** Select "raw" → "JSON" → Paste login JSON
- **Tests Tab (to auto-save token):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.sessionToken) {
        pm.collectionVariables.set("session_token", response.sessionToken);
        console.log("Session token saved:", response.sessionToken);
    }
}
```

#### Request 3: Get Current User
- **Name:** Get Current User
- **Method:** GET
- **URL:** `{{base_url}}/me`
- **Headers:** `Authorization: Bearer {{session_token}}`

#### Request 4: Verify Session
- **Name:** Verify Session
- **Method:** GET
- **URL:** `{{base_url}}/verify`
- **Headers:** `Authorization: Bearer {{session_token}}`

#### Request 5: Logout
- **Name:** Logout
- **Method:** POST
- **URL:** `{{base_url}}/logout`
- **Headers:** 
  - `Authorization: Bearer {{session_token}}`
  - `Content-Type: application/json`
- **Body:** Select "raw" → "JSON" → `{}`

---

## Testing Flow

1. **First, test Health Check** to ensure server is running
2. **Signup** a new user (or use existing credentials)
3. **Login** with the credentials (copy the sessionToken)
4. **Get Current User** using the sessionToken
5. **Verify Session** to check if token is valid
6. **Logout** to end the session

---

## Common Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Name must be at least 2 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized (Invalid Credentials)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

### 409 Conflict (User Already Exists)
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## Quick Test JSON Bodies

### Signup
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout
```json
{}
```

