import { connectDB } from "@/lib/db";
import Task from "@/model/task";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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
  createDate?: string;
  __v?: number;
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("Fetching task ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid task ID:", id);
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    await connectDB();
    const task = await Task.findById(id).lean<TaskDocument>();

    if (!task) {
      console.log("Task not found for ID:", id);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const responseTask = {
      ...task,
      assignedTo: task.assignedTo,
      status: task.status,
      priority: task.priority || "",
      dueDate: task.dueDate?.toISOString() || "",
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
    delete (responseTask as any).__v;

    return NextResponse.json(responseTask);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("Task ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid task ID:", id);
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    await connectDB();
    const data = await req.json();
    console.log("Request body:", data);

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
      "createDate",
    ];
    const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
      console.log("Invalid fields:", invalidFields);
      return NextResponse.json(
        { error: `Invalid fields in request: ${invalidFields.join(", ")}` },
        { status: 400 }
      );
    }

    const transformedData = { ...data };
    if (transformedData.dueDate && isNaN(Date.parse(transformedData.dueDate))) {
      console.log("Invalid dueDate:", transformedData.dueDate);
      return NextResponse.json({ error: "Invalid dueDate format" }, { status: 400 });
    }
    if (!transformedData.dueDate) {
      transformedData.dueDate = undefined;
    }

    if (transformedData.status && !["todo", "in-progress", "testing", "done"].includes(transformedData.status)) {
      console.log("Invalid status:", transformedData.status);
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    if (transformedData.priority && !["low", "medium", "high"].includes(transformedData.priority)) {
      console.log("Invalid priority:", transformedData.priority);
      return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...transformedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean<TaskDocument>();

    if (!updatedTask) {
      console.log("Task not found for ID:", id);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const responseTask = {
      ...updatedTask,
      status: updatedTask.status,
      priority: updatedTask.priority || "",
      dueDate: updatedTask.dueDate?.toISOString() || "",
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    };
    delete (responseTask as any).__v;

    return NextResponse.json(responseTask);
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      console.log("Mongoose validation error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    console.log("Request body:", data);

    const allowedFields = [
      "title",
      "description",
      "dueDate",
      "priority",
      "status",
      "assignedTo",
      "createdBy",
      "createDate",
    ];
    const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
      console.log("Invalid fields:", invalidFields);
      return NextResponse.json(
        { error: `Invalid fields in request: ${invalidFields.join(", ")}` },
        { status: 400 }
      );
    }

    if (!data.title) {
      console.log("Missing title");
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const transformedData = { ...data };
    if (transformedData.dueDate && isNaN(Date.parse(transformedData.dueDate))) {
      console.log("Invalid dueDate:", transformedData.dueDate);
      return NextResponse.json({ error: "Invalid dueDate format" }, { status: 400 });
    }
    if (!transformedData.dueDate) {
      transformedData.dueDate = undefined;
    }

    if (transformedData.status && !["todo", "in-progress", "testing", "done"].includes(transformedData.status)) {
      console.log("Invalid status:", transformedData.status);
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    if (transformedData.priority && !["low", "medium", "high"].includes(transformedData.priority)) {
      console.log("Invalid priority:", transformedData.priority);
      return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
    }

    if (transformedData.createDate) {
      transformedData.createdAt = new Date(transformedData.createDate);
      delete transformedData.createDate;
    }

    const newTask = await Task.create({
      ...transformedData,
      createdAt: transformedData.createdAt || new Date(),
      updatedAt: new Date(),
    });

    const responseTask = {
      ...newTask.toObject(),
      status: newTask.status,
      priority: newTask.priority || "",
      dueDate: newTask.dueDate?.toISOString() || "",
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString(),
    };
    delete (responseTask as any).__v;

    return NextResponse.json(responseTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      console.log("Mongoose validation error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("Deleting task ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid task ID:", id);
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    await connectDB();
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      console.log("Task not found for ID:", id);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}