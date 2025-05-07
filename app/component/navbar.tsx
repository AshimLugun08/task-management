
'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
// import { Task, TaskStatus, User } from '@/types/task';/

type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'done';

interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  assignee?: string;
  description?: string;
  priority?: string;
  labels?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  _id: string;
  name: string;
  avatar?: string; // Optional avatar field for future use
}


export default function Navbar() {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '' as 'low' | 'medium' | 'high' | '',
    status: 'todo' as TaskStatus,
    assignee: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const openModal = () => {
    setShowModal(true);
    fetchUsers();
  };

  const closeModal = () => {
    setShowModal(false);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: '',
      status: 'todo',
      assignee: '',
    });
    setUsers([]);
    setUserFetchError(null);
    setError(null);
  };

  const getInitial = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUserFetchError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const userData: User[] = await res.json();
      console.log('Fetched users:', userData);
      setUsers(userData);
    } catch (err) {
      setUserFetchError(err instanceof Error ? err.message : 'An error occurred while fetching users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) {
      setError('Title is required');
      return;
    }

    try {
      const payload = {
        ...newTask,
        createdBy: session?.user?.email || 'unknown',
      };
      console.log('Creating task with payload:', payload);
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const createdTask: Task = await res.json();
      console.log('Created task:', createdTask);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        showModal
      ) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <>
      <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-4 shadow-md relative">
        <div className="text-xl font-bold">
          <Link href="/">MyLogo</Link>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="hover:text-blue-400 transition">
            Dashboard
          </Link>
          <Link href="/board" className="hover:text-blue-400 transition">
            Board
          </Link>
          <Link href="/projects" className="hover:text-blue-400 transition">
            Projects
          </Link>
          <button
            onClick={openModal}
            className="hover:text-blue-400 transition"
          >
            Create
          </button>

          {/* User Icon */}
          {session?.user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white focus:outline-none"
                title={session.user.name || ""}
              >
                {getInitial(session.user.name)}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
                  <div className="p-4 border-b">
                    <p className="font-bold">{session.user.name}</p>
                    <p className="text-sm text-gray-600">{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Create Issue</h2>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                {isLoadingUsers ? (
                  <div className="text-gray-500">Loading users...</div>
                ) : userFetchError ? (
                  <div className="text-red-600">{userFetchError}</div>
                ) : users.length === 0 ? (
                  <div className="text-gray-500">No users available</div>
                ) : (
                  <select
                    name="assignee"
                    value={newTask.assignee}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user._id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}