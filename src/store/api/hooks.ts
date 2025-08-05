import { useCallback, useEffect, useState } from "react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { TypedUseQueryStateResult } from "@reduxjs/toolkit/query/react"

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  total: number
  page: number
  pageCount: number
}

/**
 * • QArg is the full “args” type your endpoint hook uses,
 *   including page?: number (and any other optional filters, e.g. limit?).
 * • TData is your item type.
 */
export function usePaginatedQuery<QArg extends { page?: number }, TData>(
  /**
   * Pass RTK-Query’s generated hook directly, e.g.
   *   useGetClassesQuery
   */
  useQueryHook: (
    args: QArg,
    options?: { skip?: boolean },
  ) => TypedUseQueryStateResult<
    PaginatedResponse<TData>,
    QArg,
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >,

  initialArgs?: QArg,
  options?: { skip?: boolean },
) {
  const [page, setPage] = useState(initialArgs?.page ?? 1)
  const [allData, setAllData] = useState<TData[]>([])
  const [hasMore, setHasMore] = useState(true)

  // this will be exactly QArg
  const mergedArgs = { ...initialArgs, page } as QArg

  const { data, isFetching, isError, error } = useQueryHook(mergedArgs, {
    skip: !!options?.skip,
  })

  useEffect(() => {
    if (!data) {
      return
    }

    setAllData((prev) => [...prev, ...data.data])

    if (data.page >= data.pageCount) {
      setHasMore(false)
    }
  }, [data])

  const fetchNextPage = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((p) => p + 1)
    }
  }, [isFetching, hasMore])

  return {
    data: allData,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasMore,
    currentPage: page,
  }
}

/**
 * Auto-fetch every page of a paginated endpoint.
 *
 * @param useQueryHook   RTK-Query hook (e.g. useGetThingsQuery)
 * @param initialArgs    all your query args except `page`
 */
export function useAllPagesQuery<QArg extends { page?: number }, TData>(
  useQueryHook: (
    args: QArg,
    options?: { skip?: boolean },
  ) => TypedUseQueryStateResult<
    PaginatedResponse<TData>,
    QArg,
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >,
  initialArgs: QArg,
  options?: { skip?: boolean },
) {
  // reuse your existing paginated hook
  const { data, isFetching, isError, error, hasMore, fetchNextPage } = usePaginatedQuery<
    QArg,
    TData
  >(useQueryHook, initialArgs, options)

  // as soon as one page finishes, fetch the next — until hasMore === false
  useEffect(() => {
    if (data.length > 0 && !isFetching && !isError && hasMore) {
      fetchNextPage()
    }
  }, [data, isFetching, isError, hasMore, fetchNextPage])

  return {
    data, // TData[] of *all* pages concatenated
    isLoading: isFetching && data.length === 0,
    isFetching, // true whenever *any* page is in-flight
    isError,
    error,
  }
}
