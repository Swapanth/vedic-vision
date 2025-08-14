import Team from '../models/Team.js';
import User from '../models/User.js';
import ProblemStatement from '../models/ProblemStatement.js';
import mongoose from 'mongoose';

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const { page = 1, limit = 60, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get teams with pagination
    const teams = await Team.find(query)
      .populate('leader', 'name email collegeName profilePicture')
      .populate('members.user', 'name email collegeName profilePicture')
      .populate('problemStatement', 'title description')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Team.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        teams,
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
      .populate('invitations.invitedBy', 'name email collegeName')
      .populate('problemStatement', 'title description');

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
    console.log('Create team request body:', req.body);
    const { name, description, problemStatement } = req.body;
    const userId = req.user._id;
    console.log('User ID:', userId);

    // Check if user is already in a team
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    
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

    // Validate problem statement exists and is a valid ObjectId
    if (!problemStatement) {
      return res.status(400).json({
        success: false,
        message: 'Problem statement is required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(problemStatement)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem statement ID.'
      });
    }

    // Verify that the problem statement exists and check selection limit
    const problemExists = await ProblemStatement.findById(problemStatement);
    if (!problemExists) {
      return res.status(400).json({
        success: false,
        message: 'Problem statement not found.'
      });
    }

    // Check if problem statement has reached selection limit
    if (problemExists.selectionCount >= 4) {
      return res.status(400).json({
        success: false,
        message: 'This problem statement has reached the maximum selection limit of 4 teams.'
      });
    }

    console.log('Creating team with data:', { name, description, problemStatement, leader: userId });

    // Create new team
    const team = new Team({
      name,
      description,
      problemStatement,
      leader: userId
    });

    await team.save();

    // Add team selection to problem statement
    await problemExists.addTeamSelection(team._id);
    console.log('Team saved successfully:', team._id);

    // Update user's team reference
    user.team = team._id;
    await user.save();
    console.log('User team reference updated');

    // Populate team data for response
    await team.populate('leader', 'name email collegeName profilePicture');
    await team.populate('members.user', 'name email collegeName profilePicture');
    await team.populate('problemStatement', 'title description');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team }
    });
  } catch (error) {
    console.error('Create team error details:', error);
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
    const { name, description, problemStatement } = req.body;
    const userId = req.user._id;

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

    // Handle problem statement change if provided
    if (problemStatement && problemStatement !== team.problemStatement.toString()) {
      if (!mongoose.Types.ObjectId.isValid(problemStatement)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid problem statement ID.'
        });
      }

      // Verify that the new problem statement exists and check selection limit
      const newProblemExists = await ProblemStatement.findById(problemStatement);
      if (!newProblemExists) {
        return res.status(400).json({
          success: false,
          message: 'Problem statement not found.'
        });
      }

      // Check if new problem statement has reached selection limit
      if (newProblemExists.selectionCount >= 4) {
        return res.status(400).json({
          success: false,
          message: 'This problem statement has reached the maximum selection limit of 4 teams.'
        });
      }

      // Remove team from old problem statement
      const oldProblem = await ProblemStatement.findById(team.problemStatement);
      if (oldProblem) {
        await oldProblem.removeTeamSelection(team._id);
      }

      // Add team to new problem statement
      await newProblemExists.addTeamSelection(team._id);
      
      // Update team's problem statement
      team.problemStatement = problemStatement;
    }

    // Update other team fields
    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    await team.save();
    await team.populate('leader', 'name email collegeName profilePicture');
    await team.populate('members.user', 'name email collegeName profilePicture');
    await team.populate('problemStatement', 'title description');

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

