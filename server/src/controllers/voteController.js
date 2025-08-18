import Vote from '../models/Vote.js';
import Team from '../models/Team.js';
import User from '../models/User.js';

// Submit a vote for a team
export const submitVote = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is part of a team (required to vote)
    const userTeam = await Team.findOne({ 'members.user': userId });
    if (!userTeam) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a team to vote for other teams'
      });
    }

    // Check if user is voting for their own team
    if (userTeam._id.toString() === teamId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote for your own team'
      });
    }

    // Check if user has already voted for this team
    const existingVote = await Vote.findOne({ voter: userId, team: teamId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted for this team'
      });
    }

    // Create new vote
    const vote = new Vote({
      voter: userId,
      team: teamId,
      rating,
      comment: comment || ''
    });

    await vote.save();

    // Populate voter details
    await vote.populate('voter', 'name email');

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      data: { vote }
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    if (
      error.name === 'ValidationError' ||
      (typeof error.message === 'string' && (
        error.message.includes('You cannot vote for your own team') ||
        error.message.includes('Team not found') ||
        error.message.includes('invalid team members')
      ))
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit vote',
      error: error.message
    });
  }
};

// Get all teams with their ratings
export const getAllTeamsWithRatings = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user._id;
    
    // Check if user is part of a team (required to access voting)
    const userTeam = await Team.findOne({ 'members.user': userId });
    if (!userTeam) {
      return res.status(400).json({
        success: false,
        message: 'You must be part of a team to access voting'
      });
    }
    
    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get all teams
    const teams = await Team.find(searchQuery)
      .populate('leader', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    // Get ratings for each team
    const teamsWithRatings = await Promise.all(
      teams.map(async (team) => {
        const ratingData = await Vote.getAverageRating(team._id);
        return {
          ...team.toObject(),
          rating: ratingData.averageRating,
          totalVotes: ratingData.totalVotes
        };
      })
    );

    res.json({
      success: true,
      data: { teams: teamsWithRatings }
    });
  } catch (error) {
    console.error('Error getting teams with ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teams with ratings',
      error: error.message
    });
  }
};

// Get votes for a specific team
export const getTeamVotes = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get votes for the team
    const votes = await Vote.getTeamVotes(teamId);
    const ratingData = await Vote.getAverageRating(teamId);

    res.json({
      success: true,
      data: {
        team: {
          _id: team._id,
          name: team.name,
          description: team.description,
          leader: team.leader,
          members: team.members
        },
        votes,
        rating: ratingData.averageRating,
        totalVotes: ratingData.totalVotes
      }
    });
  } catch (error) {
    console.error('Error getting team votes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team votes',
      error: error.message
    });
  }
};

// Check if user has voted for a specific team
export const checkUserVote = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    const vote = await Vote.hasUserVoted(userId, teamId);

    res.json({
      success: true,
      data: { hasVoted: !!vote, vote: vote || null }
    });
  } catch (error) {
    console.error('Error checking user vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user vote',
      error: error.message
    });
  }
};

// Get user's voting history
export const getUserVotingHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const votes = await Vote.find({ voter: userId })
      .populate('team', 'name description leader')
      .populate('team.leader', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { votes }
    });
  } catch (error) {
    console.error('Error getting user voting history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get voting history',
      error: error.message
    });
  }
};

// Update user's vote for a team
export const updateVote = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find existing vote
    const vote = await Vote.findOne({ voter: userId, team: teamId });
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    // Update vote
    vote.rating = rating;
    vote.comment = comment || '';
    await vote.save();

    // Populate voter details
    await vote.populate('voter', 'name email');

    res.json({
      success: true,
      message: 'Vote updated successfully',
      data: { vote }
    });
  } catch (error) {
    console.error('Error updating vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vote',
      error: error.message
    });
  }
};

// Delete user's vote for a team
export const deleteVote = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    const vote = await Vote.findOneAndDelete({ voter: userId, team: teamId });
    
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      });
    }

    res.json({
      success: true,
      message: 'Vote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vote',
      error: error.message
    });
  }
};

// Admin: Get all votes organized by team
export const getAllVotesByTeam = async (req, res) => {
  try {
    // Get all teams with their votes
    const teamsWithVotes = await Team.aggregate([
      {
        $lookup: {
          from: 'votes',
          localField: '_id',
          foreignField: 'team',
          as: 'votes'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'leader',
          foreignField: '_id',
          as: 'leaderInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members.user',
          foreignField: '_id',
          as: 'memberInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'votes.voter',
          foreignField: '_id',
          as: 'voterInfo'
        }
      },
      {
        $addFields: {
          // Calculate average rating
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$votes' }, 0] },
              then: { $avg: '$votes.rating' },
              else: 0
            }
          },
          totalVotes: { $size: '$votes' },
          // Map voter info to votes
          votesWithVoters: {
            $map: {
              input: '$votes',
              as: 'vote',
              in: {
                _id: '$$vote._id',
                rating: '$$vote.rating',
                comment: '$$vote.comment',
                createdAt: '$$vote.createdAt',
                voter: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$voterInfo',
                        cond: { $eq: ['$$this._id', '$$vote.voter'] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          teamNumber: 1,
          description: 1,
          leader: { $arrayElemAt: ['$leaderInfo', 0] },
          members: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                role: '$$member.role',
                joinedAt: '$$member.joinedAt',
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$memberInfo',
                        cond: { $eq: ['$$this._id', '$$member.user'] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          },
          votes: '$votesWithVoters',
          averageRating: { $round: ['$averageRating', 1] },
          totalVotes: 1,
          createdAt: 1
        }
      },
      {
        $sort: { totalVotes: -1, averageRating: -1 }
      }
    ]);

    // Get overall voting statistics
    const totalVotesCount = await Vote.countDocuments();
    const totalTeamsCount = await Team.countDocuments();
    const teamsWithVotesCount = teamsWithVotes.filter(team => team.totalVotes > 0).length;

    res.json({
      success: true,
      data: {
        teams: teamsWithVotes,
        statistics: {
          totalVotes: totalVotesCount,
          totalTeams: totalTeamsCount,
          teamsWithVotes: teamsWithVotesCount,
          teamsWithoutVotes: totalTeamsCount - teamsWithVotesCount
        }
      }
    });
  } catch (error) {
    console.error('Error getting all votes by team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get votes by team',
      error: error.message
    });
  }
};