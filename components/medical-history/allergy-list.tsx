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
import { IconPlus, IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import { ALLERGY_SEVERITY_LABELS } from "@/lib/validations/medical-history";
import type { Allergy } from "@/hooks/use-medical-history";

// Flexible input type for adding allergies
interface AllergyFormData {
  allergen: string;
  reaction?: string | null;
  severity?: string;
  notes?: string | null;
}

interface AllergyListProps {
  allergies: Allergy[];
  onAdd: (data: AllergyFormData) => void;
  onDelete: (id: string) => void;
  isAdding: boolean;
  isDeleting: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  MILD: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  MODERATE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  SEVERE:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  LIFE_THREATENING: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function AllergyList({
  allergies,
  onAdd,
  onDelete,
  isAdding,
  isDeleting,
}: AllergyListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allergen, setAllergen] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("MODERATE");
  const [notes, setNotes] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergen.trim()) return;

    onAdd({
      allergen: allergen.trim(),
      reaction: reaction.trim() || null,
      severity: severity,
      notes: notes.trim() || null,
    });

    // Reset form
    setAllergen("");
    setReaction("");
    setSeverity("MODERATE");
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
            <IconAlertTriangle className="h-5 w-5 text-orange-500" />
            Allergies
          </CardTitle>
          <CardDescription>
            Known allergies and adverse reactions
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Allergy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Allergy</DialogTitle>
              <DialogDescription>
                Record a known allergy or adverse reaction
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergen">Allergen *</Label>
                <Input
                  id="allergen"
                  placeholder="e.g., Penicillin, Peanuts, Latex"
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reaction">Reaction</Label>
                <Input
                  id="reaction"
                  placeholder="e.g., Hives, Swelling, Anaphylaxis"
                  value={reaction}
                  onChange={(e) => setReaction(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ALLERGY_SEVERITY_LABELS).map(
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
                <Label htmlFor="allergyNotes">Notes</Label>
                <Textarea
                  id="allergyNotes"
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
                <Button type="submit" disabled={isAdding || !allergen.trim()}>
                  {isAdding ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Adding...
                    </>
                  ) : (
                    "Add Allergy"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {allergies.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No allergies recorded</p>
            <p className="text-sm mt-1">
              Click &quot;Add Allergy&quot; to record known allergies
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{allergy.allergen}</span>
                    <Badge
                      variant="secondary"
                      className={SEVERITY_COLORS[allergy.severity] || ""}
                    >
                      {ALLERGY_SEVERITY_LABELS[allergy.severity] ||
                        allergy.severity}
                    </Badge>
                  </div>
                  {allergy.reaction && (
                    <p className="text-sm text-muted-foreground">
                      Reaction: {allergy.reaction}
                    </p>
                  )}
                  {allergy.notes && (
                    <p className="text-sm text-muted-foreground">
                      {allergy.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(allergy.id)}
                  disabled={isDeleting && deletingId === allergy.id}
                >
                  {isDeleting && deletingId === allergy.id ? (
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
