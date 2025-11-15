"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { useAppointments } from "@/hooks/use-appointments";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { IconCalendar } from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function PatientAppointmentsPage() {
  const { data: session } = useSession();
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<string | null>(null);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const { appointments, isLoading, updateAppointment, isUpdating } = useAppointments({
    userId: session?.user?.id || "",
    role: "patient",
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

  const handleReschedule = (appointmentId: string) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (appointment) {
      setSelectedDoctorId(appointment.doctorId);
      setRescheduleDate(new Date(appointment.appointmentDate));
      setRescheduleAppointmentId(appointmentId);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleAppointmentId || !rescheduleDate || !rescheduleTime) {
      toast.error("Please select a new date and time");
      return;
    }

    try {
      await updateAppointment({
        appointmentId: rescheduleAppointmentId,
        appointmentDate: rescheduleDate.toISOString(),
        timeSlot: rescheduleTime,
        status: "RESCHEDULED",
      });

      toast.success("Appointment rescheduled successfully");
      setRescheduleAppointmentId(null);
      setRescheduleDate(null);
      setRescheduleTime("");
      setSelectedDoctorId("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reschedule appointment"
      );
    }
  };

  const handleCancel = (appointmentId: string) => {
    setCancelAppointmentId(appointmentId);
  };

  const handleCancelSubmit = async () => {
    if (!cancelAppointmentId || !cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      await updateAppointment({
        appointmentId: cancelAppointmentId,
        status: "CANCELLED",
        cancelReason: cancelReason,
      });

      toast.success("Appointment cancelled successfully");
      setCancelAppointmentId(null);
      setCancelReason("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel appointment"
      );
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
              <h1 className="text-3xl font-bold">My Appointments</h1>
              <p className="text-muted-foreground">
                Manage your upcoming and past appointments
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
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming appointments
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
                        onReschedule={handleReschedule}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : pastAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No past appointments
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

            {/* Reschedule Dialog */}
            <Dialog
              open={!!rescheduleAppointmentId}
              onOpenChange={(open) => {
                if (!open) {
                  setRescheduleAppointmentId(null);
                  setRescheduleDate(null);
                  setRescheduleTime("");
                  setSelectedDoctorId("");
                }
              }}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Reschedule Appointment</DialogTitle>
                  <DialogDescription>
                    Select a new date and time for your appointment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>New Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <IconCalendar className="mr-2 h-4 w-4" />
                          {rescheduleDate ? (
                            format(rescheduleDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={rescheduleDate || undefined}
                          onSelect={(date) => {
                            setRescheduleDate(date || null);
                            setRescheduleTime("");
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {rescheduleDate && selectedDoctorId && (
                    <TimeSlotPicker
                      doctorId={selectedDoctorId}
                      date={rescheduleDate}
                      selectedTime={rescheduleTime}
                      onTimeSelect={setRescheduleTime}
                    />
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRescheduleAppointmentId(null);
                      setRescheduleDate(null);
                      setRescheduleTime("");
                      setSelectedDoctorId("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRescheduleSubmit}
                    disabled={!rescheduleDate || !rescheduleTime || isUpdating}
                  >
                    {isUpdating ? "Rescheduling..." : "Reschedule"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog
              open={!!cancelAppointmentId}
              onOpenChange={(open) => {
                if (!open) {
                  setCancelAppointmentId(null);
                  setCancelReason("");
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Appointment</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for cancelling this appointment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancel-reason">Reason</Label>
                    <Textarea
                      id="cancel-reason"
                      placeholder="Enter reason for cancellation..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCancelAppointmentId(null);
                      setCancelReason("");
                    }}
                  >
                    Keep Appointment
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubmit}
                    disabled={!cancelReason.trim() || isUpdating}
                  >
                    {isUpdating ? "Cancelling..." : "Cancel Appointment"}
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

