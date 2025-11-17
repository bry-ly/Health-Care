"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { formatPhoneInput, formatPhonePH, cleanPhonePH } from "@/lib/phone-utils";
import { useEffect } from "react";

export default function DoctorProfilePage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    specialization: "",
    licenseNumber: "",
    phone: "",
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [session]);

  const fetchDoctorProfile = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/doctors?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.doctors && data.doctors.length > 0) {
          const doctor = data.doctors[0];
          setDoctorProfile(doctor);
          setFormData({
            name: doctor.user.name,
            email: doctor.user.email,
            specialization: doctor.specialization,
            licenseNumber: doctor.licenseNumber,
            phone: doctor.user.phone ? formatPhonePH(doctor.user.phone) : "",
          });
        }
      }
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Clean phone number before sending
      const submitData = {
        name: formData.name,
        phone: formData.phone ? cleanPhonePH(formData.phone) : null,
      };

      // Update profile via API
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update doctor-specific fields if doctor profile exists
      if (doctorProfile) {
        const doctorResponse = await fetch(`/api/doctors/${doctorProfile.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            specialization: formData.specialization,
            licenseNumber: formData.licenseNumber,
          }),
        });

        if (!doctorResponse.ok) {
          throw new Error("Failed to update doctor profile");
        }
      }

      toast.success("Profile updated successfully");
      fetchDoctorProfile();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.id === "phone" 
      ? formatPhoneInput(e.target.value)
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.id]: value,
    });
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex h-screen items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </SidebarInset>
      </SidebarProvider>
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
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">
                Manage your profile information
              </p>
            </div>

            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile and professional details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <FieldGroup className="space-y-4">
                    <Field>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSaving}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                      />
                      <FieldDescription>
                        Email cannot be changed
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="specialization">Specialization</FieldLabel>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={isSaving}
                        placeholder="e.g., Cardiology, Pediatrics"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="licenseNumber">License Number</FieldLabel>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        disabled={isSaving}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSaving}
                        placeholder="09XX XXX XXXX or 02X XXX XXXX"
                        maxLength={13}
                      />
                    </Field>
                    <Field>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
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

