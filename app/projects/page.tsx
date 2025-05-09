// app/projects/page.tsx
import TaskList from './tasklist';
import Task from '@/model/task';
import { connectDB } from '@/lib/db';
import Navbar from '../component/navbar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Define Task type for consistency
type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'done';

interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  assignedTo?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default async function ProjectPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  await connectDB();
  const tasks = await Task.find().lean();
  return (
    <div>
      <Navbar />
      <TaskList tasks={JSON.parse(JSON.stringify(tasks)) as Task[]} />
    </div>
  );
}