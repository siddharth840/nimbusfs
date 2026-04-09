'use client';

import { useState, useEffect } from 'react';
import { FileList } from '@/components/files/FileList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { FileInfo } from '@/lib/types';

// Mock data for demonstration
const mockFiles: FileInfo[] = [
  {
    id: '1',
    name: 'report.pdf',
    size: 2500000,
    uploadedAt: '2026-04-08T10:30:00Z',
    chunks: [
      { id: 'c1', index: 0, nodeId: '1', size: 850000 },
      { id: 'c2', index: 1, nodeId: '2', size: 850000 },
      { id: 'c3', index: 2, nodeId: '3', size: 800000 },
    ],
  },
  {
    id: '2',
    name: 'data.csv',
    size: 1200000,
    uploadedAt: '2026-04-09T14:15:00Z',
    chunks: [
      { id: 'c4', index: 0, nodeId: '2', size: 600000 },
      { id: 'c5', index: 1, nodeId: '1', size: 600000 },
    ],
  },
  {
    id: '3',
    name: 'image-backup.zip',
    size: 45000000,
    uploadedAt: '2026-04-07T09:00:00Z',
    chunks: [
      { id: 'c6', index: 0, nodeId: '1', size: 15000000 },
      { id: 'c7', index: 1, nodeId: '2', size: 15000000 },
      { id: 'c8', index: 2, nodeId: '3', size: 15000000 },
    ],
  },
  {
    id: '4',
    name: 'config.json',
    size: 4500,
    uploadedAt: '2026-04-10T08:45:00Z',
    chunks: [
      { id: 'c9', index: 0, nodeId: '2', size: 4500 },
    ],
  },
  {
    id: '5',
    name: 'database-dump.sql',
    size: 120000000,
    uploadedAt: '2026-04-05T22:30:00Z',
    chunks: [
      { id: 'c10', index: 0, nodeId: '1', size: 40000000 },
      { id: 'c11', index: 1, nodeId: '2', size: 40000000 },
      { id: 'c12', index: 2, nodeId: '3', size: 40000000 },
    ],
  },
];

export function FilesContent() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadFiles = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFiles(mockFiles);
      setFilteredFiles(mockFiles);
      setIsLoading(false);
    };
    loadFiles();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files);
    }
  }, [searchQuery, files]);

  const handleDownload = async (file: FileInfo) => {
    // In real app, would call fileApi.downloadFile
    console.log('Downloading:', file.name);
    alert(`Download started for: ${file.name}`);
  };

  const handleDelete = async (file: FileInfo) => {
    // In real app, would call fileApi.deleteFile
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        <Button variant="outline" onClick={() => setSearchQuery('')}>
          Clear
        </Button>
      </div>

      {/* File List */}
      <FileList
        files={filteredFiles}
        isLoading={isLoading}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
}
