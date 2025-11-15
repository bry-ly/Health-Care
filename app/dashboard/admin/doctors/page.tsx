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
import { IconStethoscope } from "@tabler/icons-react";

interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  appointmentCount?: number;
}

export default function AdminDoctorsPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/doctors");
      if (response.ok) {
        const data = await response.json();
        const doctorsList = data.doctors || [];
        
        // Fetch appointment counts for each doctor
        const doctorsWithCounts = await Promise.all(
          doctorsList.map(async (doctor: Doctor) => {
            try {
              const aptResponse = await fetch(`/api/appointments?userId=${doctor.userId}&role=doctor`);
              if (aptResponse.ok) {
                const aptData = await aptResponse.json();
                return { ...doctor, appointmentCount: aptData.appointments?.length || 0 };
              }
            } catch {
              // Ignore errors
            }
            return { ...doctor, appointmentCount: 0 };
          })
        );
        
        setDoctors(doctorsWithCounts);
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
              <h1 className="text-3xl font-bold">Doctors</h1>
              <p className="text-muted-foreground">
                Manage and view all doctor profiles
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Doctors ({doctors.length})</CardTitle>
                <CardDescription>
                  Complete list of registered doctors in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <IconStethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No doctors found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>License Number</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Appointments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">{doctor.user.name}</TableCell>
                          <TableCell>{doctor.user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doctor.specialization}</Badge>
                          </TableCell>
                          <TableCell>{doctor.licenseNumber}</TableCell>
                          <TableCell>{doctor.user.phone || "N/A"}</TableCell>
                          <TableCell>{doctor.appointmentCount || 0}</TableCell>
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

