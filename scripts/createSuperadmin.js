import mongoose from "mongoose";
import User from "../server/src/models/User.js";
import connectDB from "../server/src/config/database.js";

const createSuperadmin = async () => {
  await connectDB();
  const exists = await User.findOne({ email: "admin@gmail.com" });
  if (exists) {
    console.log("Superadmin already exists");
    process.exit(0);
  }
  const user = new User({
    name: "Super Admin",
    email: "admin@gmail.com",
    mobile: "+1234567890",
    password: "Super123",
    role: "superadmin",
  });
  await user.save();
  console.log("Superadmin created!");
  process.exit(0);
};

createSuperadmin();
