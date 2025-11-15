"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useDoctors } from "@/hooks/use-doctors";
import { IconStethoscope, IconSearch } from "@tabler/icons-react";
import Link from "next/link";

export default function PatientDoctorsPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const { data: doctors = [], isLoading } = useDoctors(
    selectedSpecialization === "all" ? undefined : selectedSpecialization
  );

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Find Doctors</h1>
              <p className="text-muted-foreground">
                Search and browse available doctors
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Search Doctors</CardTitle>
                <CardDescription>
                  Find a doctor by name or specialization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or specialization..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={selectedSpecialization}
                    onValueChange={setSelectedSpecialization}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Specializations" />
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
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <IconStethoscope className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No doctors found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{doctor.user.name}</CardTitle>
                      <CardDescription>{doctor.user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Badge variant="outline">{doctor.specialization}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>License: {doctor.licenseNumber}</p>
                      </div>
                      <Button asChild className="w-full">
                        <Link href={`/dashboard/patient/book-appointment?doctorId=${doctor.id}`}>
                          Book Appointment
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

