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

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  appointmentCount?: number;
}

export default function AdminPatientsPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        const patientUsers = (data.users || []).filter(
          (user: { role: string }) => user.role === "PATIENT"
        );
        
        // Fetch appointment counts for each patient
        const patientsWithCounts = await Promise.all(
          patientUsers.map(async (user: Patient) => {
            try {
              const aptResponse = await fetch(`/api/appointments?userId=${user.id}&role=patient`);
              if (aptResponse.ok) {
                const aptData = await aptResponse.json();
                return { ...user, appointmentCount: aptData.appointments?.length || 0 };
              }
            } catch {
              // Ignore errors
            }
            return { ...user, appointmentCount: 0 };
          })
        );
        
        setPatients(patientsWithCounts);
      }
    } catch {
      // Error handled by toast if needed
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
              <h1 className="text-3xl font-bold">Patients</h1>
              <p className="text-muted-foreground">
                Manage and view all patient accounts
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Patients ({patients.length})</CardTitle>
                <CardDescription>
                  Complete list of registered patients in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : patients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <IconUser className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No patients found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>{patient.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={patient.emailVerified ? "default" : "secondary"}>
                              {patient.emailVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>{patient.appointmentCount || 0}</TableCell>
                          <TableCell>
                            {format(new Date(patient.createdAt), "MMM dd, yyyy")}
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

