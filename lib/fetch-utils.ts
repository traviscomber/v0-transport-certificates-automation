/**
 * Centralized fetch utility with consistent error handling
 * Implements the pattern shown in documentation examples
 */

export interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
}

export interface FetchResult<T> {
  data?: T
  error?: string
  status?: number
  details?: any
}

/**
 * Safe fetch wrapper with consistent error handling
 * Handles network errors, non-ok responses, and timeouts
 * 
 * Usage:
 * const { data, error } = await safeFetch('/api/endpoint');
 * if (error) {
 *   console.error(error);
 *   return [];
 * }
 */
export async function safeFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const { timeout = 10000, retries = 0, ...fetchOptions } = options

  let lastError: any = null
  let attempts = 0
  const maxAttempts = (retries || 0) + 1

  while (attempts < maxAttempts) {
    try {
      attempts++
      console.log(`[v0] Fetching ${url} (attempt ${attempts}/${maxAttempts})`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch (e) {
          // Response is not JSON
          errorData = { message: response.statusText }
        }

        console.warn(`[v0] Fetch failed with status ${response.status}:`, {
          url,
          status: response.status,
          error: errorData,
        })

        return {
          error: errorData.error || errorData.message || `HTTP ${response.status}`,
          status: response.status,
          details: errorData.details || errorData,
        }
      }

      let data: T
      try {
        data = await response.json()
      } catch (e) {
        console.error(`[v0] Failed to parse response JSON:`, e)
        return {
          error: 'Invalid response format from server',
          status: 200,
        }
      }

      console.log(`[v0] Fetch successful: ${url}`)
      return { data }
    } catch (err: any) {
      lastError = err
      console.error(`[v0] Fetch error (attempt ${attempts}/${maxAttempts}):`, {
        url,
        error: err.message || String(err),
        name: err.name,
      })

      // Don't retry on abort or timeout if this was the last attempt
      if (attempts < maxAttempts && err.name !== 'AbortError') {
        console.log(`[v0] Retrying fetch...`)
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        continue
      }

      return {
        error: err.name === 'AbortError' 
          ? `Request timeout after ${timeout}ms` 
          : err.message || 'Fetch failed',
        details: err,
      }
    }
  }

  return {
    error: lastError?.message || 'Unknown error',
    details: lastError,
  }
}

/**
 * Fetch with automatic no-store cache header
 * Useful for always-fresh data
 */
export async function fetchFresh<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  return safeFetch<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

/**
 * Add timestamp to URL to bypass cache
 * Usage: fetchWithTimestamp('/api/data') → '/api/data?_t=1234567890'
 */
export function addTimestampParam(url: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_t=${Date.now()}`
}
