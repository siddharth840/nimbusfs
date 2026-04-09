'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeStatusPanel, NodeBox } from '@/components/nodes/NodeStatusPanel';
import type { NodeStatus } from '@/lib/types';

// Mock data for demonstration
const mockNodes: NodeStatus[] = [
  { id: '1', name: 'node1', status: 'online', storage: { used: 2.4, total: 10 }, chunks: 45 },
  { id: '2', name: 'node2', status: 'online', storage: { used: 3.1, total: 10 }, chunks: 52 },
  { id: '3', name: 'node3', status: 'offline', storage: { used: 1.8, total: 10 }, chunks: 38 },
];

export function NodesContent() {
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setNodes(mockNodes);
    setIsLoading(false);
    setLastRefresh(new Date());
  };

  const handleRefresh = () => {
    loadNodes();
  };

  const totalStorage = nodes.reduce((acc, node) => acc + node.storage.total, 0);
  const usedStorage = nodes.reduce((acc, node) => acc + node.storage.used, 0);
  const totalChunks = nodes.reduce((acc, node) => acc + node.chunks, 0);
  const onlineNodes = nodes.filter((n) => n.status === 'online').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          Refresh Status
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Nodes"
          value={nodes.length.toString()}
          subtitle={`${onlineNodes} online, ${nodes.length - onlineNodes} offline`}
        />
        <StatCard
          title="Storage Capacity"
          value={`${totalStorage} GB`}
          subtitle={`${usedStorage.toFixed(1)} GB used (${((usedStorage / totalStorage) * 100).toFixed(0)}%)`}
        />
        <StatCard
          title="Total Chunks"
          value={totalChunks.toString()}
          subtitle="Distributed across nodes"
        />
        <StatCard
          title="System Health"
          value={onlineNodes === nodes.length ? 'Healthy' : 'Degraded'}
          subtitle={onlineNodes === nodes.length ? 'All nodes operational' : 'Some nodes offline'}
          status={onlineNodes === nodes.length ? 'online' : 'warning'}
        />
      </div>

      {/* Detailed Node Status */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Node Details</CardTitle>
          <CardDescription>
            Detailed status and storage information for each node
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NodeStatusPanel nodes={nodes} />
        </CardContent>
      </Card>

      {/* Node Distribution Chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Storage Distribution</CardTitle>
          <CardDescription>
            Visual representation of storage usage across nodes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Bar Chart */}
            <div className="flex items-end gap-4 h-40">
              {nodes.map((node) => {
                const heightPercentage = (node.storage.used / node.storage.total) * 100;
                return (
                  <div key={node.id} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full h-32 bg-muted rounded-t-lg overflow-hidden">
                      <div
                        className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                          node.status === 'online' ? 'bg-primary' : 'bg-muted-foreground'
                        }`}
                        style={{ height: `${heightPercentage}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{node.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {node.storage.used.toFixed(1)} / {node.storage.total} GB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-xs text-muted-foreground">Used Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted" />
                <span className="text-xs text-muted-foreground">Available Storage</span>
              </div>
            </div>
          </div>
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
