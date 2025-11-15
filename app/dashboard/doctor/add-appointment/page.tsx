"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/doctor/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { IconCalendar } from "@tabler/icons-react";
import { useAppointments } from "@/hooks/use-appointments";

export default function DoctorAddAppointmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileCheckAttempts, setProfileCheckAttempts] = useState(0);
  const hasShownAccessDenied = useRef(false);
  const hasShownProfileToast = useRef<string | null>(null);

  const userRole = (session?.user as any)?.role as string | undefined;
  const { createAppointment, isCreating } = useAppointments({
    userId: session?.user?.id || "",
    role: userRole === "ADMIN" ? "admin" : "doctor",
  });

  useEffect(() => {
    // Check if user has permission (DOCTOR or ADMIN)
    if (!session?.user) return;
    
    const currentUserRole = (session.user as any)?.role as string | undefined;
    
    if (currentUserRole !== "DOCTOR" && currentUserRole !== "ADMIN") {
      if (!hasShownAccessDenied.current) {
        hasShownAccessDenied.current = true;
        toast.error("Access denied. Only doctors and admins can create appointments.");
        router.push("/dashboard");
      }
      return;
    }

    const fetchDoctorProfile = async () => {
      if (!session.user.id) {
        setIsLoadingProfile(false);
        return;
      }
      
      // Reset toast flags when user changes
      const currentUserId = session.user.id;
      if (hasShownProfileToast.current !== currentUserId) {
        hasShownProfileToast.current = null;
      }
      
      setIsLoadingProfile(true);
      
      // For doctors, fetch their own profile
      if (currentUserRole === "DOCTOR") {
        try {
          const response = await fetch(`/api/doctors?userId=${session.user.id}`, {
            cache: "no-store", // Always fetch fresh data
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Doctor profile fetch response:", data);
            
            if (data.doctors && data.doctors.length > 0) {
              const doctor = data.doctors[0];
              console.log("Found doctor profile:", doctor.id);
              setDoctorId(doctor.id);
              if (hasShownProfileToast.current !== "success") {
                hasShownProfileToast.current = "success";
                toast.success("Doctor profile loaded successfully");
              }
            } else {
              // Profile doesn't exist
              console.warn("Doctor profile not found for userId:", session.user.id);
              setDoctorId(""); // Explicitly clear doctorId
              if (hasShownProfileToast.current !== "warning") {
                hasShownProfileToast.current = "warning";
                toast.warning("Doctor profile not found. Please complete your profile.");
              }
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Error loading doctor profile:", errorData.error);
            setDoctorId(""); // Clear on error
          }
        } catch (error) {
          console.error("Error fetching doctor profile:", error);
          setDoctorId(""); // Clear on error
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        // For admins, they can select any doctor (no auto-set)
        setIsLoadingProfile(false);
      }
    };
    fetchDoctorProfile();
  }, [session, router, profileCheckAttempts]);

  const handlePatientSearch = async () => {
    if (!patientEmail) {
      toast.error("Please enter a patient email");
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?email=${patientEmail}`);
      if (response.ok) {
        const data = await response.json();
        const users = data.users || [];
        const patient = users.find((u: any) => u.role === "PATIENT" && u.email === patientEmail);
        if (patient) {
          setPatientId(patient.id);
          toast.success(`Found patient: ${patient.name}`);
        } else {
          toast.error("Patient not found with this email. Please ensure the email belongs to a patient account.");
          setPatientId("");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to search for patient");
      }
    } catch {
      toast.error("Failed to search for patient");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      toast.error("Please search and select a patient first");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    // For doctors, doctorId is required. For admins, they might select a doctor later
    if (userRole === "DOCTOR" && !doctorId) {
      toast.error("Doctor profile not found. Please complete your profile first.");
      return;
    }
    
    // For admins creating appointments, doctorId should be set (they can select any doctor)
    if (userRole === "ADMIN" && !doctorId) {
      toast.error("Please select a doctor for this appointment.");
      return;
    }

    try {
      await createAppointment({
        patientId,
        doctorId,
        appointmentDate: selectedDate.toISOString(),
        timeSlot: selectedTime,
        reason: reason || undefined,
      });

      toast.success("Appointment created successfully");
      router.push("/dashboard/doctor/schedule");
    } catch (error: any) {
      toast.error(error.message || "Failed to create appointment");
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Role check - only DOCTOR and ADMIN can access this page
  if (userRole !== "DOCTOR" && userRole !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only doctors and administrators can create appointments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 ">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Add Appointment</h1>
              <p className="text-muted-foreground">
                Create a new appointment for a patient
              </p>
            </div>

            <Card className="max-w-2xl w-full flex flex-col justify-center mx-auto">
              <CardHeader>
                <CardTitle>New Appointment</CardTitle>
                <CardDescription>
                  Schedule an appointment with a patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FieldGroup>
                    {doctorId && userRole === "DOCTOR" && (
                      <Field>
                        <FieldDescription className="text-green-600 flex items-center gap-2">
                          <span>✓ Doctor profile loaded</span>
                        </FieldDescription>
                      </Field>
                    )}
                    <Field>
                      <FieldLabel htmlFor="patientEmail">Patient Email</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id="patientEmail"
                          type="email"
                          placeholder="patient@example.com"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          disabled={isCreating}
                        />
                        <Button
                          type="button"
                          onClick={handlePatientSearch}
                          disabled={isCreating}
                        >
                          Search
                        </Button>
                      </div>
                      {patientId && (
                        <FieldDescription className="text-green-600">
                          Patient found and selected
                        </FieldDescription>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel>Appointment Date</FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={isCreating}
                          >
                            <IconCalendar className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate || undefined}
                            onSelect={(date) => setSelectedDate(date || null)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            required={false}
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    {selectedDate && (
                    <Field>
                      <FieldLabel>Time Slot</FieldLabel>
                        {isLoadingProfile ? (
                          <div className="flex items-center justify-center py-8">
                            <Spinner className="h-6 w-6" />
                            <span className="ml-2 text-sm text-muted-foreground">Loading doctor profile...</span>
                          </div>
                        ) : doctorId ? (
                          <TimeSlotPicker
                            doctorId={doctorId}
                            date={selectedDate}
                            selectedTime={selectedTime}
                            onTimeSelect={setSelectedTime}
                          />
                        ) : userRole === "ADMIN" ? (
                          <div className="space-y-2">
                            <FieldDescription className="text-amber-600">
                              Please select a doctor first to see available time slots, or enter time manually.
                            </FieldDescription>
                            <Input
                              type="time"
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              disabled={isCreating}
                              placeholder="HH:MM"
                            />
                            <FieldDescription>
                              Enter appointment time manually (e.g., 09:00, 14:30)
                            </FieldDescription>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <FieldDescription className="text-destructive">
                              Doctor profile not found. Please complete your doctor profile first.
                            </FieldDescription>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/dashboard/doctor/profile")}
                                className="flex-1"
                              >
                                Go to Profile Settings
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setProfileCheckAttempts(prev => prev + 1);
                                  toast.info("Refreshing doctor profile...");
                                }}
                                disabled={isLoadingProfile}
                              >
                                Refresh
                              </Button>
                            </div>
                            <FieldDescription>
                              If you just completed your profile, click "Refresh" to reload it. Or enter appointment time manually below (e.g., 09:00, 14:30)
                            </FieldDescription>
                            <Input
                              type="time"
                              value={selectedTime}
                              onChange={(e) => setSelectedTime(e.target.value)}
                              disabled={isCreating}
                              placeholder="HH:MM"
                            />
                          </div>
                        )}
                        {selectedTime && (
                          <FieldDescription className="text-green-600">
                            Selected time: {selectedTime}
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                    <Field>
                      <FieldLabel htmlFor="reason">Reason (Optional)</FieldLabel>
                      <Textarea
                        id="reason"
                        placeholder="Appointment reason or notes..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={isCreating}
                        rows={3}
                      />
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full" disabled={isCreating || !patientId}>
                        {isCreating ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Creating...
                          </>
                        ) : (
                          "Create Appointment"
                        )}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

