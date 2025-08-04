import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '..', 'server');
dotenv.config({ path: path.join(serverDir, '.env') });

// User schema (same as in the model)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  collegeName: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['participant', 'mentor', 'superadmin'], default: 'participant' },
  profilePicture: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  totalScore: { type: Number, default: 0 },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String, default: '', trim: true },
  skills: [{ type: String, trim: true }],
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Verify user credentials
async function verifyCredentials(email, password) {
  try {
    await connectDB();
    
    console.log(`🔍 Looking for user: ${email}`);
    
    // Find user by email (same logic as auth controller)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return { success: false, message: 'Invalid email or password' };
    }
    
    console.log(`📋 User found: ${user.name}`);
    console.log(`📱 Mobile: ${user.mobile}`);
    console.log(`🏫 College: ${user.collegeName}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`✅ Active: ${user.isActive}`);
    console.log(`🔐 Password hash: ${user.password}`);
    
    // Check if user is active
    if (!user.isActive) {
      console.log('❌ Account is inactive');
      return { success: false, message: 'Account is inactive. Please contact administrator.' };
    }
    
    // Test password comparison
    console.log(`\n🧪 Testing password: "${password}"`);
    const isValidPassword = await user.comparePassword(password);
    console.log(`Password verification result: ${isValidPassword ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!isValidPassword) {
      // Let's also test with bcrypt directly
      console.log('\n🔬 Direct bcrypt test:');
      const directTest = await bcrypt.compare(password, user.password);
      console.log(`Direct bcrypt.compare result: ${directTest ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      // Test with mobile number as password
      console.log(`\n📱 Testing with mobile number: "${user.mobile}"`);
      const mobileTest = await bcrypt.compare(user.mobile, user.password);
      console.log(`Mobile number test: ${mobileTest ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      return { success: false, message: 'Invalid email or password' };
    }
    
    return { 
      success: true, 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    };
    
  } catch (error) {
    console.error('❌ Error verifying credentials:', error.message);
    return { success: false, message: 'Verification failed', error: error.message };
  } finally {
    await mongoose.connection.close();
  }
}

// Main execution
async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.log('Usage: node verifyUserCredentials.js <email> <password>');
    console.log('\nExample:');
    console.log('node verifyUserCredentials.js leelamadhavnulakani@gmail.com 9133603383');
    process.exit(1);
  }
  
  console.log('🔐 Verifying user credentials...\n');
  
  const result = await verifyCredentials(email, password);
  
  console.log('\n' + '='.repeat(50));
  console.log('VERIFICATION RESULT');
  console.log('='.repeat(50));
  console.log(`Success: ${result.success}`);
  console.log(`Message: ${result.message}`);
  
  if (result.user) {
    console.log('User Details:');
    console.log(`- ID: ${result.user.id}`);
    console.log(`- Name: ${result.user.name}`);
    console.log(`- Email: ${result.user.email}`);
    console.log(`- Mobile: ${result.user.mobile}`);
    console.log(`- Role: ${result.user.role}`);
  }
}

main();