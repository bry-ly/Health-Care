"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/doctor/app-sidebar";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAppointments } from "@/hooks/use-appointments";
import { IconUsers, IconSearch } from "@tabler/icons-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  appointmentCount: number;
}

export default function DoctorPatientsPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const { appointments } = useAppointments({
    userId: session?.user?.id || "",
    role: "doctor",
  });

  useEffect(() => {
    // Extract unique patients from appointments
    const patientMap = new Map<string, Patient>();
    
    appointments.forEach((apt) => {
      if (!patientMap.has(apt.patient.id)) {
        patientMap.set(apt.patient.id, {
          id: apt.patient.id,
          name: apt.patient.name,
          email: apt.patient.email,
          phone: null,
          appointmentCount: 0,
        });
      }
      const patient = patientMap.get(apt.patient.id)!;
      patient.appointmentCount++;
    });

    setPatients(Array.from(patientMap.values()));
    setLoading(false);
  }, [appointments]);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold">My Patients</h1>
              <p className="text-muted-foreground">
                View and manage your patients
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Patients ({patients.length})</CardTitle>
                <CardDescription>
                  Patients who have appointments with you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <IconUsers className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No patients found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Appointments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium">{patient.name}</TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>{patient.phone || "N/A"}</TableCell>
                          <TableCell>{patient.appointmentCount}</TableCell>
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

