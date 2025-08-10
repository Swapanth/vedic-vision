import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  updateParticipantType,
  deleteUser,
  getDashboardStats,
  getLeaderboard,
  assignParticipantsToMentor,
  removeParticipantsFromMentor,
  getMentorParticipants,
  getAllMentorsWithParticipants,
  getMyMentor,
  createMentor,
  getAllMentors,
  getMentorById,
  updateMentor,
  deleteMentor
} from '../controllers/userController.js';
import { authenticateToken, adminOnly, superadminOnly, mentorOnly, participantOnly } from '../middleware/auth.js';
import { validateMongoId, validatePagination, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Specific routes first
router.get('/leaderboard', getLeaderboard);
router.get('/dashboard-stats', adminOnly, getDashboardStats);
router.get('/mentors', superadminOnly, getAllMentorsWithParticipants);
router.get('/mentors/all', adminOnly, getAllMentors);
router.get('/my-participants', mentorOnly, getMentorParticipants);
router.get('/my-mentor', participantOnly, getMyMentor);
router.get('/', adminOnly, validatePagination, handleValidationErrors, getAllUsers);

// Mentor CRUD routes (Admin only)
router.post('/mentors', adminOnly, createMentor);
router.get('/mentors/:id', adminOnly, validateMongoId('id'), handleValidationErrors, getMentorById);
router.put('/mentors/:id', adminOnly, validateMongoId('id'), handleValidationErrors, updateMentor);
router.delete('/mentors/:id', adminOnly, validateMongoId('id'), handleValidationErrors, deleteMentor);

// Mentor assignment routes (Superadmin only)
router.post('/assign-participants', superadminOnly, assignParticipantsToMentor);
router.post('/remove-participants', superadminOnly, removeParticipantsFromMentor);

// Routes with parameters (more specific first)
router.patch('/:id/status', adminOnly, validateMongoId('id'), handleValidationErrors, updateUserStatus);
router.patch('/:id/role', adminOnly, validateMongoId('id'), handleValidationErrors, updateUserRole);
router.patch('/:id/participant-type', adminOnly, validateMongoId('id'), handleValidationErrors, updateParticipantType);
router.get('/:id', adminOnly, validateMongoId('id'), handleValidationErrors, getUserById);
router.delete('/:id', adminOnly, validateMongoId('id'), handleValidationErrors, deleteUser);

export default router; 