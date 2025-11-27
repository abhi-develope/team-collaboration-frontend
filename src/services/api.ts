import axios, { AxiosError } from "axios";
import type { Project, Task, Message, ApiResponse } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const message = error.response?.data?.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// Auth APIs
export const authAPI = {
  register: async (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      name,
      role,
    });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

// Project APIs
export const projectAPI = {
  getAll: async (
    teamId?: string
  ): Promise<ApiResponse<{ projects: Project[] }>> => {
    const { data } = await api.get("/projects", { params: { teamId } });
    return data;
  },
  create: async (
    projectData: Partial<Project>
  ): Promise<ApiResponse<{ project: Project }>> => {
    const { data } = await api.post("/projects", projectData);
    return data;
  },
  update: async (
    id: string,
    projectData: Partial<Project>
  ): Promise<ApiResponse<{ project: Project }>> => {
    const { data } = await api.put(`/projects/${id}`, projectData);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
};

// Task APIs
export const taskAPI = {
  getAll: async (
    projectId?: string
  ): Promise<ApiResponse<{ tasks: Task[] }>> => {
    const { data } = await api.get("/tasks", { params: { projectId } });
    return data;
  },
  create: async (
    taskData: Partial<Task>
  ): Promise<ApiResponse<{ task: Task }>> => {
    const { data } = await api.post("/tasks", taskData);
    return data;
  },
  update: async (
    id: string,
    taskData: Partial<Task>
  ): Promise<ApiResponse<{ task: Task }>> => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};

// Message APIs
export const messageAPI = {
  getAll: async (
    teamId: string,
    limit = 50
  ): Promise<ApiResponse<{ messages: Message[]; count: number }>> => {
    const { data } = await api.get("/messages", { params: { teamId, limit } });
    return data;
  },
  send: async (
    content: string,
    teamId: string
  ): Promise<ApiResponse<{ message: Message }>> => {
    const { data } = await api.post("/messages", { content, teamId });
    return data;
  },
};

export default api;
