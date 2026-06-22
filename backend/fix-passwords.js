import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Define a schema locally to avoid triggering any pre-save middlewares registered in model files
const rawAuthSchema = new mongoose.Schema({
  username: String,
  password: { type: String, trim: true }
}, { collection: "auths" });

const RawAuth = mongoose.model("RawAuth", rawAuthSchema);

const fixPasswords = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("Connected successfully.");

    const accounts = await RawAuth.find({});
    console.log(`Found ${accounts.length} accounts to fix.`);

    let fixedCount = 0;

    for (const account of accounts) {
      const username = account.username;

      // Let's set the correct plaintext password
      // For student1-student13, and student111, their passwords are identical to their username.
      // For khacsy0, we'll temporarily set it to "khacsy0" (or you can change it via the profile UI later).
      let plainPassword = username;

      console.log(`Hashing password '${plainPassword}' for user '${username}'...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      // Use updateOne to bypass any save middleware completely
      await RawAuth.updateOne(
        { _id: account._id },
        { $set: { password: hashedPassword } }
      );
      fixedCount++;
    }

    console.log(`Successfully fixed and single-hashed ${fixedCount} accounts.`);
    process.exit(0);
  } catch (error) {
    console.error("Error during recovery:", error);
    process.exit(1);
  }
};

fixPasswords();
