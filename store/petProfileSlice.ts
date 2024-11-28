import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of a single pet profile
interface PetProfile {
  _id: string;
  aggressiveTendencies: {
    femaleDog: boolean;
    human: boolean;
    maleDog: boolean;
    otherAnimals: boolean;
  };
  bathingFrequency: string;
  collarAggression: boolean;
  dailyCombing: boolean;
  dewormingDate: string;
  dietSchedule: { _id: string; portion: string; time: string }[];
  foodAggression: boolean;
  foodAllergy: string;
  groomingAggression: boolean;
  isNeutered: boolean;
  medicationDetails: {
    administration: string;
    nameFrequency: string;
    reason: string;
  };
  petAgeMonths: string;
  petAgeYears: string;
  petBreed: string;
  petGender: string;
  petImages: { _id: string; public_id: string; url: string }[];
  petName: string;
  petType: string;
  pottyTraining: string;
  resourceGuarding: boolean;
  tickTreatmentDate: string;
  toiletBreaks: string;
  userId: string;
  vaccinationDate: string;
  walkPerDay: string;
}

// Define the state interface for multiple pet profiles
interface PetProfileState {
  petProfiles: PetProfile[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: PetProfileState = {
  petProfiles: [],
  isLoading: false,
  error: null,
};

const petProfileSlice = createSlice({
  name: "petProfile",
  initialState,
  reducers: {
    // Add a new pet profile
    addPetProfile(state, action: PayloadAction<PetProfile>) {
      if (!state.petProfiles) state.petProfiles = []; // Defensive check
      state.petProfiles.push(action.payload);
    },
    // Replace the entire array of pet profiles
    setPetProfiles(state, action: PayloadAction<PetProfile[]>) {
      state.petProfiles = action.payload || [];
    },
    // Update an existing pet profile by ID
    updatePetProfile(state, action: PayloadAction<PetProfile>) {
      const index = state.petProfiles.findIndex(
        (profile) => profile._id === action.payload._id
      );
      if (index !== -1) {
        state.petProfiles[index] = action.payload;
      }
    },
    // Remove a pet profile by ID
    removePetProfile(state, action: PayloadAction<string>) {
      state.petProfiles = state.petProfiles.filter(
        (profile) => profile._id !== action.payload
      );
    },
    // Set loading state
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    // Set error state
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  addPetProfile,
  setPetProfiles,
  updatePetProfile,
  removePetProfile,
  setIsLoading,
  setError,
} = petProfileSlice.actions;

export default petProfileSlice.reducer;
