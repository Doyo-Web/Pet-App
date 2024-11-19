import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingLocation {
  address: string;
  type: string;
}

interface Pet {
  _id: string;
  id: string;
  image: string;
  name: string;
}

interface BookingData {
  __v: number;
  _id: string;
  acceptedHosts: string[];
  createdAt: string;
  diet: string;
  endDateTime: string;
  location: BookingLocation;
  paymentStatus: string;
  pets: Pet[];
  startDateTime: string;
  updatedAt: string;
  userId: string;
}

interface BookingState {
  bookingData: BookingData | null;
}

const initialState: BookingState = {
  bookingData: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookingData: (state, action: PayloadAction<BookingData>) => {
      state.bookingData = action.payload;
    },
    clearBookingData: (state) => {
      state.bookingData = null;
    },
  },
});

export const { setBookingData, clearBookingData } = bookingSlice.actions;

export default bookingSlice.reducer;
