// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: {
    fullname: string;
    avatar: string;
    phonenumber: string;
    email: string;
    profession: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
      setUser: (state, action: PayloadAction<UserState["user"]>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setLoading, setError, clearUser } = userSlice.actions;

export default userSlice.reducer;
