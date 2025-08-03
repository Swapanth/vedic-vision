import Team from '../models/Team.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isActive: true,
      ...(search && { name: { $regex: search, $options: 'i' } })
    };

    const teams = await Team.find(query)
      .populate('leader', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Team.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        teams,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
};

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid team ID'
      });
    }

    const team = await Team.findById(id)
      .populate('leader', 'name email collegeName profilePicture')
      .populate('members.user', 'name email collegeName profilePicture')
      .populate('invitations.user', 'name email collegeName')
      .populate('invitations.invitedBy', 'name email collegeName');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { team }
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team',
      error: error.message
    });
  }
};

// Create new team
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    // Check if user is already in a team
    const user = await User.findById(userId);
    if (user.team) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of a team. Leave your current team first.'
      });
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists. Please choose a different name.'
      });
    }

    // Create new team
    const team = new Team({
      name,
      description,
      leader: userId
    });

    await team.save();

    // Update user's team reference
    user.team = team._id;
    await user.save();

    // Populate team data for response
    await team.populate('leader', 'name email collegeName profilePicture');
    await team.populate('members.user', 'name email collegeName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team }
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is the team leader
    if (!team.isLeader(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can update team details'
      });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team name already exists. Please choose a different name.'
        });
      }
    }

    // Update team
    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    await team.save();
    await team.populate('leader', 'name email collegeName profilePicture');
    await team.populate('members.user', 'name email collegeName profilePicture');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: { team }
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team',
      error: error.message
    });
  }
};

// Join team (for open teams or accepting invitation)
export const joinTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is already in a team
    const user = await User.findById(userId);
    if (user.team) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of a team. Leave your current team first.'
      });
    }

    // Check if team is full
    if (team.isFull) {
      return res.status(400).json({
        success: false,
        message: 'Team is already full'
      });
    }

    // Check if user is already a member
    if (team.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Add user to team
    await team.addMember(userId);
    
    // Update user's team reference
    user.team = team._id;
    await user.save();

    await team.populate('leader', 'name email profilePicture');
    await team.populate('members.user', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Successfully joined the team',
      data: { team }
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join team',
      error: error.message
    });
  }
};

// Leave team
export const leaveTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is a member
    if (!team.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // If user is the leader, check team size
    if (team.isLeader(userId)) {
      if (team.members.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Team leader cannot leave while there are other members. Transfer leadership or disband the team.'
        });
      } else {
        // If leader is the only member, delete the team
        await Team.findByIdAndDelete(id);
        
        // Update user's team reference
        const user = await User.findById(userId);
        user.team = null;
        await user.save();

        return res.status(200).json({
          success: true,
          message: 'Team disbanded successfully'
        });
      }
    }

    // Remove user from team
    await team.removeMember(userId);
    
    // Update user's team reference
    const user = await User.findById(userId);
    user.team = null;
    await user.save();

    await team.populate('leader', 'name email profilePicture');
    await team.populate('members.user', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Successfully left the team',
      data: { team }
    });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to leave team',
      error: error.message
    });
  }
};

// Remove member from team (leader only)
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is the team leader
    if (!team.isLeader(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can remove members'
      });
    }

    // Check if member exists in team
    if (!team.isMember(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this team'
      });
    }

    // Cannot remove leader
    if (team.isLeader(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team leader'
      });
    }

    // Remove member
    await team.removeMember(memberId);
    
    // Update member's team reference
    const member = await User.findById(memberId);
    if (member) {
      member.team = null;
      await member.save();
    }

    await team.populate('leader', 'name email profilePicture');
    await team.populate('members.user', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: { team }
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove member',
      error: error.message
    });
  }
};

// Get user's current team
export const getMyTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'team',
      populate: [
        { path: 'leader', select: 'name email profilePicture' },
        { path: 'members.user', select: 'name email profilePicture' }
      ]
    });

    res.status(200).json({
      success: true,
      data: { team: user.team }
    });
  } catch (error) {
    console.error('Get my team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your team',
      error: error.message
    });
  }
};

// Get available users (not in any team)
export const getAvailableUsers = async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    const query = {
      role: 'participant',
      isActive: true,
      team: null,
      ...(search && { 
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const users = await User.find(query)
      .select('name email collegeName profilePicture registrationDate')
      .sort({ name: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available users',
      error: error.message
    });
  }
};

// Delete team (leader only)
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is the team leader
    if (!team.isLeader(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can delete the team'
      });
    }

    // Update all members' team reference to null
    const memberIds = team.members.map(member => member.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $unset: { team: 1 } }
    );

    // Delete the team
    await Team.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    });
  }
};