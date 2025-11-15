"use client";

import { useQuery } from "@tanstack/react-query";

interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  pendingAppointments: number;
  missedAppointments: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersRes, appointmentsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/appointments?role=admin"),
      ]);

      if (!usersRes.ok || !appointmentsRes.ok) {
        throw new Error("Failed to fetch admin stats");
      }

      const usersData = await usersRes.json();
      const appointmentsData = await appointmentsRes.json();

      const users = usersData.users || [];
      const appointments = appointmentsData.appointments || [];

      return {
        totalPatients: users.filter((u: { role: string }) => u.role === "PATIENT").length,
        totalDoctors: users.filter((u: { role: string }) => u.role === "DOCTOR").length,
        pendingAppointments: appointments.filter((a: { status: string }) => a.status === "PENDING").length,
        missedAppointments: appointments.filter((a: { status: string }) => a.status === "MISSED").length,
      } as AdminStats;
    },
  });
}



