"use client";

import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/doctor/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AvailabilityEditor } from "@/components/doctors/availability-editor";
import { useEffect, useState, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function DoctorAvailabilityPage() {
  const { data: session } = useSession();
  const [doctorId, setDoctorId] = useState<string>("");
  const hasShownError = useRef<string | null>(null);

  // First, get doctor profile for this user
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!session?.user?.id) return;

      const currentUserId = session.user.id;
      
      try {
        const response = await fetch(`/api/doctors?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.doctors && data.doctors.length > 0) {
            setDoctorId(data.doctors[0].id);
            hasShownError.current = null; // Reset on success
          } else {
            if (hasShownError.current !== "not-found") {
              hasShownError.current = "not-found";
              toast.error("Doctor profile not found. Please contact admin.");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        if (hasShownError.current !== "fetch-error") {
          hasShownError.current = "fetch-error";
          toast.error("Failed to load doctor profile");
        }
      }
    };

    fetchDoctorProfile();
  }, [session?.user?.id]);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!doctorId) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            </div>
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
              <h1 className="text-3xl font-bold">Manage Availability</h1>
              <p className="text-muted-foreground">
                Set your working hours and break times for each day of the week
              </p>
            </div>

            <AvailabilityEditor
              doctorId={doctorId}
              onSave={() => {
                // Toast is already shown in AvailabilityEditor component
                // No need to show it again here
              }}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

