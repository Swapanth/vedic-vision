import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  session: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'evening', 'full-day']
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for self-marked attendance
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ userId: 1, date: 1, session: 1 }, { unique: true });

// Static method to get attendance stats
attendanceSchema.statics.getAttendanceStats = async function(userId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, { present: 0, absent: 0, late: 0 });
};

export default mongoose.model('Attendance', attendanceSchema); 