import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  round: {
    type: Number,
    enum: [1, 2, 3],
    required: true,
    index: true
  },
  score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

evaluationSchema.index({ judgeId: 1, teamId: 1, round: 1 }, { unique: true });

export default mongoose.model('Evaluation', evaluationSchema);


