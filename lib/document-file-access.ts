export type DocumentAccessMode = 'preview' | 'download'

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function extractStorageTarget(value: string) {
  try {
    const parsed = new URL(value)
    const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)

    if (match) {
      return {
        bucket: decodeURIComponent(match[1]),
        path: decodeURIComponent(match[2]),
      }
    }
  } catch {
    // Not a full URL, fall through to path handling.
  }

  const trimmed = value.replace(/^\/+/, '')
  const bucketAndPath = trimmed.split('/')

  if (bucketAndPath.length > 1 && bucketAndPath[0].includes('-')) {
    return {
      bucket: bucketAndPath[0],
      path: bucketAndPath.slice(1).join('/'),
    }
  }

  return {
    bucket: 'documents',
    path: trimmed,
  }
}

export function buildDocumentAccessUrl(
  value?: string | null,
  mode: DocumentAccessMode = 'preview'
): string {
  if (!value) return ''

  const encodedValue = encodeURIComponent(value)

  if (mode === 'download') {
    return `/api/documents/download?url=${encodedValue}`
  }

  return `/api/documents/preview?url=${encodedValue}`
}

export function resolveDocumentStorageTarget(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return { bucket: 'documents', path: '' }
  }

  if (!isAbsoluteUrl(normalized)) {
    return extractStorageTarget(normalized)
  }

  return extractStorageTarget(normalized)
}
