export type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'done';

export interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  assignee?: string;
  description?: string;
  priority?: string;
  labels?: string[];
  dueDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  avatar?: string;
}