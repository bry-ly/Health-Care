import { z } from "zod";

// Blood type enum values matching Prisma schema
export const bloodTypeEnum = z.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "UNKNOWN",
]);

// Allergy severity enum values matching Prisma schema
export const allergySeverityEnum = z.enum([
  "MILD",
  "MODERATE",
  "SEVERE",
  "LIFE_THREATENING",
]);

// Chronic condition status
export const conditionStatusEnum = z.enum(["ACTIVE", "MANAGED", "RESOLVED"]);

// Medical History base schema
export const medicalHistorySchema = z.object({
  bloodType: bloodTypeEnum.optional().default("UNKNOWN"),
  height: z.number().positive().max(300).optional().nullable(), // cm
  weight: z.number().positive().max(500).optional().nullable(), // kg
  surgicalHistory: z.string().max(2000).optional().nullable(),
  familyHistory: z.string().max(2000).optional().nullable(),
  currentMedications: z.string().max(2000).optional().nullable(),
  lifestyle: z.string().max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// Create/Update medical history schema
export const upsertMedicalHistorySchema = medicalHistorySchema.extend({
  patientId: z.string().min(1, "Patient ID is required"),
});

// Allergy schema
export const allergySchema = z.object({
  allergen: z.string().min(1, "Allergen name is required").max(200),
  reaction: z.string().max(500).optional().nullable(),
  severity: allergySeverityEnum.optional().default("MODERATE"),
  diagnosedDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }),
  notes: z.string().max(1000).optional().nullable(),
});

// Create allergy schema
export const createAllergySchema = allergySchema.extend({
  medicalHistoryId: z.string().min(1, "Medical History ID is required"),
});

// Update allergy schema
export const updateAllergySchema = allergySchema.partial().extend({
  id: z.string().min(1, "Allergy ID is required"),
});

// Chronic condition schema
export const chronicConditionSchema = z.object({
  condition: z.string().min(1, "Condition name is required").max(200),
  diagnosedDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }),
  status: conditionStatusEnum.optional().default("ACTIVE"),
  treatment: z.string().max(1000).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

// Create chronic condition schema
export const createChronicConditionSchema = chronicConditionSchema.extend({
  medicalHistoryId: z.string().min(1, "Medical History ID is required"),
});

// Update chronic condition schema
export const updateChronicConditionSchema = chronicConditionSchema
  .partial()
  .extend({
    id: z.string().min(1, "Condition ID is required"),
  });

// Type exports
export type BloodType = z.infer<typeof bloodTypeEnum>;
export type AllergySeverity = z.infer<typeof allergySeverityEnum>;
export type ConditionStatus = z.infer<typeof conditionStatusEnum>;
export type MedicalHistoryInput = z.infer<typeof medicalHistorySchema>;
export type UpsertMedicalHistoryInput = z.infer<
  typeof upsertMedicalHistorySchema
>;
export type AllergyInput = z.infer<typeof allergySchema>;
export type CreateAllergyInput = z.infer<typeof createAllergySchema>;
export type UpdateAllergyInput = z.infer<typeof updateAllergySchema>;
export type ChronicConditionInput = z.infer<typeof chronicConditionSchema>;
export type CreateChronicConditionInput = z.infer<
  typeof createChronicConditionSchema
>;
export type UpdateChronicConditionInput = z.infer<
  typeof updateChronicConditionSchema
>;

// Blood type display labels
export const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  UNKNOWN: "Unknown",
};

// Allergy severity display labels
export const ALLERGY_SEVERITY_LABELS: Record<string, string> = {
  MILD: "Mild",
  MODERATE: "Moderate",
  SEVERE: "Severe",
  LIFE_THREATENING: "Life-Threatening",
};

// Condition status display labels
export const CONDITION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  MANAGED: "Managed",
  RESOLVED: "Resolved",
};
