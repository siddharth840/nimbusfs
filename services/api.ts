import axios, { AxiosProgressEvent } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

import type { User, UserRole } from '@/lib/types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  chunks: ChunkInfo[];
}

export interface ChunkInfo {
  id: string;
  index: number;
  nodeId: string;
  size: number;
}

export interface NodeStatus {
  id: string;
  name: string;
  status: 'online' | 'offline';
  storage: {
    used: number;
    total: number;
  };
  chunks: number;
}

export interface HealthResponse {
  status: string;
  nodes: NodeStatus[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Demo credentials for testing - admin account
    if (email === 'admin@example.com' && password === 'admin') {
      const demoResponse: LoginResponse = {
        token: 'demo-admin-token-' + Date.now(),
        user: {
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
        },
      };
      localStorage.setItem('auth_token', demoResponse.token);
      return demoResponse;
    }
    
    // Demo credentials for testing - regular user
    if (email === 'demo@example.com' && password === 'password') {
      const demoResponse: LoginResponse = {
        token: 'demo-user-token-' + Date.now(),
        user: {
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user',
        },
      };
      localStorage.setItem('auth_token', demoResponse.token);
      return demoResponse;
    }

    const response = await api.post<LoginResponse>('/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
};

// File endpoints
export const fileApi = {
  getFiles: async (): Promise<FileInfo[]> => {
    const response = await api.get<FileInfo[]>('/files');
    return response.data;
  },

  uploadFile: async (
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileInfo> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileInfo>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });
    return response.data;
  },

  downloadFile: async (fileId: string, fileName: string): Promise<void> => {
    const response = await api.get(`/download/${fileId}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },
};

// Health/Node endpoints
export const healthApi = {
  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },

  getNodes: async (): Promise<NodeStatus[]> => {
    const response = await api.get<NodeStatus[]>('/nodes');
    return response.data;
  },
};

export default api;
