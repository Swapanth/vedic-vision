import express from 'express';
import { authenticateToken, adminOnly } from '../middleware/auth.js';
import {
  submitVote,
  getAllTeamsWithRatings,
  getTeamVotes,
  checkUserVote,
  getUserVotingHistory,
  updateVote,
  deleteVote,
  getAllVotesByTeam
} from '../controllers/voteController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Submit a vote for a team
router.post('/teams/:teamId/vote', submitVote);

// Get all teams with their ratings (for voting interface)
router.get('/teams-with-ratings', getAllTeamsWithRatings);

// Get votes for a specific team
router.get('/teams/:teamId/votes', getTeamVotes);

// Check if user has voted for a specific team
router.get('/teams/:teamId/check-vote', checkUserVote);

// Get user's voting history
router.get('/my-votes', getUserVotingHistory);

// Update user's vote for a team
router.put('/teams/:teamId/vote', updateVote);

// Delete user's vote for a team
router.delete('/teams/:teamId/vote', deleteVote);

// Admin: Get all votes organized by team
router.get('/admin/all-votes-by-team', adminOnly, getAllVotesByTeam);

export default router; 