# Mentor Assignment System

## Overview
The Vedic Vision platform now includes a comprehensive mentor assignment system that allows administrators to assign participants to mentors, creating a structured learning environment.

## Features

### 1. Admin Dashboard - Mentor Assignment Tab
- **View All Mentors**: See all registered mentors with their assigned participants count
- **View Unassigned Participants**: Track participants who haven't been assigned to mentors yet
- **Bulk Assignment**: Assign multiple participants to a mentor at once
- **Remove Assignments**: Remove participants from mentors when needed
- **Real-time Statistics**: View assignment statistics and unassigned participant alerts

### 2. Enhanced Mentor Dashboard
- **Assigned Participants Only**: Mentors now see only their assigned participants
- **Attendance Tracking**: Mark attendance for assigned participants
- **Progress Reports**: Generate reports for assigned participants
- **Feedback System**: Provide feedback on submissions from assigned participants

### 3. Participant Dashboard
- **Mentor Information**: View assigned mentor details including contact information
- **Mentor Contact**: Direct email and phone contact options with assigned mentor

### 4. Updated Mentors Tab
- **Assignment Count**: See how many participants are assigned to each mentor
- **Visual Indicators**: Color-coded badges showing assignment status

## User Roles

### Superadmin
- Can assign/remove participants to/from mentors
- View all mentor-participant relationships
- Access the Mentor Assignment tab in Admin Dashboard

### Admin
- View mentor assignments (read-only)
- Cannot modify assignments

### Mentor
- View only assigned participants
- Mark attendance for assigned participants
- Provide feedback on assigned participants' submissions

### Participant
- View assigned mentor information
- Contact assigned mentor directly

## API Endpoints

### Backend Routes (Already Implemented)
- `POST /api/users/assign-participants` - Assign participants to a mentor
- `POST /api/users/remove-participants` - Remove participants from a mentor
- `GET /api/users/mentors` - Get all mentors with their assigned participants
- `GET /api/users/my-participants` - Get mentor's assigned participants
- `GET /api/users/my-mentor` - Get participant's assigned mentor

## Database Schema

### User Model Updates
The User model includes mentor-participant relationship fields:

```javascript
{
  // For participants - reference to assigned mentor
  assignedMentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // For mentors - array of assigned participants
  assignedParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}
```

## Usage Instructions

### For Administrators

#### Assigning Participants to Mentors:
1. Navigate to Admin Dashboard
2. Click on "Assign Mentors" tab
3. Click "Assign Participants" button
4. Select a mentor from the dropdown
5. Check the participants you want to assign
6. Click "Assign Participants"

#### Removing Participants from Mentors:
1. In the Mentor Assignment tab, find the mentor
2. Click the "X" button next to the participant you want to remove
3. Confirm the removal

### For Mentors

#### Viewing Assigned Participants:
1. Login to Mentor Dashboard
2. All displayed participants are your assigned ones
3. Use attendance and reporting features for your participants

### For Participants

#### Viewing Assigned Mentor:
1. Login to Participant Dashboard
2. Your mentor information is displayed in the "Mentor & Team" section
3. Click email or phone to contact your mentor

## Testing

### Test Script
Use the existing test script to verify assignments:

```bash
cd scripts
node testMentorAssignment.js
```

This script will show:
- Current mentor-participant relationships
- Unassigned participants
- Assignment statistics

### Creating Test Data
Use the existing scripts to create mentors:

```bash
cd scripts
node createMentor.js mentor@example.com "Mentor Name" password123 "+1234567890"
```

## Security & Permissions

- Only Superadmins can assign/remove participants
- Mentors can only see their assigned participants
- Participants can only see their assigned mentor
- All assignment operations are logged and tracked

## Future Enhancements

Potential future improvements:
1. Mentor capacity limits
2. Automatic assignment algorithms
3. Mentor-participant communication system
4. Assignment history and audit logs
5. Mentor performance analytics
6. Participant preferences for mentor assignment

## Troubleshooting

### Common Issues:

1. **Participants not showing in mentor dashboard**: Ensure participants are properly assigned using the Admin Dashboard
2. **Mentor information not appearing for participants**: Check that the participant has an assigned mentor
3. **API errors during assignment**: Verify user roles and permissions

### Debug Commands:

```bash
# Check current assignments
node scripts/testMentorAssignment.js

# Create a test mentor
node scripts/createMentor.js test@mentor.com "Test Mentor"

# Create a superadmin (if needed)
node scripts/createSuperadmin.js admin@example.com "Admin Name"
```
