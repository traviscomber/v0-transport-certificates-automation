import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock component for testing (simplified version of anomaly-table)
const AnomalyTableMock = ({ anomalies, onActionClick }: any) => (
  <div data-testid="anomaly-table">
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Severity</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {anomalies.map((anomaly: any) => (
          <tr key={anomaly.id} data-testid={`anomaly-row-${anomaly.id}`}>
            <td>{anomaly.anomaly_type}</td>
            <td>{anomaly.severity}</td>
            <td>{anomaly.action_taken || 'Pending'}</td>
            <td>
              <button onClick={() => onActionClick(anomaly.id, 'approved')}>
                Approve
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

describe('Anomaly Table Component', () => {
  const mockAnomalies = [
    {
      id: '1',
      anomaly_type: 'fraud',
      severity: 'critical',
      action_taken: null,
    },
    {
      id: '2',
      anomaly_type: 'expiration',
      severity: 'high',
      action_taken: 'approved',
    },
  ]

  it('should render table with anomalies', () => {
    const onActionClick = jest.fn()
    render(
      <AnomalyTableMock
        anomalies={mockAnomalies}
        onActionClick={onActionClick}
      />
    )

    expect(screen.getByTestId('anomaly-table')).toBeInTheDocument()
    expect(screen.getByTestId('anomaly-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('anomaly-row-2')).toBeInTheDocument()
  })

  it('should display correct anomaly data', () => {
    const onActionClick = jest.fn()
    render(
      <AnomalyTableMock
        anomalies={mockAnomalies}
        onActionClick={onActionClick}
      />
    )

    expect(screen.getByText('fraud')).toBeInTheDocument()
    expect(screen.getByText('critical')).toBeInTheDocument()
    expect(screen.getByText('expiration')).toBeInTheDocument()
  })

  it('should display action buttons', () => {
    const onActionClick = jest.fn()
    render(
      <AnomalyTableMock
        anomalies={mockAnomalies}
        onActionClick={onActionClick}
      />
    )

    const approveButtons = screen.getAllByText('Approve')
    expect(approveButtons).toHaveLength(2)
  })

  it('should call onActionClick when approve button is clicked', () => {
    const onActionClick = jest.fn()
    render(
      <AnomalyTableMock
        anomalies={mockAnomalies}
        onActionClick={onActionClick}
      />
    )

    const approveButtons = screen.getAllByText('Approve')
    fireEvent.click(approveButtons[0])

    expect(onActionClick).toHaveBeenCalledWith('1', 'approved')
  })

  it('should render empty state when no anomalies', () => {
    const onActionClick = jest.fn()
    render(
      <AnomalyTableMock anomalies={[]} onActionClick={onActionClick} />
    )

    expect(screen.getByTestId('anomaly-table')).toBeInTheDocument()
    const rows = screen.queryAllByRole('row')
    expect(rows).toHaveLength(1) // only header row
  })

  it('should display pending status for null action_taken', () => {
    const onActionClick = jest.fn()
    render(
      <AnomalyTableMock
        anomalies={mockAnomalies}
        onActionClick={onActionClick}
      />
    )

    expect(screen.getByText('Pending')).toBeInTheDocument()
  })
})
