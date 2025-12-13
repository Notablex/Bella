# User Service API Testing Guide

## Base URL
```
http://localhost:3001
```

## Available Endpoints

### 1. Health Check (No Auth Required)
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "service": "user-service",
    "uptime": 123.456,
    "timestamp": "2025-12-13T11:35:11.357Z"
  }
}
```

---

## Authentication Endpoints (`/auth`)

### 2. Register New User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-id-here",
      "username": "testuser",
      "email": "test@example.com",
      "role": "USER",
      "createdAt": "2025-12-13T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token for authenticated requests!**

### 3. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. Get Current User (Requires Auth)
```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Logout (Requires Auth)
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Profile Endpoints (`/profile`) - All Require Auth

### 6. Get Current User's Profile
```bash
curl http://localhost:3001/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Create/Update Profile
```bash
curl -X PUT http://localhost:3001/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "shortBio": "Just testing the API",
    "age": 25,
    "gender": "MAN",
    "intent": "FRIENDS",
    "locationCity": "New York",
    "locationCountry": "USA",
    "relationshipIntents": ["LONG_TERM", "CASUAL_DATES"],
    "familyPlans": "NOT_SURE_YET",
    "religion": "AGNOSTIC",
    "educationLevel": "UNDERGRADUATE",
    "politicalViews": "MODERATE",
    "exercise": "FREQUENTLY",
    "smoking": "NEVER",
    "drinking": "SOCIALLY"
  }'
```

### 8. Update Partner Preferences
```bash
curl -X PUT http://localhost:3001/profile/preferences \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredGenders": ["WOMAN", "NONBINARY"],
    "preferredMinAge": 22,
    "preferredMaxAge": 30,
    "preferredRelationshipIntents": ["LONG_TERM"],
    "preferredExerciseHabits": ["FREQUENTLY", "SOCIALLY"]
  }'
```

### 9. Upload Profile Photo/Video
```bash
curl -X POST http://localhost:3001/profile/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/image.jpg" \
  -F "type=photo"
```

### 10. Remove Media from Profile
```bash
curl -X DELETE http://localhost:3001/profile/media \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-media-url.com/image.jpg",
    "type": "photo"
  }'
```

### 11. Get Public User Profile (No Auth Required)
```bash
curl http://localhost:3001/profile/users/USER_ID_HERE
```

### 12. Batch Fetch Users (No Auth Required)
```bash
curl -X POST http://localhost:3001/profile/users/batch \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user-id-1", "user-id-2", "user-id-3"]
  }'
```

---

## Safety Endpoints (`/safety`) - All Require Auth

### 13. Report a User
```bash
curl -X POST http://localhost:3001/safety/report \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "reportedUserId": "user-id-to-report",
    "reportType": "inappropriate_behavior",
    "description": "This user was being inappropriate in chat messages"
  }'
```

**Report Types:**
- `inappropriate_behavior`
- `harassment`
- `spam`
- `fake_profile`
- `underage`
- `inappropriate_content`
- `violence_threat`
- `other`

### 14. Block a User
```bash
curl -X POST http://localhost:3001/safety/block \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "blockedUserId": "user-id-to-block",
    "reason": "Unwanted contact"
  }'
```

### 15. Unblock a User
```bash
curl -X DELETE http://localhost:3001/safety/block/USER_ID_TO_UNBLOCK \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 16. Get Blocked Users List
```bash
curl http://localhost:3001/safety/blocked \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 17. Get Safety Status
```bash
curl http://localhost:3001/safety/safety-status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 18. Submit an Appeal
```bash
curl -X POST http://localhost:3001/safety/appeal \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "appealReason": "I believe my account was restricted by mistake. I have always followed community guidelines and would like to request a review of my case.",
    "evidence": ["https://evidence-url.com/screenshot.jpg"]
  }'
```

### 19. Get My Reports
```bash
curl http://localhost:3001/safety/my-reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 20. Check if Can Interact with User
```bash
curl -X POST http://localhost:3001/safety/can-interact \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "otherUserId": "user-id-to-check"
  }'
