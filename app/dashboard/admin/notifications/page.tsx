"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { IconBell } from "@tabler/icons-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  emailSent: boolean;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch all notifications - we'll need to create an admin endpoint or fetch from all users
      // For now, we'll show a message that this requires backend support
      setNotifications([]);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                View and manage all system notifications
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>
                  System-wide notification history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <IconBell className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No notifications found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Notification history will appear here once backend support is added
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Email Sent</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <Badge variant="outline">{notification.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{notification.title}</TableCell>
                          <TableCell>{notification.message}</TableCell>
                          <TableCell>{notification.user.name}</TableCell>
                          <TableCell>
                            <Badge variant={notification.emailSent ? "default" : "secondary"}>
                              {notification.emailSent ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

