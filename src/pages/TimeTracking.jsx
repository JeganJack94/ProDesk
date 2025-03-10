import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import { Clock, Calendar, FolderKanban, ListTodo, History } from 'lucide-react';
import Timer from '../components/Timer';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TimeTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projectAnalysis, setProjectAnalysis] = useState([]);

  // Fetch projects on mount
  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [user?.uid]);

  // Fetch tasks and time entries when a project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject.id);
      fetchProjectAnalysis();
    }
  }, [selectedProject]);

  // Fetch time entries for the selected project and task
  useEffect(() => {
    if (selectedProject && selectedTask) {
      fetchTimeEntries();
    }
  }, [selectedTask]);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const result = await databaseService.listProjects(user.uid);
      if (result.success) {
        setProjects(result.projects);
      }
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for the selected project
  const fetchTasks = async (projectId) => {
    try {
      if (!projectId) return;
      
      const result = await databaseService.listTasks(user.uid, projectId);
      if (result.success) {
        setTasks(result.tasks);
        // Clear selected task when loading new tasks
        setSelectedTask(null);
      }
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  // Fetch time entries for the selected project and task
  const fetchTimeEntries = async () => {
    if (!selectedProject?.id || !selectedTask?.id) return;
    
    try {
      const result = await databaseService.listTimeEntries(
        user.uid,
        selectedProject.id,
        selectedTask.id
      );
      if (result.success) {
        setTimeEntries(result.timeEntries);
      }
    } catch (error) {
      toast.error('Failed to load time entries');
    }
  };

  // Fetch project time analysis for the chart
  const fetchProjectAnalysis = async () => {
    if (!selectedProject?.id) return;
    
    try {
      const result = await databaseService.getProjectTimeAnalysis(
        user.uid,
        selectedProject.id
      );
      if (result.success) {
        setProjectAnalysis(result.timeAnalysis);
      }
    } catch (error) {
      toast.error('Failed to load time analysis');
    }
  };

  // Format time for display (converts seconds to hours)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Prepare data for the chart
  const getChartData = () => {
    return projectAnalysis.map(item => ({
      task: item.taskTitle,
      hours: Math.round((item.totalTime / 3600) * 100) / 100
    }));
  };

  // Project selection handler
  const handleProjectChange = (e) => {
    const project = projects.find(p => p.id === e.target.value);
    setSelectedProject(project);
  };

  // Task selection handler
  const handleTaskChange = (e) => {
    const task = tasks.find(t => t.id === e.target.value);
    setSelectedTask(task);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Time Tracking</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Section */}
        <div className="space-y-6">
          {/* Project & Task Selection */}
          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Project</label>
              <select
                value={selectedProject?.id || ''}
                onChange={handleProjectChange}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="">Choose a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Task</label>
              <select
                value={selectedTask?.id || ''}
                onChange={handleTaskChange}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                disabled={!selectedProject}
              >
                <option value="">Choose a task</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timer */}
          {selectedProject && selectedTask && (
            <Timer
              projectId={selectedProject.id}
              taskId={selectedTask.id}
              projectTitle={selectedProject.title}
              taskTitle={selectedTask.title}
              onTimeEntryCreated={() => {
                fetchTimeEntries();
                fetchProjectAnalysis();
              }}
            />
          )}
        </div>

        {/* Time Entries & Chart */}
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold mb-4">Project Time Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="task" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Time Entries */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <History size={20} className="text-muted-foreground" />
                Recent Time Entries
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Project</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Task</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Duration</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {timeEntries
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 7)
                    .map(entry => (
                      <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-medium text-sm">{entry.projectTitle}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm text-muted-foreground">{entry.taskTitle}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-sm bg-primary/10 text-primary rounded-full px-2 py-1 inline-block">
                            {formatTime(entry.duration)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()} at{' '}
                            {new Date(entry.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {timeEntries.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No time entries yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;