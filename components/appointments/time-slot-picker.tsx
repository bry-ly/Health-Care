"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { formatTime12Hour } from "@/lib/time-utils";

interface TimeSlotPickerProps {
  doctorId: string;
  date: Date | null;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
}

interface WorkingPeriod {
  start: string;
  end: string;
}

// Helper to categorize time slots into periods
function categorizeSlot(time: string): "morning" | "afternoon" | "evening" {
  const [hour] = time.split(":").map(Number);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

// Group slots by period
function groupSlotsByPeriod(slots: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  slots.forEach((slot) => {
    const period = categorizeSlot(slot);
    groups[period].push(slot);
  });

  return groups;
}

const periodLabels: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const periodIcons: Record<string, string> = {
  morning: "🌅",
  afternoon: "☀️",
  evening: "🌙",
};

export function TimeSlotPicker({
  doctorId,
  date,
  selectedTime,
  onTimeSelect,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateStr = date.toISOString().split("T")[0];
        const response = await fetch(
          `/api/doctors/availability/check?doctorId=${doctorId}&date=${dateStr}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch available slots");
        }

        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
        setWorkingHours(data.workingHours || []);
        if (data.message && data.availableSlots.length === 0) {
          setError(data.message);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load time slots"
        );
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [doctorId, date]);

  if (!date) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Time</CardTitle>
          <CardDescription>Please select a date first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groupedSlots = groupSlotsByPeriod(availableSlots);
  const hasSlots = availableSlots.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Time Slots</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : `${availableSlots.length} slots available`}
          {workingHours.length > 1 && !loading && (
            <span className="block text-xs mt-1">
              Multiple working periods:{" "}
              {workingHours
                .map(
                  (p) =>
                    `${formatTime12Hour(p.start)} - ${formatTime12Hour(p.end)}`
                )
                .join(", ")}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Spinner className="h-6 w-6" />
            <p className="text-sm text-muted-foreground">
              Loading available times...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive font-medium mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">
              The doctor may not have set their availability schedule yet.
              Please try another date or contact the doctor.
            </p>
          </div>
        ) : !hasSlots ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-medium mb-2">
              No available time slots for this date
            </p>
            <p className="text-sm text-muted-foreground">
              The doctor may not be available on this day, or all slots may be
              booked. Please try another date.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(["morning", "afternoon", "evening"] as const).map((period) => {
              const slots = groupedSlots[period];
              if (slots.length === 0) return null;

              return (
                <div key={period}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{periodIcons[period]}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {periodLabels[period]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({slots.length} slots)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {slots.map((slot) => {
                      const displayTime = formatTime12Hour(slot);
                      return (
                        <Button
                          key={slot}
                          type="button"
                          variant={
                            selectedTime === slot ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => onTimeSelect(slot)}
                          className={cn(
                            selectedTime === slot &&
                              "bg-primary text-primary-foreground"
                          )}
                        >
                          {displayTime}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
