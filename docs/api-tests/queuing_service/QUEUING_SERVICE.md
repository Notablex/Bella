# Queuing Service API Tests

Base URL: `http://localhost:3002`

## Typical Flow

1. **User** joins queue with preferences
2. **System** automatically matches users in background
3. **User** gets matched with compatible users
4. **User** can view match history and stats
5. **Admin** monitors queue statistics

---

## 1. Health Check (Public)

```http
GET /health
```

---

## 2. Queue Management (User - Auth Required)

### Join Queue
```http
POST /api/queue/join
Content-Type: application/json

{
  "userId": "user-id",
  "intent": "CASUAL",
  "gender": "MAN",
  "age": 28,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "interests": ["music", "travel", "fitness"],
  "languages": ["en", "es"],
  "ethnicity": "Hispanic"
}
```

**Intent Options:** `CASUAL`, `FRIENDS`, `SERIOUS`, `NETWORKING`
**Gender Options:** `MAN`, `WOMAN`, `NONBINARY`

### Leave Queue
```http
POST /api/queue/leave
Content-Type: application/json

{
  "userId": "user-id"
}
```

### Get Queue Status
```http
GET /api/queue/status/:userId
```

### Get Queue Stats (Admin)
```http
GET /api/queue/stats
```

---

## 3. Matching Preferences (User - Auth Required)

### Get Preferences
```http
GET /api/matching/preferences/:userId
```

### Update Basic Preferences
```http
PUT /api/matching/preferences/:userId
Content-Type: application/json

{
  "minAge": 25,
  "maxAge": 35,
  "maxRadius": 50,
  "interests": ["music", "travel"],
  "preferredInterests": ["fitness", "cooking"],
  "languages": ["en"],
  "preferredLanguages": ["en", "es"],
  "ethnicity": "Hispanic",
  "preferredEthnicities": ["Hispanic", "Asian"],
  "ethnicityImportance": 0.3,
  "ageWeight": 0.3,
  "locationWeight": 0.4,
  "interestWeight": 0.2,
  "languageWeight": 0.1
}
```

### Update Dating Preferences
```http
PUT /api/matching/dating-preferences/:userId
Content-Type: application/json

{
  "preferredGenders": ["WOMAN"],
  "preferredRelationshipIntents": ["LONG_TERM", "MARRIAGE"],
  "preferredFamilyPlans": ["DOESNT_HAVE_KIDS_WANTS_KIDS"],
  "preferredReligions": ["CHRISTIAN", "CATHOLIC"],
  "preferredEducationLevels": ["UNDERGRADUATE", "POSTGRADUATE"],
  "preferredPoliticalViews": ["MODERATE", "LIBERAL"],
  "preferredExerciseHabits": ["FREQUENTLY", "SOCIALLY"],
  "preferredSmokingHabits": ["NEVER"],
  "preferredDrinkingHabits": ["SOCIALLY", "RARELY"],
  "preferredMinAge": 25,
  "preferredMaxAge": 35,
  "genderWeight": 0.25,
  "relationshipIntentWeight": 0.15,
  "lifestyleWeight": 0.10
}
```

**Relationship Intent Options:**
- `LONG_TERM` - Long-term relationship
- `CASUAL_DATES` - Casual dating
- `MARRIAGE` - Looking for marriage
- `INTIMACY` - Physical intimacy
- `INTIMACY_NO_COMMITMENT` - Casual intimacy
- `LIFE_PARTNER` - Life partner
- `ETHICAL_NON_MONOGAMY` - Open relationships

**Family Plans Options:**
- `HAS_KIDS_WANTS_MORE`
- `HAS_KIDS_DOESNT_WANT_MORE`
- `DOESNT_HAVE_KIDS_WANTS_KIDS`
- `DOESNT_HAVE_KIDS_DOESNT_WANT_KIDS`
- `NOT_SURE_YET`

**Religion Options:**
`AGNOSTIC`, `ATHEIST`, `BUDDHIST`, `CATHOLIC`, `CHRISTIAN`, `HINDU`, `JEWISH`, `MUSLIM`, `SPIRITUAL`, `OTHER`

**Education Options:**
`HIGH_SCHOOL`, `IN_COLLEGE`, `UNDERGRADUATE`, `IN_GRAD_SCHOOL`, `POSTGRADUATE`

**Political Views:**
`LIBERAL`, `MODERATE`, `CONSERVATIVE`, `APOLITICAL`, `OTHER`

**Lifestyle Habits:**
`FREQUENTLY`, `SOCIALLY`, `RARELY`, `NEVER`

---

## 4. Finding Matches (User - Auth Required)

### Find Dating Matches
```http
POST /api/matching/find-dating-matches
Content-Type: application/json

{
  "userId": "user-id",
  "intent": "CASUAL",
  "maxMatches": 10
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "matches": [
      {
        "userId": "matched-user-id",
        "matchId": "match-attempt-id",
        "compatibility": {
          "totalScore": 85,
          "breakdown": {
            "ageCompatibility": 90,
            "locationCompatibility": 80,
            "interestCompatibility": 75,
            "genderCompatibility": 100,
            "relationshipIntentCompatibility": 85,
            "lifestyleCompatibility": 70,
            "premiumBonus": 5
          }
        }
      }
    ],
    "algorithm": "dating_v1",
    "timestamp": "2025-12-13T..."
  }
}
```

### Get Match History
```http
GET /api/matching/history/:userId?limit=20&offset=0
```

### Get Matching Stats
```http
GET /api/matching/stats
```

---

## Quick Test

```powershell
# 1. Check health
Invoke-RestMethod -Uri "http://localhost:3002/health"

# 2. Join queue
$body = @{
  userId = "user123"
  intent = "CASUAL"
  gender = "MAN"
  age = 28
  latitude = 40.7128
  longitude = -74.0060
  interests = @("music", "travel")
  languages = @("en")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/queue/join" -Method POST -Body $body -ContentType "application/json"

# 3. Update preferences
$prefs = @{
  minAge = 25
  maxAge = 35
  preferredGenders = @("WOMAN")
  preferredRelationshipIntents = @("LONG_TERM")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/matching/dating-preferences/user123" -Method PUT -Body $prefs -ContentType "application/json"

# 4. Find matches
$matchReq = @{
  userId = "user123"
  intent = "CASUAL"
  maxMatches = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/matching/find-dating-matches" -Method POST -Body $matchReq -ContentType "application/json"

# 5. Get queue status
Invoke-RestMethod -Uri "http://localhost:3002/api/queue/status/user123"
```

---

## Matching Algorithm

The queuing service uses an advanced matching algorithm that considers:

1. **Age Compatibility** (15% weight) - Age difference and preferences
2. **Location Proximity** (20% weight) - Distance between users
3. **Shared Interests** (10% weight) - Common hobbies and activities
4. **Language Compatibility** (5% weight) - Common languages
5. **Gender Compatibility** (25% weight) - Gender preferences match
6. **Relationship Intent** (15% weight) - Similar relationship goals
7. **Lifestyle Compatibility** (10% weight) - Exercise, smoking, drinking habits
8. **Premium Bonus** - Premium users get priority matching

**Total Score:** 0-100% compatibility

---

## Background Matching

The service automatically processes matches every 5 seconds (configurable):
- Scans waiting users in queue
- Calculates compatibility scores
- Creates match proposals
- Prioritizes premium users
- Removes expired queue entries
