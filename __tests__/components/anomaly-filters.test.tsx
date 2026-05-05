import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock filter component
const AnomalyFiltersMock = ({ onFilterChange }: any) => (
  <div data-testid="anomaly-filters">
    <select
      data-testid="severity-filter"
      onChange={(e) => onFilterChange({ severity: e.target.value })}
    >
      <option value="all">All Severities</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="critical">Critical</option>
    </select>

    <select
      data-testid="status-filter"
      onChange={(e) => onFilterChange({ actionTaken: e.target.value })}
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>

    <input
      type="text"
      data-testid="search-input"
      placeholder="Search..."
      onChange={(e) => onFilterChange({ search: e.target.value })}
    />
  </div>
)

describe('Anomaly Filters Component', () => {
  it('should render all filter controls', () => {
    const onFilterChange = jest.fn()
    render(<AnomalyFiltersMock onFilterChange={onFilterChange} />)

    expect(screen.getByTestId('severity-filter')).toBeInTheDocument()
    expect(screen.getByTestId('status-filter')).toBeInTheDocument()
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  it('should call onFilterChange when severity filter changes', () => {
    const onFilterChange = jest.fn()
    render(<AnomalyFiltersMock onFilterChange={onFilterChange} />)

    const severitySelect = screen.getByTestId('severity-filter') as HTMLSelectElement
    fireEvent.change(severitySelect, { target: { value: 'critical' } })

    expect(onFilterChange).toHaveBeenCalledWith({ severity: 'critical' })
  })

  it('should call onFilterChange when status filter changes', () => {
    const onFilterChange = jest.fn()
    render(<AnomalyFiltersMock onFilterChange={onFilterChange} />)

    const statusSelect = screen.getByTestId('status-filter') as HTMLSelectElement
    fireEvent.change(statusSelect, { target: { value: 'approved' } })

    expect(onFilterChange).toHaveBeenCalledWith({ actionTaken: 'approved' })
  })

  it('should call onFilterChange when search input changes', () => {
    const onFilterChange = jest.fn()
    render(<AnomalyFiltersMock onFilterChange={onFilterChange} />)

    const searchInput = screen.getByTestId('search-input') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'fraud' } })

    expect(onFilterChange).toHaveBeenCalledWith({ search: 'fraud' })
  })

  it('should have default values', () => {
    const onFilterChange = jest.fn()
    render(<AnomalyFiltersMock onFilterChange={onFilterChange} />)

    const severitySelect = screen.getByTestId('severity-filter') as HTMLSelectElement
    const statusSelect = screen.getByTestId('status-filter') as HTMLSelectElement

    expect(severitySelect.value).toBe('all')
    expect(statusSelect.value).toBe('all')
  })

  it('should display all severity options', () => {
    const onFilterChange = jest.fn()
    render(<AnomalyFiltersMock onFilterChange={onFilterChange} />)

    expect(screen.getByText('All Severities')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('should display all status options', () => {
    const onFilterChange = jest.fn()
    render(<AnomalyFiltersMock onFilterChange={onFilterChange} />)

    expect(screen.getByText('All Status')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })
})
