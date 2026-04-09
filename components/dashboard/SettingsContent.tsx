'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import storage from '@/lib/storage';
import type { User } from '@/lib/types';

export function SettingsContent() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const storedUser = storage.getUser();
    if (storedUser) {
      setUser(storedUser);
      setName(storedUser.name || '');
      setEmail(storedUser.email);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update local storage
    if (user) {
      const updatedUser = { ...user, name, email };
      storage.setUser(updatedUser);
      setUser(updatedUser);
    }
    
    setIsSaving(false);
    setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
    
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Profile Section */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your personal information and account details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {(name || email)?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">{name || email}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  user?.role === 'admin' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {user?.role || 'user'}
                </span>
                {user?.role === 'admin' && (
                  <span className="text-xs text-muted-foreground">Full system access</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Account Settings</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Display Name</FieldLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-secondary border-border"
            />
          </Field>

          <Field>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border"
            />
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              value="••••••••"
              disabled
              className="bg-secondary border-border"
            />
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Change Password
            </Button>
          </Field>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">API Configuration</CardTitle>
          <CardDescription>Configure the backend API endpoint</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel>API Base URL</FieldLabel>
            <Input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="bg-secondary border-border font-mono text-sm"
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Test Connection
            </Button>
            <span className="text-xs text-muted-foreground">
              Verify connectivity to your NimbusFS backend
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>Customize your dashboard experience</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Notifications</p>
              <p className="text-xs text-muted-foreground">
                Receive alerts for upload completion and node status changes
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-refresh Data</p>
              <p className="text-xs text-muted-foreground">
                Automatically refresh node status every 30 seconds
              </p>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Storage Usage</CardTitle>
          <CardDescription>Your current storage allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Used</span>
              <span className="font-medium">2.4 GB of 5 GB</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '48%' }} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>48% used</span>
              <span>2.6 GB available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete All Files</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove all your files from the system
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Delete Files
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          saveMessage.type === 'success' 
            ? 'bg-status-online/20 text-status-online border border-status-online/30' 
            : 'bg-destructive/20 text-destructive border border-destructive/30'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </div>
  );
}
