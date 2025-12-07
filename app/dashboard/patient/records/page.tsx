"use client";

import { Suspense } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedicalHistory } from "@/hooks/use-medical-history";
import { MedicalHistoryForm } from "@/components/medical-history/medical-history-form";
import { AllergyList } from "@/components/medical-history/allergy-list";
import { ChronicConditionsList } from "@/components/medical-history/chronic-conditions-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loader for the page - shows immediately while data loads
 */
function MedicalRecordsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Medical History Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>

      {/* Allergies and Conditions Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Content component that loads data - wrapped in Suspense boundary
 */
function MedicalRecordsContent() {
  const {
    medicalHistory,
    isLoading,
    updateMedicalHistory,
    isUpdating,
    addAllergy,
    isAddingAllergy,
    deleteAllergy,
    isDeletingAllergy,
    addCondition,
    isAddingCondition,
    deleteCondition,
    isDeletingCondition,
  } = useMedicalHistory();

  // Show skeleton while loading (but layout is already rendered)
  if (isLoading) {
    return <MedicalRecordsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Basic Health Information */}
      <MedicalHistoryForm
        medicalHistory={medicalHistory ?? null}
        onSubmit={updateMedicalHistory}
        isSubmitting={isUpdating}
      />

      {/* Allergies and Chronic Conditions in 2 columns on larger screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AllergyList
          allergies={medicalHistory?.allergies || []}
          onAdd={addAllergy}
          onDelete={deleteAllergy}
          isAdding={isAddingAllergy}
          isDeleting={isDeletingAllergy}
        />

        <ChronicConditionsList
          conditions={medicalHistory?.chronicConditions || []}
          onAdd={addCondition}
          onDelete={deleteCondition}
          isAdding={isAddingCondition}
          isDeleting={isDeletingCondition}
        />
      </div>
    </div>
  );
}

/**
 * Main page component - renders layout immediately
 */
export default function PatientRecordsPage() {
  const { data: session, isPending } = useSession();

  // Layout renders immediately even while session is loading
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Medical Records</h1>
              <p className="text-muted-foreground">
                View and manage your complete medical history
              </p>
            </div>

            {/* Show skeleton during session check, then load content */}
            {isPending || !session ? (
              <MedicalRecordsSkeleton />
            ) : (
              <Suspense fallback={<MedicalRecordsSkeleton />}>
                <MedicalRecordsContent />
              </Suspense>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
