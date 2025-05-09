// app/board/page.tsx
import { connectDB } from "@/lib/db";
import Task from "@/model/task";
import BoardPage from "./board";
import Navbar from "../component/navbar";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
  createdBy?: string;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  await connectDB();
  const tasks = await Task.find().lean();
  return (
    <div>
      <Navbar />
      <BoardPage tasks={JSON.parse(JSON.stringify(tasks)) as Task[]} />
    </div>
  );
}