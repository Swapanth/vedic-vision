import Task from '../models/Task.js';
import Submission from '../models/Submission.js';

// Create new task (Admin only)
export const createTask = async (req, res) => {
  try {
    const { title, description, day, maxScore, instructions } = req.body;

    const task = new Task({
      title,
      description,
      day,
      maxScore,
      instructions,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      day,
      isActive,
      sortBy = 'day',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    if (day) query.day = day;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get tasks
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // For participants, also get their submission status for each task
    let tasksWithSubmissionStatus = tasks;
    if (req.user.role === 'participant') {
      const taskIds = tasks.map(task => task._id);
      const userSubmissions = await Submission.find({
        userId: req.user._id,
        taskId: { $in: taskIds }
      }).select('taskId status score');

      const submissionMap = userSubmissions.reduce((acc, submission) => {
        acc[submission.taskId.toString()] = {
          status: submission.status,
          score: submission.score,
          hasSubmitted: true
        };
        return acc;
      }, {});

      tasksWithSubmissionStatus = tasks.map(task => ({
        ...task.toObject(),
        userSubmission: submissionMap[task._id.toString()] || { hasSubmitted: false },
        isOverdue: task.isOverdue
      }));
    }

    res.json({
      success: true,
      data: {
        tasks: tasksWithSubmissionStatus,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTasks: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

// Get active tasks
export const getActiveTasks = async (req, res) => {
  try {
    const tasks = await Task.getActiveTasks()
      .populate('createdBy', 'name email');

    // For participants, include submission status
    let tasksWithSubmissionStatus = tasks;
    if (req.user.role === 'participant') {
      const taskIds = tasks.map(task => task._id);
      const userSubmissions = await Submission.find({
        userId: req.user._id,
        taskId: { $in: taskIds }
      }).select('taskId status score submittedAt');

      const submissionMap = userSubmissions.reduce((acc, submission) => {
        acc[submission.taskId.toString()] = {
          status: submission.status,
          score: submission.score,
          submittedAt: submission.submittedAt,
          hasSubmitted: true
        };
        return acc;
      }, {});

      tasksWithSubmissionStatus = tasks.map(task => ({
        ...task.toObject(),
        userSubmission: submissionMap[task._id.toString()] || { hasSubmitted: false },
        isOverdue: task.isOverdue
      }));
    }

    res.json({
      success: true,
      data: { tasks: tasksWithSubmissionStatus }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active tasks',
      error: error.message
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get submission statistics
    const submissionStats = await Submission.aggregate([
      { $match: { taskId: task._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    const stats = submissionStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        avgScore: stat.avgScore || 0
      };
      return acc;
    }, {});

    // For participants, get their submission
    let userSubmission = null;
    if (req.user.role === 'participant') {
      userSubmission = await Submission.findOne({
        userId: req.user._id,
        taskId: id
      });
    }

    res.json({
      success: true,
      data: {
        task: {
          ...task.toObject(),
          isOverdue: task.isOverdue
        },
        stats,
        userSubmission
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

// Update task (Admin only)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating createdBy
    delete updates.createdBy;

    const task = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

// Toggle task status (Admin only)
export const toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.isActive = !task.isActive;
    await task.save();
    await task.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: `Task ${task.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { task }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle task status',
      error: error.message
    });
  }
};

// Delete task (Admin only)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if there are submissions for this task
    const submissionCount = await Submission.countDocuments({ taskId: id });
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete task with existing submissions. Deactivate instead.'
      });
    }

    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

// Get task submissions (Admin only)
export const getTaskSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Verify task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Build query
    const query = { taskId: id };
    if (status) query.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get submissions
    const submissions = await Submission.find(query)
      .populate('userId', 'name email')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        task: {
          _id: task._id,
          title: task.title,
          maxScore: task.maxScore
        },
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
      message: 'Failed to fetch task submissions',
      error: error.message
    });
  }
}; 