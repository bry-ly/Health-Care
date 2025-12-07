"use client";

import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/dashboard/patient/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useMedicalHistory } from "@/hooks/use-medical-history";
import { MedicalHistoryForm } from "@/components/medical-history/medical-history-form";
import { AllergyList } from "@/components/medical-history/allergy-list";
import { ChronicConditionsList } from "@/components/medical-history/chronic-conditions-list";

export default function PatientRecordsPage() {
  const { data: session } = useSession();
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
              <h1 className="text-3xl font-bold">Medical Records</h1>
              <p className="text-muted-foreground">
                View and manage your complete medical history
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
                <p className="mt-4 text-muted-foreground">
                  Loading your medical records...
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
