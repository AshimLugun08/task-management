'use client';

import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

export default function TaskList({ tasks }: { tasks: any[] }) {
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const openModal = (task: any) => setSelectedTask(task);
  const closeModal = () => setSelectedTask(null);

  // Status color mapping matching Jira's colors
  const statusColors: { [key: string]: string } = {
    'to-do': 'bg-blue-100 text-blue-800 border border-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    testing: 'bg-orange-100 text-orange-800 border border-orange-300',
    done: 'bg-green-100 text-green-800 border border-green-300',
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Tasks</h1>

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task._id}
            onClick={() => openModal(task)}
            className="border p-4 rounded-lg cursor-pointer hover:shadow-lg hover:bg-gray-50 transition ease-in-out"
          >
            <div className="flex justify-between items-center">
              <strong className="text-lg">{task.title}</strong>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[task.status]}`}
              >
                {task.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm mt-2 text-gray-500">{task.description}</p>
          </li>
        ))}
      </ul>

      {selectedTask && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] max-h-[80vh] mx-4 sm:mx-6 lg:mx-0 flex flex-col lg:flex-row overflow-hidden">
            {/* Main Content Area */}
            <div className="w-full lg:w-2/3 p-5 overflow-y-auto">
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
                  {/* <span className="text-sm text-blue-600 hover:underline cursor-pointer">{selectedTask._id}</span> */}
                  <h2 className="text-lg font-medium text-gray-900 break-words">{selectedTask.title}</h2>
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
                <button
                  className={`px-3 py-1 text-sm font-medium rounded ${statusColors[selectedTask.status]}`}
                >
                  {selectedTask.status.toUpperCase()}
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{selectedTask.description || 'No description provided'}</p>
              </div>

              {/* Child Issues */}
              {selectedTask.childIssues && selectedTask.childIssues.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Child Issues</h3>
                  <ul className="space-y-2">
                    {selectedTask.childIssues.map((child: any) => (
                      <li key={child._id} className="flex items-center space-x-2 text-sm">
                        <span className="text-blue-600 hover:underline cursor-pointer">{child._id}</span>
                        <span className="text-gray-600 break-words">{child.title}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[child.status]}`}
                        >
                          {child.status.toUpperCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar for Details */}
            <div className="w-full lg:w-1/3 bg-gray-100 p-5 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Assignee:</span>
                  <p className="text-gray-600 mt-1">{selectedTask.assignedTo || 'Unassigned'}</p>
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
                      <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
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
                    {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Updated:</span>
                  <p className="text-gray-600 mt-1">
                    {selectedTask.updatedAt ? new Date(selectedTask.updatedAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}