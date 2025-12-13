# User Service API Tests

Base URL: `http://localhost:3001`

## Typical Flow

1. **Anyone** checks health endpoint
2. **New User** registers → gets JWT token
3. **User** creates/updates profile
4. **User** manages safety (block, report)
5. **Anyone** views public profiles

---

## 1. Health Check (Public)

```http
GET /health
```

---

## 2. Authentication (Public)

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Response includes JWT token - save it!**

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## 3. Profile Management (User - Auth Required)

### Get My Profile
```http
GET /profile
Authorization: Bearer <token>
```

### Create/Update Profile
```http
PUT /profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "John Doe",
  "shortBio": "Looking for meaningful connections",
  "age": 28,
  "gender": "MAN",
  "intent": "LONG_TERM",
  "locationCity": "New York",
  "locationCountry": "USA"
}
```

### Update Preferences
```http
PUT /profile/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferredGenders": ["WOMAN"],
  "preferredMinAge": 25,
  "preferredMaxAge": 35,
  "preferredRelationshipIntents": ["LONG_TERM"]
}
```

### Upload Photo/Video
```http
POST /profile/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image/video file>
type: "photo" or "video"
```

### Remove Media
```http
DELETE /profile/media
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://media-url.com/image.jpg",
  "type": "photo"
}
```

---

## 4. Public Profiles (No Auth)

### Get User Profile
```http
GET /profile/users/:userId
```

### Batch Fetch Users
```http
POST /profile/users/batch
Content-Type: application/json

{
  "userIds": ["user-id-1", "user-id-2"]
}
```

---

## 5. Safety Features (User - Auth Required)

### Report User
```http
POST /safety/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportedUserId": "user-id",
  "reportType": "inappropriate_behavior",
  "description": "Detailed description"
}
```

**Report Types:** `inappropriate_behavior`, `harassment`, `spam`, `fake_profile`, `underage`, `inappropriate_content`, `violence_threat`, `other`

### Block User
```http
POST /safety/block
Authorization: Bearer <token>
Content-Type: application/json

{
  "blockedUserId": "user-id",
  "reason": "Unwanted contact"
}
```

### Unblock User
```http
DELETE /safety/block/:userId
Authorization: Bearer <token>
```

### Get Blocked Users
```http
GET /safety/blocked
Authorization: Bearer <token>
```

### Get Safety Status
```http
GET /safety/safety-status
Authorization: Bearer <token>
```

### Submit Appeal
```http
POST /safety/appeal
Authorization: Bearer <token>
Content-Type: application/json

{
  "appealReason": "I believe this was a mistake...",
  "evidence": ["https://evidence-url.com/proof.jpg"]
}
```

### Get My Reports
```http
GET /safety/my-reports
Authorization: Bearer <token>
```

### Check Interaction Ability
```http
POST /safety/can-interact
Authorization: Bearer <token>
Content-Type: application/json

{
  "otherUserId": "user-id"
}
```

---

## Quick Test

```powershell
# 1. Register
$register = Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method POST -Body (@{username="testuser"; email="test@example.com"; password="SecurePass123!"} | ConvertTo-Json) -ContentType "application/json"
$token = $register.data.token

# 2. Get current user
Invoke-RestMethod -Uri "http://localhost:3001/auth/me" -Headers @{Authorization="Bearer $token"}

# 3. Create profile
Invoke-RestMethod -Uri "http://localhost:3001/profile" -Method PUT -Headers @{Authorization="Bearer $token"} -Body (@{displayName="Test User"; age=25; gender="MAN"} | ConvertTo-Json) -ContentType "application/json"

# 4. Get profile
Invoke-RestMethod -Uri "http://localhost:3001/profile" -Headers @{Authorization="Bearer $token"}
```

---

## Validation Rules

- **Username:** 3-20 chars, alphanumeric + underscore
- **Email:** Valid email format
- **Password:** Min 8 characters
- **Age:** 18-100
- **Display Name:** Required, XSS sanitized
- **Bio:** Max 500 chars, XSS sanitized
