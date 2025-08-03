import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation error:', errors.array());
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request query:', req.query);
    console.log('Request params:', req.params);
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation rules
// ...existing code...
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('mobile')
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Mobile number must be between 10 and 15 digits')
    .matches(/^[0-9]+$/)
    .withMessage('Mobile number must contain only digits'),
  body('collegeName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('College name must be between 2 and 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['participant', 'mentor', 'admin'])
    .withMessage('Role must be either participant, mentor, or admin')
];
// ...existing code...
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Task validation rules
export const validateCreateTask = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Description must be at least 5 characters long'),
  body('maxScore')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max score must be between 1 and 1000'),
  body('day')
    .isIn(['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10', 'day11', 'day12'])
    .withMessage('Please provide a valid day (day1-day12)')
];

// Submission validation rules
export const validateSubmission = [
  body('taskId')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('submissionType')
    .isIn(['text', 'link'])
    .withMessage('Invalid submission type'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .custom((value) => {
      // Content can be a JSON string or an object
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch (error) {
          throw new Error('Content must be valid JSON');
        }
      }
      return true;
    })
];

// Attendance validation rules
export const validateAttendance = [
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['present', 'absent', 'late'])
    .withMessage('Invalid attendance status')
];

// Mentor attendance validation rules (for marking attendance for a single user)
export const validateMentorAttendance = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['present', 'absent', 'late'])
    .withMessage('Invalid attendance status'),
  body('session')
    .optional()
    .isString()
    .withMessage('Session must be a string'),
  body('remarks')
    .optional()
    .isString()
    .withMessage('Remarks must be a string')
];

// Admin attendance marking validation rules
export const validateAdminAttendance = [
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('session')
    .optional()
    .isString()
    .withMessage('Session must be a string'),
  body('attendees')
    .isArray({ min: 1 })
    .withMessage('Attendees must be a non-empty array'),
  body('attendees.*.userId')
    .isMongoId()
    .withMessage('Invalid user ID in attendees'),
  body('attendees.*.status')
    .optional()
    .isIn(['present', 'absent', 'late'])
    .withMessage('Invalid attendance status')
];

// Announcement validation rules
export const validateAnnouncement = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content must not be empty'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('targetAudience')
    .optional()
    .isIn(['all', 'participants', 'admins'])
    .withMessage('Invalid target audience'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    })
];

// Grading validation rules
export const validateGrading = [
  body('score')
    .isInt({ min: 0 })
    .withMessage('Score must be a non-negative integer'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback must not exceed 500 characters')
];

// MongoDB ID validation
export const validateMongoId = (field = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`)
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('SortBy must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either asc or desc')
]; 

// Team Validation

export const validateteam = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('members')
    .isArray({ min: 1 })
    .withMessage('Members must be a non-empty array'),
  body('members.*.userId')
    .isMongoId()
    .withMessage('Invalid user ID in members'),
  body('members.*.role')
    .isIn(['participant', 'admin'])
    .withMessage('Role must be either participant or admin')
];
