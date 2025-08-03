import mongoose from 'mongoose';
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
    const { 
      limit = 100, 
      role, 
      page = 1, 
      search, 
      sortBy = 'totalScore', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query filter
    const filter = { isActive: true };
    
    // Add role filter if specified
    if (role && ['participant', 'mentor', 'admin'].includes(role)) {
      filter.role = role;
    }

    // Add search filter if specified
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle mentors differently - they don't need scoring/ranking
    if (role === 'mentor') {
      const mentors = await User.find(filter)
        .select('name email collegeName role description skills')
        .limit(parseInt(limit))
        .lean();

      const mentorList = mentors.map(mentor => ({
        ...mentor,
        description: mentor.description || 'No description available',
        skills: mentor.skills || []
      }));

      console.log('Mentor data fetched:', JSON.stringify(mentorList, null, 2));

      return res.json({
        success: true,
        data: { 
          leaderboard: mentorList,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalUsers: mentorList.length,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }

    // For participants and others, calculate scores and rankings
    const users = await User.find(filter)
      .select('name email collegeName role')
      .lean();

    // Calculate real-time scores for each user
    const Submission = mongoose.model('Submission');
    const Attendance = mongoose.model('Attendance');

    const leaderboardWithScores = await Promise.all(
      users.map(async (user) => {
        // Calculate task submission points
        const submissions = await Submission.find({ userId: user._id }).lean();
        const taskPoints = submissions.reduce((total, submission) => {
          return total + (submission.score || 0);
        }, 0);

        // Calculate attendance points (10 points per day present)
        const presentDays = await Attendance.countDocuments({ 
          userId: user._id, 
          status: 'present' 
        });
        const attendancePoints = presentDays * 10;

        // Total score = task points + attendance points
        const totalScore = taskPoints + attendancePoints;

        return {
          ...user,
          totalScore,
          taskPoints,
          attendancePoints,
          presentDays
        };
      })
    );

    // Sort by specified field and order
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    let sortedLeaderboard = leaderboardWithScores.sort((a, b) => {
      if (sortBy === 'totalScore') {
        return sortOrder === 'asc' ? a.totalScore - b.totalScore : b.totalScore - a.totalScore;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === 'email') {
        return sortOrder === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
      }
      return 0;
    });

    // Calculate pagination
    const totalUsers = sortedLeaderboard.length;
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * parseInt(limit);
    
    // Apply pagination
    const paginatedLeaderboard = sortedLeaderboard.slice(skip, skip + parseInt(limit));

    // Add rank to each user (based on overall position, not just current page)
    const leaderboardWithRank = paginatedLeaderboard.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));

    res.json({
      success: true,
      data: { 
        leaderboard: leaderboardWithRank,
        pagination: {
          currentPage,
          totalPages,
          totalUsers,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      }
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

// Create mentor profile (Admin only)
export const createMentor = async (req, res) => {
  try {
    const { name, email, mobile, collegeName, password, description, skills } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new mentor
    const mentor = new User({
      name,
      email,
      mobile,
      collegeName,
      password,
      role: 'mentor',
      description: description || '',
      skills: skills || []
    });

    await mentor.save();

    // Remove password from response
    const mentorResponse = mentor.toObject();
    delete mentorResponse.password;

    console.log('Mentor created:', JSON.stringify(mentorResponse, null, 2));

    res.status(201).json({
      success: true,
      message: 'Mentor created successfully',
      data: { mentor: mentorResponse }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create mentor',
      error: error.message
    });
  }
};

// Get all mentors
export const getAllMentors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build query filter
    const filter = { role: 'mentor', isActive: true };

    // Add search filter if specified
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get mentors
    const mentors = await User.find(filter)
      .select('name email mobile collegeName description skills assignedParticipants createdAt')
      .populate('assignedParticipants', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    console.log('All mentors fetched:', JSON.stringify(mentors, null, 2));

    res.json({
      success: true,
      data: {
        mentors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalMentors: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors',
      error: error.message
    });
  }
};

// Get mentor by ID
export const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;

    const mentor = await User.findOne({ _id: id, role: 'mentor' })
      .select('-password')
      .populate('assignedParticipants', 'name email mobile collegeName totalScore')
      .lean();

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    console.log('Mentor by ID fetched:', JSON.stringify(mentor, null, 2));

    res.json({
      success: true,
      data: { mentor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor',
      error: error.message
    });
  }
};

// Update mentor profile
export const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, collegeName, description, skills } = req.body;

    // Check if mentor exists
    const existingMentor = await User.findOne({ _id: id, role: 'mentor' });
    if (!existingMentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingMentor.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    // Update mentor
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (collegeName) updateData.collegeName = collegeName;
    if (description !== undefined) updateData.description = description;
    if (skills !== undefined) updateData.skills = skills;

    const mentor = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean();

    console.log('Mentor updated:', JSON.stringify(mentor, null, 2));

    res.json({
      success: true,
      message: 'Mentor updated successfully',
      data: { mentor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update mentor',
      error: error.message
    });
  }
};

// Delete mentor (soft delete)
export const deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if mentor exists
    const mentor = await User.findOne({ _id: id, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Remove mentor from all assigned participants
    await User.updateMany(
      { assignedMentor: id },
      { $unset: { assignedMentor: 1 } }
    );

    // Soft delete mentor
    await User.findByIdAndUpdate(id, { isActive: false });

    console.log('Mentor deleted (soft delete):', { id, name: mentor.name });

    res.json({
      success: true,
      message: 'Mentor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete mentor',
      error: error.message
    });
  }
};

// Get participant's assigned mentor details (Participant only)
export const getMyMentor = async (req, res) => {
  try {
    const participantId = req.user._id;

    const participant = await User.findById(participantId)
      .populate('assignedMentor', 'name email mobile profilePicture registrationDate description skills')
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