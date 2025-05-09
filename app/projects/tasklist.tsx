'use client';

import { useState, useEffect } from 'react';
import { IoClose, IoAttach, IoLink } from 'react-icons/io5';
import axios from 'axios';

// TypeScript interface for User
interface User {
  _id: string;
  name: string;
}

// TypeScript interface for Task
interface Task {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'testing' | 'done';
  assignedTo?: string;
  description?: string;
  priority?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  labels?: string[];
  fixVersions?: string[];
  childIssues?: any[];
  assigneeName?: string; // Added to support assigneeName
}

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userCache, setUserCache] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch assignee name for a user ID
  const fetchAssigneeName = async (userId: string): Promise<string> => {
    if (!userId) return 'Unassigned';

    // Check cache first
    if (userCache.has(userId)) {
      return userCache.get(userId)!;
    }

    try {
      const response = await axios.get(`/api/users/${userId}`);
      const user: User = response.data;
      const name = user.name || 'Unassigned';
      // Update cache
      setUserCache((prev) => new Map(prev).set(userId, name));
      return name;
    } catch (err: any) {
      console.error(`Failed to fetch user ${userId}:`, err);
      // Handle specific error from API
      const message = err.response?.data?.message || 'Failed to fetch user';
      return 'Unassigned';
    }
  };

  // Fetch assignee name when selectedTask changes
  useEffect(() => {
    if (selectedTask?.assignedTo) {
      fetchAssigneeName(selectedTask.assignedTo).then((name) => {
        setSelectedTask((prev) =>
          prev
            ? {
                ...prev,
                assigneeName: name,
              }
            : null
        );
      });
    } else if (selectedTask) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              assigneeName: 'Unassigned',
            }
          : null
      );
    }
  }, [selectedTask?.assignedTo]);

  const openModal = (task: Task) => setSelectedTask(task);
  const closeModal = () => {
    setSelectedTask(null);
    setError(null);
    setIsDeleting(false);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask?._id) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/task/${selectedTask._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      closeModal();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the task');
      setIsDeleting(false);
    }
  };

  // Status color mapping matching Jira's colors and Task schema
  const statusColors: { [key: string]: string } = {
    todo: 'bg-blue-100 text-blue-800 border border-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    testing: 'bg-orange-100 text-orange-800 border border-orange-300',
    done: 'bg-green-100 text-green-800 border border-green-300',
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Project Tasks</h1>

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task._id}
            onClick={() => openModal(task)}
            className="border p-3 sm:p-4 rounded-lg cursor-pointer hover:shadow-lg hover:bg-gray-50 transition ease-in-out"
          >
            <div className="flex justify-between items-center">
              <strong className="text-base sm:text-lg">{task.title}</strong>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[task.status] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}
              >
                {task.status ? task.status.toUpperCase() : 'UNKNOWN'}
              </span>
            </div>
            <p className="text-sm mt-2 text-gray-500">{task.description}</p>
          </li>
        ))}
      </ul>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[95%] sm:max-w-[600px] lg:max-w-[900px] max-h-[90vh] mx-2 sm:mx-4 overflow-y-auto">
            <div className="flex flex-col lg:flex-row w-full">
              {/* Main Content Area */}
              <div className="w-full lg:w-2/3 p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Close modal"
                    >
                      <IoClose className="w-6 h-6" />
                    </button>
                    <h2 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                      {selectedTask.title}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-500 hover:text-gray-700" aria-label="Attach">
                      <IoAttach className="w-5 h-5" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700" aria-label="Link issue">
                      <IoLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${statusColors[selectedTask.status] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                  >
                    {selectedTask.status ? selectedTask.status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">
                    {selectedTask.description || 'No description provided'}
                  </p>
                </div>

                {/* Child Issues */}
                {selectedTask.childIssues && selectedTask.childIssues.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Child Issues</h3>
                    <ul className="space-y-2">
                      {selectedTask.childIssues.map((child: any) => (
                        <li key={child._id} className="flex items-center space-x-2 text-sm">
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {child._id}
                          </span>
                          <span className="text-gray-600 break-words">{child.title}</span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[child.status] || 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                          >
                            {child.status ? child.status.toUpperCase() : 'UNKNOWN'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
                )}
              </div>

              {/* Sidebar for Details */}
              <div className="w-full lg:w-1/3 bg-gray-100 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Assignee:</span>
                    <p className="text-gray-600 mt-1">{selectedTask.assigneeName || 'Loading...'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Labels:</span>
                    <p className="text-gray-600 mt-1">{selectedTask.labels?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Priority:</span>
                    <p className="text-gray-600 mt-1 flex items-center">
                      {selectedTask.priority || 'None'}
                      {selectedTask.priority === 'Medium' && (
                        <svg
                          className="w-4 h-4 ml-1 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fix Versions:</span>
                    <p className="text-gray-600 mt-1">{selectedTask.fixVersions?.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Reporter:</span>
                    <p className="text-gray-600 mt-1">{selectedTask.createdBy || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Created:</span>
                    <p className="text-gray-600 mt-1">
                      {selectedTask.createdAt
                        ? new Date(selectedTask.createdAt).toLocaleString()
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Updated:</span>
                    <p className="text-gray-600 mt-1">
                      {selectedTask.updatedAt
                        ? new Date(selectedTask.updatedAt).toLocaleString()
                        : 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-start space-x-3">
                  <button
                    type="button"
                    onClick={handleDeleteTask}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm flex items-center justify-center min-w-[100px] disabled:bg-red-400"
                  >
                    {isDeleting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}