```

---

## Testing with Postman

### 1. Import Collection
Create a new Postman collection with these requests.

### 2. Set Environment Variables
- `BASE_URL`: `http://localhost:3001`
- `TOKEN`: (will be set after login)

### 3. Auto-Set Token
In the "Register" or "Login" request, add this to the "Tests" tab:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("TOKEN", response.data.token);
}
```

### 4. Use Token in Headers
For authenticated requests, add header:
```
Authorization: Bearer {{TOKEN}}
```

---

## Testing with cURL - Complete Flow

### Step 1: Register
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "testuser123@example.com",
    "password": "SecurePass123!"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

### Step 2: Get Current User
```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Step 3: Create Profile
```bash
curl -X PUT http://localhost:3001/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User 123",
    "shortBio": "Testing the API",
    "age": 25,
    "gender": "MAN",
    "intent": "FRIENDS"
  }' | jq
```

### Step 4: Get Profile
```bash
curl http://localhost:3001/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Testing with JavaScript/Node.js

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let token = '';

// Register
async function register() {
  const response = await axios.post(`${BASE_URL}/auth/register`, {
    username: 'testuser',
    email: 'test@example.com',
    password: 'SecurePass123!'
  });
  
  token = response.data.data.token;
  console.log('Registered! Token:', token);
  return token;
}

// Get Profile
async function getProfile() {
  const response = await axios.get(`${BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('Profile:', response.data);
  return response.data;
}

// Run tests
(async () => {
  await register();
  await getProfile();
})();
```

---

## Testing with Python

```python
import requests

BASE_URL = 'http://localhost:3001'
token = ''

# Register
def register():
    global token
    response = requests.post(f'{BASE_URL}/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'SecurePass123!'
    })
    
    data = response.json()
    token = data['data']['token']
    print(f'Registered! Token: {token}')
    return token

# Get Profile
def get_profile():
    response = requests.get(f'{BASE_URL}/profile', 
        headers={'Authorization': f'Bearer {token}'})
    
    print('Profile:', response.json())
    return response.json()

# Run tests
if __name__ == '__main__':
    register()
    get_profile()
```

---

## Common Response Formats

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-13T...",
    "requestId": "req-123"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "field": "fieldName"
  },
  "meta": {
    "timestamp": "2025-12-13T...",
    "requestId": "req-123"
  }
}
```

---

## Validation Rules

### Username
- 3-20 characters
- Letters, numbers, and underscores only

### Email
- Valid email format

### Password
- Minimum 8 characters

### Age
- Between 18 and 100

### Display Name
- Required for profile
- Sanitized for XSS

### Short Bio
- Maximum 500 characters
- Sanitized for XSS

---

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "1. Testing health endpoint..."
curl -s $BASE_URL/health | jq

echo -e "\n2. Registering new user..."
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "SecurePass123!"
  }')

echo $RESPONSE | jq

TOKEN=$(echo $RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

echo -e "\n3. Getting current user..."
curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n4. Creating profile..."
curl -s -X PUT $BASE_URL/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test User",
    "shortBio": "Testing the API",
    "age": 25,
    "gender": "MAN"
  }' | jq

echo -e "\n5. Getting profile..."
curl -s $BASE_URL/profile \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\nAll tests completed!"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Troubleshooting

### 401 Unauthorized
- Check if token is valid
- Token might be expired (default: 24h)
- Make sure to include "Bearer " prefix

### 400 Bad Request
- Check request body format
- Validate required fields
- Check data types

### 404 Not Found
- Verify endpoint URL
- Check if resource exists

### 500 Internal Server Error
- Check service logs: `docker compose logs -f user-service`
- Verify database connection
- Check environment variables

---

## Next Steps

1. Test health endpoint first
2. Register a new user and save the token
3. Test authenticated endpoints with the token
4. Try creating and updating a profile
5. Test safety features (report, block)
6. Explore all endpoints systematically

Happy testing! 🚀
