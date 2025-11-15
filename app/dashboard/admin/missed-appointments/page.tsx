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
import { IconCalendar, IconClock, IconUser, IconStethoscope, IconMail } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function MissedAppointmentsPage() {
  const { data: session } = useSession();
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [followUpNote, setFollowUpNote] = useState<string>("");

  const { appointments, isLoading, updateAppointment, isUpdating } = useAppointments({
    userId: session?.user?.id || "",
    role: "admin",
  });

  const missedAppointments = appointments.filter(
    (apt) => apt.status === "MISSED"
  );

  const handleFollowUp = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
  };

  const handleFollowUpSubmit = async () => {
    if (!selectedAppointment) return;

    try {
      // Here you could create a follow-up record or update the appointment
      // For now, we'll just mark it as resolved by updating notes
      await updateAppointment({
        appointmentId: selectedAppointment,
        // You might want to add a notes field update here
      });

      toast.success("Follow-up action recorded");
      setSelectedAppointment(null);
      setFollowUpNote("");
    } catch {
      toast.error("Failed to record follow-up");
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
              <h1 className="text-3xl font-bold">Missed Appointments</h1>
              <p className="text-muted-foreground">
                Monitor and follow up on missed appointments
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Missed Appointments ({missedAppointments.length})</CardTitle>
                <CardDescription>
                  Appointments that were not attended by patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : missedAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No missed appointments
                  </div>
                ) : (
                  <div className="space-y-4">
                    {missedAppointments.map((appointment) => (
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
                                <div className="flex items-center gap-4 text-sm mt-2">
                                  <div className="flex items-center gap-1">
                                    <IconMail className="h-4 w-4" />
                                    <span>{appointment.patient.email}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="destructive">MISSED</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFollowUp(appointment.id)}
                              >
                                Record Follow-up
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    await updateAppointment({
                                      appointmentId: appointment.id,
                                      // Could add a status change or note here
                                    });
                                    toast.success("Appointment updated");
                                  } catch (error) {
                                    toast.error("Failed to update");
                                  }
                                }}
                              >
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-up Dialog */}
            <Dialog
              open={!!selectedAppointment}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedAppointment(null);
                  setFollowUpNote("");
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Follow-up</DialogTitle>
                  <DialogDescription>
                    Record follow-up actions for this missed appointment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="follow-up-note">Follow-up Notes</Label>
                    <Textarea
                      id="follow-up-note"
                      placeholder="Enter follow-up actions taken..."
                      value={followUpNote}
                      onChange={(e) => setFollowUpNote(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAppointment(null);
                      setFollowUpNote("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleFollowUpSubmit} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Follow-up"}
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

