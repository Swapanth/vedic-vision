import express from 'express';
import {
  getHackathonDashboard,
  getHackathonMentors,
  getHackathonTeams,
  getHackathonProblemStatements
} from '../controllers/hackathonController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validatePagination, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Hackathon dashboard routes
router.get('/dashboard', getHackathonDashboard);
router.get('/mentors', validatePagination, handleValidationErrors, getHackathonMentors);
router.get('/teams', validatePagination, handleValidationErrors, getHackathonTeams);
router.get('/problem-statements', validatePagination, handleValidationErrors, getHackathonProblemStatements);

export default router;