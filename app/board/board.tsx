'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskModal from './taskmodal';
// import { Task, TaskStatus } from '@/types/task';


type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'done';

interface Task {
    _id: string;
    title: string;
    status: TaskStatus;
    assignee?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface User {
    _id: string;
    name: string;
    avatar?: string;
  }

interface Column {
  name: string;
  tasks: Task[];
}

interface Columns {
  [key: string]: Column;
}

interface BoardPageProps {
  tasks: Task[];
}

export default function BoardPage({ tasks: initialTasks }: BoardPageProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState({
    title: '',
    status: 'todo' as TaskStatus,
    assignee: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const router = useRouter();

  // Derive columns from tasks
  const columns: Columns = {
    todo: { name: 'TO DO', tasks: [] },
    'in-progress': { name: 'IN PROGRESS', tasks: [] },
    testing: { name: 'TESTING', tasks: [] },
    done: { name: 'DONE', tasks: [] },
  };

  tasks.forEach((task) => {
    const status = task.status?.toLowerCase() as TaskStatus;
    if (columns[status]) {
      columns[status].tasks.push(task);
    } else {
      console.warn(`Task with invalid status:`, task);
    }
  });

  useEffect(() => {
    console.log('Initial tasks:', initialTasks.length, initialTasks);
    console.log('selectedTask updated:', selectedTask);
  }, [selectedTask, initialTasks]);

  useEffect(() => {
    console.log('Tasks updated:', tasks.length, tasks);
  }, [tasks]);

  const statusColors: { [key in TaskStatus]: string } = {
    todo: 'bg-blue-100 text-blue-800 border border-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    testing: 'bg-orange-100 text-orange-800 border border-orange-300',
    done: 'bg-green-100 text-green-800 border border-green-300',
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const createdTask: Task = await res.json();
      console.log('Created task:', createdTask);
      setTasks((prev) => {
        const newTasks = [...prev, createdTask];
        console.log('After adding task:', newTasks.length, newTasks);
        return newTasks;
      });
      setNewTask({ title: '', status: 'todo', assignee: '' });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => {
      const newTasks = prev.map((task) =>
        task._id === updatedTask._id ? { ...updatedTask } : task
      );
      console.log('After updating task:', newTasks.length, newTasks);
      return newTasks;
    });
    setSelectedTask(null);
  };

  const openModal = (task: Task) => {
    console.log('Opening modal for task:', task);
    setSelectedTask(task);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setSelectedTask(null);
  };

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Add Task Form */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Task</h2>
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="w-full sm:w-40">
            <select
              name="status"
              value={newTask.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todo">TO DO</option>
              <option value="in-progress">IN PROGRESS</option>
              <option value="testing">TESTING</option>
              <option value="done">DONE</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              name="assignee"
              value={newTask.assignee}
              onChange={handleInputChange}
              placeholder="Assignee (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ease-in-out"
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Board Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Project Board</h1>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-200">
            Filter
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-200">
            Share
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <div
            key={columnId}
            className="flex-shrink-0 w-72 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-700">
                {column.name} ({column.tasks.length})
              </h2>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3 min-h-[100px] max-h-[calc(100vh-200px)] overflow-y-auto">
              {column.tasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No issues</p>
              ) : (
                column.tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => openModal(task)}
                    className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition ease-in-out cursor-pointer"
                  >
                    <div className="flex justify-end items-center mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[task.status]}`}
                      >
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-800">{task.title}</h3>
                    <div className="flex items-center mt-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">
                        {task.assignee ? task.assignee[0] : '?'}
                      </div>
                      <span className="ml-2 text-xs text-gray-600">{task.assignee || 'Unassigned'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={closeModal} onUpdate={handleUpdateTask} />
      )}
    </div>
  );
}