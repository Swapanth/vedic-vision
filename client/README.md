# Vedic Vision 2K25 - Client Application

This is the React frontend application for the Vedic Vision 2K25 hackathon management system.

## Features

### For Participants:
- User registration and login
- Mark daily attendance
- View and submit tasks
- View announcements
- Track submission scores and feedback
- View leaderboard rankings
- Update profile information

### For Admins:
- Complete user management
- Create and manage tasks
- Track attendance across all participants
- Grade task submissions
- Create announcements
- Export data (attendance, submissions, scores)
- View comprehensive statistics

## Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Authentication**: JWT tokens with localStorage

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── common/
│   │   ├── Navigation.jsx
│   │   └── ProtectedRoute.jsx
│   ├── dashboard/
│   │   ├── AdminDashboard.jsx
│   │   └── ParticipantDashboard.jsx
│   ├── profile/
│   │   └── Profile.jsx
│   └── leaderboard/
│       └── Leaderboard.jsx
├── context/
│   └── AuthContext.jsx
├── services/
│   └── api.js
├── App.jsx
└── main.jsx
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## API Configuration

The application is configured to connect to the backend server at `http://localhost:5000/api`. You can modify this in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Authentication Flow

1. **Registration**: Users can register as participants
2. **Login**: Both admins and participants can login
3. **Token Management**: JWT tokens are stored in localStorage
4. **Auto-logout**: Invalid tokens automatically redirect to login

## Role-Based Access

- **Participants**: Can access dashboard, profile, leaderboard
- **Admins**: Can access all features including admin dashboard

## Key Components

### AuthContext
Manages authentication state, user information, and provides login/logout functions.

### API Service
Centralized API calls with automatic token management and error handling.

### Protected Routes
Ensures only authenticated users can access protected pages.

### Dashboards
- **ParticipantDashboard**: Shows attendance, tasks, submissions, announcements
- **AdminDashboard**: Comprehensive admin interface with tabs for different functions

## Usage

1. **Start the backend server first** (make sure it's running on port 5000)
2. **Start the client**: `npm run dev`
3. **Access the application**: Open `http://localhost:5173`
4. **Register/Login**: Use the authentication forms
5. **Navigate**: Use the navigation links to access different features

## Development Notes

- No CSS styling included (as requested) - ready for Tailwind CSS integration
- All functionality is implemented and connected to the backend
- Error handling and loading states are included
- File upload functionality for task submissions
- CSV export functionality for admin data exports

## Backend Integration

This client is designed to work with the provided Node.js/Express backend with the following endpoints:

- Authentication: `/api/auth/*`
- Tasks: `/api/tasks/*`
- Attendance: `/api/attendance/*`
- Submissions: `/api/submissions/*`
- Announcements: `/api/announcements/*`
- Users: `/api/users/*`
- Exports: `/api/export/*`

## Environment Variables

No environment variables are required for the client, but you can add them for:
- API base URL
- Feature flags
- Analytics keys

## Browser Compatibility

- Modern browsers with ES6+ support
- LocalStorage for token storage
- File API for uploads
- Fetch API (via Axios)
