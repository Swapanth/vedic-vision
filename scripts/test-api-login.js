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

// Test login exactly like auth controller
async function testLogin(email, password) {
  try {
    await connectDB();
    
    console.log(`🔐 Testing login for: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
    // Find user by email (EXACTLY like auth controller - no toLowerCase())
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    console.log(`📋 User found: ${user.name}`);
    console.log(`📧 Email in DB: "${user.email}"`);
    console.log(`📧 Email searched: "${email}"`);
    console.log(`📱 Mobile: ${user.mobile}`);
    console.log(`✅ Active: ${user.isActive}`);

    // Check if user is active (EXACTLY like auth controller)
    if (!user.isActive) {
      console.log('❌ Account is inactive');
      return {
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      };
    }

    // Validate password (EXACTLY like auth controller)
    const isValidPassword = await user.comparePassword(password);
    console.log(`🔐 Password valid: ${isValidPassword}`);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    console.log('✅ Login successful');
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role
        }
      }
    };
    
  } catch (error) {
    console.error('❌ Error during login test:', error.message);
    return { 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    };
  } finally {
    await mongoose.connection.close();
  }
}

// Main execution
async function main() {
  const email = process.argv[2] || 'meghana.madala2006@gmail.com';
  const password = process.argv[3] || '9390189530';
  
  console.log('🧪 Testing API login logic...\n');
  
  const result = await testLogin(email, password);
  
  console.log('\n' + '='.repeat(50));
  console.log('LOGIN TEST RESULT');
  console.log('='.repeat(50));
  console.log(JSON.stringify(result, null, 2));
}

main();