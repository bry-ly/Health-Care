"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { useDoctors } from "@/hooks/use-doctors";
import { useAppointments } from "@/hooks/use-appointments";
import { toast } from "sonner";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconCalendar } from "@tabler/icons-react";

export default function BookAppointmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors(
    selectedSpecialization === "all" ? undefined : selectedSpecialization
  );

  const { createAppointment, isCreating } = useAppointments({
    userId: session?.user?.id || "",
    role: "patient",
  });

  const specializations = Array.from(
    new Set(doctors.map((doc) => doc.specialization))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error("Please log in to book an appointment");
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createAppointment({
        patientId: session.user.id,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate.toISOString(),
        timeSlot: selectedTime,
        reason: reason || undefined,
        duration: 30,
      });

      toast.success("Appointment booked successfully!");
      router.push("/dashboard/patient/appointments");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to book appointment"
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
          <div className="@container/main flex flex-1 flex-col items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-2xl">
              <div className="flex flex-col gap-2 mb-6 text-center">
                <h1 className="text-3xl font-bold">Book Appointment</h1>
                <p className="text-muted-foreground">
                  Schedule an appointment with a healthcare provider
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Booking Form</CardTitle>
                  <CardDescription>
                    Fill in the details below to book your appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Doctor Selection Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialization" className="text-base font-medium">
                          Specialization <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={selectedSpecialization}
                          onValueChange={(value) => {
                            setSelectedSpecialization(value);
                            setSelectedDoctor("");
                          }}
                        >
                          <SelectTrigger id="specialization" className="h-11">
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Specializations</SelectItem>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {doctorsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Spinner className="h-6 w-6" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="doctor" className="text-base font-medium">
                            Doctor <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={selectedDoctor}
                            onValueChange={setSelectedDoctor}
                            disabled={!selectedSpecialization && doctors.length === 0}
                          >
                            <SelectTrigger id="doctor" className="h-11">
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.user.name} - {doctor.specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Date and Time Selection Section */}
                    {selectedDoctor && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            Appointment Date <span className="text-destructive">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal h-11"
                              >
                                <IconCalendar className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                  format(selectedDate, "PPP")
                                ) : (
                                  <span className="text-muted-foreground">Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={selectedDate || undefined}
                                onSelect={(date) => {
                                  setSelectedDate(date || null);
                                  setSelectedTime("");
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {selectedDate && (
                          <div className="space-y-2">
                            <Label className="text-base font-medium">
                              Time Slot <span className="text-destructive">*</span>
                            </Label>
                            <TimeSlotPicker
                              doctorId={selectedDoctor}
                              date={selectedDate}
                              selectedTime={selectedTime}
                              onTimeSelect={setSelectedTime}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reason Section */}
                    {selectedDoctor && (
                      <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="reason" className="text-base font-medium">
                          Reason for Visit <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder="Brief description of your symptoms or reason for visit..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1 sm:flex-initial"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          !selectedDoctor ||
                          !selectedDate ||
                          !selectedTime ||
                          isCreating
                        }
                        className="flex-1 sm:flex-initial"
                      >
                        {isCreating ? "Booking..." : "Book Appointment"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

