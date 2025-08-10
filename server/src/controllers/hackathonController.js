import User from '../models/User.js';
import Team from '../models/Team.js';
import ProblemStatement from '../models/ProblemStatement.js';

// Get hackathon dashboard data
export const getHackathonDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Verify user is a hackathon participant
    const user = await User.findById(userId).select('-password');
    if (!user || user.role !== 'participant' || user.participantType !== 'hackathon') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only hackathon participants can access this dashboard.'
      });
    }

    // Get user's team information
    const userTeam = await Team.findOne({ 
      'members.user': userId,
      isActive: true 
    })
    .populate('leader', 'name email profilePicture')
    .populate('members.user', 'name email profilePicture participantType')
    .populate('problemStatement', 'title description category difficulty')
    .lean();

    // Get assigned mentor
    const userWithMentor = await User.findById(userId)
      .populate('assignedMentor', 'name email mobile description skills profilePicture')
      .select('assignedMentor')
      .lean();

    // Get all problem statements for team formation
    const problemStatements = await ProblemStatement.find({ isActive: true })
      .select('title description category difficulty')
      .sort({ createdAt: -1 })
      .lean();

    // Get available teams (not full) for joining
    const availableTeams = await Team.find({
      isActive: true,
      $expr: { $lt: [{ $size: '$members' }, '$maxMembers'] }
    })
    .populate('leader', 'name email profilePicture')
    .populate('members.user', 'name email profilePicture participantType')
    .populate('problemStatement', 'title description category')
    .limit(10)
    .lean();

    // Filter teams to only show those with hackathon participants or mixed teams
    const hackathonFriendlyTeams = availableTeams.filter(team => {
      const hasHackathonParticipants = team.members.some(member => 
        member.user.participantType === 'hackathon'
      );
      return hasHackathonParticipants || team.members.length < 3; // Allow joining smaller teams
    });

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          participantType: user.participantType
        },
        team: userTeam,
        mentor: userWithMentor.assignedMentor,
        problemStatements,
        availableTeams: hackathonFriendlyTeams,
        stats: {
          totalProblemStatements: problemStatements.length,
          availableTeams: hackathonFriendlyTeams.length,
          hasTeam: !!userTeam,
          hasMentor: !!userWithMentor.assignedMentor
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hackathon dashboard',
      error: error.message
    });
  }
};

// Get all mentors for hackathon participants
export const getHackathonMentors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Verify user is a hackathon participant
    if (req.user.role !== 'participant' || req.user.participantType !== 'hackathon') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only hackathon participants can access this resource.'
      });
    }

    // Build query filter
    const filter = { role: 'mentor', isActive: true };

    // Add search filter if specified
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get mentors with their assigned participants count
    const mentors = await User.find(filter)
      .select('name email description skills profilePicture registrationDate')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get participant counts for each mentor
    const mentorsWithStats = await Promise.all(
      mentors.map(async (mentor) => {
        const assignedCount = await User.countDocuments({ 
          assignedMentor: mentor._id,
          isActive: true 
        });
        
        return {
          ...mentor,
          assignedParticipants: assignedCount,
          skills: mentor.skills || [],
          description: mentor.description || 'No description available'
        };
      })
    );

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        mentors: mentorsWithStats,
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

// Get hackathon teams with filtering
export const getHackathonTeams = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, problemStatementId } = req.query;

    // Verify user is a hackathon participant
    if (req.user.role !== 'participant' || req.user.participantType !== 'hackathon') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only hackathon participants can access this resource.'
      });
    }

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (problemStatementId) {
      query.problemStatement = problemStatementId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get teams
    const teams = await Team.find(query)
      .populate('leader', 'name email profilePicture participantType')
      .populate('members.user', 'name email profilePicture participantType')
      .populate('problemStatement', 'title description category difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add additional team stats
    const teamsWithStats = teams.map(team => ({
      ...team,
      memberCount: team.members.length,
      spotsAvailable: team.maxMembers - team.members.length,
      isFull: team.members.length >= team.maxMembers,
      hasHackathonParticipants: team.members.some(member => 
        member.user.participantType === 'hackathon'
      ),
      participantTypeBreakdown: {
        bootcamp: team.members.filter(member => member.user.participantType === 'bootcamp').length,
        hackathon: team.members.filter(member => member.user.participantType === 'hackathon').length
      }
    }));

    const total = await Team.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        teams: teamsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTeams: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
};

// Get problem statements for hackathon participants
export const getHackathonProblemStatements = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;

    // Verify user is a hackathon participant
    if (req.user.role !== 'participant' || req.user.participantType !== 'hackathon') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only hackathon participants can access this resource.'
      });
    }

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get problem statements
    const problemStatements = await ProblemStatement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get team counts for each problem statement
    const problemStatementsWithStats = await Promise.all(
      problemStatements.map(async (ps) => {
        const teamCount = await Team.countDocuments({ 
          problemStatement: ps._id,
          isActive: true 
        });
        
        return {
          ...ps,
          teamCount,
          availableForTeams: true
        };
      })
    );

    const total = await ProblemStatement.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get unique categories for filtering
    const categories = await ProblemStatement.distinct('category', { isActive: true });

    res.json({
      success: true,
      data: {
        problemStatements: problemStatementsWithStats,
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProblemStatements: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem statements',
      error: error.message
    });
  }
};