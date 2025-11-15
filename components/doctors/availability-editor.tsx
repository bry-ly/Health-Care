"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface AvailabilityDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  isActive: boolean;
}

interface AvailabilityEditorProps {
  doctorId: string;
  onSave?: () => void;
}

export function AvailabilityEditor({ doctorId, onSave }: AvailabilityEditorProps) {
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctorId) return;

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/doctors/availability?doctorId=${doctorId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.availability && data.availability.length > 0) {
            setAvailability(data.availability);
          } else {
            // Initialize with default empty schedule
            setAvailability(
              DAYS_OF_WEEK.map((day) => ({
                dayOfWeek: day.value,
                startTime: "09:00",
                endTime: "17:00",
                breakStart: null,
                breakEnd: null,
                isActive: false,
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

  const updateDay = (dayOfWeek: number, updates: Partial<AvailabilityDay>) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const activeAvailability = availability.filter((day) => day.isActive);
      
      const response = await fetch("/api/doctors/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          availability: activeAvailability,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save availability");
      }

      toast.success("Availability saved successfully");
      onSave?.();
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
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
        const dayAvailability = availability.find((a) => a.dayOfWeek === day.value) || {
          dayOfWeek: day.value,
          startTime: "09:00",
          endTime: "17:00",
          breakStart: null,
          breakEnd: null,
          isActive: false,
        };

        return (
          <Card key={day.value}>
            <CardHeader>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`start-${day.value}`}>Start Time</Label>
                    <Input
                      id={`start-${day.value}`}
                      type="time"
                      value={dayAvailability.startTime}
                      onChange={(e) =>
                        updateDay(day.value, { startTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`end-${day.value}`}>End Time</Label>
                    <Input
                      id={`end-${day.value}`}
                      type="time"
                      value={dayAvailability.endTime}
                      onChange={(e) =>
                        updateDay(day.value, { endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Break Time (Optional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`break-start-${day.value}`} className="text-xs">
                        Break Start
                      </Label>
                      <Input
                        id={`break-start-${day.value}`}
                        type="time"
                        value={dayAvailability.breakStart || ""}
                        onChange={(e) =>
                          updateDay(day.value, {
                            breakStart: e.target.value || null,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`break-end-${day.value}`} className="text-xs">
                        Break End
                      </Label>
                      <Input
                        id={`break-end-${day.value}`}
                        type="time"
                        value={dayAvailability.breakEnd || ""}
                        onChange={(e) =>
                          updateDay(day.value, {
                            breakEnd: e.target.value || null,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
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

