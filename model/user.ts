import mongoose, { Schema } from "mongoose";

// Define the user schema
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Ensure email uniqueness
    role: { 
      type: String, 
      enum: ["admin", "developer", "manager"], 
      default: "developer" 
    },
    passwordHash: { type: String }, // If using custom authentication, else omit
    tasksAssigned: [{ type: Schema.Types.ObjectId, ref: "Task" }], // Task references
    projectsAssigned: [{ type: Schema.Types.ObjectId, ref: "Project" }], // Project references
  },
  { timestamps: true }
);

// Ensure the model is created only once
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
