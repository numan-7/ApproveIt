'use client';

import { useZoom } from '@/context/ZoomContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Video, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { isConnected, connect, disconnect } = useZoom();

  return (
    <div className="container max-w-2xl mx-auto py-8 font-dm">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user?.user_metadata?.avatar_url}
                alt="Profile picture"
              />
            </Avatar>
            <div>
              <p className="text-lg font-semibold">
                {user?.user_metadata?.full_name || 'Your Name'}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            To update your profile picture, name, or email, please use the
            Google sign-in options. These details are managed through your
            Google account.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Manage your connected services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Video className="h-8 w-8 text-[#2D8CFF]" />
              <div>
                <h3 className="font-semibold">Zoom</h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected to Zoom' : 'Not connected'}
                </p>
              </div>
            </div>
            {isConnected ? (
              <Button
                onClick={disconnect}
                variant="outline"
                className="bg-[#2D8CFF] text-white hover:bg-[#2681F2] hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connect}
                variant="outline"
                className="bg-[#2D8CFF] text-white hover:bg-[#2681F2] hover:text-white"
              >
                <Video className="mr-2 h-4 w-4" />
                Connect Zoom
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
