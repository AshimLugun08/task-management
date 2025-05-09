'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Avatar,
  AvatarGroup,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { IoClose, IoAttach, IoLink } from 'react-icons/io5';

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

interface TaskModalProps {
  task: Task & { __v?: number };
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export default function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  // Log initial task prop for debugging
  console.log('Initial task prop:', task);

  // Memoize initialTask to ensure stable reference
  const initialTask = useMemo<Task>(() => ({
    _id: task._id,
    title: task.title,
    status: task.status,
    assignedTo: task.assignedTo,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }), [task]);

  const [editedTask, setEditedTask] = useState<Task>(initialTask);
  const [users, setUsers] = useState<User[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = [
    { value: 'todo', label: 'TO DO', color: 'bg-blue-100 text-blue-800' },
    { value: 'in-progress', label: 'IN PROGRESS', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'testing', label: 'TESTING', color: 'bg-orange-100 text-orange-800' },
    { value: 'done', label: 'DONE', color: 'bg-green-100 text-green-800' },
  ];

  useEffect(() => {
    console.log('TaskModal mounted for task:', task._id);
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const userData: User[] = await res.json();
        setUsers(userData);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();

    return () => {
      console.log('TaskModal unmounting for task:', task._id);
      setUsers([]);
      setFetchError(null);
      setUpdateError(null);
      setIsLoadingUsers(false);
    };
  }, [task._id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const handleAssignedToChange = (newValue: User | null) => {
    setEditedTask((prev) => ({ ...prev, assignedTo: newValue ? newValue._id : undefined }));
  };

  const handleDueDateChange = (newDate: Date | null) => {
    setEditedTask((prev) => ({
      ...prev,
      dueDate: newDate ? newDate.toISOString().split('T')[0] : undefined,
    }));
  };

  const handleUpdateTask = async () => {
    setIsSaving(true);
    console.log('editedTask before payload:', editedTask);
    const { _id, createdAt, updatedAt, createdBy, __v, ...updateData } = editedTask as Task & { __v?: number };

    // Clean payload: remove undefined, null, and __v explicitly
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== undefined && value !== null && key !== '__v')
    );

    console.log('Sending update payload:', cleanedUpdateData);

    try {
      const res = await fetch(`/api/task/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedUpdateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || errorData.error || `Failed to update task (Status: ${res.status})`);
      }

      const serverTask: Task & { __v?: number } = await res.json();
      // Clean __v from server response
      const updatedTask: Task = {
        _id: serverTask._id,
        title: serverTask.title,
        status: serverTask.status,
        assignedTo: serverTask.assignedTo,
        description: serverTask.description,
        priority: serverTask.priority,
        dueDate: serverTask.dueDate,
        createdBy: serverTask.createdBy,
        createdAt: serverTask.createdAt,
        updatedAt: serverTask.updatedAt,
      };
      console.log('Received updated task:', updatedTask);
      onUpdate(updatedTask);
      setUpdateError(null);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the task';
      console.error('Update error:', err);
      setUpdateError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '90vh',
            borderRadius: 2,
            height: { xs: 'auto', lg: '80vh' },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              flex: { xs: 'none', lg: 2 },
              p: { xs: 2, sm: 3 },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={onClose} aria-label="Close modal">
                  <IoClose />
                </IconButton>
                <Typography variant="h6" sx={{ wordBreak: 'break-word', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {editedTask.title || 'Edit Task'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton aria-label="Attach">
                  <IoAttach />
                </IconButton>
                <IconButton aria-label="Link issue">
                  <IoLink />
                </IconButton>
              </Box>
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={editedTask.status}
                onChange={handleInputChange}
                label="Status"
                sx={{ '& .MuiSelect-select': { py: 1 } }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box className={option.color} sx={{ px: 1, py: 0.5, borderRadius: 1 }}>
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Title"
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={editedTask.description || ''}
              onChange={handleInputChange}
              variant="outlined"
              multiline
              rows={4}
              placeholder="Add a description..."
              sx={{ mb: 2 }}
            />

            {updateError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {updateError.includes('Task not found')
                  ? 'The task could not be found. It may have been deleted.'
                  : updateError.includes('Invalid task ID')
                  ? 'The task ID is invalid. Please try again.'
                  : updateError.includes('Invalid fields')
                  ? 'The request contains invalid fields. Please check your input.'
                  : updateError.includes('Invalid status')
                  ? 'The status value is invalid. Choose a valid status.'
                  : updateError}
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              flex: { xs: 'none', lg: 1 },
              bgcolor: 'grey.100',
              p: { xs: 2, sm: 3 },
              borderLeft: { lg: 1 },
              borderTop: { xs: 1, lg: 0 },
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Details
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium" color="text.secondary">
                Assigned To:
              </Typography>
              {fetchError ? (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Failed to load users
                </Alert>
              ) : isLoadingUsers ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Loading users...
                </Typography>
              ) : users.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No users available
                </Typography>
              ) : (
                <>
                  <AvatarGroup total={users.length} max={4} sx={{ mt: 1, mb: 1, justifyContent: 'flex-start' }}>
                    {users.map((user) => (
                      <Tooltip key={user._id} title={user.name}>
                        <Avatar
                          alt={user.name}
                          src={user.avatar}
                          sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>

                  <Autocomplete
                    options={users}
                    getOptionLabel={(option: User) => option.name}
                    value={users.find((user) => user._id === editedTask.assignedTo) || null}
                    onChange={(event, newValue) => handleAssignedToChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Assigned To"
                        variant="outlined"
                        size="small"
                        margin="dense"
                      />
                    )}
                    renderOption={(props, option: User) => {
                      const { key, ...otherProps } = props;
                      return (
                        <li key={key} {...otherProps} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar
                            alt={option.name}
                            src={option.avatar}
                            sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                          >
                            {option.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">{option.name}</Typography>
                        </li>
                      );
                    }}
                    noOptionsText="No users available"
                    clearOnEscape
                    sx={{ width: '100%' }}
                  />
                </>
              )}
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={editedTask.priority || ''}
                onChange={handleInputChange}
                label="Priority"
                sx={{ '& .MuiSelect-select': { py: 1 } }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium" color="text.secondary">
                Due Date:
              </Typography>
              <DatePicker
                label="Select Due Date"
                value={editedTask.dueDate ? new Date(editedTask.dueDate) : null}
                onChange={handleDueDateChange}
                sx={{ mt: 1, width: '100%' }}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    size: 'small',
                    margin: 'dense',
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium" color="text.secondary">
                Created:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editedTask.createdAt ? new Date(editedTask.createdAt).toLocaleString() : 'Unknown'}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleUpdateTask}
              disabled={isSaving}
              startIcon={isSaving && <CircularProgress size={20} />}
              sx={{ mt: 2 }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}