import express from 'express';
import {
  createTask,
  getAllTasks,
  getActiveTasks,
  getTaskById,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getTaskSubmissions
} from '../controllers/taskController.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';
import {
  validateCreateTask,
  validateMongoId,
  validatePagination,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Routes accessible by all authenticated users (specific routes first)
router.get('/active', getActiveTasks);
router.get('/', validatePagination, handleValidationErrors, getAllTasks);

// Admin only routes (specific routes first)
router.post('/', adminOnly, validateCreateTask, handleValidationErrors, createTask);

// Routes with parameters (more specific first)
router.get('/:id/submissions', adminOnly, validateMongoId('id'), handleValidationErrors, getTaskSubmissions);
router.patch('/:id/toggle-status', adminOnly, validateMongoId('id'), handleValidationErrors, toggleTaskStatus);
router.get('/:id', validateMongoId('id'), handleValidationErrors, getTaskById);
router.put('/:id', adminOnly, validateMongoId('id'), handleValidationErrors, updateTask);
router.delete('/:id', adminOnly, validateMongoId('id'), handleValidationErrors, deleteTask);

export default router; 