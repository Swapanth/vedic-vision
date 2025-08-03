import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from server directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, "..", "server");
dotenv.config({ path: path.join(serverDir, ".env") });

// User model definition (copied from server/src/models/User.js)
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["participant", "mentor", "superadmin"],
      default: "participant",
    },
    profilePicture: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
      default: "",
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

// CSV parsing function for mentors
function parseCSV(csvContent) {
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",").map((header) => header.trim());

  console.log("CSV Headers found:", headers);

  const mentors = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((value) => value.trim());

    if (values.length >= 5) {
      // Parse skills - assuming they're separated by semicolons or pipes
      const skillsString = values[4] || "";
      const skills = skillsString
        ? skillsString
            .split(/[;|]/)
            .map((skill) => skill.trim())
            .filter((skill) => skill)
        : [];

      const mentor = {
        name: values[0],
        mobile: values[1],
        email: values[2],
        description: values[3] || "",
        skills: skills,
        password: values[1], // Using mobile number as password
        role: "mentor",
        collegeName: "Not Specified", // Default college name for mentors
      };
      mentors.push(mentor);
    }
  }

  return mentors;
}

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Bulk import mentors
async function bulkImportMentors(csvFilePath) {
  try {
    // Connect to database
    await connectDB();

    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found: ${csvFilePath}`);
      console.log("Please ensure the CSV file exists and the path is correct.");
      process.exit(1);
    }

    // Read CSV file
    console.log(`Reading CSV file: ${csvFilePath}`);
    const csvContent = fs.readFileSync(csvFilePath, "utf-8");

    // Parse CSV
    const mentors = parseCSV(csvContent);
    console.log(`Found ${mentors.length} mentors to import`);

    if (mentors.length === 0) {
      console.log("No mentors found in CSV file");
      process.exit(0);
    }

    // Display first few mentors for verification
    console.log("\nSample mentors to be imported:");
    mentors.slice(0, 3).forEach((mentor, index) => {
      console.log(
        `${index + 1}. ${mentor.name} (${mentor.email}) - ${mentor.mobile}`
      );
      console.log(`   Description: ${mentor.description}`);
      console.log(`   Skills: ${mentor.skills.join(", ")}`);
      console.log("");
    });

    // Import mentors
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    console.log("\nStarting bulk mentor import...");

    for (let i = 0; i < mentors.length; i++) {
      try {
        const mentorData = mentors[i];

        // Check if mentor already exists
        const existingMentor = await User.findOne({ email: mentorData.email });
        if (existingMentor) {
          console.log(`⚠️  Mentor already exists: ${mentorData.email}`);
          errorCount++;
          errors.push({
            row: i + 2,
            email: mentorData.email,
            error: "Mentor already exists",
          });
          continue;
        }

        // Create new mentor
        const mentor = new User(mentorData);
        await mentor.save();

        successCount++;
        console.log(`✅ Imported: ${mentorData.name} (${mentorData.email})`);
      } catch (error) {
        errorCount++;
        const errorMsg =
          error.code === 11000 ? "Duplicate email" : error.message;
        errors.push({ row: i + 2, email: mentors[i].email, error: errorMsg });
        console.log(`❌ Error importing ${mentors[i].email}: ${errorMsg}`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("BULK MENTOR IMPORT SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total mentors in CSV: ${mentors.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\nErrors encountered:");
      errors.forEach((error) => {
        console.log(`Row ${error.row}: ${error.email} - ${error.error}`);
      });
    }

    console.log("\nBulk mentor import completed!");
  } catch (error) {
    console.error("Bulk mentor import failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Main execution
async function main() {
  const csvFilePath = process.argv[2];

  if (!csvFilePath) {
    console.log("Usage: node bulkImportMentors.js <path-to-csv-file>");
    console.log("\nExpected CSV format:");
    console.log("Name,Mobile,Email,Description,Skills");
    console.log(
      "John Doe,9876543210,john@example.com,Experienced software developer,JavaScript;React;Node.js"
    );
    console.log(
      "Jane Smith,9876543211,jane@example.com,Full-stack developer,Python;Django;PostgreSQL"
    );
    console.log("\nNote: ");
    console.log("- Password will be set to the mobile number for each mentor");
    console.log("- Skills should be separated by semicolons (;) or pipes (|)");
    console.log('- Role will be automatically set to "mentor"');
    process.exit(1);
  }

  const fullPath = path.resolve(csvFilePath);
  console.log(`Starting bulk mentor import from: ${fullPath}`);

  await bulkImportMentors(fullPath);
}

main();
