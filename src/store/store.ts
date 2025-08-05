import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"
import userSlice from "@/components/users/userSlice"
import { listenerMiddleware } from "./listenerMiddleware"
import { api } from "./api"

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    users: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .prepend(listenerMiddleware.middleware)
      .concat(api.middleware),
})

// Infer the type of `store`
export type AppStore = typeof store
export type RootState = ReturnType<AppStore["getState"]>
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]
// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
