"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { IconPlus, IconTrash } from "@tabler/icons-react";

// Days ordered Monday-first
const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  dayOfWeek: number;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface AvailabilityEditorProps {
  doctorId: string;
  onSave?: () => void;
}

// Create a default time slot
const createDefaultSlot = (): TimeSlot => ({
  startTime: "09:00",
  endTime: "17:00",
});

export function AvailabilityEditor({
  doctorId,
  onSave,
}: AvailabilityEditorProps) {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/doctors/availability?doctorId=${doctorId}`
        );
        if (response.ok) {
          const data = await response.json();

          if (data.availability && data.availability.length > 0) {
            // Group existing availability by day
            const groupedByDay: Record<number, TimeSlot[]> = {};

            data.availability.forEach((slot: any) => {
              if (!groupedByDay[slot.dayOfWeek]) {
                groupedByDay[slot.dayOfWeek] = [];
              }
              groupedByDay[slot.dayOfWeek].push({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
              });
            });

            // Create availability array for all days
            setAvailability(
              DAYS_OF_WEEK.map((day) => ({
                dayOfWeek: day.value,
                isActive: Boolean(groupedByDay[day.value]?.length),
                timeSlots: groupedByDay[day.value] || [createDefaultSlot()],
              }))
            );
          } else {
            // Initialize with default empty schedule
            setAvailability(
              DAYS_OF_WEEK.map((day) => ({
                dayOfWeek: day.value,
                isActive: false,
                timeSlots: [createDefaultSlot()],
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to load availability");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [doctorId]);

  const updateDay = (dayOfWeek: number, updates: Partial<DayAvailability>) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
      )
    );
  };

  const updateTimeSlot = (
    dayOfWeek: number,
    slotIndex: number,
    updates: Partial<TimeSlot>
  ) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        const newSlots = [...day.timeSlots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], ...updates };
        return { ...day, timeSlots: newSlots };
      })
    );
  };

  const addTimeSlot = (dayOfWeek: number) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        // Find a reasonable default time for new slot
        const lastSlot = day.timeSlots[day.timeSlots.length - 1];
        const [endHour] = lastSlot.endTime.split(":").map(Number);
        const newStartHour = Math.min(endHour + 1, 23);
        const newEndHour = Math.min(newStartHour + 2, 23);

        return {
          ...day,
          timeSlots: [
            ...day.timeSlots,
            {
              startTime: `${String(newStartHour).padStart(2, "0")}:00`,
              endTime: `${String(newEndHour).padStart(2, "0")}:00`,
            },
          ],
        };
      })
    );
  };

  const removeTimeSlot = (dayOfWeek: number, slotIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        if (day.timeSlots.length <= 1) return day; // Keep at least one slot
        return {
          ...day,
          timeSlots: day.timeSlots.filter((_, i) => i !== slotIndex),
        };
      })
    );
  };

  const handleSave = async () => {
    // Validate that at least one day is active
    const activeDays = availability.filter((day) => day.isActive);

    if (activeDays.length === 0) {
      toast.error("Please enable at least one day and set working hours");
      return;
    }

    // Validate that all active days have valid times
    for (const day of activeDays) {
      for (const slot of day.timeSlots) {
        if (
          !slot.startTime ||
          !slot.endTime ||
          slot.startTime >= slot.endTime
        ) {
          const dayLabel = DAYS_OF_WEEK.find(
            (d) => d.value === day.dayOfWeek
          )?.label;
          toast.error(
            `Please ensure all time slots for ${dayLabel} have valid start and end times`
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Flatten the availability structure for API
      const flatAvailability = activeDays.flatMap((day) =>
        day.timeSlots.map((slot) => ({
          dayOfWeek: day.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          breakStart: null,
          breakEnd: null,
          isActive: true,
        }))
      );

      const response = await fetch("/api/doctors/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          availability: flatAvailability,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to save availability" }));
        const errorMessage =
          errorData.details || errorData.error || "Failed to save availability";
        throw new Error(errorMessage);
      }

      toast.success("Availability saved successfully");
      onSave?.();

      // Refresh the availability list
      const fetchResponse = await fetch(
        `/api/doctors/availability?doctorId=${doctorId}`
      );
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        if (data.availability && data.availability.length > 0) {
          const groupedByDay: Record<number, TimeSlot[]> = {};

          data.availability.forEach((slot: any) => {
            if (!groupedByDay[slot.dayOfWeek]) {
              groupedByDay[slot.dayOfWeek] = [];
            }
            groupedByDay[slot.dayOfWeek].push({
              id: slot.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
            });
          });

          setAvailability(
            DAYS_OF_WEEK.map((day) => ({
              dayOfWeek: day.value,
              isActive: Boolean(groupedByDay[day.value]?.length),
              timeSlots: groupedByDay[day.value] || [createDefaultSlot()],
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save availability";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading availability...</div>;
  }

  return (
    <div className="space-y-4">
      {DAYS_OF_WEEK.map((day) => {
        const dayAvailability = availability.find(
          (a) => a.dayOfWeek === day.value
        ) || {
          dayOfWeek: day.value,
          isActive: false,
          timeSlots: [createDefaultSlot()],
        };

        return (
          <Card key={day.value}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{day.label}</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${day.value}`} className="text-sm">
                    Available
                  </Label>
                  <Switch
                    id={`active-${day.value}`}
                    checked={dayAvailability.isActive}
                    onCheckedChange={(checked) =>
                      updateDay(day.value, { isActive: checked })
                    }
                  />
                </div>
              </div>
            </CardHeader>
            {dayAvailability.isActive && (
              <CardContent className="space-y-4">
                {dayAvailability.timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-end gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`start-${day.value}-${slotIndex}`}
                          className="text-xs"
                        >
                          Start Time
                        </Label>
                        <Input
                          id={`start-${day.value}-${slotIndex}`}
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateTimeSlot(day.value, slotIndex, {
                              startTime: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor={`end-${day.value}-${slotIndex}`}
                          className="text-xs"
                        >
                          End Time
                        </Label>
                        <Input
                          id={`end-${day.value}-${slotIndex}`}
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateTimeSlot(day.value, slotIndex, {
                              endTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    {dayAvailability.timeSlots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeTimeSlot(day.value, slotIndex)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => addTimeSlot(day.value)}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Time Slot
                </Button>
              </CardContent>
            )}
          </Card>
        );
      })}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Availability"}
        </Button>
      </div>
    </div>
  );
}
