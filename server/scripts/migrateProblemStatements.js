import mongoose from 'mongoose';
import ProblemStatement from '../src/models/ProblemStatement.js';
import Team from '../src/models/Team.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedic-vision';

async function migrateProblemStatements() {
  try {
    console.log('🔄 Starting problem statement migration...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all problem statements
    const problemStatements = await ProblemStatement.find({});
    console.log(`📋 Found ${problemStatements.length} problem statements to migrate`);

    // Get all teams with their problem statements
    const teams = await Team.find({}).populate('problemStatement');
    console.log(`👥 Found ${teams.length} teams`);

    // Create a map of problem statement selections
    const selectionMap = new Map();
    
    teams.forEach(team => {
      if (team.problemStatement && team.problemStatement._id) {
        const problemId = team.problemStatement._id.toString();
        if (!selectionMap.has(problemId)) {
          selectionMap.set(problemId, []);
        }
        selectionMap.get(problemId).push(team._id);
      }
    });

    console.log(`🔍 Found selections for ${selectionMap.size} problem statements`);

    // Update each problem statement
    let updatedCount = 0;
    for (const problem of problemStatements) {
      const problemId = problem._id.toString();
      const selectedByTeams = selectionMap.get(problemId) || [];
      const selectionCount = selectedByTeams.length;

      // Update the problem statement
      await ProblemStatement.findByIdAndUpdate(
        problem._id,
        {
          selectedByTeams: selectedByTeams,
          selectionCount: selectionCount
        },
        { new: true }
      );

      console.log(`✅ Updated "${problem.title}" - ${selectionCount} team(s) selected`);
      updatedCount++;
    }

    console.log(`🎉 Migration completed successfully!`);
    console.log(`📊 Updated ${updatedCount} problem statements`);
    
    // Print summary
    const summary = Array.from(selectionMap.entries())
      .map(([problemId, teams]) => {
        const problem = problemStatements.find(p => p._id.toString() === problemId);
        return {
          title: problem?.title || 'Unknown',
          count: teams.length
        };
      })
      .sort((a, b) => b.count - a.count);

    console.log('\n📈 Selection Summary:');
    summary.forEach(({ title, count }) => {
      const status = count >= 4 ? '🔴 FULL' : count >= 3 ? '🟡 ALMOST FULL' : '🟢 AVAILABLE';
      console.log(`  ${status} ${title}: ${count}/4 teams`);
    });

    // Check for any problems at or over limit
    const atLimit = summary.filter(s => s.count >= 4);
    if (atLimit.length > 0) {
      console.log(`\n⚠️  ${atLimit.length} problem statement(s) at selection limit:`);
      atLimit.forEach(({ title, count }) => {
        console.log(`  - ${title}: ${count}/4 teams`);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
migrateProblemStatements();