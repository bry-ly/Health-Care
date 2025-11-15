"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconStethoscope,
} from "@tabler/icons-react";

export default function PatientDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const { appointments, isLoading } = useAppointments({
    userId: session?.user?.id || "",
    role: "patient",
  });

  const upcomingAppointments = appointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) >= new Date() &&
      apt.status !== "CANCELLED" &&
      apt.status !== "COMPLETED"
  );

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">
                Welcome, {session.user.name}!
              </h1>
              <p className="text-muted-foreground">
                Manage your appointments and health information
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Appointments
                  </CardTitle>
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Next appointment soon
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Appointments
                  </CardTitle>
                  <IconClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appointments.length}
                  </div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Preferred Doctors
                  </CardTitle>
                  <IconStethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Saved doctors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Profile Status
                  </CardTitle>
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {session.user.emailVerified ? "✓" : "!"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.user.emailVerified ? "Verified" : "Not verified"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Book New Appointment</CardTitle>
                  <CardDescription>
                    Choose your preferred doctor and schedule an appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push("/dashboard/patient/book-appointment")
                    }
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>View Appointments</CardTitle>
                  <CardDescription>
                    Manage your upcoming and past appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      router.push("/dashboard/patient/appointments")
                    }
                  >
                    <IconClock className="mr-2 h-4 w-4" />
                    View All Appointments
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  Your latest appointment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments yet. Book your first appointment!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment) => (
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
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
