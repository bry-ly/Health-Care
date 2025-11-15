"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ChartAppointments } from "@/components/dashboard/admin/chart-appointments";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useAdminStats } from "@/hooks/use-admin-stats";
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import {
  IconUsers,
  IconStethoscope,
  IconCalendar,
  IconAlertCircle,
} from "@tabler/icons-react";

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { appointments, isLoading: appointmentsLoading } = useAppointments({
    userId: session?.user?.id || "",
    role: "admin",
  });

  const recentAppointments = appointments.slice(0, 5);

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
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage appointments, doctors, staff, and patients
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Patients
                  </CardTitle>
                  <IconUsers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "-" : stats?.totalPatients || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered patients
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Doctors
                  </CardTitle>
                  <IconStethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "-" : stats?.totalDoctors || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Healthcare providers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Appointments
                  </CardTitle>
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "-" : stats?.pendingAppointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting action
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Missed Appointments
                  </CardTitle>
                  <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "-" : stats?.missedAppointments || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requires follow-up
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Chart */}
            <ChartAppointments />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  Latest appointment bookings and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : recentAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
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
