import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      enum: [
        "day1",
        "day2",
        "day3",
        "day4",
        "day5",
        "day6",
        "day7",
        "day8",
        "day9",
        "day10",
        "day11",
        "day12",
      ],
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
        instructions: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get active tasks sorted by day
taskSchema.statics.getActiveTasks = function () {
  return this.find({ isActive: true }).sort({ day: 1 });
};

export default mongoose.model("Task", taskSchema);
