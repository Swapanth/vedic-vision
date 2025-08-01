# Vedic Vision Backend API

A comprehensive event management and task submission platform built with Node.js, Express, and MongoDB following MVC architecture.

## 🚀 Features

### 👥 User Management
- User registration and authentication with JWT
- Role-based access control (Admin/Participant)
- User profile management
- Password change functionality
- Leaderboard system

### 📋 Task Management
- Task creation and management by admins
- Multiple task types (assignment, project, quiz, presentation)
- Task deadline tracking
- Active/inactive task status

### 📤 Submission System
- File, link, and text submissions
- Automatic late submission detection
- Grading system with feedback
- Submission history tracking

### 👨‍🏫 Attendance Management
- Session-based attendance tracking
- Multiple sessions per day support
- Attendance statistics and analytics
- Export capabilities

### 📢 Announcements
- Priority-based announcements
- Target audience selection
- Read/unread tracking
- File attachments support

### 📊 Data Export
- CSV export for attendance records
- Submissions export with detailed information
- Scores and leaderboard export
- Comprehensive participant reports

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: bcryptjs for password hashing
- **Export**: CSV Writer
- **Development**: Nodemon

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── taskController.js    # Task operations
│   │   ├── submissionController.js # Submission handling
│   │   ├── attendanceController.js # Attendance tracking
│   │   ├── announcementController.js # Announcements
│   │   └── exportController.js  # Data export
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── upload.js           # File upload handling
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Task.js             # Task model
│   │   ├── Submission.js       # Submission model
│   │   ├── Attendance.js       # Attendance model
│   │   └── Announcement.js     # Announcement model
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── userRoutes.js       # User endpoints
│   │   ├── taskRoutes.js       # Task endpoints
│   │   ├── submissionRoutes.js # Submission endpoints
│   │   ├── attendanceRoutes.js # Attendance endpoints
│   │   ├── announcementRoutes.js # Announcement endpoints
│   │   ├── exportRoutes.js     # Export endpoints
│   │   └── index.js            # Route aggregator
│   └── index.js                # Main server file
├── uploads/                    # File storage
├── exports/                    # Temporary export files
├── package.json
├── .env.example
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vedic-vision/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=9000
   MONGODB_URI=mongodb://localhost:27017/vedic-vision
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:9000`

## 📚 API Documentation

### Base URL
```
http://localhost:9000/api
```

### Authentication Endpoints
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/profile           # Get user profile
PUT  /api/auth/profile           # Update user profile
POST /api/auth/change-password   # Change password
POST /api/auth/refresh-token     # Refresh JWT token
POST /api/auth/logout            # Logout user
```

### User Management (Admin)
```http
GET    /api/users                # Get all users
GET    /api/users/:id            # Get user by ID
PATCH  /api/users/:id/status     # Update user status
PATCH  /api/users/:id/role       # Update user role
DELETE /api/users/:id            # Delete user
GET    /api/users/dashboard-stats # Dashboard statistics
GET    /api/users/leaderboard    # Get leaderboard
```

### Task Management
```http
GET    /api/tasks                # Get all tasks
GET    /api/tasks/active         # Get active tasks
GET    /api/tasks/:id            # Get task by ID
POST   /api/tasks                # Create task (Admin)
PUT    /api/tasks/:id            # Update task (Admin)
PATCH  /api/tasks/:id/toggle-status # Toggle task status (Admin)
DELETE /api/tasks/:id            # Delete task (Admin)
GET    /api/tasks/:id/submissions # Get task submissions (Admin)
```

### Submissions
```http
POST   /api/submissions          # Submit task (Participants)
GET    /api/submissions          # Get all submissions (Admin)
GET    /api/submissions/my-submissions # Get user submissions (Participants)
GET    /api/submissions/pending  # Get pending submissions (Admin)
GET    /api/submissions/:id      # Get submission by ID
POST   /api/submissions/:id/grade # Grade submission (Admin)
PUT    /api/submissions/:id/grade # Update grade (Admin)
DELETE /api/submissions/:id      # Delete submission
```

