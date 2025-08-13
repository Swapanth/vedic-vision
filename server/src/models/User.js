import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['participant', 'mentor', 'admin', 'superadmin'],
    default: 'participant'
  },
  participantType: {
    type: String,
    enum: ['bootcamp', 'hackathon'],
    default: 'bootcamp',
    required: function() {
      return this.role === 'participant';
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  // Mentor-Participant relationship
  assignedMentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    default: '',
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update total score (only for bootcamp participants)
userSchema.methods.updateTotalScore = async function() {
  // Only calculate scores for bootcamp participants
  if (this.role !== 'participant' || this.participantType !== 'bootcamp') {
    this.totalScore = 0;
    await this.save();
    return;
  }

  const Submission = mongoose.model('Submission');
  const Attendance = mongoose.model('Attendance');
  
  // Calculate task submission points
  const submissions = await Submission.find({ userId: this._id });
  const taskPoints = submissions.reduce((total, submission) => {
    return total + (submission.score || 0);
  }, 0);
  
  // Calculate attendance points (10 points per day present)
  const presentDays = await Attendance.countDocuments({ 
    userId: this._id, 
    status: 'present' 
  });
  const attendancePoints = presentDays * 10;
  
  // Total score = task points + attendance points
  this.totalScore = taskPoints + attendancePoints;
  await this.save();
};

export default mongoose.model('User', userSchema); 