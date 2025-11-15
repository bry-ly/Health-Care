"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppointments } from "@/hooks/use-appointments";
import { format } from "date-fns";
import { IconCalendar, IconClock, IconUser, IconStethoscope, IconCheck, IconX } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AdminAppointmentsPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [suggestDate, setSuggestDate] = useState<Date | null>(null);
  const [suggestTime, setSuggestTime] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const { appointments, isLoading, updateAppointment, isUpdating } = useAppointments({
    userId: session?.user?.id || "",
    role: "admin",
  });

  const filteredAppointments = statusFilter === "all"
    ? appointments
    : appointments.filter((apt) => apt.status === statusFilter);

  const handleAccept = async (appointmentId: string) => {
    try {
      await updateAppointment({
        appointmentId,
        status: "CONFIRMED",
      });
      toast.success("Appointment confirmed");
    } catch {
      toast.error("Failed to confirm appointment");
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await updateAppointment({
        appointmentId,
        status: "CANCELLED",
      });
      toast.success("Appointment rejected");
    } catch {
      toast.error("Failed to reject appointment");
    }
  };

  const handleSuggestTime = (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      setSelectedDoctorId(appointment.doctorId);
      setSelectedAppointment(appointmentId);
    }
  };

  const handleSuggestTimeSubmit = async () => {
    if (!selectedAppointment || !suggestDate || !suggestTime) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      await updateAppointment({
        appointmentId: selectedAppointment,
        appointmentDate: suggestDate.toISOString(),
        timeSlot: suggestTime,
        status: "RESCHEDULED",
      });

      toast.success("Alternative time suggested");
      setSelectedAppointment(null);
      setSuggestDate(null);
      setSuggestTime("");
      setSelectedDoctorId("");
    } catch {
      toast.error("Failed to suggest alternative time");
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
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Appointment Management</h1>
                <p className="text-muted-foreground">
                  Manage all appointments in the system
                </p>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="MISSED">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Appointments ({filteredAppointments.length})</CardTitle>
                <CardDescription>
                  View and manage appointments across the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <IconUser className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold">
                                    {appointment.patient.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <IconStethoscope className="h-4 w-4" />
                                  <span>{appointment.doctor.user.name}</span>
                                  <span className="mx-2">•</span>
                                  <span>{appointment.doctor.specialization}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <IconCalendar className="h-4 w-4" />
                                  <span>
                                    {format(new Date(appointment.appointmentDate), "EEEE, MMMM d, yyyy")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <IconClock className="h-4 w-4" />
                                  <span>{appointment.timeSlot}</span>
                                </div>
                                {appointment.reason && (
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.reason}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={
                                  appointment.status === "CONFIRMED"
                                    ? "default"
                                    : appointment.status === "COMPLETED"
                                    ? "secondary"
                                    : appointment.status === "CANCELLED"
                                    ? "destructive"
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
                                  onClick={() => handleAccept(appointment.id)}
                                  disabled={isUpdating}
                                >
                                  <IconCheck className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(appointment.id)}
                                  disabled={isUpdating}
                                >
                                  <IconX className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuggestTime(appointment.id)}
                                  disabled={isUpdating}
                                >
                                  Suggest Time
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggest Time Dialog */}
            <Dialog
              open={!!selectedAppointment}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedAppointment(null);
                  setSuggestDate(null);
                  setSuggestTime("");
                  setSelectedDoctorId("");
                }
              }}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Suggest Alternative Time</DialogTitle>
                  <DialogDescription>
                    Select an alternative date and time for this appointment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label>Suggested Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <IconCalendar className="mr-2 h-4 w-4" />
                          {suggestDate ? (
                            format(suggestDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={suggestDate || undefined}
                          onSelect={(date) => {
                            setSuggestDate(date || null);
                            setSuggestTime("");
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {suggestDate && selectedDoctorId && (
                    <TimeSlotPicker
                      doctorId={selectedDoctorId}
                      date={suggestDate}
                      selectedTime={suggestTime}
                      onTimeSelect={setSuggestTime}
                    />
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAppointment(null);
                      setSuggestDate(null);
                      setSuggestTime("");
                      setSelectedDoctorId("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSuggestTimeSubmit}
                    disabled={!suggestDate || !suggestTime || isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Suggest Time"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

