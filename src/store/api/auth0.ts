import { userUpdateAuth0Tokens } from "@/components/users"
import { store } from "@/store"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type Auth0TokensModel = {
  refreshToken: string
  accessToken?: string
}

const enum Auth0GrantType {
  RefreshToken = "http://auth0.com/oauth/grant-type/password-realm",
  AccessToken = "refresh_token",
}
const AUTH0_SCOPE = "openid profile email offline_access"

enum Auth0StorageTypes {
  RefreshTokenStorageNameKey = "@CLMBR_Auth0UserRefreshToken",
  AccessTokenStorageNameKey = "@CLMBR_Auth0UserAccessToken",
}

type AuthResponse = {
  refresh_token: string
  access_token: string
  id_token?: string
  scope?: string
  error?: string
  error_description?: string
  expires_in?: string
  token_type?: string
}

export async function auth0ClearTokensFromStorage() {
  console.log("[auth0] auth0ClearTokensFromStorage called")
  await AsyncStorage.multiRemove([
    Auth0StorageTypes.RefreshTokenStorageNameKey,
    Auth0StorageTypes.AccessTokenStorageNameKey,
  ])
  console.log("[auth0] auth0ClearTokensFromStorage tokens cleared")
}

export async function auth0LoginAndStoreTokens(email: string, password: string) {
  const tokenReps = await auth0FetchToken(email, password)
  if (!tokenReps) {
    console.error("[auth0LoginAndStoreTokens] Failed to get token")
    throw new Error("[auth0LoginAndStoreTokens] Failed to get token")
  }
  const tokens: Auth0TokensModel = {
    refreshToken: tokenReps.refresh_token,
    accessToken: tokenReps.access_token,
  }

  store.dispatch(userUpdateAuth0Tokens(tokens))
  await auth0StoreTokens(tokens)
  return tokens
}

async function auth0StoreTokens(tokens: Auth0TokensModel) {
  //TODO: Use secure storage for the tokens https://docs.expo.dev/versions/latest/sdk/securestore/
  console.log("[auth0StoreTokens] called")
  const refresh: [string, string] = [
    Auth0StorageTypes.RefreshTokenStorageNameKey,
    tokens.refreshToken,
  ]
  console.log("[auth0StoreTokens] refresh", refresh)
  const access: [string, string] = [
    Auth0StorageTypes.AccessTokenStorageNameKey,
    tokens.accessToken ?? "",
  ]
  console.log("[auth0StoreTokens] access", access)
  await AsyncStorage.multiSet([refresh, access])
  console.log("[auth0StoreTokens] Token stored successfully")
}

export async function auth0LoadTokenFromStorage() {
  console.log("[auth0LoadTokenFromStorage] called")
  const tokens = await AsyncStorage.multiGet([
    Auth0StorageTypes.RefreshTokenStorageNameKey,
    Auth0StorageTypes.AccessTokenStorageNameKey,
  ])

  // tokens: [[RefreshTokenStorageNameKey, refreshToken], [AccessTokenStorageNameKey, accessToken]]
  const refreshToken = tokens?.at(0)?.at(1)
  const accessToken = tokens?.at(1)?.at(1)

  console.log("[auth0LoadTokenFromStorage] tokens loaded")
  return { refreshToken, accessToken } as Auth0TokensModel
}

async function auth0FetchToken(email: string, password: string) {
  const url = "TODO: SOME URL"
  const body = {
    grant_type: Auth0GrantType.RefreshToken,
    username: email,
    password,
    client_id: "auth0ClientId",
    client_secret: "auth0ClientSecret",
    scope: AUTH0_SCOPE,
    realm: "auth0Realm",
    audience: "auth0ClientAudience",
  }

  console.log("[auth0FetchToken] URL:", url)
  console.log("[auth0FetchToken] BODY:", JSON.stringify(body, null, 2))

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data: AuthResponse = await response.json()

  if (response.ok && data.refresh_token && data.access_token) {
    return data
  }
  const error = data.error_description || "Unknown error"
  console.error("[auth0FetchToken] Error:", error)
  throw new Error(error)
}

export async function auth0RefreshToken(refreshToken: string) {
  const resp = await fetch("TODO: auth0Url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: "TODO:.auth0ClientId",
      refresh_token: refreshToken,
      audience: "TODO:.auth0ClientAudience",
    }),
  })
  const json = (await resp.json()) as AuthResponse
  if (json?.access_token) {
    const tokens = {
      refreshToken: json.refresh_token,
      accessToken: json.access_token,
    } as Auth0TokensModel
    store.dispatch(userUpdateAuth0Tokens(tokens))
    return tokens
  }
}
