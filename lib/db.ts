// lib/db.ts
import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ MongoDB URI not found in environment variables.");
    throw new Error("MONGODB_URI not defined");
  }
  console.log("Mongo URI:", mongoUri);

  try {
    await mongoose.connect(mongoUri, {
      dbName: "taskmanager", // change if needed
    });
    isConnected = true;
    console.log("✅ MongoDB connected.");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
};
