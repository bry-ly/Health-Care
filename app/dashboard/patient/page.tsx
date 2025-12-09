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
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { PatientAssistant } from "@/components/dashboard/patient/patient-assistant";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconStethoscope,
} from "@tabler/icons-react";

/**
 * Skeleton loader for dashboard content
 */
function DashboardSkeleton() {
  return (
    <>
      {/* Welcome Section Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/**
 * Appointments list with loading state
 */
function RecentAppointments({ userId }: { userId: string }) {
  const { appointments, isLoading } = useAppointments({
    userId,
    role: "patient",
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No appointments yet. Book your first appointment!
      </div>
    );
  }

  return (
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
  );
}

export default function PatientDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const { appointments } = useAppointments({
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

  // Layout renders immediately with skeleton
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
            {isPending || !session ? (
              <DashboardSkeleton />
            ) : (
              <>
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
                      <div className="text-2xl font-bold">
                        {upcomingAppointments.length}
                      </div>
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
                      <p className="text-xs text-muted-foreground">
                        Saved doctors
                      </p>
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
                        {session.user.emailVerified
                          ? "Verified"
                          : "Not verified"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
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

                  <PatientAssistant compact />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>
                      Your latest appointment history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentAppointments userId={session.user.id} />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
