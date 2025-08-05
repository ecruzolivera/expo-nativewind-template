import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@/store"
import { User } from "./userApi"

type UserData = {
  user: User
}

// Define the initial state
const initialState: UserData = {
  user: {} as User,
}

// Create a slice of the Redux store
const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    userUpdateData: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    userLogout: () => {
      return initialState
    },
  },
})

export const { userUpdateData, userLogout } = userDataSlice.actions

export default userDataSlice.reducer

export const selectUserId = (state: RootState) => state.users.user.id
