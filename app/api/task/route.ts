// app/api/tasks/route.ts
import { connectDB } from "@/lib/db";
import Task from "@/model/task";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find().lean();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const newTask = await Task.create(data);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}