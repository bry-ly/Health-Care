"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/doctor/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { useAppointments } from "@/hooks/use-appointments";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";

export default function DoctorAppointmentsPage() {
  const { data: session } = useSession();

  const { appointments, isLoading } = useAppointments({
    userId: session?.user?.id || "",
    role: "doctor",
  });

  const upcomingAppointments = appointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) >= new Date() &&
      apt.status !== "CANCELLED" &&
      apt.status !== "COMPLETED"
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) < new Date() ||
      apt.status === "CANCELLED" ||
      apt.status === "COMPLETED"
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
              <h1 className="text-3xl font-bold">Appointments</h1>
              <p className="text-muted-foreground">
                Manage all your appointments
              </p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastAppointments.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {upcomingAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        id={appointment.id}
                        doctorName={appointment.doctor.user.name}
                        appointmentDate={new Date(appointment.appointmentDate)}
                        timeSlot={appointment.timeSlot}
                        status={appointment.status}
                        reason={appointment.reason}
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="past" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : pastAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">No past appointments</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {pastAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        id={appointment.id}
                        doctorName={appointment.doctor.user.name}
                        appointmentDate={new Date(appointment.appointmentDate)}
                        timeSlot={appointment.timeSlot}
                        status={appointment.status}
                        reason={appointment.reason}
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

