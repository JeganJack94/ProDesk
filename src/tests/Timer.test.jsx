import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from '../components/Timer';
import { databaseService } from '../lib/database';

// Mock database service
jest.mock('../lib/database');

describe('Timer Component', () => {
  const mockProps = {
    projectId: 'project-1',
    taskId: 'task-1',
    userId: 'user-1',
    onTimeEntryCreated: jest.fn()
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders timer component', () => {
    render(<Timer {...mockProps} />);
    expect(screen.getByText(/00:00:00/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  test('starts and stops timer', () => {
    render(<Timer {...mockProps} />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(screen.getByText(/00:00:03/i)).toBeInTheDocument();
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    fireEvent.click(stopButton);
    
    expect(screen.getByText(/00:00:03/i)).toBeInTheDocument();
  });

  test('saves time entry when stopped', async () => {
    databaseService.createTimeEntry.mockResolvedValueOnce({ success: true });
    
    render(<Timer {...mockProps} />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    fireEvent.click(stopButton);
    
    expect(databaseService.createTimeEntry).toHaveBeenCalled();
    expect(mockProps.onTimeEntryCreated).toHaveBeenCalled();
  });
}); 