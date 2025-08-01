import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user stats
    const totalSubmissions = await Submission.countDocuments({ userId: id });
    const gradedSubmissions = await Submission.countDocuments({ 
      userId: id, 
      status: 'graded' 
    });
    
    const attendanceStats = await Attendance.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const attendanceBreakdown = attendanceStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, { present: 0, absent: 0, late: 0 });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalSubmissions,
          gradedSubmissions,
          attendance: attendanceBreakdown
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Update user status (Admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['participant', 'mentor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be participant or mentor'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting the current admin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by setting isActive to false instead of hard delete
    // This preserves data integrity for submissions and attendance
    await User.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Get dashboard stats (Admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // Total users by role
    const userStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Total submissions
    const totalSubmissions = await Submission.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'submitted' });

    // Attendance today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });

    const userBreakdown = userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, { participant: 0, mentor: 0, superadmin: 0 });

    res.json({
      success: true,
      data: {
        users: {
          total: userBreakdown.participant + userBreakdown.mentor + userBreakdown.superadmin,
          participants: userBreakdown.participant,
          mentors: userBreakdown.mentor,
          superadmins: userBreakdown.superadmin,
          recentRegistrations
        },
        submissions: {
          total: totalSubmissions,
          pending: pendingSubmissions,
          graded: totalSubmissions - pendingSubmissions
        },
        attendance: {
          today: todayAttendance
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await User.find({ 
      role: 'participant',
      isActive: true 
    })
      .select('name email totalScore')
      .sort({ totalScore: -1 })
      .limit(parseInt(limit));

    // Add rank to each user
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    res.json({
      success: true,
      data: { leaderboard: leaderboardWithRank }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

// Assign participants to mentor (Superadmin only)
export const assignParticipantsToMentor = async (req, res) => {
  try {
    const { mentorId, participantIds } = req.body;

    // Validate mentor exists and has mentor role
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid mentor ID or user is not a mentor'
      });
    }

    // Validate all participants exist and have participant role
    const participants = await User.find({
      _id: { $in: participantIds },
      role: 'participant'
    });

    if (participants.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participant IDs are invalid'
      });
    }

    // Update mentor's assigned participants
    await User.findByIdAndUpdate(mentorId, {
      $addToSet: { assignedParticipants: { $each: participantIds } }
    });

    // Update participants' assigned mentor
    await User.updateMany(
      { _id: { $in: participantIds } },
      { assignedMentor: mentorId }
    );

    res.json({
      success: true,
      message: 'Participants assigned to mentor successfully',
      data: {
        mentor: mentor.name,
        assignedCount: participantIds.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign participants to mentor',
      error: error.message
    });
  }
};

// Remove participants from mentor (Superadmin only)
export const removeParticipantsFromMentor = async (req, res) => {
  try {
    const { mentorId, participantIds } = req.body;

    // Update mentor's assigned participants
    await User.findByIdAndUpdate(mentorId, {
      $pull: { assignedParticipants: { $in: participantIds } }
    });

    // Remove assigned mentor from participants
    await User.updateMany(
      { _id: { $in: participantIds } },
      { $unset: { assignedMentor: 1 } }
    );

    res.json({
      success: true,
      message: 'Participants removed from mentor successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove participants from mentor',
      error: error.message
    });
  }
};

// Get mentor's assigned participants (Mentor only)
export const getMentorParticipants = async (req, res) => {
  try {
    const mentorId = req.user._id;

    const mentor = await User.findById(mentorId)
      .populate('assignedParticipants', 'name email totalScore isActive registrationDate')
      .select('name assignedParticipants');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    res.json({
      success: true,
      data: {
        mentor: mentor.name,
        participants: mentor.assignedParticipants
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor participants',
      error: error.message
    });
  }
};

// Get all mentors with their assigned participants (Superadmin only)
export const getAllMentorsWithParticipants = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor', isActive: true })
      .populate('assignedParticipants', 'name email totalScore isActive')
      .select('name email assignedParticipants registrationDate');

    res.json({
      success: true,
      data: { mentors }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors',
      error: error.message
    });
  }
};

// Get participant's assigned mentor details (Participant only)
export const getMyMentor = async (req, res) => {
  try {
    const participantId = req.user._id;

    const participant = await User.findById(participantId)
      .populate('assignedMentor', 'name email mobile profilePicture registrationDate')
      .select('assignedMentor');

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    if (!participant.assignedMentor) {
      return res.json({
        success: true,
        data: {
          mentor: null,
          message: 'No mentor assigned yet'
        }
      });
    }

    res.json({
      success: true,
      data: {
        mentor: participant.assignedMentor
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned mentor',
      error: error.message
    });
  }
}; 