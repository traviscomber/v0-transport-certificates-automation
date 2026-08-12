const DEFAULT_TIMEOUT_MS = 8_000

export type GTrackHealthResult = {
  configured: boolean
  reachable: boolean
  status: number | null
  latencyMs: number | null
  classification: 'ok' | 'not_configured' | 'invalid_credentials' | 'not_found' | 'unavailable' | 'error'
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function classifyStatus(status: number): GTrackHealthResult['classification'] {
  if (status >= 200 && status < 300) return 'ok'
  if (status === 401 || status === 403) return 'invalid_credentials'
  if (status === 404) return 'not_found'
  if (status >= 500) return 'unavailable'
  return 'error'
}

export async function checkGTrackHealth(
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<GTrackHealthResult> {
  const baseUrl = process.env.GTRACK_API_BASE_URL
  const token = process.env.GTRACK_API_TOKEN

  if (!baseUrl || !token) {
    return {
      configured: false,
      reachable: false,
      status: null,
      latencyMs: null,
      classification: 'not_configured',
    }
  }

  let url: string
  try {
    url = normalizeBaseUrl(baseUrl)
    new URL(url)
  } catch {
    return {
      configured: true,
      reachable: false,
      status: null,
      latencyMs: null,
      classification: 'error',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = Date.now()

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    const status = response.status
    return {
      configured: true,
      reachable: status >= 200 && status < 300,
      status,
      latencyMs: Date.now() - startedAt,
      classification: classifyStatus(status),
    }
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      status: null,
      latencyMs: Date.now() - startedAt,
      classification: error instanceof DOMException && error.name === 'AbortError'
        ? 'unavailable'
        : 'error',
    }
  } finally {
    clearTimeout(timeout)
  }
}
