import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import exportRoutes from './exportRoutes.js';
import teamRoutes from './teamRoutes.js';
import voteRoutes from './voteRoutes.js';
import configRoutes from './configRoutes.js';

const router = express.Router();

// API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Vedic Vision API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/submissions', submissionRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/announcements', announcementRoutes);
router.use('/export', exportRoutes);
router.use('/teams', teamRoutes);

router.use('/votes', voteRoutes);
router.use('/config', configRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/leaderboard',
      'GET /api/tasks/active',
      'GET /api/announcements/active',
      'POST /api/attendance',
      'POST /api/submissions'
    ]
  });
});

export default router; 