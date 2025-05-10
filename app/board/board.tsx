'use client';

import { useState, useEffect, useCallback } from 'react';
import TaskModal from './taskmodal';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { IoAdd } from 'react-icons/io5';
import { PriorityHigh, ArrowUpward, ArrowDownward, Search as SearchIcon } from '@mui/icons-material';

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

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface BoardPageProps {
  tasks: Task[]; // Define tasks prop
}

export default function BoardPage({ tasks: initialTasks }: BoardPageProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks); // Initialize with prop
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: TaskStatus[] = ['todo', 'in-progress', 'testing', 'done'];

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/task');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data: Task[] = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while fetching tasks'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const userData: User[] = await res.json();
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // Update tasks when initialTasks prop changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const openModal = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const closeModal = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
    setSelectedTask(null);
  }, []);

  const getUserById = (userId?: string) => {
    return users.find((user) => user._id === userId) || null;
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <PriorityHigh color="error" />;
      case 'medium':
        return <ArrowUpward color="warning" />;
      case 'low':
        return <ArrowDownward color="success" />;
      default:
        return undefined;
    }
  };

  // Filter tasks by both selectedUsers and searchQuery
  const filteredTasks = tasks.filter(
    (task) =>
      (selectedUsers.length === 0 || selectedUsers.includes(task.assignedTo || '')) &&
      (searchQuery === '' || task.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const taskStats = columns.reduce((acc, column) => {
    acc[column] = filteredTasks.filter((task) => task.status === column).length;
    return acc;
  }, {} as Record<TaskStatus, number>);

  const totalTasks = filteredTasks.length;

  return (
    <Box sx={{ p: 3, bgcolor: '#F4F5F7', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          bgcolor: 'white',
          p: 2,
          borderRadius: 1,
          boxShadow: 1,
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#172B4D' }}>
          Task Board
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          {/* Sidebar with Search */}
          <Box
            sx={{
              width: { xs: '100%', sm: 250 },
              bgcolor: 'white',
              p: 2,
              borderRadius: 1,
              boxShadow: 1,
              flexShrink: 0,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#172B4D', mb: 2 }}>
              Search Tasks
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#5E6C84' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: '#F4F5F7',
                },
                '& .MuiInputBase-input': {
                  color: '#172B4D',
                  fontFamily: 'Roboto, sans-serif',
                },
              }}
            />
          </Box>

          {/* Main Content (Task Board + Summary) */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Task Board */}
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {columns.map((column) => (
                <Box
                  key={column}
                  sx={{
                    flex: '0 0 280px',
                    bgcolor: '#EBECF0',
                    borderRadius: 2,
                    p: 2,
                    minHeight: '70vh',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      fontWeight: 500,
                      color: '#172B4D',
                      textTransform: 'uppercase',
                      fontSize: '0.875rem',
                    }}
                  >
                    {column.replace('-', ' ')}
                  </Typography>
                  <Box sx={{ minHeight: '50vh' }}>
                    {filteredTasks
                      .filter((task) => task.status === column)
                      .map((task) => (
                        <Box
                          key={task._id}
                          sx={{
                            bgcolor: 'white',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            boxShadow: 1,
                            '&:hover': {
                              bgcolor: '#F7FAFC',
                              boxShadow: 2,
                            },
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onClick={() => openModal(task)}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: '#172B4D', mb: 0.5 }}
                          >
                            {task.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: '#5E6C84', fontWeight: 500 }}
                            >
                              TASK-{task._id.slice(-4).toUpperCase()}
                            </Typography>
                            {task.priority && (
                              <Chip
                                icon={getPriorityIcon(task.priority)}
                                label={task.priority}
                                size="small"
                                sx={{
                                  bgcolor:
                                    task.priority === 'high'
                                      ? '#FFE4E1'
                                      : task.priority === 'medium'
                                      ? '#FFF4E5'
                                      : '#E6FFEC',
                                  color:
                                    task.priority === 'high'
                                      ? '#C41E3A'
                                      : task.priority === 'medium'
                                      ? '#FFA500'
                                      : '#2E7D32',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {task.assignedTo ? (
                              getUserById(task.assignedTo) ? (
                                <Avatar
                                  alt={getUserById(task.assignedTo)?.name}
                                  src={getUserById(task.assignedTo)?.avatar}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: '1rem',
                                    bgcolor: '#f1f1f1',
                                    color: '#2d2d2d',
                                  }}
                                >
                                  {getUserById(task.assignedTo)?.name.charAt(0).toUpperCase()}
                                </Avatar>
                              ) : (
                                <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                                  Unassigned
                                </Typography>
                              )
                            ) : (
                              <Typography variant="caption" sx={{ color: '#5E6C84' }}>
                                Unassigned
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Summary Section Below Task Board */}
            <Box
              sx={{
                mt: 3,
                bgcolor: 'white',
                p: 2,
                borderRadius: 1,
                boxShadow: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              {/* Summary content removed as per the provided code */}
            </Box>
          </Box>
        </Box>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={closeModal}
          onUpdate={handleUpdateTask}
        />
      )}
    </Box>
  );
}