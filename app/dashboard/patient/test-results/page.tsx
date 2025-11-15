"use client";

import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { IconClipboardList } from "@tabler/icons-react";

export default function PatientTestResultsPage() {
  const { data: session } = useSession();

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
              <h1 className="text-3xl font-bold">Test Results</h1>
              <p className="text-muted-foreground">
                View your laboratory and diagnostic test results
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Laboratory and diagnostic test results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <IconClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Test results feature coming soon</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This section will display your lab results, imaging reports, and diagnostic tests
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

