'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../component/navbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import router from 'next/router';
// TypeScript interfaces for Task and User based on MongoDB schemas
interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'testing' | 'done';
  assignedTo?: string;
  createdBy?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'manager';
  tasksAssigned: string[];
}

export default function Dashboard() {
  const { data: session, status: authStatus } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks and users on mount
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  // Fetch tasks and users on mount
  useEffect(() => {
    if (authStatus === 'authenticated') {
      const fetchData = async () => {
        try {
          const [tasksResponse, usersResponse] = await Promise.all([
            axios.get('/api/task'),
            axios.get('/api/users'),
          ]);
          setTasks(tasksResponse.data);
          setUsers(usersResponse.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to load data');
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [authStatus]);
  // Calculate task statistics
  const taskStatusCounts = tasks.reduce(
    (acc, task) => ({
      ...acc,
      [task.status]: (acc[task.status] || 0) + 1,
    }),
    {} as Record<string, number>
  );

  const pieChartData = [
    { name: 'To Do', value: taskStatusCounts['todo'] || 0 },
    { name: 'In Progress', value: taskStatusCounts['in-progress'] || 0 },
    { name: 'Testing', value: taskStatusCounts['testing'] || 0 },
    { name: 'Done', value: taskStatusCounts['done'] || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Get user name by ID
  const getUserName = (userId?: string) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : 'Unassigned';
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Project Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-semibold">Total Tasks</h3>
            <p className="text-xl sm:text-2xl">{tasks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-semibold">Open Tasks</h3>
            <p className="text-xl sm:text-2xl">
              {tasks.filter((t) => t.status !== 'done').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-semibold">Team Members</h3>
            <p className="text-xl sm:text-2xl">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-semibold">High Priority</h3>
            <p className="text-xl sm:text-2xl">
              {tasks.filter((t) => t.priority === 'high').length}
            </p>
          </div>
        </div>

        {/* Task Status Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Task Status Distribution</h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Task Assignments Table */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Team Task Assignments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 sm:px-4 py-2 text-left">Name</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Role</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Tasks Assigned</th>
                  <th className="px-2 sm:px-4 py-2 text-left">Open Tasks</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userTasks = tasks.filter((t) => t.assignedTo === user._id);
                  const openTasks = userTasks.filter((t) => t.status !== 'done').length;
                  return (
                    <tr key={user._id} className="border-t">
                      <td className="px-2 sm:px-4 py-2">{user.name}</td>
                      <td className="px-2 sm:px-4 py-2 capitalize">{user.role}</td>
                      <td className="px-2 sm:px-4 py-2">{userTasks.length}</td>
                      <td className="px-2 sm:px-4 py-2">{openTasks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}