import "server-only"

import type { GTrackConfig } from "./types"

function getConfig(): GTrackConfig {
  const baseUrl = process.env.GTRACK_API_BASE_URL
  const apiToken = process.env.GTRACK_API_TOKEN

  if (!baseUrl || !apiToken) {
    throw new Error("GTrack integration is not configured")
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), apiToken }
}

export async function gtrackRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { baseUrl, apiToken } = getConfig()
  const response = await fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
      ...init.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`GTrack API request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export function isGTrackConfigured(): boolean {
  return Boolean(process.env.GTRACK_API_BASE_URL && process.env.GTRACK_API_TOKEN)
}
