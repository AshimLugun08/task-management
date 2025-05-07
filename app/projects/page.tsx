// app/projects/page.tsx
import TaskList from './tasklist';
import Task from '@/model/task';
import { connectDB } from '@/lib/db';
import Navbar from '../component/navbar';

export default async function ProjectPage() {
  await connectDB();
  const tasks = await Task.find().lean();
  return <div><Navbar/>
  <TaskList tasks={JSON.parse(JSON.stringify(tasks))} /></div>;
}
