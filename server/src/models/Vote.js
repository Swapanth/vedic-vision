import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure one vote per user per team
voteSchema.index({ voter: 1, team: 1 }, { unique: true });

// Static method to get average rating for a team
voteSchema.statics.getAverageRating = async function(teamId) {
  const result = await this.aggregate([
    { $match: { team: new mongoose.Types.ObjectId(teamId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalVotes: { $sum: 1 }
      }
    }
  ]);

  if (result.length === 0) {
    return { averageRating: 0, totalVotes: 0 };
  }

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal place
    totalVotes: result[0].totalVotes
  };
};

// Static method to get all votes for a team with voter details
voteSchema.statics.getTeamVotes = async function(teamId) {
  return await this.find({ team: teamId })
    .populate('voter', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to check if user has voted for a team
voteSchema.statics.hasUserVoted = async function(userId, teamId) {
  return await this.findOne({ voter: userId, team: teamId });
};

// Pre-save middleware to validate that user is not voting for their own team
voteSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Team = mongoose.model('Team');
    const team = await Team.findById(this.team);
    if (!team || !Array.isArray(team.members)) {
      return next(new Error('Team not found or invalid team members'));
    }
    if (team.members.some(member => member.user.toString() === this.voter.toString())) {
      return next(new Error('You cannot vote for your own team'));
    }
  }
  next();
});

export default mongoose.model('Vote', voteSchema); 