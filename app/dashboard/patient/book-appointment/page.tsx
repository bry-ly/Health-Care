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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/appointments/time-slot-picker";
import { useDoctors } from "@/hooks/use-doctors";
import { useAppointments } from "@/hooks/use-appointments";
import { toast } from "sonner";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconCalendar } from "@tabler/icons-react";
import { formatPhoneInput, cleanPhonePH, formatPhonePH } from "@/lib/phone-utils";

export default function BookAppointmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("CONSULTATION");
  const [urgencyLevel, setUrgencyLevel] = useState<string>("ROUTINE");
  const [duration, setDuration] = useState<number>(30);
  const [reason, setReason] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>(
    session?.user?.phone ? formatPhonePH(session.user.phone) : ""
  );
  const [patientEmail, setPatientEmail] = useState<string>(session?.user?.email || "");
  const [insuranceProvider, setInsuranceProvider] = useState<string>("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState<string>("");
  const [emergencyContactName, setEmergencyContactName] = useState<string>("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>("");
  const [isFollowUp, setIsFollowUp] = useState<boolean>(false);

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

    if (!selectedDoctor || !selectedDate || !selectedTime || !patientPhone.trim() || !patientEmail.trim()) {
      toast.error("Please fill in all required fields (Doctor, Date, Time, Phone Number, and Email)");
      return;
    }

    try {
      await createAppointment({
        patientId: session.user.id,
        doctorId: selectedDoctor,
        appointmentDate: selectedDate.toISOString(),
        timeSlot: selectedTime,
        reason: reason || undefined,
        symptoms: symptoms || undefined,
        duration: duration,
        appointmentType: appointmentType as any,
        urgencyLevel: urgencyLevel as any,
        patientPhone: patientPhone ? cleanPhonePH(patientPhone) : undefined,
        patientEmail: patientEmail || undefined,
        insuranceProvider: insuranceProvider || undefined,
        insurancePolicyNumber: insurancePolicyNumber || undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone ? cleanPhonePH(emergencyContactPhone) : undefined,
        isFollowUp: isFollowUp,
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
                    <div className="grid grid-cols-2 gap-4">
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
                          <SelectTrigger id="specialization" className="h-11 w-full">
                            <SelectValue placeholder="Select specialization" className="truncate" />
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
                        <div className="flex items-end justify-center">
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
                            <SelectTrigger id="doctor" className="h-11 w-full">
                              <SelectValue placeholder="Select a doctor" className="truncate" />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  <span className="truncate block">{doctor.user.name} - {doctor.specialization}</span>
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

                    {/* Appointment Details Section */}
                    {selectedDoctor && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="appointmentType" className="text-base font-medium">
                              Appointment Type <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={appointmentType}
                              onValueChange={setAppointmentType}
                            >
                              <SelectTrigger id="appointmentType" className="h-11 w-full">
                                <SelectValue placeholder="Select type" className="truncate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                                <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                                <SelectItem value="CHECKUP">Checkup</SelectItem>
                                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                <SelectItem value="SURGERY">Surgery</SelectItem>
                                <SelectItem value="TEST">Test/Procedure</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="duration" className="text-base font-medium">
                              Duration (minutes) <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={duration.toString()}
                              onValueChange={(value) => setDuration(parseInt(value))}
                            >
                              <SelectTrigger id="duration" className="h-11 w-full">
                                <SelectValue placeholder="Select duration" className="truncate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                                <SelectItem value="90">90 minutes</SelectItem>
                                <SelectItem value="120">120 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="urgencyLevel" className="text-base font-medium">
                            Urgency Level <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={urgencyLevel}
                            onValueChange={setUrgencyLevel}
                          >
                            <SelectTrigger id="urgencyLevel" className="h-11 w-full">
                              <SelectValue placeholder="Select urgency level" className="truncate" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ROUTINE">Routine</SelectItem>
                              <SelectItem value="URGENT">Urgent</SelectItem>
                              <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isFollowUp"
                            checked={isFollowUp}
                            onCheckedChange={(checked) => setIsFollowUp(checked === true)}
                          />
                          <Label htmlFor="isFollowUp" className="text-sm font-normal cursor-pointer">
                            This is a follow-up appointment
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* Reason and Symptoms Section */}
                    {selectedDoctor && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="reason" className="text-base font-medium">
                            Reason for Visit <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                          </Label>
                          <Textarea
                            id="reason"
                            placeholder="Brief description of why you need this appointment..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="symptoms" className="text-base font-medium">
                            Symptoms or Concerns <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                          </Label>
                          <Textarea
                            id="symptoms"
                            placeholder="Describe any symptoms, pain levels, or concerns you're experiencing..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Patient Contact Information */}
                    {selectedDoctor && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-base font-semibold">Contact Information</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="patientPhone" className="text-base font-medium">
                              Phone Number <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="patientPhone"
                              type="tel"
                              placeholder="09XX XXX XXXX or 02X XXX XXXX"
                              value={patientPhone}
                              onChange={(e) => setPatientPhone(formatPhoneInput(e.target.value))}
                              required
                              className="h-11"
                              maxLength={13}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="patientEmail" className="text-base font-medium">
                              Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="patientEmail"
                              type="email"
                              placeholder="your.email@example.com"
                              value={patientEmail}
                              onChange={(e) => setPatientEmail(e.target.value)}
                              required
                              className="h-11"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          We'll use these to confirm your appointment and send reminders
                        </p>
                      </div>
                    )}

                    {/* Insurance Information */}
                    {selectedDoctor && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-base font-semibold">Insurance Information <span className="text-muted-foreground text-sm font-normal">(Optional)</span></h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="insuranceProvider" className="text-base font-medium">
                              Insurance Provider
                            </Label>
                            <Input
                              id="insuranceProvider"
                              type="text"
                              placeholder="e.g., Blue Cross Blue Shield"
                              value={insuranceProvider}
                              onChange={(e) => setInsuranceProvider(e.target.value)}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="insurancePolicyNumber" className="text-base font-medium">
                              Policy Number
                            </Label>
                            <Input
                              id="insurancePolicyNumber"
                              type="text"
                              placeholder="Policy number"
                              value={insurancePolicyNumber}
                              onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                              className="h-11"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {selectedDoctor && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-base font-semibold">Emergency Contact <span className="text-muted-foreground text-sm font-normal">(Optional)</span></h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContactName" className="text-base font-medium">
                              Contact Name
                            </Label>
                            <Input
                              id="emergencyContactName"
                              type="text"
                              placeholder="Full name"
                              value={emergencyContactName}
                              onChange={(e) => setEmergencyContactName(e.target.value)}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContactPhone" className="text-base font-medium">
                              Contact Phone
                            </Label>
                            <Input
                              id="emergencyContactPhone"
                              type="tel"
                              placeholder="09XX XXX XXXX or 02X XXX XXXX"
                              value={emergencyContactPhone}
                              onChange={(e) => setEmergencyContactPhone(formatPhoneInput(e.target.value))}
                              className="h-11"
                              maxLength={13}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1 sm:flex-initial sm:min-w-[120px]"
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
                        className="flex-1 sm:flex-initial sm:min-w-[160px]"
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

