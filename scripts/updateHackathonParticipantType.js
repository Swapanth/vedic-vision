import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '..', 'server');
dotenv.config({ path: path.join(serverDir, '.env') });

// Import User model from server
import User from '../server/src/models/User.js';

// List of hackathon participant emails
const hackathonEmails = [
  'ravindratalapati143@gmail.com',
  'bobbilikalyani095@gmail.com',
  'poornasravanipotnuri@gmail.com',
  'saiganta3699@gmail.com',
  'sarathmanoj246@gmail.com',
  'kobagapusaiprasanth@gmail.com',
  'kotnipavan8@gmail.com',
  'skkhajavaliskkhajavali701@gmail.com',
  'somepallisivanagalakshmi@gmail.com',
  'tanujayallapu@gmail.com',
  'manjulathota20@gmail.com',
  'nakkarajulokeswari@gmail.com',
  'jnanendravarma.b_csit@srkrec.edu.in',
  'saipraneethboni2506@gmail.com',
  'dvar66501@gmail.com',
  'satyareddy1407@gmail.com',
  'pallitarakram@gmail.com',
  'akashbevara078@gmail.com',
  'rushithakona@gmail.com',
  'bunnyraya5@gmail.com',
  'vivekpotnuru07@gmail.com',
  'sreedevipulaparthi31@gmail.com',
  'peddinibodhan123@gmail.com',
  'scs311136@gmail.com',
  'satwiknethi2005@gmail.com',
  'pandisurya455@gmail.com',
  'palaparthishanmuk2@gmail.com',
  'lokeshmandadapu96@gmail.com',
  'ajithonlinee@gmail.com',
  'chandranimaheswari13@gmail.com',
  'bonguashok86@gmail.com',
  'bhargavitejaswi97@gmail.com',
  'srikarchinthala25@gmail.com',
  'karrivardhansai37@gmail.com',
  'medampavanreddy@gmail.com',
  'satish.ambati0804@gmail.com',
  'keertanaemandi@gmail.com',
  'umamaheshkotni2005@gmail.com',
  'jyothsnaduvvada8@gmail.com',
  'gandhambhaskar975@gmail.com',
  'kalyansalapu3@gmail.com'
];

async function updateHackathonParticipantTypes() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('🔄 Updating participant types for hackathon participants...\n');
    
    // Update all hackathon participants
    const result = await User.updateMany(
      { 
        email: { $in: hackathonEmails },
        role: 'participant'
      },
      { 
        $set: { participantType: 'hackathon' }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} participants to hackathon type`);
    
    // Verify the update
    const hackathonCount = await User.countDocuments({
      email: { $in: hackathonEmails },
      participantType: 'hackathon'
    });
    
    console.log(`✅ Verified: ${hackathonCount} participants now have participantType: 'hackathon'`);
    
    // Show summary
    const totalBootcamp = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'bootcamp' 
    });
    const totalHackathon = await User.countDocuments({ 
      role: 'participant', 
      participantType: 'hackathon' 
    });
    
    console.log('\n📊 Participant Type Summary:');
    console.log(`   Bootcamp participants: ${totalBootcamp}`);
    console.log(`   Hackathon participants: ${totalHackathon}`);
    console.log(`   Total participants: ${totalBootcamp + totalHackathon}`);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

console.log('🎯 Update Hackathon Participant Types');
console.log('====================================\n');

updateHackathonParticipantTypes();