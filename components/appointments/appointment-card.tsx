"use client";

import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconCalendar, IconClock, IconStethoscope } from "@tabler/icons-react";
import { AppointmentStatus } from "@prisma/client";

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
  status: AppointmentStatus;
  reason?: string | null;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

const statusColors: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  RESCHEDULED: "bg-purple-100 text-purple-800 border-purple-200",
  MISSED: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  RESCHEDULED: "Rescheduled",
  MISSED: "Missed",
};

export function AppointmentCard({
  id,
  doctorName,
  appointmentDate,
  timeSlot,
  status,
  reason,
  onReschedule,
  onCancel,
  showActions = true,
}: AppointmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{doctorName}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <IconCalendar className="h-4 w-4" />
                <span>{format(appointmentDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <IconClock className="h-4 w-4" />
                <span>{timeSlot}</span>
              </div>
            </CardDescription>
          </div>
          <Badge className={statusColors[status]} variant="outline">
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      {reason && (
        <CardContent>
          <div className="flex items-start gap-2">
            <IconStethoscope className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>
        </CardContent>
      )}
      {showActions && (status === "PENDING" || status === "CONFIRMED") && (
        <CardContent className="flex gap-2 pt-0">
          {onReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReschedule(id)}
            >
              Reschedule
            </Button>
          )}
          {onCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(id)}
            >
              Cancel
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

