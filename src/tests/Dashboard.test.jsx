import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { databaseService } from '../lib/database';
import { AuthContext } from '../context/AuthContext';

// Mock database service and charts
jest.mock('../lib/database');
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null
}));

describe('Dashboard Component', () => {
  const mockUser = { uid: 'test-user' };
  const mockProjects = [
    { id: '1', title: 'Project 1', status: 'in-progress' },
    { id: '2', title: 'Project 2', status: 'completed' }
  ];

  beforeEach(() => {
    databaseService.listProjects.mockResolvedValue({ success: true, projects: mockProjects });
    databaseService.listProjectTasks.mockResolvedValue({ success: true, tasks: [] });
    databaseService.listTimeEntries.mockResolvedValue({ success: true, timeEntries: [] });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: mockUser }}>
          <Dashboard />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('renders dashboard with project metrics', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Total Projects/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total projects count
    });
  });

  test('displays loading state initially', () => {
    renderDashboard();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    databaseService.listProjects.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
}); 