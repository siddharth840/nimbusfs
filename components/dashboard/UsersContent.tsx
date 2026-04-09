'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ManagedUser, UserRole } from '@/lib/types';

// Mock data for demonstration
const mockUsers: ManagedUser[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    storageUsed: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
    filesCount: 48,
    lastActive: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'user',
    storageUsed: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
    filesCount: 23,
    lastActive: '2024-01-14T16:45:00Z',
    createdAt: '2023-08-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'bob@example.com',
    name: 'Bob Wilson',
    role: 'admin',
    storageUsed: 4.8 * 1024 * 1024 * 1024, // 4.8 GB
    filesCount: 156,
    lastActive: '2024-01-15T09:00:00Z',
    createdAt: '2023-03-10T00:00:00Z',
  },
  {
    id: '4',
    email: 'alice@example.com',
    name: 'Alice Brown',
    role: 'user',
    storageUsed: 0.8 * 1024 * 1024 * 1024, // 0.8 GB
    filesCount: 12,
    lastActive: '2024-01-13T14:20:00Z',
    createdAt: '2023-11-20T00:00:00Z',
  },
  {
    id: '5',
    email: 'charlie@example.com',
    name: 'Charlie Davis',
    role: 'user',
    storageUsed: 3.1 * 1024 * 1024 * 1024, // 3.1 GB
    filesCount: 87,
    lastActive: '2024-01-15T11:15:00Z',
    createdAt: '2023-07-05T00:00:00Z',
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

export function UsersContent() {
  const [users, setUsers] = useState<ManagedUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStorage = users.reduce((acc, user) => acc + user.storageUsed, 0);
  const totalFiles = users.reduce((acc, user) => acc + user.filesCount, 0);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
            <p className="text-sm text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatBytes(totalStorage)}</div>
            <p className="text-sm text-muted-foreground">Total Storage Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-sm text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </div>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-secondary"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Storage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Files</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{formatBytes(user.storageUsed)}</td>
                    <td className="py-3 px-4 text-sm">{user.filesCount}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatRelativeTime(user.lastActive)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="text-xs"
                        >
                          Manage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Manage User</CardTitle>
              <CardDescription>{selectedUser.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Storage Used</p>
                  <p className="font-medium">{formatBytes(selectedUser.storageUsed)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Files</p>
                  <p className="font-medium">{selectedUser.filesCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-sm font-medium">Change Role</p>
                <div className="flex gap-2">
                  <Button
                    variant={selectedUser.role === 'user' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRoleChange(selectedUser.id, 'user')}
                    className="flex-1"
                  >
                    User
                  </Button>
                  <Button
                    variant={selectedUser.role === 'admin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                    className="flex-1"
                  >
                    Admin
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-1"
                >
                  Delete User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
