import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { Mutex } from "async-mutex"
import { auth0RefreshToken } from "./auth0"
import { type RootState } from "@/store/store"
import { delay } from "@/utils/delay"
import { userLogout } from "@/components/users"

const refreshMutex = new Mutex()

function createBaseQuery(token?: string) {
  return fetchBaseQuery({
    baseUrl: `https://jsonplaceholder.typicode.com`,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  })
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const url = typeof args === "string" ? args : args.url
  const method = typeof args === "string" ? "GET" : (args.method ?? "GET")
  // if another call is already refreshing, wait for it to finish
  await refreshMutex.waitForUnlock()
  console.log(`[CloudApi] ${method} ${url}`)

  const state = api.getState() as RootState
  const accessToken = state.users.auth0Tokens?.accessToken
  const refreshToken = state.users.auth0Tokens?.refreshToken

  // Initial request
  let result = await createBaseQuery(accessToken)(args, api, extraOptions)

  // Handle token expiration
  if (result.error && result.error.status === 401 && refreshToken) {
    if (!refreshMutex.isLocked()) {
      console.warn("we’re the first to notice the 401, acquire the mutex")
      const release = await refreshMutex.acquire()
      let refreshCounter = 1
      let tokens = null
      try {
        while (refreshCounter++ <= 3) {
          try {
            console.warn("[CloudApi] Token expired. Attempting refresh...", refreshCounter)
            tokens = await auth0RefreshToken(refreshToken)
            if (tokens?.accessToken) {
              break // stop refreshing
            }
          } catch (error) {
            console.error("[CloudApi] Refresh token error:", error)
            console.warn("[CloudApi] waiting 1 second before attempting to refresh again")
            await delay(1000)
          }
        }
      } finally {
        release()
      }
      if (tokens?.accessToken) {
        console.info("[CloudApi] Token refreshed. Retrying request...")
        // Retry request with refreshed token
        result = await createBaseQuery(tokens.accessToken)(args, api, extraOptions)
      } else {
        console.error("[CloudApi] Token refresh failed login out user")
        api.dispatch(userLogout())
        new Error("Session expired")
      }
    } else {
      console.warn("another request is already refreshing; wait for it to finish")
      await refreshMutex.waitForUnlock()
      // re-read the updated token from state
      const newState = api.getState() as RootState
      const newAccessToken = newState.users.auth0Tokens?.accessToken
      // retry original request with whatever token is now in state
      result = await createBaseQuery(newAccessToken)(args, api, extraOptions)
    }
  }

  if (result.error) {
    console.error(`[CloudApi] ${method} ${url}\nerror:`, result.error)
  }

  return result
}

export const api = createApi({
  reducerPath: "api",
  keepUnusedDataFor: 60,
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users"],
  endpoints: () => ({}),
})
