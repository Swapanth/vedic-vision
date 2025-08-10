import mongoose from "mongoose";
import connectDB from "../src/config/database.js";

/**
 * Migration: Create database indexes for optimal performance
 * This creates all necessary indexes for the hackathon features
 */

const createIndexes = async (standalone = false) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log("Creating database indexes...");

    const db = mongoose.connection.db;

    // User collection indexes (email unique index auto-created by schema)
    console.log("Creating User indexes...");
    await db.collection("users").createIndex({ role: 1 });
    await db.collection("users").createIndex({ participantType: 1 });
    await db.collection("users").createIndex({ assignedMentor: 1 });
    await db.collection("users").createIndex({ team: 1 });
    await db.collection("users").createIndex({ isActive: 1 });

    // Team collection indexes (name unique index auto-created by schema)
    console.log("Creating Team indexes...");
    await db.collection("teams").createIndex({ leader: 1 });
    await db.collection("teams").createIndex({ "members.user": 1 });
    await db.collection("teams").createIndex({ problemStatement: 1 });
    await db.collection("teams").createIndex({ isActive: 1 });
    await db.collection("teams").createIndex({ createdAt: -1 });

    // Problem Statement collection indexes
    console.log("Creating ProblemStatement indexes...");
    await db.collection("problemstatements").createIndex({
      title: "text",
      description: "text",
      domain: "text",
      suggestedTechnologies: "text",
      topic: "text",
    });
    await db.collection("problemstatements").createIndex({ domain: 1 });
    await db.collection("problemstatements").createIndex({ selectionCount: 1 });
    await db.collection("problemstatements").createIndex({ isCustom: 1 });
    await db.collection("problemstatements").createIndex({ createdBy: 1 });

    // Vote collection indexes (unique compound index auto-created by schema)
    console.log("Creating Vote indexes...");
    await db.collection("votes").createIndex({ team: 1 });
    await db.collection("votes").createIndex({ voter: 1 });

    // Submission collection indexes (unique compound index auto-created by schema)
    console.log("Creating Submission indexes...");
    await db.collection("submissions").createIndex({ userId: 1 });
    await db.collection("submissions").createIndex({ taskId: 1 });
    await db.collection("submissions").createIndex({ status: 1 });
    await db.collection("submissions").createIndex({ submittedAt: -1 });

    // Task collection indexes
    console.log("Creating Task indexes...");
    await db.collection("tasks").createIndex({ day: 1 });
    await db.collection("tasks").createIndex({ isActive: 1 });
    await db.collection("tasks").createIndex({ createdBy: 1 });

    // Attendance collection indexes (unique compound index auto-created by schema)
    console.log("Creating Attendance indexes...");
    await db.collection("attendances").createIndex({ userId: 1 });
    await db.collection("attendances").createIndex({ date: 1 });
    await db.collection("attendances").createIndex({ status: 1 });

    console.log("All indexes created successfully!");
    
    return { success: true };
    
  } catch (error) {
    console.error("Index creation failed:", error);
    if (standalone) {
      process.exit(1);
    }
    throw error;
  } finally {
    if (standalone) {
      await mongoose.connection.close();
      process.exit(0);
    }
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createIndexes(true);
}

export default createIndexes;
