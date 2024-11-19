import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import userReducer from "./userSlice";
import petProfileReducer from "./petProfileSlice";
import bookingReducer from "./bookingSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user", "petProfile", "booking"], // Specify which reducers to persist
};

const rootReducer = combineReducers({
  user: userReducer,
  petProfile: petProfileReducer,
  booking: bookingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

store.subscribe(() => {
  try {
    console.log("Store updated:", store.getState());
  } catch (error) {
    console.error("Error updating store:", error);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
