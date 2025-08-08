import express from 'express';
import {
  submitTask,
  getUserSubmissions,
  getAllSubmissions,
  getSubmissionById,
  gradeSubmission,
  updateGrade,
  deleteSubmission,
  getPendingSubmissions
} from '../controllers/submissionController.js';
import { authenticateToken, adminOnly, participantOnly, mentorOrAdmin } from '../middleware/auth.js';
import { uploadSubmission, handleUploadError } from '../middleware/upload.js';
import {
  validateSubmission,
  validateGrading,
  validateMongoId,
  validatePagination,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Specific routes first
router.get('/my-submissions', participantOnly, validatePagination, handleValidationErrors, getUserSubmissions);
router.get('/pending', mentorOrAdmin, getPendingSubmissions);
router.get('/', mentorOrAdmin, validatePagination, handleValidationErrors, getAllSubmissions);
router.post('/', participantOnly, uploadSubmission, handleUploadError, validateSubmission, handleValidationErrors, submitTask);

// Routes with parameters (more specific first)
router.post('/:id/grade', mentorOrAdmin, validateMongoId('id'), validateGrading, handleValidationErrors, gradeSubmission);
router.put('/:id/grade', mentorOrAdmin, validateMongoId('id'), validateGrading, handleValidationErrors, updateGrade);
router.get('/:id', validateMongoId('id'), handleValidationErrors, getSubmissionById);
router.delete('/:id', validateMongoId('id'), handleValidationErrors, deleteSubmission);

export default router; 