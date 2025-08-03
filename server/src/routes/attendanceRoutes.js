import express from 'express';
import {
  markAttendance,
  getUserAttendance,
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  getTodayAttendance,
  canMarkAttendance,
  markAttendanceForUsers,
  markAttendanceForSingleUser
} from '../controllers/attendanceController.js';
import { authenticateToken, adminOnly, participantOnly, mentorOrAdmin } from '../middleware/auth.js';
import {
  validateAttendance,
  validateMentorAttendance,
  validateAdminAttendance,
  validateMongoId,
  validatePagination,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Specific routes first
router.get('/my-attendance', participantOnly, validatePagination, handleValidationErrors, getUserAttendance);
router.get('/can-mark', participantOnly, canMarkAttendance);
router.get('/today', mentorOrAdmin, getTodayAttendance);
router.get('/stats', mentorOrAdmin, getAttendanceStats);
router.get('/', mentorOrAdmin, validatePagination, handleValidationErrors, getAllAttendance);
router.post('/', participantOnly, validateAttendance, handleValidationErrors, markAttendance);
router.post('/mark-for-user', mentorOrAdmin, validateMentorAttendance, handleValidationErrors, markAttendanceForSingleUser);
router.post('/mark-for-users', mentorOrAdmin, validateAdminAttendance, handleValidationErrors, markAttendanceForUsers);

// Routes with parameters
router.put('/:id', adminOnly, validateMongoId('id'), handleValidationErrors, updateAttendance);
router.delete('/:id', adminOnly, validateMongoId('id'), handleValidationErrors, deleteAttendance);

export default router; 