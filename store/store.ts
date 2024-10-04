// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable if needed, for example, when dealing with non-serializable data like Dates.
    }),
});

store.subscribe(() => {
  try {
    console.log("Store updated:", store.getState());
  } catch (error) {
    console.error("Error updating store:", error);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
