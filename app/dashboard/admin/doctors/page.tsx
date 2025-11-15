"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { IconStethoscope, IconPlus } from "@tabler/icons-react";

interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  licenseNumber: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  appointmentCount?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDoctorsPage() {
  const { data: session } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    specialization: "",
    licenseNumber: "",
    bio: "",
    experience: "",
    consultationFee: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/doctors");
      if (response.ok) {
        const data = await response.json();
        const doctorsList = data.doctors || [];
        
        // Fetch appointment counts for each doctor
        const doctorsWithCounts = await Promise.all(
          doctorsList.map(async (doctor: Doctor) => {
            try {
              const aptResponse = await fetch(`/api/appointments?userId=${doctor.userId}&role=doctor`);
              if (aptResponse.ok) {
                const aptData = await aptResponse.json();
                return { ...doctor, appointmentCount: aptData.appointments?.length || 0 };
              }
            } catch {
              // Ignore errors
            }
            return { ...doctor, appointmentCount: 0 };
          })
        );
        
        setDoctors(doctorsWithCounts);
      }
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(searchEmail)}`);
      if (response.ok) {
        const data = await response.json();
        const users = data.users || [];
        const doctorUsers = users.filter((user: User) => user.role === "DOCTOR");
        
        if (doctorUsers.length === 0) {
          toast.error("No user with DOCTOR role found with this email");
          setSearchResults([]);
          setSelectedUser(null);
        } else {
          setSearchResults(doctorUsers);
          if (doctorUsers.length === 1) {
            setSelectedUser(doctorUsers[0]);
            setFormData((prev) => ({ ...prev, userId: doctorUsers[0].id }));
          }
        }
      } else {
        toast.error("Failed to search for user");
      }
    } catch (error) {
      console.error("Error searching user:", error);
      toast.error("Failed to search for user");
    }
  };

  const handleCreateDoctor = () => {
    setIsDialogOpen(true);
    setFormData({
      userId: "",
      specialization: "",
      licenseNumber: "",
      bio: "",
      experience: "",
      consultationFee: "",
    });
    setSearchEmail("");
    setSearchResults([]);
    setSelectedUser(null);
  };

  const handleSaveDoctor = async () => {
    if (!formData.userId || !formData.specialization || !formData.licenseNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          bio: formData.bio || undefined,
          experience: formData.experience ? parseInt(formData.experience) : 0,
          consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : 0,
        }),
      });

      if (response.ok) {
        toast.success("Doctor profile created successfully");
        setIsDialogOpen(false);
        // Refresh the doctors list
        await fetchDoctors();
        // Reset form
        setFormData({
          userId: "",
          specialization: "",
          licenseNumber: "",
          bio: "",
          experience: "",
          consultationFee: "",
        });
        setSearchEmail("");
        setSearchResults([]);
        setSelectedUser(null);
      } else {
        const error = await response.json().catch(() => ({ error: "Failed to create doctor profile" }));
        toast.error(error.error || "Failed to create doctor profile");
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
      toast.error("Failed to create doctor profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
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
                <h1 className="text-3xl font-bold">Doctors</h1>
                <p className="text-muted-foreground">
                  Manage and view all doctor profiles
                </p>
              </div>
              <Button onClick={handleCreateDoctor} className="gap-2">
                <IconPlus className="h-4 w-4" />
                Create Doctor Profile
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Doctors ({doctors.length})</CardTitle>
                <CardDescription>
                  Complete list of registered doctors in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="h-8 w-8" />
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <IconStethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No doctors found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>License Number</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Appointments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">{doctor.user.name}</TableCell>
                          <TableCell>{doctor.user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doctor.specialization}</Badge>
                          </TableCell>
                          <TableCell>{doctor.licenseNumber}</TableCell>
                          <TableCell>{doctor.user.phone || "N/A"}</TableCell>
                          <TableCell>{doctor.appointmentCount || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Create Doctor Profile Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Doctor Profile</DialogTitle>
                  <DialogDescription>
                    Create a doctor profile for a user with DOCTOR role. Note: After creating the profile, the doctor will need to set their availability schedule in their dashboard.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveDoctor(); }}>
                  <FieldGroup className="space-y-4 py-4">
                    <Field>
                      <FieldLabel htmlFor="searchEmail" className="text-sm">
                        Search User by Email
                      </FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          id="searchEmail"
                          type="email"
                          placeholder="doctor@example.com"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          className="h-9 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSearchUser}
                          disabled={!searchEmail.trim()}
                        >
                          Search
                        </Button>
                      </div>
                      <FieldDescription>
                        Search for a user with DOCTOR role to create a profile
                      </FieldDescription>
                    </Field>

                    {searchResults.length > 0 && (
                      <Field>
                        <FieldLabel className="text-sm">Select User</FieldLabel>
                        <Select
                          value={selectedUser?.id || ""}
                          onValueChange={(value) => {
                            const user = searchResults.find((u) => u.id === value);
                            setSelectedUser(user || null);
                            setFormData((prev) => ({ ...prev, userId: value }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {searchResults.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}

                    {selectedUser && (
                      <>
                        <Field>
                          <FieldLabel htmlFor="specialization" className="text-sm">
                            Specialization *
                          </FieldLabel>
                          <Input
                            id="specialization"
                            type="text"
                            placeholder="Cardiology, Neurology, etc."
                            required
                            disabled={isSaving}
                            value={formData.specialization}
                            onChange={handleChange}
                            className="h-9"
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="licenseNumber" className="text-sm">
                            License Number *
                          </FieldLabel>
                          <Input
                            id="licenseNumber"
                            type="text"
                            placeholder="LIC-12345"
                            required
                            disabled={isSaving}
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="h-9"
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="experience" className="text-sm">
                            Years of Experience
                          </FieldLabel>
                          <Input
                            id="experience"
                            type="number"
                            min="0"
                            placeholder="5"
                            disabled={isSaving}
                            value={formData.experience}
                            onChange={handleChange}
                            className="h-9"
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="consultationFee" className="text-sm">
                            Consultation Fee
                          </FieldLabel>
                          <Input
                            id="consultationFee"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="100.00"
                            disabled={isSaving}
                            value={formData.consultationFee}
                            onChange={handleChange}
                            className="h-9"
                          />
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="bio" className="text-sm">
                            Bio
                          </FieldLabel>
                          <Textarea
                            id="bio"
                            placeholder="Doctor's biography and qualifications..."
                            disabled={isSaving}
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                          />
                        </Field>
                      </>
                    )}
                  </FieldGroup>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving || !selectedUser}>
                      {isSaving ? "Creating..." : "Create Profile"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

