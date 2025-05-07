import mongoose, { Schema, models, model } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "testing", "done"],
      default: "todo",
    },
    assignedTo: String,
    createdBy: String,
  },
  { timestamps: true }
);

// ✅ Don't use `mongoose.model` directly — use `models.Task` fallback
const Task = models?.Task || model("Task", taskSchema);
export default Task;
