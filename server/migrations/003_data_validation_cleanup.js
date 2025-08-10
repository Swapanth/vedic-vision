import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Team from '../src/models/Team.js';
import ProblemStatement from '../src/models/ProblemStatement.js';
import connectDB from '../src/config/database.js';

/**
 * Migration: Data validation and cleanup
 * This ensures data integrity and fixes any inconsistencies
 */

const validateAndCleanupData = async (standalone = false) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    
    console.log('Starting data validation and cleanup...');
    
    // 1. Fix team member counts and ensure leaders are in members array
    console.log('Validating team data...');
    const teams = await Team.find({});
    let teamsFixed = 0;
    
    for (const team of teams) {
      let needsSave = false;
      
      // Ensure leader is in members array
      const leaderInMembers = team.members.find(member => 
        member.user.toString() === team.leader.toString()
      );
      
      if (!leaderInMembers) {
        team.members.unshift({
          user: team.leader,
          role: 'leader',
          joinedAt: team.createdAt || new Date()
        });
        needsSave = true;
      } else if (leaderInMembers.role !== 'leader') {
        leaderInMembers.role = 'leader';
        needsSave = true;
      }
      
      if (needsSave) {
        await team.save();
        teamsFixed++;
      }
    }
    
    console.log(`Fixed ${teamsFixed} teams with leader/member inconsistencies`);
    
    // 2. Update problem statement selection counts
    console.log('Updating problem statement selection counts...');
    const problemStatements = await ProblemStatement.find({});
    let problemStatementsFixed = 0;
    
    for (const ps of problemStatements) {
      const actualTeamCount = await Team.countDocuments({ 
        problemStatement: ps._id,
        isActive: true 
      });
      
      if (ps.selectionCount !== actualTeamCount) {
        ps.selectionCount = actualTeamCount;
        ps.selectedByTeams = await Team.find({ 
          problemStatement: ps._id,
          isActive: true 
        }).distinct('_id');
        
        await ps.save();
        problemStatementsFixed++;
      }
    }
    
    console.log(`Fixed ${problemStatementsFixed} problem statements with incorrect selection counts`);
    
    // 3. Update user team references
    console.log('Validating user team references...');
    const users = await User.find({ role: 'participant' });
    let userTeamRefsFixed = 0;
    
    for (const user of users) {
      const userTeam = await Team.findOne({ 
        'members.user': user._id,
        isActive: true 
      });
      
      if (userTeam && user.team?.toString() !== userTeam._id.toString()) {
        user.team = userTeam._id;
        await user.save();
        userTeamRefsFixed++;
      } else if (!userTeam && user.team) {
        user.team = null;
        await user.save();
        userTeamRefsFixed++;
      }
    }
    
    console.log(`Fixed ${userTeamRefsFixed} user team references`);
    
    // 4. Ensure all participants have participantType
    console.log('Ensuring all participants have participantType...');
    const participantsWithoutType = await User.updateMany(
      { 
        role: 'participant',
        participantType: { $exists: false }
      },
      { 
        $set: { participantType: 'bootcamp' }
      }
    );
    
    console.log(`Set participantType for ${participantsWithoutType.modifiedCount} participants`);
    
    // 5. Generate summary report
    console.log('\n=== MIGRATION SUMMARY ===');
    const totalUsers = await User.countDocuments({});
    const bootcampParticipants = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'bootcamp' 
    });
    const hackathonParticipants = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'hackathon' 
    });
    const mentors = await User.countDocuments({ role: 'mentor' });
    const totalTeams = await Team.countDocuments({ isActive: true });
    const totalProblemStatements = await ProblemStatement.countDocuments({});
    
    console.log(`Total Users: ${totalUsers}`);
    console.log(`- Bootcamp Participants: ${bootcampParticipants}`);
    console.log(`- Hackathon Participants: ${hackathonParticipants}`);
    console.log(`- Mentors: ${mentors}`);
    console.log(`Active Teams: ${totalTeams}`);
    console.log(`Problem Statements: ${totalProblemStatements}`);
    console.log('=========================\n');
    
    console.log('Data validation and cleanup completed successfully!');
    
    return {
      teamsFixed,
      problemStatementsFixed,
      userTeamRefsFixed,
      participantsWithoutType: participantsWithoutType.modifiedCount,
      totalUsers,
      bootcampParticipants,
      hackathonParticipants,
      mentors,
      totalTeams,
      totalProblemStatements
    };
    
  } catch (error) {
    console.error('Data validation failed:', error);
    if (standalone) {
      process.exit(1);
    }
    throw error;
  } finally {
    if (standalone) {
      await mongoose.connection.close();
      process.exit(0);
    }
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAndCleanupData(true);
}

export default validateAndCleanupData;