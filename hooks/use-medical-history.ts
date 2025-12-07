"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types matching Prisma models
export interface MedicalHistory {
  id: string;
  patientId: string;
  bloodType: string;
  height: number | null;
  weight: number | null;
  surgicalHistory: string | null;
  familyHistory: string | null;
  currentMedications: string | null;
  lifestyle: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  allergies: Allergy[];
  chronicConditions: ChronicCondition[];
}

export interface Allergy {
  id: string;
  medicalHistoryId: string;
  allergen: string;
  reaction: string | null;
  severity: string;
  diagnosedDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ChronicCondition {
  id: string;
  medicalHistoryId: string;
  condition: string;
  diagnosedDate: string | null;
  status: string;
  treatment: string | null;
  notes: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Fetch medical history
async function fetchMedicalHistory(): Promise<MedicalHistory | null> {
  const response = await fetch("/api/medical-history");
  const result: ApiResponse<MedicalHistory | null> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch medical history");
  }

  return result.data ?? null;
}

// Form input type (flexible for component compatibility)
interface MedicalHistoryFormData {
  bloodType?: string;
  height?: number | null;
  weight?: number | null;
  surgicalHistory?: string | null;
  familyHistory?: string | null;
  currentMedications?: string | null;
  lifestyle?: string | null;
  notes?: string | null;
}

// Update medical history
async function updateMedicalHistory(
  data: MedicalHistoryFormData
): Promise<MedicalHistory> {
  const response = await fetch("/api/medical-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<MedicalHistory> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update medical history");
  }

  return result.data!;
}

// Flexible input type for adding allergies
interface AllergyFormData {
  allergen: string;
  reaction?: string | null;
  severity?: string;
  notes?: string | null;
}

// Add allergy
async function addAllergy(data: AllergyFormData): Promise<Allergy> {
  const response = await fetch("/api/medical-history/allergies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Allergy> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to add allergy");
  }

  return result.data!;
}

// Delete allergy
async function deleteAllergy(allergyId: string): Promise<void> {
  const response = await fetch(
    `/api/medical-history/allergies?id=${allergyId}`,
    { method: "DELETE" }
  );

  const result: ApiResponse<null> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete allergy");
  }
}

// Flexible input type for adding chronic conditions
interface ChronicConditionFormData {
  condition: string;
  status?: string;
  treatment?: string | null;
  notes?: string | null;
}

// Add chronic condition
async function addChronicCondition(
  data: ChronicConditionFormData
): Promise<ChronicCondition> {
  const response = await fetch("/api/medical-history/conditions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<ChronicCondition> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to add condition");
  }

  return result.data!;
}

// Delete chronic condition
async function deleteChronicCondition(conditionId: string): Promise<void> {
  const response = await fetch(
    `/api/medical-history/conditions?id=${conditionId}`,
    { method: "DELETE" }
  );

  const result: ApiResponse<null> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete condition");
  }
}

// Main hook
export function useMedicalHistory() {
  const queryClient = useQueryClient();

  // Query for fetching medical history
  const query = useQuery({
    queryKey: ["medical-history"],
    queryFn: fetchMedicalHistory,
  });

  // Mutation for updating medical history
  const updateMutation = useMutation({
    mutationFn: updateMedicalHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-history"] });
      toast.success("Medical history updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation for adding allergy
  const addAllergyMutation = useMutation({
    mutationFn: addAllergy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-history"] });
      toast.success("Allergy added");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation for deleting allergy
  const deleteAllergyMutation = useMutation({
    mutationFn: deleteAllergy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-history"] });
      toast.success("Allergy removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation for adding chronic condition
  const addConditionMutation = useMutation({
    mutationFn: addChronicCondition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-history"] });
      toast.success("Condition added");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Mutation for deleting chronic condition
  const deleteConditionMutation = useMutation({
    mutationFn: deleteChronicCondition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-history"] });
      toast.success("Condition removed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    // Data
    medicalHistory: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Medical history mutations
    updateMedicalHistory: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    // Allergy mutations
    addAllergy: addAllergyMutation.mutate,
    isAddingAllergy: addAllergyMutation.isPending,
    deleteAllergy: deleteAllergyMutation.mutate,
    isDeletingAllergy: deleteAllergyMutation.isPending,

    // Condition mutations
    addCondition: addConditionMutation.mutate,
    isAddingCondition: addConditionMutation.isPending,
    deleteCondition: deleteConditionMutation.mutate,
    isDeletingCondition: deleteConditionMutation.isPending,

    // Refetch
    refetch: query.refetch,
  };
}
