import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  joinTeam,
  leaveTeam,
  removeMember,
  getMyTeam,
  getAvailableUsers,
  deleteTeam
} from '../controllers/teamController.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validateteam } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createTeamValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Team name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
];

const updateTeamValidation = [
  param('id').isMongoId().withMessage('Invalid team ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Team name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and underscores'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters')
];

const teamIdValidation = [
  param('id').isMongoId().withMessage('Invalid team ID')
];

const memberIdValidation = [
  param('id').isMongoId().withMessage('Invalid team ID'),
  param('memberId').isMongoId().withMessage('Invalid member ID')
];

// Routes

router.use(authenticateToken);
router.get('/', getAllTeams);
router.get('/my-team', getMyTeam);
router.get('/available-users', getAvailableUsers);
router.get('/:id', teamIdValidation, validateteam, getTeamById);
router.post('/', createTeamValidation, validateteam, createTeam);
router.put('/:id', updateTeamValidation, validateteam, updateTeam);
router.post('/:id/join', teamIdValidation, validateteam, joinTeam);
router.post('/:id/leave', teamIdValidation, validateteam, leaveTeam);
router.delete('/:id/members/:memberId', memberIdValidation, validateteam, removeMember);
router.delete('/:id', teamIdValidation, validateteam, deleteTeam);

export default router;