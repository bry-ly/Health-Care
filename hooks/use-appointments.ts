"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppointmentStatus } from "@prisma/client";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  timeSlot: string;
  duration: number;
  status: AppointmentStatus;
  reason?: string | null;
  symptoms?: string | null;
  notes?: string | null;
  cancelReason?: string | null;
  appointmentType?: string | null;
  urgencyLevel?: string | null;
  patientPhone?: string | null;
  patientEmail?: string | null;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isFollowUp?: boolean | null;
  doctor: {
    id: string;
    specialization: string;
    user: {
      name: string;
      email: string;
    };
  };
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface UseAppointmentsOptions {
  userId: string;
  role: "patient" | "doctor" | "admin";
  status?: AppointmentStatus;
  date?: string;
}

export function useAppointments({ userId, role, status, date }: UseAppointmentsOptions) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["appointments", userId, role, status, date],
    queryFn: async () => {
      const params = new URLSearchParams({
        userId,
        role,
      });
      if (status) params.append("status", status);
      if (date) params.append("date", date);

      const response = await fetch(`/api/appointments?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      return data.appointments as Appointment[];
    },
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async (appointmentData: {
      patientId: string;
      doctorId: string;
      appointmentDate: string;
      timeSlot: string;
      reason?: string;
      symptoms?: string;
      duration?: number;
      appointmentType?: string;
      urgencyLevel?: string;
      patientPhone?: string;
      patientEmail?: string;
      insuranceProvider?: string;
      insurancePolicyNumber?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      isFollowUp?: boolean;
      previousAppointmentId?: string;
    }) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updateData: {
      appointmentId: string;
      status?: AppointmentStatus;
      appointmentDate?: string;
      timeSlot?: string;
      cancelReason?: string;
    }) => {
      const response = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/appointments?appointmentId=${appointmentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return {
    appointments: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createAppointment: createMutation.mutate,
    updateAppointment: updateMutation.mutate,
    deleteAppointment: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}



