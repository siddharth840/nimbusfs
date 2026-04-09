'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminFile {
  id: string;
  name: string;
  size: number;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  chunks: number;
  nodes: string[];
}

// Mock data for all files across all users
const mockAdminFiles: AdminFile[] = [
  {
    id: '1',
    name: 'project_report.pdf',
    size: 2.5 * 1024 * 1024,
    owner: { id: '1', name: 'John Doe', email: 'john@example.com' },
    uploadedAt: '2024-01-15T10:30:00Z',
    chunks: 3,
    nodes: ['node1', 'node2', 'node3'],
  },
  {
    id: '2',
    name: 'database_backup.sql',
    size: 150 * 1024 * 1024,
    owner: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    uploadedAt: '2024-01-14T16:45:00Z',
    chunks: 8,
    nodes: ['node1', 'node2'],
  },
  {
    id: '3',
    name: 'company_logo.png',
    size: 500 * 1024,
    owner: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
    uploadedAt: '2024-01-14T09:00:00Z',
    chunks: 1,
    nodes: ['node1', 'node3'],
  },
  {
    id: '4',
    name: 'financial_data.xlsx',
    size: 8.2 * 1024 * 1024,
    owner: { id: '1', name: 'John Doe', email: 'john@example.com' },
    uploadedAt: '2024-01-13T14:20:00Z',
    chunks: 4,
    nodes: ['node2', 'node3'],
  },
  {
    id: '5',
    name: 'presentation.pptx',
    size: 25 * 1024 * 1024,
    owner: { id: '4', name: 'Alice Brown', email: 'alice@example.com' },
    uploadedAt: '2024-01-12T11:15:00Z',
    chunks: 5,
    nodes: ['node1', 'node2', 'node3'],
  },
  {
    id: '6',
    name: 'video_tutorial.mp4',
    size: 500 * 1024 * 1024,
    owner: { id: '5', name: 'Charlie Davis', email: 'charlie@example.com' },
    uploadedAt: '2024-01-11T16:00:00Z',
    chunks: 12,
    nodes: ['node1', 'node2'],
  },
  {
    id: '7',
    name: 'source_code.zip',
    size: 45 * 1024 * 1024,
    owner: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    uploadedAt: '2024-01-10T08:30:00Z',
    chunks: 6,
    nodes: ['node2', 'node3'],
  },
  {
    id: '8',
    name: 'analytics_export.csv',
    size: 12 * 1024 * 1024,
    owner: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
    uploadedAt: '2024-01-09T13:45:00Z',
    chunks: 3,
    nodes: ['node1', 'node3'],
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminFilesContent() {
  const [files, setFiles] = useState<AdminFile[]>(mockAdminFiles);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const uniqueOwners = Array.from(new Set(files.map(f => f.owner.email)));

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = ownerFilter === 'all' || file.owner.email === ownerFilter;
    return matchesSearch && matchesOwner;
  });

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleDeleteSelected = () => {
    setFiles(files.filter(f => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-sm text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
            <p className="text-sm text-muted-foreground">Total Size</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{uniqueOwners.length}</div>
            <p className="text-sm text-muted-foreground">Unique Owners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{files.reduce((acc, f) => acc + f.chunks, 0)}</div>
            <p className="text-sm text-muted-foreground">Total Chunks</p>
          </CardContent>
        </Card>
      </div>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Files</CardTitle>
                <CardDescription>View and manage files from all users</CardDescription>
              </div>
              {selectedFiles.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  Delete Selected ({selectedFiles.size})
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search files or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-secondary"
              />
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="px-3 py-2 rounded-md bg-secondary border border-border text-sm"
              >
                <option value="all">All Owners</option>
                {uniqueOwners.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">File Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Chunks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nodes</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Uploaded</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <FileIcon name={file.name} />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium">{file.owner.name}</p>
                        <p className="text-xs text-muted-foreground">{file.owner.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{formatBytes(file.size)}</td>
                    <td className="py-3 px-4 text-sm">{file.chunks}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {file.nodes.map((node) => (
                          <span
                            key={node}
                            className="px-1.5 py-0.5 text-xs rounded bg-status-online/20 text-status-online"
                          >
                            {node}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive hover:text-destructive"
                          onClick={() => {
                            setFiles(files.filter(f => f.id !== file.id));
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No files found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  let color = 'text-muted-foreground';
  
  if (['pdf'].includes(ext || '')) color = 'text-red-500';
  else if (['doc', 'docx'].includes(ext || '')) color = 'text-blue-500';
  else if (['xls', 'xlsx', 'csv'].includes(ext || '')) color = 'text-green-500';
  else if (['ppt', 'pptx'].includes(ext || '')) color = 'text-orange-500';
  else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) color = 'text-purple-500';
  else if (['mp4', 'mov', 'avi'].includes(ext || '')) color = 'text-pink-500';
  else if (['zip', 'rar', '7z'].includes(ext || '')) color = 'text-yellow-500';
  else if (['sql', 'js', 'ts', 'py'].includes(ext || '')) color = 'text-cyan-500';
  
  return (
    <div className={`w-4 h-4 ${color}`}>
      <div className="w-full h-full border-2 border-current rounded-sm relative">
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-card border-l border-b border-current" />
      </div>
    </div>
  );
}
