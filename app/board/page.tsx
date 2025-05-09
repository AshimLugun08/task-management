// app/board/page.tsx
import { connectDB } from "@/lib/db";
import Task from "@/model/task";
import BoardPage from "./board";
import Navbar from "../component/navbar";

// Define Task type
type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'done';

export interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  assignedTo?: string;
  description?: string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  createdBy?: string; // Added to match BoardPage
}

export default async function Page() {
  await connectDB();
  const tasks = await Task.find().lean();
  return (
    <div>
      <Navbar />
      <BoardPage tasks={JSON.parse(JSON.stringify(tasks)) as Task[]} />
    </div>
  );
}