"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface NotificationPreferences {
  appointmentReminders: boolean;
  bookingConfirmations: boolean;
  cancellationAlerts: boolean;
  rescheduleAlerts: boolean;
}

async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await fetch("/api/user/notification-preferences");
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch preferences");
  }

  return data.data;
}

async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const response = await fetch("/api/user/notification-preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to update preferences");
  }

  return data.data;
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: fetchNotificationPreferences,
  });

  const updateMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onMutate: async (newPreferences) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["notification-preferences"],
      });

      // Snapshot the previous value
      const previousPreferences =
        queryClient.getQueryData<NotificationPreferences>([
          "notification-preferences",
        ]);

      // Optimistically update
      queryClient.setQueryData<NotificationPreferences>(
        ["notification-preferences"],
        (old) => ({
          ...old!,
          ...newPreferences,
        })
      );

      return { previousPreferences };
    },
    onError: (err, _newPreferences, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          ["notification-preferences"],
          context.previousPreferences
        );
      }
      toast.error("Failed to update preferences");
    },
    onSuccess: () => {
      toast.success("Preferences updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });

  const togglePreference = (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    updateMutation.mutate({
      [key]: !preferences[key],
    });
  };

  return {
    preferences,
    isLoading,
    error,
    togglePreference,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
