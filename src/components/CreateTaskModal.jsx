import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, Tag, AlertCircle } from 'lucide-react';
import { databaseService } from '../lib/database';
import { toast } from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, projectId, projectTitle, userId, onTaskCreated, standalone = false }) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    projectId: projectId || '',
    projectTitle: projectTitle || '',
    estimatedTime: '',
  });

  useEffect(() => {
    if (standalone) {
      fetchProjects();
    }
  }, [standalone]);

  const fetchProjects = async () => {
    try {
      const result = await databaseService.listProjects(userId);
      if (result.success) {
        setProjects(result.projects);
        if (!projectId && result.projects.length > 0) {
          setFormData(prev => ({
            ...prev,
            projectId: result.projects[0].id,
            projectTitle: result.projects[0].title
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast.error('Please select a project');
      return;
    }
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        estimatedTime: formData.estimatedTime || '1h',
        createdAt: new Date(),
        timeSpent: '0h',
      };

      const result = await databaseService.createTask(userId, formData.projectId, taskData);

      if (result.success) {
        toast.success('Task created successfully');
        onTaskCreated(result.task);
        onClose();
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'medium',
          status: 'todo',
          projectId: projectId || '',
          projectTitle: projectTitle || '',
          estimatedTime: '',
        });
      } else {
        toast.error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Create task error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'projectId' && standalone) {
      const project = projects.find(p => p.id === value);
      if (project) {
        setFormData(prev => ({
          ...prev,
          projectTitle: project.title
        }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Task</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Selection - Only show if standalone */}
          {standalone && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Project <span className="text-destructive">*</span>
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Details Card */}
          <div className="bg-background rounded-lg border border-border p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter task description"
              />
            </div>
          </div>

          {/* Task Settings Card */}
          <div className="bg-background rounded-lg border border-border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Due Date <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="date"
                    name="dueDate"
                    required
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full pl-3 pr-10 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Estimated Time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Estimated Time
                </label>
                <div className="relative">
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    className="w-full pl-3 pr-10 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g., 2h 30m"
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-input bg-background text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal; 