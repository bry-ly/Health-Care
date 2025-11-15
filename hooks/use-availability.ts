"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Availability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isActive: boolean;
}

export function useAvailability(doctorId?: string, userId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["availability", doctorId, userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (doctorId) params.append("doctorId", doctorId);
      if (userId) params.append("userId", userId);

      const response = await fetch(`/api/doctors/availability?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      const data = await response.json();
      return data.availability as Availability[];
    },
    enabled: !!(doctorId || userId),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: {
      doctorId: string;
      availability: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        breakStart?: string | null;
        breakEnd?: string | null;
        isActive: boolean;
      }>;
    }) => {
      const response = await fetch("/api/doctors/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save availability");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  return {
    availability: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    saveAvailability: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}



