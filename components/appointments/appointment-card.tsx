"use client";

import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconCalendar, IconClock, IconStethoscope, IconMail, IconPhone, IconCreditCard, IconAlertTriangle, IconFileDescription, IconUserCheck } from "@tabler/icons-react";
import { AppointmentStatus } from "@prisma/client";
import { formatTime12Hour } from "@/lib/time-utils";

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  appointmentDate: Date;
  timeSlot: string;
  status: AppointmentStatus;
  reason?: string | null;
  symptoms?: string | null;
  appointmentType?: string | null;
  urgencyLevel?: string | null;
  duration?: number | null;
  patientPhone?: string | null;
  patientEmail?: string | null;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isFollowUp?: boolean | null;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
  isDoctorView?: boolean;
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
  symptoms,
  appointmentType,
  urgencyLevel,
  duration,
  patientPhone,
  patientEmail,
  insuranceProvider,
  insurancePolicyNumber,
  emergencyContactName,
  emergencyContactPhone,
  isFollowUp,
  onReschedule,
  onCancel,
  onDelete,
  onAccept,
  onReject,
  showActions = true,
  isDoctorView = false,
}: AppointmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {isDoctorView ? `Patient: ${doctorName}` : doctorName}
            </CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <IconCalendar className="h-4 w-4" />
                <span>{format(appointmentDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <IconClock className="h-4 w-4" />
                <span>{formatTime12Hour(timeSlot)}</span>
                {duration && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{duration} minutes</span>
                  </>
                )}
              </div>
              {(appointmentType || urgencyLevel || isFollowUp) && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {appointmentType && (
                    <>
                      <IconFileDescription className="h-4 w-4" />
                      <span className="text-xs capitalize">{appointmentType.toLowerCase().replace("_", "-")}</span>
                    </>
                  )}
                  {urgencyLevel && (
                    <>
                      <span className="mx-1">•</span>
                      <IconAlertTriangle className={`h-4 w-4 ${
                        urgencyLevel === "EMERGENCY" ? "text-red-500" :
                        urgencyLevel === "URGENT" ? "text-orange-500" :
                        "text-blue-500"
                      }`} />
                      <span className="text-xs capitalize">{urgencyLevel.toLowerCase()}</span>
                    </>
                  )}
                  {isFollowUp && (
                    <>
                      <span className="mx-1">•</span>
                      <IconUserCheck className="h-4 w-4" />
                      <span className="text-xs">Follow-up</span>
                    </>
                  )}
                </div>
              )}
              {isDoctorView && (patientPhone || patientEmail) && (
                <div className="flex flex-col gap-1 mt-2 pt-2 border-t">
                  {patientPhone && (
                    <div className="flex items-center gap-2 text-xs">
                      <IconPhone className="h-3 w-3" />
                      <span>{patientPhone}</span>
                    </div>
                  )}
                  {patientEmail && (
                    <div className="flex items-center gap-2 text-xs">
                      <IconMail className="h-3 w-3" />
                      <span>{patientEmail}</span>
                    </div>
                  )}
                </div>
              )}
            </CardDescription>
          </div>
          <Badge className={statusColors[status]} variant="outline">
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      {(reason || symptoms || isDoctorView) && (
        <CardContent className="space-y-3">
          {reason && (
            <div className="flex items-start gap-2">
              <IconStethoscope className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Reason:</p>
                <p className="text-sm text-muted-foreground">{reason}</p>
              </div>
            </div>
          )}
          {symptoms && (
            <div className="flex items-start gap-2 pt-2 border-t">
              <IconFileDescription className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Symptoms:</p>
                <p className="text-sm text-muted-foreground">{symptoms}</p>
              </div>
            </div>
          )}
          {isDoctorView && (insuranceProvider || insurancePolicyNumber) && (
            <div className="flex items-start gap-2 pt-2 border-t">
              <IconCreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground mb-1">Insurance:</p>
                {insuranceProvider && (
                  <p className="text-sm text-muted-foreground">Provider: {insuranceProvider}</p>
                )}
                {insurancePolicyNumber && (
                  <p className="text-sm text-muted-foreground">Policy: {insurancePolicyNumber}</p>
                )}
              </div>
            </div>
          )}
          {isDoctorView && (emergencyContactName || emergencyContactPhone) && (
            <div className="flex items-start gap-2 pt-2 border-t">
              <IconUserCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground mb-1">Emergency Contact:</p>
                {emergencyContactName && (
                  <p className="text-sm text-muted-foreground">{emergencyContactName}</p>
                )}
                {emergencyContactPhone && (
                  <p className="text-sm text-muted-foreground">{emergencyContactPhone}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
      {showActions && (
        <CardContent className="flex gap-2 pt-0">
          {isDoctorView && status === "PENDING" ? (
            <>
              {onAccept && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAccept(id)}
                  className="flex-1"
                >
                  Accept
                </Button>
              )}
              {onReject && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onReject(id)}
                  className="flex-1"
                >
                  Reject
                </Button>
              )}
            </>
          ) : (
            <>
              {onReschedule && (status === "PENDING" || status === "CONFIRMED") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReschedule(id)}
                >
                  Reschedule
                </Button>
              )}
              {onCancel && (status === "PENDING" || status === "CONFIRMED") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(id)}
                >
                  Cancel
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(id)}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

