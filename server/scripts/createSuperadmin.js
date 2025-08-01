import mongoose from 'mongoose';
import User from '../src/models/User.js';
import connectDB from '../src/config/database.js';

const createSuperadmin = async () => {
  try {
    await connectDB();
    const exists = await User.findOne({ email: 'tejassriavinasha@gmail.com' });
    if (exists) {
      console.log('Superadmin already exists');
      process.exit(0);
    }
    const user = new User({
      name: 'avinasha',
      email: 'tejassriavinasha@gmail.com',
      password: 'avinasha999',
      role: 'superadmin'
    });
    await user.save();
    console.log('Superadmin created successfully!');
    console.log('Email: tejassriavinasha@gmail.com');
    console.log('Password: avinasha999');
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
};

createSuperadmin(); 