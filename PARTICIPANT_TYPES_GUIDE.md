# Participant Types Feature Guide

## Overview
The system now supports two types of participants:
- **Bootcamp Participants** (240 users): Full access to tasks, leaderboards, scoring, team management, mentors, and problem statements
- **Hackathon Participants** (40 users): Access only to team management, mentors, and problem statements (no tasks or leaderboards)

## Key Changes

### 1. User Model Updates
- Added `participantType` field with values: `'bootcamp'` or `'hackathon'`
- Only required for users with role `'participant'`
- Defaults to `'bootcamp'` for backward compatibility

### 2. API Endpoints

#### New Endpoint
- `PATCH /api/users/:id/participant-type` - Update participant type (Admin only)
  ```json
  {
    "participantType": "hackathon"
  }
  ```

#### Updated Endpoints
- `GET /api/users` - Now supports `participantType` query parameter
- `GET /api/users/leaderboard` - Now supports `participantType` filter
- `GET /api/users/dashboard-stats` - Shows breakdown of participant types

### 3. Feature Access Control

#### Bootcamp Participants
- ✅ Tasks and submissions
- ✅ Attendance tracking
- ✅ Leaderboard and scoring
- ✅ Team management
- ✅ Mentor assignment
- ✅ Problem statements

#### Hackathon Participants
- ❌ Tasks and submissions
- ❌ Attendance tracking
- ❌ Leaderboard and scoring (always shows 0 score)
- ✅ Team management
- ✅ Mentor assignment
- ✅ Problem statements

### 4. Database Migration

#### Run Migration Script
```bash
cd server
node scripts/migrateParticipantTypes.js
```
This sets all existing participants to `'bootcamp'` type.

#### Update Specific Users to Hackathon Type
1. Edit `server/scripts/updateHackathonParticipants.js`
2. Add email addresses of hackathon-only participants to the array
3. Run the script:
```bash
node scripts/updateHackathonParticipants.js
```

### 5. Registration Updates
New registrations can specify participant type:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "collegeName": "Example College",
  "password": "password123",
  "role": "participant",
  "participantType": "hackathon"
}
```

### 6. Dashboard Statistics
The admin dashboard now shows:
- Total participants
- Bootcamp participants count
- Hackathon participants count
- Other existing metrics

## Usage Examples

### Filter Users by Participant Type
```javascript
// Get only bootcamp participants
GET /api/users?role=participant&participantType=bootcamp

// Get only hackathon participants
GET /api/users?role=participant&participantType=hackathon
```

### Leaderboard Filtering
```javascript
// Leaderboard automatically excludes hackathon participants
GET /api/users/leaderboard?role=participant

// Explicitly get bootcamp participants only
GET /api/users/leaderboard?participantType=bootcamp
```

### Update Participant Type
```javascript
// Change user to hackathon participant
PATCH /api/users/USER_ID/participant-type
{
  "participantType": "hackathon"
}
```

## Implementation Notes

1. **Backward Compatibility**: Existing participants are automatically set to `'bootcamp'` type
2. **Score Calculation**: Hackathon participants always have `totalScore: 0`
3. **Team Management**: Both participant types can create and join teams
4. **Mentor Assignment**: Both participant types can be assigned mentors
5. **Problem Statements**: Both participant types have access to problem statements

## Frontend Considerations

The frontend should:
1. Show different UI elements based on participant type
2. Hide task/leaderboard sections for hackathon participants
3. Display participant type in user profiles
4. Allow admins to filter and manage users by participant type
5. Show appropriate messaging for hackathon participants about limited features

## Testing

1. Create test users with both participant types
2. Verify hackathon participants cannot access tasks/leaderboards
3. Verify both types can access teams, mentors, and problem statements
4. Test admin functionality for managing participant types
5. Verify dashboard statistics show correct breakdowns