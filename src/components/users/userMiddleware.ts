import { startAppListening } from "@/store"
import { api } from "@/store/api/api"
import { isAnyOf } from "@reduxjs/toolkit"
import { userLogout } from "./userSlice"

startAppListening({
  matcher: isAnyOf(userLogout),
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners()
    console.log("[userDataReducer] reseting navigation to Welcome")
    listenerApi.dispatch(api.util.resetApiState())
  },
})
