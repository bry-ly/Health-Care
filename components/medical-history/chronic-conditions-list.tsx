"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { IconPlus, IconTrash, IconHeartbeat } from "@tabler/icons-react";
import { CONDITION_STATUS_LABELS } from "@/lib/validations/medical-history";
import type { ChronicCondition } from "@/hooks/use-medical-history";

// Flexible input type for adding conditions
interface ConditionFormData {
  condition: string;
  status?: string;
  treatment?: string | null;
  notes?: string | null;
}

interface ChronicConditionsListProps {
  conditions: ChronicCondition[];
  onAdd: (data: ConditionFormData) => void;
  onDelete: (id: string) => void;
  isAdding: boolean;
  isDeleting: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  MANAGED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function ChronicConditionsList({
  conditions,
  onAdd,
  onDelete,
  isAdding,
  isDeleting,
}: ChronicConditionsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) return;

    onAdd({
      condition: condition.trim(),
      status: status,
      treatment: treatment.trim() || null,
      notes: notes.trim() || null,
    });

    // Reset form
    setCondition("");
    setStatus("ACTIVE");
    setTreatment("");
    setNotes("");
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    onDelete(id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <IconHeartbeat className="h-5 w-5 text-red-500" />
            Chronic Conditions
          </CardTitle>
          <CardDescription>
            Ongoing health conditions and treatments
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Chronic Condition</DialogTitle>
              <DialogDescription>
                Record an ongoing health condition
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Input
                  id="condition"
                  placeholder="e.g., Diabetes Type 2, Hypertension"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDITION_STATUS_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Current Treatment</Label>
                <Textarea
                  id="treatment"
                  placeholder="Medications, therapies, lifestyle changes..."
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditionNotes">Notes</Label>
                <Textarea
                  id="conditionNotes"
                  placeholder="Additional details..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding || !condition.trim()}>
                  {isAdding ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Adding...
                    </>
                  ) : (
                    "Add Condition"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {conditions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No chronic conditions recorded</p>
            <p className="text-sm mt-1">
              Click &quot;Add Condition&quot; to record ongoing health
              conditions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conditions.map((cond) => (
              <div
                key={cond.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cond.condition}</span>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[cond.status] || ""}
                    >
                      {CONDITION_STATUS_LABELS[cond.status] || cond.status}
                    </Badge>
                  </div>
                  {cond.treatment && (
                    <p className="text-sm text-muted-foreground">
                      Treatment: {cond.treatment}
                    </p>
                  )}
                  {cond.notes && (
                    <p className="text-sm text-muted-foreground">
                      {cond.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(cond.id)}
                  disabled={isDeleting && deletingId === cond.id}
                >
                  {isDeleting && deletingId === cond.id ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <IconTrash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
