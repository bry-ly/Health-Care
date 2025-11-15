"use client";

import { useQuery } from "@tanstack/react-query";

interface Doctor {
  id: string;
  specialization: string;
  licenseNumber: string;
  bio?: string | null;
  experience: number;
  consultationFee: number;
  isAvailable: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  availability?: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStart?: string | null;
    breakEnd?: string | null;
    isActive: boolean;
  }>;
}

export function useDoctors(specialization?: string) {
  return useQuery({
    queryKey: ["doctors", specialization],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (specialization) params.append("specialization", specialization);

      const response = await fetch(`/api/doctors?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();
      return data.doctors as Doctor[];
    },
  });
}

export function useDoctor(doctorId: string) {
  return useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      const response = await fetch(`/api/doctors?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctor");
      }
      const data = await response.json();
      return data.doctor as Doctor;
    },
    enabled: !!doctorId,
  });
}