// Join team
export const joinTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

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
    const userId = req.user._id;
    const { transferToUserId } = req.body;

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

    const isLeader = team.isLeader(userId);
    const teamSize = team.members.length;

    // Case 1: Leader is the only member - Delete the team
    if (isLeader && teamSize === 1) {
      // Remove team selection from problem statement
      const problem = await ProblemStatement.findById(team.problemStatement);
      if (problem) {
        await problem.removeTeamSelection(team._id);
      }

      await Team.findByIdAndDelete(id);
      
      // Update user's team reference
      const user = await User.findById(userId);
      user.team = null;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Team disbanded successfully as you were the only member'
      });
    }

    // Case 2: Leader leaving with other members - Transfer leadership
    if (isLeader && teamSize > 1) {
      let newLeader;

      if (transferToUserId) {
        if (!team.isMember(transferToUserId)) {
          return res.status(400).json({
            success: false,
            message: 'Specified user is not a member of this team'
          });
        }
        newLeader = transferToUserId;
      } else {
        const nonLeaderMembers = team.members.filter(member => 
          member.user.toString() !== userId.toString()
        );
        
        if (nonLeaderMembers.length === 0) {
          return res.status(500).json({
            success: false,
            message: 'No eligible members found for leadership transfer'
          });
        }
        
        newLeader = nonLeaderMembers[0].user;
      }

      // Transfer leadership
      team.leader = newLeader;
      
      // Update roles in members array
      team.members = team.members.map((member) => {
        if (member.user.toString() === newLeader.toString()) {
          return { ...member.toObject(), role: 'leader' };
        }
        if (member.user.toString() === userId.toString()) {
          return { ...member.toObject(), role: 'member' };
        }
        return member;
      });

      // Remove the leaving user from team
      await team.removeMember(userId);
      await team.save();

      // Update leaving user's team reference
      const leavingUser = await User.findById(userId);
      leavingUser.team = null;
      await leavingUser.save();

      // Populate team data for response
      await team.populate('leader', 'name email profilePicture');
      await team.populate('members.user', 'name email profilePicture');

      return res.status(200).json({
        success: true,
        message: `Successfully left the team. Leadership transferred to ${team.leader.name}`,
        data: { team }
      });
    }

    // Case 3: Regular member leaving
    if (!isLeader) {
      // Remove user from team
      await team.removeMember(userId);
      
      // Update user's team reference
      const user = await User.findById(userId);
      user.team = null;
      await user.save();

      // Populate team data for response
      await team.populate('leader', 'name email profilePicture');
      await team.populate('members.user', 'name email profilePicture');

      return res.status(200).json({
        success: true,
        message: 'Successfully left the team',
        data: { team }
      });
    }

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
    const userId = req.user._id;

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

// Get user's team
export const getMyTeam = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'team',
      populate: [
        { path: 'leader', select: 'name email collegeName profilePicture' },
        { path: 'members.user', select: 'name email collegeName profilePicture' },
        { path: 'problemStatement', select: 'title description' }
      ]
    });

    if (!user.team) {
      return res.status(404).json({
        success: false,
        message: 'You are not part of any team'
      });
    }

    res.json({
      success: true,
      data: { team: user.team }
    });
  } catch (error) {
    console.error('Get my team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team',
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
    const userId = req.user._id;

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

    // Remove team selection from problem statement
    const problem = await ProblemStatement.findById(team.problemStatement);
    if (problem) {
      await problem.removeTeamSelection(team._id);
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

export const transferLeadership = async (req, res) => {
  try {
    const { id } = req.params;
    const { newLeaderId } = req.body;
    const userId = req.user._id;

    if (!newLeaderId) {
      return res.status(400).json({ success: false, message: 'newLeaderId is required' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!team.isLeader(userId)) {
      return res.status(403).json({ success: false, message: 'Only team leader can transfer leadership' });
    }

    if (!team.isMember(newLeaderId) && team.leader.toString() !== newLeaderId.toString()) {
      return res.status(400).json({ success: false, message: 'New leader must be a current team member' });
    }

    // Update roles in members array
    team.members = team.members.map((m) => {
      if (m.user.toString() === team.leader.toString()) {
        return { ...m.toObject(), role: 'member' };
      }
      if (m.user.toString() === newLeaderId.toString()) {
        return { ...m.toObject(), role: 'leader' };
      }
      return m;
    });

    // Set new leader
    team.leader = newLeaderId;
    await team.save();

    await team.populate('leader', 'name email profilePicture');
    await team.populate('members.user', 'name email profilePicture');

    return res.status(200).json({ success: true, message: 'Leadership transferred successfully', data: { team } });
  } catch (error) {
    console.error('Transfer leadership error:', error);
    return res.status(500).json({ success: false, message: 'Failed to transfer leadership', error: error.message });
  }
};