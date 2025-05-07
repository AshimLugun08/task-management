// app/api/tasks/test/route.ts

import { connectDB } from "@/lib/db";
import Task from "@/model/task";

export async function GET() {
  try {
    await connectDB();

    const testTask = await Task.create({
      title: "Test Task",
      description: "This is a test task for status workflow.",
      dueDate: new Date(),
      priority: "high",
      status: "testing", // 👈 use your custom status here
      assignedTo: "test-user@example.com",
      createdBy: "admin@example.com",
    });

    return Response.json({ success: true, data: testTask });
  } catch (error :any ) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
