import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

/**
 * Database Backup Script
 * Creates a MongoDB dump backup before running migrations
 */

const backupDatabase = async () => {
  try {
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    // Parse database name from URI
    const dbName = mongoUri.split("/").pop().split("?")[0];

    // Create backup directory
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${dbName}-${timestamp}`);

    console.log("🔄 Starting database backup...");
    console.log(`Database: ${dbName}`);
    console.log(`Backup location: ${backupPath}`);

    // Run mongodump command
    const dumpCommand = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;

    console.log("⏳ Creating backup (this may take a few minutes)...");
    const { stdout, stderr } = await execAsync(dumpCommand);

    if (stderr && !stderr.includes("done dumping")) {
      console.warn("Warning:", stderr);
    }

    console.log("✅ Backup completed successfully!");
    console.log(`📁 Backup saved to: ${backupPath}`);

    // Show backup size
    const stats = fs.statSync(path.join(backupPath, dbName));
    console.log(`📊 Backup contains collections from database: ${dbName}`);

    return backupPath;
  } catch (error) {
    console.error("❌ Backup failed:", error.message);

    if (error.message.includes("mongodump")) {
      console.log("\n💡 Install MongoDB tools:");
      console.log(
        "- Windows: Download from https://www.mongodb.com/try/download/database-tools"
      );
      console.log("- macOS: brew install mongodb/brew/mongodb-database-tools");
      console.log("- Linux: sudo apt-get install mongodb-database-tools");
    }

    throw error;
  }
};

// Export backup path for restore script
export { backupDatabase };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Load environment variables
  import("dotenv").then((dotenv) => {
    dotenv.config();
    backupDatabase();
  });
}
