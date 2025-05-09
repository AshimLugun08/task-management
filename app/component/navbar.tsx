'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { IoClose, IoAdd, IoAttach, IoLink } from 'react-icons/io5';
import { useRouter, usePathname } from 'next/navigation';

// Define types for Task and User
type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'done';

interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  assignedTo?: string;
  description?: string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

// Define type for next-auth session user
interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Utility to get today's date
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function Navbar() {
  const { data: session } = useSession() as { data: { user?: SessionUser } | null };
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '' as 'low' | 'medium' | 'high' | '',
    status: 'todo' as TaskStatus,
    assignedTo: '',
    createdAt: getTodayDate(),
  });
  const [users, setUsers] = useState<User[]>([]);
  const [userFetchError, setUserFetchError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const openModal = () => {
    setNewTask((prev) => ({ ...prev, createdAt: getTodayDate() }));
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
      assignedTo: '',
      createdAt: getTodayDate(),
    });
    setUsers([]);
    setUserFetchError(null);
    setError(null);
    setIsSubmitting(false);
  };

  const getInitial = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUserFetchError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const userData: User[] = await res.json();
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

    setIsSubmitting(true);

    try {
      const payload = {
        ...newTask,
        createdBy: session?.user?.email || 'unknown',
      };

      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      await res.json();
      closeModal();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && showModal) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModal]);

  // Close dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  const statusColors: { [key in TaskStatus]: string } = {
    todo: 'bg-blue-200 text-blue-800',
    'in-progress': 'bg-yellow-200 text-yellow-800',
    testing: 'bg-orange-200 text-orange-800',
    done: 'bg-green-200 text-green-800',
  };

  // Fixed navigation function that works with both mobile and desktop
  const handleNavigation = (path: string) => {
    // First close the dropdown, then navigate after a slight delay
    setShowDropdown(false);
    
    // Use a timeout to ensure the dropdown closes visually before navigating
    // This prevents UI jarring and ensures the route change works properly
    setTimeout(() => {
      router.push(path);
    }, 50);
  };

  return (
    <>
      <nav className="flex items-center justify-between bg-gray-900 text-white px-4 py-3 md:px-6 md:py-4 shadow-md relative">
        <div className="text-lg md:text-xl font-bold">
          <Link href="/">MyLogo</Link>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="hidden md:flex items-center space-x-4 md:space-x-6">
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
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <IoAdd className="mr-1 w-5 h-5" />
              Create
            </button>
          </div>

          {session?.user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white focus:outline-none"
                title={session.user.name || ''}
              >
                {getInitial(session.user.name)}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50 pointer-events-auto">
                  <div className="p-4 border-b">
                    <p className="font-bold">{session.user.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 truncate">{session.user.email || 'No email'}</p>
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleDropdown}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {showDropdown && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 text-white shadow-md z-50 pointer-events-auto">
            <div className="flex flex-col p-4 space-y-2">
              {/* Using buttons for mobile navigation with fixed handleNavigation */}
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="hover:text-blue-400 transition text-lg text-left"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation('/board')}
                className="hover:text-blue-400 transition text-lg text-left"
              >
                Board
              </button>
              <button
                onClick={() => handleNavigation('/projects')}
                className="hover:text-blue-400 transition text-lg text-left"
              >
                Projects
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setTimeout(() => {
                    openModal();
                  }, 50);
                }}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <IoAdd className="mr-1 w-5 h-5" />
                Create
              </button>
            </div>
          </div>
        )}
      </nav>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-[95%] sm:max-w-[600px] lg:max-w-[900px] max-h-[90vh] mx-2 sm:mx-4 overflow-hidden flex flex-col"
          >
            <form id="task-form" onSubmit={handleCreateTask} className="flex flex-col lg:flex-row w-full">
              {/* Main Content Area */}
              <div className="w-full lg:w-2/3 p-4 sm:p-5 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Close modal"
                    >
                      <IoClose className="w-6 h-6" />
                    </button>
                    <h2 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                      {newTask.title || 'Create New Issue'}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Attach"
                    >
                      <IoAttach className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Link issue"
                    >
                      <IoLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="mb-4">
                  <select
                    name="status"
                    value={newTask.status}
                    onChange={handleInputChange}
                    className={`px-3 py-1 text-sm font-medium rounded ${statusColors[newTask.status]}`}
                  >
                    <option value="todo">TO DO</option>
                    <option value="in-progress">IN PROGRESS</option>
                    <option value="testing">TESTING</option>
                    <option value="done">DONE</option>
                  </select>
                </div>

                {/* Title (Editable) */}
                <div className="mb-4">
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    className="w-full text-base sm:text-lg font-medium text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                {/* Description (Editable) */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                    rows={4}
                    placeholder="Add a description..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Sidebar for Details */}
              <div className="w-full lg:w-1/3 bg-gray-100 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  {/* AssignedTo Section */}
                  <div>
                    <span className="font-medium text-gray-600">Assigned To:</span>
                    {isLoadingUsers ? (
                      <p className="text-gray-600 mt-1 text-sm">Loading users...</p>
                    ) : userFetchError ? (
                      <div className="mt-1">
                        <p className="text-red-600 text-sm">{userFetchError}</p>
                        <button
                          onClick={fetchUsers}
                          className="mt-1 text-blue-600 hover:underline text-sm"
                        >
                          Retry
                        </button>
                      </div>
                    ) : users.length === 0 ? (
                      <p className="text-gray-600 mt-1 text-sm">No users available</p>
                    ) : (
                      <div className="mt-1">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {users.slice(0, 4).map((user) => (
                            <div
                              key={user._id}
                              className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs"
                              title={user.name}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {users.length > 4 && (
                            <div className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs">
                              +{users.length - 4}
                            </div>
                          )}
                        </div>
                        <select
                          name="assignedTo"
                          value={newTask.assignedTo}
                          onChange={handleInputChange}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                        >
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <span className="font-medium text-gray-600">Priority:</span>
                    <select
                      name="priority"
                      value={newTask.priority}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                    >
                      <option value="">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {newTask.priority === 'medium' && (
                      <svg
                        className="w-4 h-4 ml-1 inline text-gray-500"
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
                        />
                      </svg>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <span className="font-medium text-gray-600">Due Date:</span>
                    <input
                      type="date"
                      name="dueDate"
                      value={newTask.dueDate}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                    />
                  </div>

                  {/* Created Date */}
                  <div>
                    <span className="font-medium text-gray-600">Created:</span>
                    <p className="text-gray-600 mt-1 text-sm">{newTask.createdAt}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm flex items-center justify-center min-w-[100px] disabled:bg-blue-400"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}