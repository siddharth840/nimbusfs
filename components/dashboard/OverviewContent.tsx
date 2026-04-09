'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NodeStatusPanel } from '@/components/nodes/NodeStatusPanel';
import { DistributionView } from '@/components/distribution/DistributionView';
import type { NodeStatus, FileInfo } from '@/lib/types';

// Mock data for demonstration
const mockNodes: NodeStatus[] = [
  { id: '1', name: 'node1', status: 'online', storage: { used: 2.4, total: 10 }, chunks: 45 },
  { id: '2', name: 'node2', status: 'online', storage: { used: 3.1, total: 10 }, chunks: 52 },
  { id: '3', name: 'node3', status: 'offline', storage: { used: 1.8, total: 10 }, chunks: 38 },
];

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
];

export function OverviewContent() {
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNodes(mockNodes);
      setFiles(mockFiles);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const totalStorage = nodes.reduce((acc, node) => acc + node.storage.total, 0);
  const usedStorage = nodes.reduce((acc, node) => acc + node.storage.used, 0);
  const onlineNodes = nodes.filter((node) => node.status === 'online').length;
  const totalChunks = nodes.reduce((acc, node) => acc + node.chunks, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Files"
          value={files.length.toString()}
          subtitle="Across all nodes"
        />
        <StatCard
          title="Storage Used"
          value={`${usedStorage.toFixed(1)} GB`}
          subtitle={`of ${totalStorage} GB total`}
        />
        <StatCard
          title="Active Nodes"
          value={`${onlineNodes}/${nodes.length}`}
          subtitle={onlineNodes === nodes.length ? 'All systems operational' : 'Some nodes offline'}
          status={onlineNodes === nodes.length ? 'online' : 'warning'}
        />
        <StatCard
          title="Total Chunks"
          value={totalChunks.toString()}
          subtitle="Distributed across nodes"
        />
      </div>

      {/* Node Status */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Node Status</CardTitle>
        </CardHeader>
        <CardContent>
          <NodeStatusPanel nodes={nodes} />
        </CardContent>
      </Card>

      {/* Recent File Distribution */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Recent File Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <DistributionView files={files} nodes={nodes} />
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  status?: 'online' | 'offline' | 'warning';
}

function StatCard({ title, value, subtitle, status }: StatCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-semibold">{value}</p>
          {status && (
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'online'
                  ? 'bg-status-online'
                  : status === 'warning'
                  ? 'bg-status-warning'
                  : 'bg-status-offline'
              }`}
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
