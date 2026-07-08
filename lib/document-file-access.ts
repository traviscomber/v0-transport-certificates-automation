export type DocumentAccessMode = 'preview' | 'download'

export type ResolvedDocumentAccessTarget =
  | {
      kind: 'storage'
      bucket: string
      path: string
    }
  | {
      kind: 'external'
      url: string
    }

const SUPABASE_PUBLIC_OBJECT_PATH = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function parseStorageTargetFromPath(value: string) {
  const match = value.match(SUPABASE_PUBLIC_OBJECT_PATH)

  if (match) {
    return {
      kind: 'storage' as const,
      bucket: decodeURIComponent(match[1]),
      path: decodeURIComponent(match[2]),
    }
  }

  return null
}

export function buildDocumentAccessUrl(
  value?: string | null,
  mode: DocumentAccessMode = 'preview'
): string {
  if (!value) return ''

  const encodedValue = encodeURIComponent(value)

  return `/api/documents/${mode}?url=${encodedValue}`
}

export function resolveDocumentStorageTarget(value: string): ResolvedDocumentAccessTarget {
  const normalized = value.trim()

  if (!normalized) {
    return {
      kind: 'storage',
      bucket: 'documents',
      path: '',
    }
  }

  if (isAbsoluteUrl(normalized)) {
    const storageTarget = parseStorageTargetFromPath(normalized)

    if (storageTarget) {
      return storageTarget
    }

    return {
      kind: 'external',
      url: normalized,
    }
  }

  const storageTarget = parseStorageTargetFromPath(normalized)

  if (storageTarget) {
    return storageTarget
  }

  const trimmed = normalized.replace(/^\/+/, '')
  const bucketAndPath = trimmed.split('/')

  if (bucketAndPath.length > 1 && (bucketAndPath[0].includes('-') || bucketAndPath[0] === 'documents')) {
    return {
      kind: 'storage',
      bucket: bucketAndPath[0],
      path: bucketAndPath.slice(1).join('/'),
    }
  }

  return {
    kind: 'storage',
    bucket: 'documents',
    path: trimmed,
  }
}
