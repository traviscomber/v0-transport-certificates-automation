import { renderHook, waitFor } from '@testing-library/react'
import { useAnomalyPolling } from '@/lib/hooks/useAnomalyPolling'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('useAnomalyPolling Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should initialize with polling disabled', () => {
    const { result } = renderHook(() =>
      useAnomalyPolling({ enabled: false })
    )

    expect(result.current.isPolling).toBe(false)
  })

  it('should start polling when enabled', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ anomalies: [] }), { status: 200 })
    )

    const { result } = renderHook(() =>
      useAnomalyPolling({ enabled: true, interval: 5000 })
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should call onUpdate callback when data is fetched', async () => {
    const onUpdate = jest.fn()
    const mockData = { anomalies: [{ id: '1', type: 'fraud' }] }

    mockFetch.mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 })
    )

    const { result } = renderHook(() =>
      useAnomalyPolling({ enabled: true, onUpdate })
    )

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(mockData)
    })
  })

  it('should include company_id in request when provided', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ anomalies: [] }), { status: 200 })
    )

    renderHook(() =>
      useAnomalyPolling({ enabled: true, companyId: 'comp-123' })
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('company_id=comp-123'),
        expect.any(Object)
      )
    })
  })

  it('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    renderHook(() => useAnomalyPolling({ enabled: true }))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('should set isPolling state correctly', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ anomalies: [] }), { status: 200 })
    )

    const { result, rerender } = renderHook(() =>
      useAnomalyPolling({ enabled: true })
    )

    // Initially not polling (before first request)
    expect(result.current.isPolling).toBe(false)

    // Trigger polling
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should provide manual refresh function', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ anomalies: [] }), { status: 200 })
    )

    const { result } = renderHook(() =>
      useAnomalyPolling({ enabled: false })
    )

    // Manual refresh
    result.current.refreshAnomalies()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should respect polling interval', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ anomalies: [] }), { status: 200 })
    )

    renderHook(() =>
      useAnomalyPolling({ enabled: true, interval: 10000 })
    )

    // First poll
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    // Advance timers but not enough for next poll (5 second debounce)
    jest.advanceTimersByTime(5000)

    // Should still be only 1 call due to debounce
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should clean up interval on unmount', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ anomalies: [] }), { status: 200 })
    )

    const { unmount } = renderHook(() =>
      useAnomalyPolling({ enabled: true, interval: 5000 })
    )

    unmount()

    // Clear timers and verify no more polls happen
    jest.runAllTimers()
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
