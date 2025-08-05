import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit"
import { api, auth0ClearTokensFromStorage, Auth0TokensModel } from "@/store/api"
import { RootState, startAppListening } from "@/store"
import { User } from "./userApi"

type UserData = {
  user: User
  auth0Tokens: Auth0TokensModel
}

// Define the initial state
const initialState: UserData = {
  user: {} as User,
  auth0Tokens: {} as Auth0TokensModel,
}

// Create a slice of the Redux store
const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    userUpdateAuth0Tokens: (state, action: PayloadAction<Auth0TokensModel>) => {
      state.auth0Tokens = action.payload
    },
    userUpdateData: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    userLogout: () => {
      return initialState
    },
  },
})

export const { userUpdateAuth0Tokens, userUpdateData, userLogout } = userDataSlice.actions

export default userDataSlice.reducer

export const selectUserId = (state: RootState) => state.users.user.id

startAppListening({
  matcher: isAnyOf(userLogout),
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners()
    console.log("[userDataReducer] reseting navigation to Welcome")
    listenerApi.dispatch(api.util.resetApiState())
    await auth0ClearTokensFromStorage()
  },
})
