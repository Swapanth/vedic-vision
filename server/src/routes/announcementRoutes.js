import express from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  toggleAnnouncementStatus,
  deleteAnnouncement,
  getUnreadCount,
  markAsRead,
  getReadStatistics
} from '../controllers/announcementController.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';
import { uploadAnnouncement, handleUploadError } from '../middleware/upload.js';
import {
  validateAnnouncement,
  validateMongoId,
  validatePagination,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Specific routes first
router.get('/active', getActiveAnnouncements);
router.get('/unread-count', getUnreadCount);
router.get('/', validatePagination, handleValidationErrors, getAllAnnouncements);
router.post('/', adminOnly, uploadAnnouncement, handleUploadError, validateAnnouncement, handleValidationErrors, createAnnouncement);

// Routes with parameters (more specific first)
router.get('/:id/read-stats', adminOnly, validateMongoId('id'), handleValidationErrors, getReadStatistics);
router.post('/:id/mark-read', validateMongoId('id'), handleValidationErrors, markAsRead);
router.patch('/:id/toggle-status', adminOnly, validateMongoId('id'), handleValidationErrors, toggleAnnouncementStatus);
router.get('/:id', validateMongoId('id'), handleValidationErrors, getAnnouncementById);
router.put('/:id', adminOnly, uploadAnnouncement, handleUploadError, validateMongoId('id'), handleValidationErrors, updateAnnouncement);
router.delete('/:id', adminOnly, validateMongoId('id'), handleValidationErrors, deleteAnnouncement);

export default router; 