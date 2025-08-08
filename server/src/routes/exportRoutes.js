import express from 'express';
import {
  exportAttendance,
  exportSubmissions,
  exportScores,
  exportComprehensiveReport
} from '../controllers/exportController.js';
import { authenticateToken, mentorOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin-only access to all routes
router.use(authenticateToken, mentorOnly);

// Export routes
router.get('/attendance', exportAttendance);
router.get('/submissions', exportSubmissions);
router.get('/scores', exportScores);
router.get('/comprehensive-report', exportComprehensiveReport);

export default router; 