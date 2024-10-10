import { Schema, model, Document } from "mongoose";

// Define interfaces for complex nested objects
interface MedicationDetails {
  nameFrequency?: string;
  reason?: string;
  administration?: string;
}

interface AggressiveTendencies {
  maleDog: boolean;
  femaleDog: boolean;
  human: boolean;
  otherAnimals: boolean;
}

interface DietSchedule {
  time: string;
  portion: string;
}

// Define the main Pet Profile interface
interface PetProfile extends Document {
  userid: Schema.Types.ObjectId; // Reference to the User as ObjectId
  petType: string;
  petName: string;
  petBreed: string;
  petAgeYears: string;
  petAgeMonths: string;
  petGender: string;
  lastHeatCycle?: Date | string;
  isNeutered?: boolean;
  neuteredDate?: Date | string;
  pottyTraining: string;
  toiletBreaks?: string;
  bathingFrequency?: string;
  walkPerDay: string;
  dailyCombing?: boolean;
  dietSchedule: DietSchedule[];
  foodAllergy: string;
  vaccinationDate: Date;
  dewormingDate: Date;
  tickTreatmentDate: Date;
  medicationDetails?: MedicationDetails; // Set as optional
  aggressiveTendencies: AggressiveTendencies;
  resourceGuarding: boolean;
  groomingAggression: boolean;
  collarAggression: boolean;
  foodAggression: boolean;
  petImages: string[];
}

// Mongoose schema definition
const PetProfileSchema = new Schema<PetProfile>({
  userid: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Properly defined as ObjectId
  petType: { type: String, required: true },
  petName: { type: String, required: true },
  petBreed: { type: String, required: true },
  petAgeYears: { type: String, required: true },
  petAgeMonths: { type: String, required: true },
  petGender: { type: String, required: true },

  // Conditional fields for female pets only
  lastHeatCycle: {
    type: Date,
    required: function (this: PetProfile) {
      return this.petGender === "female";
    },
  },
  isNeutered: {
    type: Boolean,
    required: function (this: PetProfile) {
      return this.petGender === "female";
    },
  },
  neuteredDate: {
    type: Date,
    required: function (this: PetProfile) {
      return this.petGender === "female" && this.isNeutered;
    },
  },

  pottyTraining: { type: String, required: true },

  // Conditional field for pottyTraining set to "outdoors"
  toiletBreaks: {
    type: String,
    required: function (this: PetProfile) {
      return this.pottyTraining === "outdoors";
    },
  },

  // bathingFrequency is optional
  bathingFrequency: { type: String, required: false },

  walkPerDay: { type: String, required: true },

  // dailyCombing is now optional
  dailyCombing: { type: Boolean, required: false },

  dietSchedule: [
    {
      time: { type: String, required: true },
      portion: { type: String, required: true },
    },
  ],
  foodAllergy: { type: String, required: false },
  vaccinationDate: { type: Date, required: true },
  dewormingDate: { type: Date, required: true },
  tickTreatmentDate: { type: Date, required: true },

  // medicationDetails is now optional
  medicationDetails: {
    nameFrequency: { type: String, required: false },
    reason: { type: String, required: false },
    administration: { type: String, required: false },
  },

  aggressiveTendencies: {
    maleDog: { type: Boolean, required: true },
    femaleDog: { type: Boolean, required: true },
    human: { type: Boolean, required: true },
    otherAnimals: { type: Boolean, required: true },
  },

  resourceGuarding: { type: Boolean, required: true },
  groomingAggression: { type: Boolean, required: true },
  collarAggression: { type: Boolean, required: true },
  foodAggression: { type: Boolean, required: true },

  petImages: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
});

// Export the model
export const PetProfileModel = model<PetProfile>(
  "PetProfile",
  PetProfileSchema
);
