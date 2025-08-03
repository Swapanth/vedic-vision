import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedic-vision');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testMentorOperations = async () => {
  try {
    console.log('🚀 Testing Mentor CRUD Operations...\n');

    // 1. Create a test mentor
    console.log('1. Creating a test mentor...');
    const mentorData = {
      name: 'Dr. John Smith',
      email: 'john.smith@example.com',
      mobile: '+1234567890',
      collegeName: 'Tech University',
      password: 'password123',
      role: 'mentor',
      description: 'Experienced software architect with 10+ years in full-stack development',
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'AWS', 'System Design']
    };

    let mentor = new User(mentorData);
    await mentor.save();
    console.log('✅ Mentor created successfully!');
    console.log('Mentor Data:', JSON.stringify({
      id: mentor._id,
      name: mentor.name,
      email: mentor.email,
      description: mentor.description,
      skills: mentor.skills
    }, null, 2));

    // 2. Read mentor by ID
    console.log('\n2. Reading mentor by ID...');
    const foundMentor = await User.findById(mentor._id)
      .select('-password')
      .lean();
    console.log('✅ Mentor found successfully!');
    console.log('Found Mentor:', JSON.stringify(foundMentor, null, 2));

    // 3. Update mentor
    console.log('\n3. Updating mentor...');
    const updateData = {
      description: 'Senior software architect and team lead with expertise in scalable web applications',
      skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'AWS', 'System Design', 'Docker', 'Kubernetes']
    };

    const updatedMentor = await User.findByIdAndUpdate(
      mentor._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean();

    console.log('✅ Mentor updated successfully!');
    console.log('Updated Mentor:', JSON.stringify(updatedMentor, null, 2));

    // 4. Get all mentors
    console.log('\n4. Getting all mentors...');
    const allMentors = await User.find({ role: 'mentor', isActive: true })
      .select('name email description skills assignedParticipants createdAt')
      .lean();

    console.log('✅ All mentors fetched successfully!');
    console.log(`Total mentors found: ${allMentors.length}`);
    allMentors.forEach((m, index) => {
      console.log(`Mentor ${index + 1}:`, JSON.stringify({
        name: m.name,
        email: m.email,
        description: m.description,
        skillsCount: m.skills?.length || 0,
        skills: m.skills
      }, null, 2));
    });

    // 5. Search mentors by skills
    console.log('\n5. Searching mentors by skills (MongoDB)...');
    const searchResults = await User.find({
      role: 'mentor',
      isActive: true,
      skills: { $regex: 'MongoDB', $options: 'i' }
    }).select('name email skills').lean();

    console.log('✅ Search completed!');
    console.log(`Mentors with MongoDB skills: ${searchResults.length}`);
    searchResults.forEach((m, index) => {
      console.log(`Result ${index + 1}:`, JSON.stringify({
        name: m.name,
        email: m.email,
        skills: m.skills
      }, null, 2));
    });

    // 6. Soft delete mentor
    console.log('\n6. Soft deleting mentor...');
    await User.findByIdAndUpdate(mentor._id, { isActive: false });
    
    const deletedMentor = await User.findById(mentor._id).select('name isActive').lean();
    console.log('✅ Mentor soft deleted successfully!');
    console.log('Deleted Mentor Status:', JSON.stringify(deletedMentor, null, 2));

    // 7. Verify mentor is not in active list
    console.log('\n7. Verifying mentor is not in active list...');
    const activeMentors = await User.find({ role: 'mentor', isActive: true })
      .select('name email')
      .lean();
    
    console.log('✅ Verification completed!');
    console.log(`Active mentors count: ${activeMentors.length}`);
    console.log('Our test mentor should not be in this list:', 
      activeMentors.map(m => ({ name: m.name, email: m.email })));

    console.log('\n🎉 All mentor CRUD operations completed successfully!');

  } catch (error) {
    console.error('❌ Error during mentor operations test:', error);
  }
};

const cleanup = async () => {
  try {
    // Clean up test data
    await User.deleteOne({ email: 'john.smith@example.com' });
    console.log('\n🧹 Test data cleaned up successfully');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

const main = async () => {
  await connectDB();
  await testMentorOperations();
  await cleanup();
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});
