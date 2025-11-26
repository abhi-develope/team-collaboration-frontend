export type Role = "ADMIN" | "MANAGER" | "MEMBER";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: string | null;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  teamId: string | Team;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId: string | Project;
  assignedTo?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  content: string;
  senderId: string | User;
  teamId: string | Team;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: Role
  ) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
