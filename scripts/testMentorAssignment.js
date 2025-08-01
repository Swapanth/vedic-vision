import mongoose from 'mongoose';
import User from '../server/src/models/User.js';
import connectDB from '../server/src/config/database.js';

const testMentorAssignment = async () => {
  await connectDB();
  
  console.log('=== Testing Mentor Assignment System ===\n');

  // Get all users by role
  const superadmins = await User.find({ role: 'superadmin' }).select('name email');
  const mentors = await User.find({ role: 'mentor' }).select('name email assignedParticipants');
  const participants = await User.find({ role: 'participant' }).select('name email assignedMentor');

  console.log('Current User Hierarchy:');
  console.log(`📋 Superadmins: ${superadmins.length}`);
  superadmins.forEach(admin => console.log(`  - ${admin.name} (${admin.email})`));
  
  console.log(`\n👨‍🏫 Mentors: ${mentors.length}`);
  for (const mentor of mentors) {
    const populatedMentor = await User.findById(mentor._id).populate('assignedParticipants', 'name email');
    console.log(`  - ${mentor.name} (${mentor.email})`);
    console.log(`    Assigned Participants: ${populatedMentor.assignedParticipants.length}`);
    populatedMentor.assignedParticipants.forEach(p => 
      console.log(`      • ${p.name} (${p.email})`)
    );
  }
  
  console.log(`\n👥 Participants: ${participants.length}`);
  for (const participant of participants) {
    const populatedParticipant = await User.findById(participant._id).populate('assignedMentor', 'name email');
    const mentorInfo = populatedParticipant.assignedMentor 
      ? `assigned to ${populatedParticipant.assignedMentor.name}` 
      : 'not assigned to any mentor';
    console.log(`  - ${participant.name} (${participant.email}) - ${mentorInfo}`);
  }

  console.log('\n=== Assignment Summary ===');
  const unassignedParticipants = participants.filter(p => !p.assignedMentor);
  console.log(`Unassigned Participants: ${unassignedParticipants.length}`);
  
  if (unassignedParticipants.length > 0) {
    console.log('Participants without mentors:');
    unassignedParticipants.forEach(p => console.log(`  - ${p.name} (${p.email})`));
  }

  process.exit(0);
};

testMentorAssignment().catch(console.error);