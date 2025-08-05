import { api } from "@/store/api"

export type User = {
  id: number
  name: string
  age: number
}
type UserMeDto = {
  user: User
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserMe: builder.query<UserMeDto, void>({
      query: () => {
        return `users`
      },
      providesTags: [{ type: "Users" as const, id: "ME" }],
    }),
    createUser: builder.mutation<User, User>({
      query(body) {
        return {
          url: `users`,
          method: "POST",
          body,
        }
      },
      invalidatesTags: (result) =>
        result?.id ? [{ type: "Users" as const, id: result.id }] : ["Users"],
    }),
  }),
})

export const { useGetUserMeQuery, useCreateUserMutation } = usersApi
