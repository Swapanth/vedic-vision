import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import User from "../server/src/models/User.js";
import connectDB from "../server/src/config/database.js";

// Load environment variables from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../server/.env") });

const createMentor = async () => {
  await connectDB();

  const mentorEmail = process.argv[2];
  const mentorName = process.argv[3];
  const mentorPassword = process.argv[4] || "Mentor123";

  if (!mentorEmail || !mentorName) {
    console.log(
      "Usage: node createMentor.js <email> <name> [password] [mobile]"
    );
    console.log(
      'Example: node createMentor.js mentor@example.com "John Mentor" Mentor123 "+1234567890"'
    );
    process.exit(1);
  }

  const exists = await User.findOne({ email: mentorEmail });
  if (exists) {
    console.log("User with this email already exists");
    process.exit(0);
  }

  const mentor = new User({
    name: mentorName,
    email: mentorEmail,
    mobile: process.argv[5] || "+1234567890",
    password: mentorPassword,
    role: "mentor",
  });

  await mentor.save();
  console.log(`Mentor created successfully!`);
  console.log(`Email: ${mentorEmail}`);
  console.log(`Password: ${mentorPassword}`);
  process.exit(0);
};

createMentor().catch(console.error);
