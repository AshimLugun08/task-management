// app/board/page.tsx
import { connectDB } from "@/lib/db";
import Task from "@/model/task";
import BoardPage from "./board";
import Navbar from "../component/navbar";

// Placeholder Navbar component (adjust based on your actual Navbar)


export default async function Page() {
  await connectDB();
  const tasks = await Task.find().lean();
  return (
    <div>
      <Navbar />
      <BoardPage tasks={JSON.parse(JSON.stringify(tasks))} />
    </div>
  );
}