### Attendance
```http
POST   /api/attendance           # Mark attendance (Participants)
GET    /api/attendance           # Get all attendance (Admin)
GET    /api/attendance/my-attendance # Get user attendance (Participants)
GET    /api/attendance/today     # Get today's attendance (Admin)
GET    /api/attendance/stats     # Get attendance statistics (Admin)
GET    /api/attendance/can-mark  # Check if can mark attendance (Participants)
PUT    /api/attendance/:id       # Update attendance (Admin)
DELETE /api/attendance/:id       # Delete attendance (Admin)
```

### Announcements
```http
GET    /api/announcements        # Get all announcements
GET    /api/announcements/active # Get active announcements
GET    /api/announcements/unread-count # Get unread count
GET    /api/announcements/:id    # Get announcement by ID
POST   /api/announcements        # Create announcement (Admin)
PUT    /api/announcements/:id    # Update announcement (Admin)
PATCH  /api/announcements/:id/toggle-status # Toggle status (Admin)
DELETE /api/announcements/:id    # Delete announcement (Admin)
POST   /api/announcements/:id/mark-read # Mark as read
GET    /api/announcements/:id/read-stats # Get read statistics (Admin)
```

### Data Export (Admin)
```http
GET /api/export/attendance       # Export attendance data
GET /api/export/submissions      # Export submissions data
GET /api/export/scores           # Export scores/leaderboard
GET /api/export/comprehensive-report # Export comprehensive report
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

### Participant
- Mark attendance
- Submit tasks
- View own submissions and attendance
- View announcements and tasks
- Access leaderboard

### Admin
- All participant permissions
- User management
- Task creation and management
- Grade submissions
- Create announcements
- View analytics and statistics
- Export data

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: 'participant' | 'admin',
  profilePicture: String,
  isActive: Boolean,
  totalScore: Number,
  registrationDate: Date
}
```

### Task
```javascript
{
  title: String,
  description: String,
  type: 'assignment' | 'project' | 'quiz' | 'presentation',
  maxScore: Number,
  deadline: Date,
  isActive: Boolean,
  instructions: String,
  attachments: Array,
  createdBy: ObjectId
}
```

### Submission
```javascript
{
  userId: ObjectId,
  taskId: ObjectId,
  submissionType: 'file' | 'link' | 'text',
  content: Object,
  submittedAt: Date,
  score: Number,
  feedback: String,
  status: 'submitted' | 'graded' | 'returned',
  gradedBy: ObjectId,
  gradedAt: Date,
  isLate: Boolean
}
```

### Attendance
```javascript
{
  userId: ObjectId,
  date: Date,
  session: 'morning' | 'afternoon' | 'evening' | 'full-day',
  status: 'present' | 'absent' | 'late',
  markedAt: Date,
  remarks: String
}
```

### Announcement
```javascript
{
  title: String,
  content: String,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  isActive: Boolean,
  targetAudience: 'all' | 'participants' | 'admins',
  createdBy: ObjectId,
  expiresAt: Date,
  attachments: Array,
  readBy: Array
}
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Environment variable protection

## 📁 File Upload

- **Supported formats**: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, JPEG, PNG, GIF, ZIP
- **File size limit**: 10MB per file
- **Storage location**: `/uploads` directory
- **Security**: File type validation and unique naming

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `9000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/vedic-vision` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas or production database
4. Set up proper CORS origins
5. Configure reverse proxy (nginx/Apache)
6. Set up SSL/HTTPS
7. Configure file storage (AWS S3, etc.)

### Security Checklist
- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] Database secured
- [ ] File upload restrictions
- [ ] Rate limiting (consider implementing)
- [ ] Input validation
- [ ] Error handling
- [ ] Logging system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Happy Coding! 🎉** 