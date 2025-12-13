# Quick API Testing Guide

## Testing Order & Dependencies

Services should be tested in this order due to dependencies:

1. **User Service** (3001) - Base authentication
2. **Queuing Service** (3002) - Matching system
3. **Interaction Service** (3003) - Call interactions
4. **History Service** (3004) - Session tracking
5. **Notification Service** (3006) - Push notifications
6. **Moderation Service** (3007) - Content moderation
7. **Subscription Service** (3010) - Premium features

---

## 1. User Service (Port 3001)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health"
```

### Register User
```powershell
$registerBody = @{
    email = "test@example.com"
    password = "Test123!@#"
    username = "testuser"
    dateOfBirth = "1995-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
```

### Login & Get Token
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.data.token
```

### Get Profile (Authenticated)
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3001/api/users/profile" -Headers $headers
```

---

## 2. Queuing Service (Port 3002)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/health"
```

### Join Queue (Requires Token)
```powershell
$headers = @{ Authorization = "Bearer $token" }
$queueBody = @{
    userId = "user-id-here"
    preferences = @{
        ageRange = @{ min = 18; max = 35 }
        interests = @("music", "sports")
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/queue/join" -Method POST -Headers $headers -Body $queueBody -ContentType "application/json"
```

### Check Queue Status
```powershell
Invoke-RestMethod -Uri "http://localhost:3002/api/queue/status/user-id-here" -Headers $headers
```

---

## 3. Interaction Service (Port 3003)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/health"
```

### Get Interaction Details (Requires Token)
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3003/api/interactions/interaction-id" -Headers $headers
```

### Get User Interaction History
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/interactions/user/user-id?page=1&limit=10" -Headers $headers
```

### Get Interaction Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/interactions/stats/overview" -Headers $headers
```

### Rate Interaction Quality
```powershell
$ratingBody = @{
    qualityRating = 5
    connectionIssues = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/api/interactions/interaction-id/rating" -Method PATCH -Headers $headers -Body $ratingBody -ContentType "application/json"
```

---

## 4. History Service (Port 3004)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/health"
```

### Get Session History (Requires Token)
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3004/api/history/sessions/user-id?page=1&limit=10" -Headers $headers
```

### Get User Analytics
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/analytics/user/user-id" -Headers $headers
```

### Get Chat Messages
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/api/history/messages/session-id" -Headers $headers
```

### Submit Report
```powershell
$reportBody = @{
    reporterId = "user-id"
    reportedUserId = "reported-user-id"
    reportType = "INAPPROPRIATE_CONTENT"
    reason = "Inappropriate behavior"
    description = "User was being inappropriate"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/reports" -Method POST -Headers $headers -Body $reportBody -ContentType "application/json"
```

---

## 5. Notification Service (Port 3006)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3006/health"
```

### Register Device Token (Requires Token)
```powershell
$headers = @{ Authorization = "Bearer $token" }
$deviceBody = @{
    userId = "user-id"
    deviceToken = "fcm-device-token-here"
    platform = "android"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3006/api/notifications/register" -Method POST -Headers $headers -Body $deviceBody -ContentType "application/json"
```

### Get User Notifications
```powershell
Invoke-RestMethod -Uri "http://localhost:3006/api/notifications/user/user-id?page=1&limit=20" -Headers $headers
```

### Mark as Read
```powershell
Invoke-RestMethod -Uri "http://localhost:3006/api/notifications/notification-id/read" -Method PATCH -Headers $headers
```

---

## 6. Moderation Service (Port 3007)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/health"
```

### Moderate Text Content (Requires Token)
```powershell
$headers = @{ Authorization = "Bearer $token" }
$moderateBody = @{
    content = "This is some text to moderate"
    contentType = "text"
    userId = "user-id"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3007/api/moderate/text" -Method POST -Headers $headers -Body $moderateBody -ContentType "application/json"
```

### Moderate Image
```powershell
$imageBody = @{
    imageUrl = "https://example.com/image.jpg"
    userId = "user-id"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3007/api/moderate/image" -Method POST -Headers $headers -Body $imageBody -ContentType "application/json"
```

### Get Moderation History
```powershell
Invoke-RestMethod -Uri "http://localhost:3007/api/moderate/history/user-id?page=1&limit=10" -Headers $headers
```

---

## 7. Subscription Service (Port 3010)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3010/health"
```

### Get Available Plans
```powershell
Invoke-RestMethod -Uri "http://localhost:3010/api/subscriptions/plans"
```

### Get User Subscription (Requires Token)
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3010/api/subscriptions/user/user-id" -Headers $headers
```

### Create Subscription
```powershell
$subBody = @{
    userId = "user-id"
    planId = "premium-monthly"
    paymentMethod = "stripe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3010/api/subscriptions" -Method POST -Headers $headers -Body $subBody -ContentType "application/json"
```

### Check Feature Access
```powershell
Invoke-RestMethod -Uri "http://localhost:3010/api/subscriptions/user/user-id/features/unlimited_swipes" -Headers $headers
```

---

## Complete Test Flow Example

```powershell
# 1. Register and login
$registerBody = @{
    email = "testuser@example.com"
    password = "Test123!@#"
    username = "testuser"
    dateOfBirth = "1995-01-01"
} | ConvertTo-Json

$user = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"

$loginBody = @{
    email = "testuser@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
$userId = $loginResponse.data.user.id

# 2. Set auth header for all requests
$headers = @{ Authorization = "Bearer $token" }

# 3. Join matching queue
$queueBody = @{
    userId = $userId
    preferences = @{
        ageRange = @{ min = 18; max = 35 }
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/queue/join" -Method POST -Headers $headers -Body $queueBody -ContentType "application/json"

# 4. Check subscription status
Invoke-RestMethod -Uri "http://localhost:3010/api/subscriptions/user/$userId" -Headers $headers

# 5. Get notification preferences
Invoke-RestMethod -Uri "http://localhost:3006/api/notifications/user/$userId" -Headers $headers

# 6. View interaction history
Invoke-RestMethod -Uri "http://localhost:3003/api/interactions/user/$userId" -Headers $headers

# 7. View session analytics
Invoke-RestMethod -Uri "http://localhost:3004/api/analytics/user/$userId" -Headers $headers
```

---

## Notes

- All authenticated endpoints require a valid JWT token in the Authorization header
- Replace placeholder IDs (user-id, interaction-id, etc.) with actual IDs from responses
- Some endpoints may return 404 if no data exists yet - this is normal for new users
- Rate limiting is enabled on all services (1000 requests per 15 minutes per IP)
- Health checks don't require authentication

---

## Troubleshooting

### 401 Unauthorized
- Token expired or invalid - login again to get a new token
- Token not included in Authorization header

### 404 Not Found
- Resource doesn't exist yet (normal for new users)
- Check that IDs are correct

### 500 Internal Server Error
- Check service logs: `docker logs kindred-<service-name>`
- Verify database connections are healthy

### Connection Refused
- Service not running - check: `docker ps`
- Start service: `docker compose up -d <service-name>`
