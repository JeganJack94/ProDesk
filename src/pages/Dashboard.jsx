import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import { 
  FolderKanban, 
  Clock, 
  AlertCircle, 
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowRight,
  Circle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import ProjectCard from '../components/ProjectCard';
import TaskCard from '../components/TaskCard';
import { toast } from 'react-hot-toast';

// Theme Colors
const themeColors = {
  primary: '#ff4444',
  secondary: '#ff6b6b',
  accent: '#ff8585',
  background: '#1a1a1a',
  cardBg: '#242424',
  success: '#4ade80',
  warning: '#fbbf24',
  text: '#ffffff'
};

const DashboardCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-red-500/20 p-6 transition-all duration-300 hover:scale-102 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-500/40 animate-fade-in group">
    <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
      <Icon size={128} />
    </div>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-red-500/10 text-red-500 transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-4 text-sm font-medium text-gray-400">
        <ArrowRight size={16} className="text-red-500" />
        {trend}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalClients: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalTimeTracked: 0,
    recentProjects: [],
    upcomingDeadlines: [],
    recentActivities: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchProjectTasks = async (userId, projectId) => {
    try {
      const result = await databaseService.listProjectTasks(userId, projectId);
      return result.success ? result.tasks : [];
    } catch (error) {
      console.error('Error fetching tasks for project:', projectId, error);
      return [];
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for user:', user.uid);
      
      // Fetch projects
      const projectsResult = await databaseService.listProjects(user.uid);
      console.log('Projects result:', projectsResult);
      const projects = projectsResult.success ? projectsResult.projects : [];
      setProjects(projects);
      
      // Fetch clients
      const clientsResult = await databaseService.listClients(user.uid);
      console.log('Clients result:', clientsResult);
      const clients = clientsResult.success ? clientsResult.clients : [];
      
      // Fetch all tasks for all projects
      let tasks = [];
      for (const project of projects) {
        const projectTasks = await fetchProjectTasks(user.uid, project.id);
        tasks = [...tasks, ...projectTasks.map(task => ({
          ...task,
          projectId: project.id,
          projectTitle: project.title
        }))];
      }
      setAllTasks(tasks);
      
      // Calculate metrics
      const activeProjects = projects.filter(p => p.status === 'in-progress');
      const completedProjects = projects.filter(p => p.status === 'completed');
      
      // Calculate tasks with null checks
      const totalTasks = projects.reduce((acc, p) => {
        return acc + (p.tasks?.list?.length || 0);
      }, 0);
      
      const completedTasks = projects.reduce((acc, p) => {
        return acc + (p.tasks?.list?.filter(t => t.status === 'completed').length || 0);
      }, 0);
      
      // Get recent projects with proper date handling
      const recentProjects = projects
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);
      
      // Get upcoming deadlines with proper date handling
      const upcomingDeadlines = projects
        .filter(p => p.status !== 'completed' && p.deadline)
        .sort((a, b) => {
          const dateA = new Date(a.deadline);
          const dateB = new Date(b.deadline);
          return dateA - dateB;
        })
        .slice(0, 5);
      
      // Calculate total time tracked
      let totalTimeTracked = 0;
      for (const project of projects) {
        const timeResult = await databaseService.listTimeEntries(user.uid, project.id);
        console.log('Time entries for project:', project.id, timeResult);
        if (timeResult.success) {
          totalTimeTracked += timeResult.timeEntries.reduce((acc, entry) => acc + (entry.duration || 0), 0);
        }
      }

      // Get recent activities with proper date handling
      const recentActivities = projects
        .map(project => ({
          type: 'project',
          title: project.title,
          date: project.createdAt?.toDate?.() || new Date(project.createdAt),
          status: project.status
        }))
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);

      setMetrics({
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        totalClients: clients.length,
        totalTasks,
        completedTasks,
        totalTimeTracked,
        recentProjects,
        upcomingDeadlines,
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate project status from real data
  const projectStatus = [
    {
      name: 'In Progress',
      value: projects.filter(p => p.status === 'in-progress').length,
      color: '#ff4444'
    },
    {
      name: 'Open',
      value: projects.filter(p => p.status === 'open').length,
      color: '#ff6b6b'
    },
    {
      name: 'Design',
      value: projects.filter(p => p.status === 'design').length,
      color: '#ff8585'
    },
    {
      name: 'Done',
      value: projects.filter(p => p.status === 'completed').length,
      color: '#ffa0a0'
    }
  ];

  // Calculate weekly task distribution
  const getWeeklyTasks = () => {
    const weeks = {};
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    allTasks.forEach(task => {
      const taskDate = task.createdAt?.toDate?.() || new Date(task.createdAt);
      const weekDiff = Math.floor((now - taskDate) / oneWeek);
      const weekKey = `Week ${weekDiff + 1}`;
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });
    
    return Object.entries(weeks)
      .map(([name, tasks]) => ({ name, tasks }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-5);
  };

  // Calculate sprint burndown data
  const getBurndownData = () => {
    const sprint = {};
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    allTasks.forEach(task => {
      const taskDate = task.createdAt?.toDate?.() || new Date(task.createdAt);
      const dayDiff = Math.floor((now - taskDate) / oneDay);
      const dayKey = `Day ${dayDiff + 1}`;
      sprint[dayKey] = (sprint[dayKey] || 0) + 1;
    });
    
    let remaining = allTasks.length;
    return Object.entries(sprint)
      .map(([day, completed]) => {
        remaining -= completed;
        return { day, remaining: Math.max(0, remaining) };
      })
      .sort((a, b) => a.day.localeCompare(b.day));
  };

  // Get weekly priority tasks
  const getWeeklyPriorityTasks = () => {
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    return allTasks
      .filter(task => {
        const taskDate = task.createdAt?.toDate?.() || new Date(task.createdAt);
        return (now - taskDate) <= oneWeek;
      })
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5)
      .map(task => ({
        task: task.title,
        status: task.status,
        priority: task.priority,
        projectTitle: task.projectTitle
      }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white">
            Welcome back, {user?.displayName || user?.email}
          </h1>
          <p className="text-gray-400 mt-2">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Projects"
            value={metrics.totalProjects}
            icon={FolderKanban}
            trend={`${metrics.activeProjects} active`}
          />
          <DashboardCard
            title="Total Tasks"
            value={metrics.totalTasks}
            icon={CheckCircle2}
            trend={`${metrics.completedTasks} completed`}
          />
          <DashboardCard
            title="Total Clients"
            value={metrics.totalClients}
            icon={Users}
          />
          <DashboardCard
            title="Time Tracked"
            value={`${Math.round(metrics.totalTimeTracked / 3600)}h`}
            icon={Clock}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-red-500/20 p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:border-red-500/40 group">
            <h2 className="text-xl font-bold text-white mb-6">Project Status Overview</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {projectStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#242424',
                      border: '1px solid #ff4444',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tasks by Week */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-red-500/20 p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:border-red-500/40">
            <h2 className="text-xl font-bold text-white mb-6">Weekly Task Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeeklyTasks()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="name" stroke="#999999" />
                  <YAxis stroke="#999999" />
                  <Tooltip
                    contentStyle={{
                      background: '#242424',
                      border: '1px solid #ff4444',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar 
                    dataKey="tasks" 
                    fill="#ff4444"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Burndown Chart */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-red-500/20 p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:border-red-500/40">
            <h2 className="text-xl font-bold text-white mb-6">Sprint Burndown</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getBurndownData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="day" stroke="#999999" />
                  <YAxis stroke="#999999" />
                  <Tooltip
                    contentStyle={{
                      background: '#242424',
                      border: '1px solid #ff4444',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="remaining" 
                    stroke="#ff4444" 
                    strokeWidth={3}
                    dot={{ fill: "#ff4444", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* This Week's Priorities */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-red-500/20 p-6 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:border-red-500/40">
            <h2 className="text-xl font-bold text-white mb-6">Weekly Priority Tasks</h2>
            <div className="space-y-4">
              {getWeeklyPriorityTasks().map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-red-500/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                      item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.task}</p>
                      <p className="text-sm text-gray-400">{item.projectTitle}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    item.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;