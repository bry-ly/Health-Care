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
import { Spinner } from "@/components/ui/spinner";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { BLOOD_TYPE_LABELS } from "@/lib/validations/medical-history";
import type { MedicalHistory } from "@/hooks/use-medical-history";

interface MedicalHistoryFormProps {
  medicalHistory: MedicalHistory | null;
  onSubmit: (data: {
    bloodType?: string;
    height?: number | null;
    weight?: number | null;
    surgicalHistory?: string | null;
    familyHistory?: string | null;
    currentMedications?: string | null;
    lifestyle?: string | null;
    notes?: string | null;
  }) => void;
  isSubmitting: boolean;
}

export function MedicalHistoryForm({
  medicalHistory,
  onSubmit,
  isSubmitting,
}: MedicalHistoryFormProps) {
  const [bloodType, setBloodType] = useState(
    medicalHistory?.bloodType || "UNKNOWN"
  );
  const [height, setHeight] = useState(
    medicalHistory?.height?.toString() || ""
  );
  const [weight, setWeight] = useState(
    medicalHistory?.weight?.toString() || ""
  );
  const [surgicalHistory, setSurgicalHistory] = useState(
    medicalHistory?.surgicalHistory || ""
  );
  const [familyHistory, setFamilyHistory] = useState(
    medicalHistory?.familyHistory || ""
  );
  const [currentMedications, setCurrentMedications] = useState(
    medicalHistory?.currentMedications || ""
  );
  const [lifestyle, setLifestyle] = useState(medicalHistory?.lifestyle || "");
  const [notes, setNotes] = useState(medicalHistory?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      bloodType,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      surgicalHistory: surgicalHistory || null,
      familyHistory: familyHistory || null,
      currentMedications: currentMedications || null,
      lifestyle: lifestyle || null,
      notes: notes || null,
    });
  };

  // Calculate BMI if height and weight are available
  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h && w && h > 0) {
      const heightInMeters = h / 100;
      const bmi = w / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();
  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5)
      return { label: "Underweight", color: "text-blue-500" };
    if (bmiValue < 25) return { label: "Normal", color: "text-green-500" };
    if (bmiValue < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-red-500" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Health Information</CardTitle>
        <CardDescription>
          Your general health profile and medical background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Type and Measurements */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BLOOD_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                min="0"
                max="300"
                step="0.1"
                placeholder="e.g., 170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                max="500"
                step="0.1"
                placeholder="e.g., 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {bmi && (
              <div className="space-y-2">
                <Label>BMI</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3">
                  <span className="font-medium">{bmi}</span>
                  <span
                    className={`ml-2 text-sm ${
                      getBMICategory(parseFloat(bmi)).color
                    }`}
                  >
                    ({getBMICategory(parseFloat(bmi)).label})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Text fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Textarea
                id="currentMedications"
                placeholder="List any medications you are currently taking..."
                rows={3}
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surgicalHistory">Surgical History</Label>
              <Textarea
                id="surgicalHistory"
                placeholder="List any past surgeries or procedures..."
                rows={3}
                value={surgicalHistory}
                onChange={(e) => setSurgicalHistory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyHistory">Family Medical History</Label>
              <Textarea
                id="familyHistory"
                placeholder="Relevant medical conditions in your family..."
                rows={3}
                value={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifestyle">Lifestyle</Label>
              <Textarea
                id="lifestyle"
                placeholder="Smoking, alcohol, exercise habits..."
                rows={3}
                value={lifestyle}
                onChange={(e) => setLifestyle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any other relevant health information..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
