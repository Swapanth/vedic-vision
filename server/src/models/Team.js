import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    }
  }],
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 6,
    min: 4,
    max: 6
  }
}, {
  timestamps: true
});

// Virtual for current member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual to check if team is full
teamSchema.virtual('isFull').get(function() {
  return this.members.length >= this.maxMembers;
});

// Method to check if user is a member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is the leader
teamSchema.methods.isLeader = function(userId) {
  return this.leader.toString() === userId.toString();
};

// Method to add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  if (this.isFull) {
    throw new Error('Team is already full');
  }
  
  if (this.isMember(userId)) {
    throw new Error('User is already a member of this team');
  }

  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
  
  return this.save();
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  if (this.isLeader(userId)) {
    throw new Error('Cannot remove team leader');
  }
  
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Pre-save middleware to ensure leader is in members array
teamSchema.pre('save', function(next) {
  // Ensure leader is in members array with leader role
  const leaderInMembers = this.members.find(member => 
    member.user.toString() === this.leader.toString()
  );
  
  if (!leaderInMembers) {
    this.members.unshift({
      user: this.leader,
      role: 'leader',
      joinedAt: new Date()
    });
  } else {
    // Update leader role if exists
    leaderInMembers.role = 'leader';
  }
  
  next();
});

// Index for better performance
teamSchema.index({ name: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ isActive: 1 });

export default mongoose.model('Team', teamSchema);