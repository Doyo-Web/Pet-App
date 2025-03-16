import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PetProfile {
  _id: string;
  petName: string;
  petType: string;
  petBreed: string;
  // Add other properties as needed
}

interface PetProfileState {
  petProfiles: PetProfile[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PetProfileState = {
  petProfiles: [],
  isLoading: false,
  error: null,
};

const petProfileSlice = createSlice({
  name: "petProfile",
  initialState,
  reducers: {
    setPetProfiles: (state, action: PayloadAction<PetProfile[]>) => {
      state.petProfiles = action.payload;
    },
    addPetProfile: (state, action: PayloadAction<PetProfile>) => {
      state.petProfiles.push(action.payload);
    },
    updatePetProfile: (state, action: PayloadAction<PetProfile>) => {
      const index = state.petProfiles.findIndex(
        (profile) => profile._id === action.payload._id
      );
      if (index !== -1) {
        state.petProfiles[index] = action.payload;
      }
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPetProfiles,
  addPetProfile,
  updatePetProfile,
  setIsLoading,
  setError,
} = petProfileSlice.actions;

export default petProfileSlice.reducer;
