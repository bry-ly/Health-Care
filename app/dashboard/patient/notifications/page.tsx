"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  read: boolean;
  createdAt: Date;
}

export default function PatientNotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch {
      // Error handled
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">
                  View and manage your notifications
                </p>
              </div>
              {unreadCount > 0 && (
                <Badge variant="default">{unreadCount} unread</Badge>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Notifications ({notifications.length})</CardTitle>
                <CardDescription>
                  Your appointment and system notifications
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
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                          !notification.read
                            ? "bg-muted/50 border-primary/20"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{notification.title}</p>
                            {!notification.read && (
                              <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}</span>
                            {notification.emailSent && (
                              <Badge variant="outline" className="text-xs">Email sent</Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {notification.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

