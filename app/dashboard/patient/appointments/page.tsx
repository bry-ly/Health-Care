"use client";

import { useState, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { useAppointments } from "@/hooks/use-appointments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { IconCalendar, IconSearch, IconX } from "@tabler/icons-react";
import { toast } from "sonner";

/**
 * Skeleton loader for appointments page
 */
function AppointmentsSkeleton() {
  return (
    <>
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-11 w-full max-w-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-[180px]" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

export default function PatientAppointmentsPage() {
  const { data: session, isPending } = useSession();
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<
    string | null
  >(null);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(
    null
  );
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(
    null
  );
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    appointments,
    isLoading,
    updateAppointment,
    deleteAppointment,
    isUpdating,
    isDeleting,
  } = useAppointments({
    userId: session?.user?.id || "",
    role: "patient",
  });

  // Filter appointments based on search query and status
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((apt) => {
        const doctorName = apt.doctor.user.name.toLowerCase();
        const reason = apt.reason?.toLowerCase() || "";
        const dateStr = format(
          new Date(apt.appointmentDate),
          "MMM dd, yyyy"
        ).toLowerCase();
        const statusStr = apt.status.toLowerCase();

        return (
          doctorName.includes(query) ||
          reason.includes(query) ||
          dateStr.includes(query) ||
          statusStr.includes(query) ||
          apt.timeSlot.includes(query)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    return filtered;
  }, [appointments, searchQuery, statusFilter]);

  const upcomingAppointments = filteredAppointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) >= new Date() &&
      apt.status !== "CANCELLED" &&
      apt.status !== "COMPLETED"
  );

  const pastAppointments = filteredAppointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) < new Date() ||
      apt.status === "CANCELLED" ||
      apt.status === "COMPLETED"
  );

  const allUpcomingAppointments = appointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) >= new Date() &&
      apt.status !== "CANCELLED" &&
      apt.status !== "COMPLETED"
  );

  const allPastAppointments = appointments.filter(
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
        error instanceof Error
          ? error.message
          : "Failed to reschedule appointment"
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

  const handleDelete = (appointmentId: string) => {
    setDeleteAppointmentId(appointmentId);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteAppointmentId) return;

    try {
      await deleteAppointment(deleteAppointmentId);
      toast.success("Appointment deleted successfully");
      setDeleteAppointmentId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete appointment"
      );
    }
  };

  // Layout renders immediately
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

            {isPending || !session ? (
              <AppointmentsSkeleton />
            ) : (
              <>
                {/* Search and Filter Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by doctor name, date, reason, or status..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 h-11"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                      >
                        <IconX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="status-filter"
                      className="whitespace-nowrap text-sm"
                    >
                      Filter by status:
                    </Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger
                        id="status-filter"
                        className="w-[180px] h-11"
                      >
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                        <SelectItem value="MISSED">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList>
                    <TabsTrigger value="upcoming">
                      Upcoming ({allUpcomingAppointments.length})
                      {(searchQuery || statusFilter !== "all") && (
                        <span className="ml-1 text-xs">
                          ({upcomingAppointments.length} shown)
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({allPastAppointments.length})
                      {(searchQuery || statusFilter !== "all") && (
                        <span className="ml-1 text-xs">
                          ({pastAppointments.length} shown)
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4">
                    {isLoading ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-36 w-full" />
                        ))}
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
                            appointmentDate={
                              new Date(appointment.appointmentDate)
                            }
                            timeSlot={appointment.timeSlot}
                            status={appointment.status}
                            reason={appointment.reason}
                            onReschedule={handleReschedule}
                            onCancel={handleCancel}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
                    {isLoading ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-36 w-full" />
                        ))}
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
                            appointmentDate={
                              new Date(appointment.appointmentDate)
                            }
                            timeSlot={appointment.timeSlot}
                            status={appointment.status}
                            reason={appointment.reason}
                            showActions={true}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}

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

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={!!deleteAppointmentId}
              onOpenChange={(open) => {
                if (!open) {
                  setDeleteAppointmentId(null);
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Appointment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to permanently delete this
                    appointment? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteAppointmentId(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSubmit}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
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
