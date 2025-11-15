"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
  doctorId: string;
  date: Date | null;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotPicker({
  doctorId,
  date,
  selectedTime,
  onTimeSelect,
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load time slots");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Time Slots</CardTitle>
        <CardDescription>
          {loading ? "Loading..." : `${availableSlots.length} slots available`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No available time slots for this date
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {availableSlots.map((slot) => (
              <Button
                key={slot}
                variant={selectedTime === slot ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeSelect(slot)}
                className={cn(
                  selectedTime === slot && "bg-primary text-primary-foreground"
                )}
              >
                {slot}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

