'use client';

import { useState, useEffect } from 'react';
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
import { IoClose } from 'react-icons/io5';
// import { Task, TaskStatus, User } from '@/types/task';


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

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export default function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
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
      setEditedTask({ ...task });
      setIsLoadingUsers(false);
    };
  }, [task]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAssigneeChange = (newValue: User | null) => {
    setEditedTask((prev: any) => ({ ...prev, assignee: newValue ? newValue.name : undefined }));
  };

  const handleUpdateTask = async () => {
    setIsSaving(true);
    const { _id, createdAt, updatedAt, ...updateData } = editedTask;
    console.log('Sending update payload:', updateData);
    try {
      const res = await fetch(`/api/task/${task._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const updatedTask: Task = await res.json();
      console.log('Received updated task:', updatedTask);
      onUpdate(updatedTask);
      setUpdateError(null);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'An error occurred while updating the task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{ '& .MuiDialog-paper': { maxHeight: '80vh', borderRadius: 2 } }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box sx={{ flex: 2, p: 3, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={onClose} aria-label="Close modal">
                <IoClose />
              </IconButton>
              <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                {editedTask.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton aria-label="Attach">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </IconButton>
              <IconButton aria-label="Link issue">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
              </IconButton>
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
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
            sx={{ mb: 3 }}
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
            sx={{ mb: 3 }}
          />

          {updateError && (
            <Alert severity="error" sx={{ mb: 3 }}>
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

        <Box sx={{ flex: 1, bgcolor: 'grey.100', p: 3, borderLeft: { lg: 1 }, borderTop: { xs: 1, lg: 0 }, borderColor: 'grey.200', overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Details
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="medium" color="text.secondary">
              Assignee:
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
                  value={users.find((user) => user.name === editedTask.assignee) || null}
                  onChange={(event, newValue) => handleAssigneeChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Assignee"
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
              Created:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editedTask.createdAt ? new Date(editedTask.createdAt).toLocaleString() : 'Unknown'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="medium" color="text.secondary">
              Updated:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editedTask.updatedAt ? new Date(editedTask.updatedAt).toLocaleString() : 'Unknown'}
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
  );
}