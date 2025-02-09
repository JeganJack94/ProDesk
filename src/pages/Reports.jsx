import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import {
  BarChart3,
  PieChart,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dateRange, setDateRange] = useState('week'); // week, month, year
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalTimeSpent: 0,
    clientDistribution: [],
    taskStatusDistribution: [],
    projectProgress: [],
    timeDistribution: []
  });

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user?.uid]);

  useEffect(() => {
    if (projects.length > 0) {
      calculateMetrics();
    }
  }, [projects, timeEntries, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsResult = await databaseService.listProjects(user.uid);
      
      if (projectsResult.success) {
        setProjects(projectsResult.projects);
        
        // Fetch time entries for all projects
        const timeEntriesPromises = projectsResult.projects.map(project =>
          databaseService.listTimeEntries(user.uid, project.id)
        );
        
        const timeEntriesResults = await Promise.all(timeEntriesPromises);
        const allTimeEntries = timeEntriesResults.reduce((acc, result) => {
          if (result.success) {
            return [...acc, ...result.timeEntries];
          }
          return acc;
        }, []);
        
        setTimeEntries(allTimeEntries);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const now = new Date();
    const startDate = getStartDate(dateRange);

    // Filter data based on date range
    const filteredProjects = projects.filter(project => 
      new Date(project.createdAt) >= startDate
    );

    const filteredTimeEntries = timeEntries.filter(entry =>
      new Date(entry.createdAt) >= startDate
    );

    // Calculate basic metrics
    const activeProjects = filteredProjects.filter(p => p.status === 'in-progress').length;
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
    const totalTasks = filteredProjects.reduce((acc, p) => acc + (p.tasks?.total || 0), 0);
    const completedTasks = filteredProjects.reduce((acc, p) => acc + (p.tasks?.completed || 0), 0);
    const totalTimeSpent = filteredTimeEntries.reduce((acc, entry) => acc + entry.duration, 0);

    // Calculate client distribution
    const clientDistribution = filteredProjects.reduce((acc, project) => {
      const client = project.client?.company || 'No Client';
      acc[client] = (acc[client] || 0) + 1;
      return acc;
    }, {});

    // Calculate task status distribution
    const taskStatusDistribution = filteredProjects.reduce((acc, project) => {
      project.tasks?.list?.forEach(task => {
        acc[task.status] = (acc[task.status] || 0) + 1;
      });
      return acc;
    }, {});

    // Calculate project progress
    const projectProgress = filteredProjects.map(project => ({
      name: project.title,
      progress: project.progress || 0
    }));

    // Calculate time distribution
    const timeDistribution = Object.entries(
      filteredTimeEntries.reduce((acc, entry) => {
        const date = new Date(entry.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + entry.duration;
        return acc;
      }, {})
    ).map(([date, duration]) => ({
      date,
      hours: Math.round(duration / 3600 * 100) / 100
    }));

    setMetrics({
      totalProjects: filteredProjects.length,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      totalTimeSpent,
      clientDistribution: Object.entries(clientDistribution).map(([name, value]) => ({
        name,
        value
      })),
      taskStatusDistribution: Object.entries(taskStatusDistribution).map(([name, value]) => ({
        name,
        value
      })),
      projectProgress,
      timeDistribution
    });
  };

  const getStartDate = (range) => {
    const now = new Date();
    switch (range) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(0);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Projects"
              value={metrics.totalProjects}
              icon={<BarChart3 className="text-blue-500" />}
            />
            <MetricCard
              title="Active Projects"
              value={metrics.activeProjects}
              icon={<TrendingUp className="text-green-500" />}
            />
            <MetricCard
              title="Task Completion"
              value={`${Math.round((metrics.completedTasks / metrics.totalTasks) * 100) || 0}%`}
              subtitle={`${metrics.completedTasks}/${metrics.totalTasks} tasks`}
              icon={<CheckCircle2 className="text-yellow-500" />}
            />
            <MetricCard
              title="Total Time Tracked"
              value={`${Math.round(metrics.totalTimeSpent / 3600 * 10) / 10}h`}
              icon={<Clock className="text-purple-500" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h2 className="text-lg font-semibold mb-4">Project Progress</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.projectProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Distribution */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h2 className="text-lg font-semibold mb-4">Time Distribution</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Client Distribution */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h2 className="text-lg font-semibold mb-4">Client Distribution</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={metrics.clientDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {metrics.clientDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Status Distribution */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h2 className="text-lg font-semibold mb-4">Task Status Distribution</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={metrics.taskStatusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {metrics.taskStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-card rounded-lg border border-border p-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {icon}
    </div>
    <p className="text-2xl font-semibold">{value}</p>
    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

export default Reports;