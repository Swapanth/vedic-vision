import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  registerAdmin
} from '../controllers/authController.js';
import { authenticateToken, superadminOnly } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/register-admin', authenticateToken, superadminOnly, registerAdmin);

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

export default router; 