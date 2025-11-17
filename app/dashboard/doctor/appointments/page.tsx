"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/doctor/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { useAppointments } from "@/hooks/use-appointments";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppointmentStatus } from "@prisma/client";
import { format } from "date-fns";

export default function DoctorAppointmentsPage() {
  const { data: session } = useSession();
  const [doctorId, setDoctorId] = useState<string>("");

  const { appointments, isLoading, updateAppointment, deleteAppointment, isUpdating, isDeleting } = useAppointments({
    userId: session?.user?.id || "",
    role: "doctor",
  });

  // Fetch doctor profile to get doctorId
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/doctors?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.doctors && data.doctors.length > 0) {
            setDoctorId(data.doctors[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      }
    };

    fetchDoctorProfile();
  }, [session?.user?.id]);

  // Filter appointments where this doctor was selected by the user
  const myAppointments = appointments.filter(
    (apt) => apt.doctorId === doctorId
  );

  const pendingAppointments = myAppointments.filter(
    (apt) => apt.status === "PENDING"
  );

  const upcomingAppointments = myAppointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) >= new Date() &&
      apt.status !== "CANCELLED" &&
      apt.status !== "COMPLETED" &&
      apt.status !== "PENDING"
  );

  const pastAppointments = myAppointments.filter(
    (apt) =>
      new Date(apt.appointmentDate) < new Date() ||
      apt.status === "CANCELLED" ||
      apt.status === "COMPLETED"
  );

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment({
        appointmentId,
        status: "CONFIRMED",
      });
      toast.success("Appointment accepted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept appointment"
      );
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment({
        appointmentId,
        status: "CANCELLED",
        cancelReason: "Rejected by doctor",
      });
      toast.success("Appointment rejected");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject appointment"
      );
    }
  };

  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null);

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

            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastAppointments.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : pendingAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground">No pending appointments</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Appointments that patients have booked will appear here for your acceptance.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {pendingAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        id={appointment.id}
                        doctorName={appointment.patient.name}
                        appointmentDate={new Date(appointment.appointmentDate)}
                        timeSlot={appointment.timeSlot}
                        status={appointment.status}
                        reason={appointment.reason}
                        symptoms={appointment.symptoms}
                        appointmentType={appointment.appointmentType}
                        urgencyLevel={appointment.urgencyLevel}
                        duration={appointment.duration}
                        patientPhone={appointment.patientPhone}
                        patientEmail={appointment.patientEmail}
                        insuranceProvider={appointment.insuranceProvider}
                        insurancePolicyNumber={appointment.insurancePolicyNumber}
                        emergencyContactName={appointment.emergencyContactName}
                        emergencyContactPhone={appointment.emergencyContactPhone}
                        isFollowUp={appointment.isFollowUp}
                        showActions={true}
                        onAccept={() => handleAcceptAppointment(appointment.id)}
                        onReject={() => handleRejectAppointment(appointment.id)}
                        isDoctorView={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
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
                        doctorName={appointment.patient.name}
                        appointmentDate={new Date(appointment.appointmentDate)}
                        timeSlot={appointment.timeSlot}
                        status={appointment.status}
                        reason={appointment.reason}
                        symptoms={appointment.symptoms}
                        appointmentType={appointment.appointmentType}
                        urgencyLevel={appointment.urgencyLevel}
                        duration={appointment.duration}
                        patientPhone={appointment.patientPhone}
                        patientEmail={appointment.patientEmail}
                        insuranceProvider={appointment.insuranceProvider}
                        insurancePolicyNumber={appointment.insurancePolicyNumber}
                        emergencyContactName={appointment.emergencyContactName}
                        emergencyContactPhone={appointment.emergencyContactPhone}
                        isFollowUp={appointment.isFollowUp}
                        showActions={true}
                        onDelete={handleDelete}
                        isDoctorView={true}
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
                        doctorName={appointment.patient.name}
                        appointmentDate={new Date(appointment.appointmentDate)}
                        timeSlot={appointment.timeSlot}
                        status={appointment.status}
                        reason={appointment.reason}
                        symptoms={appointment.symptoms}
                        appointmentType={appointment.appointmentType}
                        urgencyLevel={appointment.urgencyLevel}
                        duration={appointment.duration}
                        patientPhone={appointment.patientPhone}
                        patientEmail={appointment.patientEmail}
                        insuranceProvider={appointment.insuranceProvider}
                        insurancePolicyNumber={appointment.insurancePolicyNumber}
                        emergencyContactName={appointment.emergencyContactName}
                        emergencyContactPhone={appointment.emergencyContactPhone}
                        isFollowUp={appointment.isFollowUp}
                        showActions={true}
                        onDelete={handleDelete}
                        isDoctorView={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

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
                    Are you sure you want to permanently delete this appointment? This action cannot be undone.
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

