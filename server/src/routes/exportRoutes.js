import express from 'express';
import {
  exportAttendance,
  exportSubmissions,
  exportScores,
  exportComprehensiveReport
} from '../controllers/exportController.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin-only access to all routes
router.use(authenticateToken, adminOnly);

// Export routes
router.get('/attendance', exportAttendance);
router.get('/submissions', exportSubmissions);
router.get('/scores', exportScores);
router.get('/comprehensive-report', exportComprehensiveReport);

export default router; 