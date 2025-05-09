'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { Task, TaskStatus, User } from "@/type/task"

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const  [users, setUsers] = useState<User[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const router = useRouter();

  // Status color mapping matching Jira's colors
  const statusColors: { [key in TaskStatus]: string } = {
    todo: 'bg-blue-100 text-blue-800 border border-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    testing: 'bg-orange-100 text-orange-800 border border-orange-300',
    done: 'bg-green-100 text-green-800 border border-green-300',
  };

  // Fetch users for the people picker
  useEffect(() => {
    console.log('TaskModal mounted for task:', task._id);
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setFetchError(null);
      try {
        const res = await fetch('/api/users');
        console.log('Fetch users response status:', res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Fetch users error response:', errorText);
          throw new Error(`Failed to fetch users: ${res.status} ${errorText}`);
        }
        const userData: User[] = await res.json();
        console.log('Fetched users:', userData);
        setUsers(userData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching users';
        console.error('Fetch users error:', errorMessage);
        setFetchError(errorMessage);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();

    // Reset state on unmount
    return () => {
      console.log('TaskModal unmounting for task:', task._id);
      setUsers([]);
      setFetchError(null);
      setUpdateError(null);
      setEditedTask({ ...task });
      setIsLoadingUsers(false);
    };
  }, [task]);

  // Handle input changes for the task fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  // Handle assignee selection
  const handleAssigneeChange = (newValue: User | null) => {
    setEditedTask((prev) => ({ ...prev, assigneeTo: newValue ? newValue.email : undefined }));
  };

  // Handle label input
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const labels = e.target.value ? e.target.value.split(',').map((label) => label.trim()) : [];
    setEditedTask((prev) => ({ ...prev, labels }));
  };

  // Handle form submission to update the task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { _id, createdAt, updatedAt, ...updateData } = editedTask;
      console.log('Sending update payload:', updateData);
      const res = await fetch(`/api/task/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const updatedTask: Task = await res.json();
      console.log('Received updated task:', updatedTask);
      onClose();
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the task';
      console.error('Update task error:', errorMessage);
      setUpdateError(errorMessage);
    }
  };

  // Retry fetching users
  const retryFetchUsers = () => {
    setFetchError(null);
    setIsLoadingUsers(true);
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        console.log(res)
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch users: ${res.status} ${errorText}`);
        }
        const userData: User[] = await res.json();
        console.log('Fetched users:', userData);
        setUsers(userData);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] max-h-[80vh] mx-4 sm:mx-6 lg:mx-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3 p-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <IoClose className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-medium text-gray-900 break-words">{editedTask.title}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="text-gray-500 hover:text-gray-700"
                aria-label="Attach"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </button>
              <button
                className="text-gray-500 hover:text-gray-700"
                aria-label="Link issue"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="mb-4">
            <select
              name="status"
              value={editedTask.status}
              onChange={handleInputChange}
              className={`px-3 py-1 text-sm font-medium rounded ${statusColors[editedTask.status]}`}
            >
              <option value="todo">TO DO</option>
              <option value="in-progress">IN PROGRESS</option>
              <option value="testing">TESTING</option>
              <option value="done">DONE</option>
            </select>
          </div>

          {/* Title (Editable) */}
          <div className="mb-6">
            <input
              type="text"
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              className="w-full text-lg font-medium text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description (Editable) */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <textarea
              name="description"
              value={editedTask.description || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
              rows={4}
              placeholder="Add a description..."
            />
          </div>

          {/* Error Message for Update Failure */}
          {updateError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {updateError}
            </div>
          )}
        </div>

        {/* Sidebar for Details */}
        <div className="w-full lg:w-1/3 bg-gray-100 p-5 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Details</h3>
          <div className="space-y-3 text-sm">
            {/* Assignee Section with AvatarGroup and Autocomplete */}
            <div>
              <span className="font-medium text-gray-600">Assignee:</span>
              {fetchError ? (
                <div className="mt-1">
                  <p className="text-red-600 text-sm">{fetchError}</p>
                  <button
                    onClick={retryFetchUsers}
                    className="mt-1 text-blue-600 hover:underline text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : isLoadingUsers ? (
                <p className="text-gray-600 mt-1 text-sm">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-gray-600 mt-1 text-sm">No users available</p>
              ) : (
                <>
                  {/* AvatarGroup to display user avatars */}
                  <AvatarGroup total={users.length} max={4} sx={{ mt: 1, mb: 1, justifyContent: 'flex-start' }}>
                    {users.map((user) => (
                      <Avatar
                        key={user._id}
                        alt={user.name}
                        src={user.avatar}
                        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    ))}
                  </AvatarGroup>

                  {/* Autocomplete for selecting an assignee */}
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option: User) => option.name}
                    value={users.find((user) => user.name === editedTask.assignee) || null}
                    onChange={(event, newValue) => handleAssigneeChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Assignee"
                        variant="outlined"
                        size="small"
                        margin="dense"
                        sx={{ mt: 1 }}
                      />
                    )}
                    renderOption={(props, option: User) => (
                      <li {...props} className="flex items-center space-x-2">
                        <Avatar
                          alt={option.name}
                          src={option.avatar}
                          sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                        >
                          {option.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <span>{option.name}</span>
                      </li>
                    )}
                    noOptionsText="No users available"
                    clearOnEscape
                    sx={{ width: '100%' }}
                  />
                </>
              )}
            </div>

            {/* Priority (Editable) */}
            <div>
              <span className="font-medium text-gray-600">Priority:</span>
              <select
                name="priority"
                value={editedTask.priority || ''}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
              >
                <option value="">None</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {editedTask.priority === 'Medium' && (
                <svg className="w-4 h-4 ml-1 inline text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              )}
            </div>

            {/* Labels (Editable) */}
            <div>
              <span className="font-medium text-gray-600">Labels:</span>
              <input
                type="text"
                name="labels"
                value={editedTask.labels?.join(', ') || ''}
                onChange={handleLabelChange}
                className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                placeholder="Enter labels (comma-separated)"
              />
            </div>

            {/* Created At (Read-only) */}
            <div>
              <span className="font-medium text-gray-600">Created:</span>
              <p className="text-gray-600 mt-1 text-sm">
                {editedTask.createdAt ? new Date(editedTask.createdAt).toLocaleString() : 'Unknown'}
              </p>
            </div>

            {/* Updated At (Read-only) */}
            <div>
              <span className="font-medium text-gray-600">Updated:</span>
              <p className="text-gray-600 mt-1 text-sm">
                {editedTask.updatedAt ? new Date(editedTask.updatedAt).toLocaleString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleUpdateTask}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ease-in-out text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}