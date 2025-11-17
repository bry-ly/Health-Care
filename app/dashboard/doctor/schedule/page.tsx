"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/doctor/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAppointments } from "@/hooks/use-appointments";
import { format, isSameDay } from "date-fns";
import { IconCalendar, IconClock, IconUser, IconCheck, IconX, IconMail, IconPhone, IconCreditCard, IconAlertTriangle, IconFileDescription, IconUserCheck } from "@tabler/icons-react";
import { formatTime12Hour } from "@/lib/time-utils";
import { Spinner } from "@/components/ui/spinner";
import { AppointmentStatus } from "@prisma/client";
import { toast } from "sonner";

export default function DoctorSchedulePage() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { appointments, isLoading, updateAppointment, isUpdating } = useAppointments({
    userId: session?.user?.id || "",
    role: "doctor",
  });

  const dayAppointments = appointments.filter((apt) =>
    isSameDay(new Date(apt.appointmentDate), selectedDate)
  );

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await updateAppointment({
        appointmentId,
        status,
      });
      toast.success(`Appointment ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update appointment status");
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
              <h1 className="text-3xl font-bold">Daily Schedule</h1>
              <p className="text-muted-foreground">
                View and manage your appointments
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>Choose a date to view appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <IconCalendar className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => setSelectedDate(date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointments for {format(selectedDate, "EEEE, MMMM d")}</CardTitle>
                  <CardDescription>
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : dayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No appointments scheduled for this date
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dayAppointments
                        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <IconUser className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-semibold">
                                        {appointment.patient.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <IconClock className="h-4 w-4" />
                                      <span>{formatTime12Hour(appointment.timeSlot)}</span>
                                      {appointment.duration && (
                                        <>
                                          <span className="mx-2">•</span>
                                          <span>{appointment.duration} minutes</span>
                                        </>
                                      )}
                                    </div>
                                    {(appointment.appointmentType || appointment.urgencyLevel || appointment.isFollowUp) && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                        {appointment.appointmentType && (
                                          <>
                                            <IconFileDescription className="h-4 w-4" />
                                            <span className="capitalize text-xs">{appointment.appointmentType.toLowerCase().replace("_", "-")}</span>
                                          </>
                                        )}
                                        {appointment.urgencyLevel && (
                                          <>
                                            <span className="mx-1">•</span>
                                            <IconAlertTriangle className={`h-4 w-4 ${
                                              appointment.urgencyLevel === "EMERGENCY" ? "text-red-500" :
                                              appointment.urgencyLevel === "URGENT" ? "text-orange-500" :
                                              "text-blue-500"
                                            }`} />
                                            <span className="capitalize text-xs">{appointment.urgencyLevel.toLowerCase()}</span>
                                          </>
                                        )}
                                        {appointment.isFollowUp && (
                                          <>
                                            <span className="mx-1">•</span>
                                            <IconUserCheck className="h-4 w-4" />
                                            <span className="text-xs">Follow-up</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                    {(appointment.patientPhone || appointment.patientEmail) && (
                                      <div className="flex flex-col gap-1 pt-1 border-t">
                                        {appointment.patientPhone && (
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <IconPhone className="h-4 w-4" />
                                            <span>{appointment.patientPhone}</span>
                                          </div>
                                        )}
                                        {appointment.patientEmail && (
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <IconMail className="h-4 w-4" />
                                            <span>{appointment.patientEmail}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {appointment.reason && (
                                      <div className="pt-1">
                                        <p className="text-xs font-medium text-foreground mb-1">Reason:</p>
                                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                                      </div>
                                    )}
                                    {appointment.symptoms && (
                                      <div className="pt-1 border-t">
                                        <p className="text-xs font-medium text-foreground mb-1">Symptoms:</p>
                                        <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                                      </div>
                                    )}
                                    {(appointment.insuranceProvider || appointment.insurancePolicyNumber) && (
                                      <div className="flex flex-col gap-1 pt-1 border-t">
                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                          <IconCreditCard className="h-4 w-4" />
                                          <span>Insurance</span>
                                        </div>
                                        {appointment.insuranceProvider && (
                                          <p className="text-sm text-muted-foreground ml-6">
                                            {appointment.insuranceProvider}
                                          </p>
                                        )}
                                        {appointment.insurancePolicyNumber && (
                                          <p className="text-sm text-muted-foreground ml-6">
                                            Policy: {appointment.insurancePolicyNumber}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    {(appointment.emergencyContactName || appointment.emergencyContactPhone) && (
                                      <div className="flex flex-col gap-1 pt-1 border-t">
                                        <p className="text-xs font-medium text-foreground">Emergency Contact:</p>
                                        {appointment.emergencyContactName && (
                                          <p className="text-sm text-muted-foreground ml-4">
                                            {appointment.emergencyContactName}
                                          </p>
                                        )}
                                        {appointment.emergencyContactPhone && (
                                          <p className="text-sm text-muted-foreground ml-4">
                                            {appointment.emergencyContactPhone}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <Badge
                                    variant={
                                      appointment.status === "CONFIRMED"
                                        ? "default"
                                        : appointment.status === "COMPLETED"
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {appointment.status}
                                  </Badge>
                                </div>
                                {appointment.status === "PENDING" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleStatusChange(appointment.id, "CONFIRMED")
                                      }
                                      disabled={isUpdating}
                                    >
                                      <IconCheck className="h-4 w-4 mr-1" />
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleStatusChange(appointment.id, "CANCELLED")
                                      }
                                      disabled={isUpdating}
                                    >
                                      <IconX className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                                {appointment.status === "CONFIRMED" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusChange(appointment.id, "COMPLETED")
                                    }
                                    disabled={isUpdating}
                                  >
                                    Mark as Completed
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

