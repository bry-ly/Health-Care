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
import { IconUser } from "@tabler/icons-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  phone?: string | null;
  createdAt: Date;
}

export default function AdminStaffPage() {
  const { data: session } = useSession();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        const staffUsers = (data.users || []).filter(
          (user: { role: string }) => user.role === "ADMIN"
        );
        setStaff(staffUsers);
      }
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
              <h1 className="text-3xl font-bold">Staff</h1>
              <p className="text-muted-foreground">
                Manage and view all administrative staff
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Staff ({staff.length})</CardTitle>
                <CardDescription>
                  Complete list of administrative staff members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : staff.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <IconUser className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No staff members found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={member.emailVerified ? "default" : "secondary"}>
                              {member.emailVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{member.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(member.createdAt), "MMM dd, yyyy")}
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

