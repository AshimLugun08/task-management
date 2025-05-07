import { connectDB } from "@/lib/db";
import Task from "@/model/task";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
// import  TaskDocument from "./task";


interface TaskDocument {
    _id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: "low" | "medium" | "high";
    status: "todo" | "in-progress" | "testing" | "done";
    assignedTo?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
    __v?: number;
  }

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // Await params to resolve the dynamic route parameters
    const { id } = await context.params;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Parse request body
    const data = await req.json();

    // Validate allowed fields
    const allowedFields = [
      "title",
      "description",
      "dueDate",
      "priority",
      "status",
      "assignedTo",
      "createdBy",
      "createdAt",
      "updatedAt",
      // Frontend fields for compatibility
      "assignee",
    ];
    const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields in request: ${invalidFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Transform frontend fields to backend schema
    const transformedData = { ...data };

    // Map 'assignee' to 'assignedTo'
    if (data.assignee !== undefined) {
      transformedData.assignedTo = data.assignee;
      delete transformedData.assignee;
    }

    // Map 'to-do' to 'todo' for status
    if (data.status === "to-do") {
      transformedData.status = "todo";
    }

    // Validate status
    if (transformedData.status && !["todo", "in-progress", "testing", "done"].includes(transformedData.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Validate priority
    if (transformedData.priority && !["low", "medium", "high"].includes(transformedData.priority)) {
      return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
    }

    // Validate dueDate if provided
    if (transformedData.dueDate && isNaN(Date.parse(transformedData.dueDate))) {
      return NextResponse.json({ error: "Invalid dueDate format" }, { status: 400 });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...transformedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean<TaskDocument>();

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Transform backend response to frontend format
    const responseTask = {
      ...updatedTask,
      assignee: updatedTask.assignedTo,
      status: updatedTask.status === "todo" ? "to-do" : updatedTask.status,
      priority: updatedTask.priority || "", // Allow empty string for frontend compatibility
      dueDate: updatedTask.dueDate?.toISOString(),
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    };
    delete (responseTask as any).assignedTo;
    delete (responseTask as any).__v;

    return NextResponse.json(responseTask);
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}