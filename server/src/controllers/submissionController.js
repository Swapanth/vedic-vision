import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import path from 'path';

// Submit task (Participants only)
export const submitTask = async (req, res) => {
  try {
    const { taskId, submissionType, content } = req.body;
    
    // Parse content if it's a JSON string
    let parsedContent = content;
    if (typeof content === 'string') {
      try {
        parsedContent = JSON.parse(content);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content format'
        });
      }
    }

    // Verify task exists and is active
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!task.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Task is not active'
      });
    }

    // Check if user already submitted
    const existingSubmission = await Submission.findOne({
      userId: req.user._id,
      taskId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted for this task'
      });
    }

    // Prepare submission data
    const submissionData = {
      userId: req.user._id,
      taskId,
      submissionType,
      content: {}
    };

    // Handle different submission types
    if (submissionType === 'file' && req.file) {
      submissionData.content = {
        fileUrl: `/uploads/submissions/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size
      };
    } else if (submissionType === 'link') {
      submissionData.content = {
        link: parsedContent.link,
        linkTitle: parsedContent.linkTitle || ''
      };
    } else if (submissionType === 'text') {
      submissionData.content = {
        text: parsedContent.text
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission type or missing file'
      });
    }

    const submission = new Submission(submissionData);
    await submission.save();

    await submission.populate([
      { path: 'userId', select: 'name email' },
      { path: 'taskId', select: 'title day maxScore' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Task submitted successfully',
      data: { submission }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit task',
      error: error.message
    });
  }
};

// Get user's submissions (Participants)
export const getUserSubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (status) query.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get submissions
    const submissions = await Submission.find(query)
      .populate('taskId', 'title day maxScore')
      .populate('gradedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSubmissions: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Get all submissions (Admin only)
export const getAllSubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      taskId,
      userId,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (taskId) query.taskId = taskId;
    if (userId) query.userId = userId;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get submissions
    const submissions = await Submission.find(query)
      .populate('userId', 'name email')
      .populate('taskId', 'title day maxScore')
      .populate('gradedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSubmissions: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Get submission by ID
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('userId', 'name email')
      .populate('taskId', 'title day maxScore instructions')
      .populate('gradedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check access rights
    if (req.user.role === 'participant' && 
        submission.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message
    });
  }
};

// Grade submission (Admin only)
export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findById(id)
      .populate('taskId', 'maxScore')
      .populate('userId', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Validate score
    if (score > submission.taskId.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score cannot exceed maximum score of ${submission.taskId.maxScore}`
      });
    }

    // Update submission
    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();

    // Update user's total score
    const user = await User.findById(submission.userId._id);
    await user.updateTotalScore();

    await submission.populate('gradedBy', 'name email');

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: { submission }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message
    });
  }
};

// Update submission grade (Admin only)
export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findById(id)
      .populate('taskId', 'maxScore')
      .populate('userId', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Validate score
    if (score > submission.taskId.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score cannot exceed maximum score of ${submission.taskId.maxScore}`
      });
    }

    // Store old score for total score calculation
    const oldScore = submission.score || 0;

    // Update submission
    submission.score = score;
    submission.feedback = feedback;
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();

    // Update user's total score
    const user = await User.findById(submission.userId._id);
    await user.updateTotalScore();

    await submission.populate('gradedBy', 'name email');

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: { submission }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update grade',
      error: error.message
    });
  }
};

// Delete submission (Admin only or own submission if not graded)
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check permissions
    const isOwner = submission.userId.toString() === req.user._id.toString();
    const isSuperadmin = req.user.role === 'superadmin';

    if (!isSuperadmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Participants can only delete ungraded submissions
    if (isOwner && !isSuperadmin && submission.status === 'graded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete graded submission'
      });
    }

    await Submission.findByIdAndDelete(id);

    // Update user's total score if submission was graded
    if (submission.score && submission.score > 0) {
      const user = await User.findById(submission.userId);
      await user.updateTotalScore();
    }

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

// Get pending submissions (Admin only)
export const getPendingSubmissions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const pendingSubmissions = await Submission.find({ status: 'submitted' })
      .populate('userId', 'name email')
      .populate('taskId', 'title day maxScore')
      .sort({ submittedAt: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { submissions: pendingSubmissions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending submissions',
      error: error.message
    });
  }
}; 