import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { databaseService } from '../../lib/database';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  FileText,
  Paperclip,
  MoreVertical,
  CheckCircle2,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import TaskCard from '../../components/TaskCard';
import CreateTaskModal from '../../components/CreateTaskModal';
import Notes from '../../components/Notes';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchProject();
    fetchTasks();
  }, [id, user?.uid]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const result = await databaseService.getProject(user.uid, id);
      if (result.success) {
        setProject(result.project);
      } else {
        setError('Failed to load project');
        toast.error('Failed to load project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const result = await databaseService.listProjectTasks(user.uid, id);
      if (result.success) {
        setTasks(result.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const result = await databaseService.deleteProject(user.uid, id);
        if (result.success) {
          toast.success('Project deleted successfully');
          navigate('/app/projects');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setProject(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        total: (prev.tasks?.total || 0) + 1
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">{error || 'Project not found'}</p>
        <button
          onClick={() => navigate('/app/projects')}
          className="mt-4 btn btn-primary"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-500',
      'in-progress': 'bg-primary',
      'on-hold': 'bg-yellow-500',
      'delayed': 'bg-destructive'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/app/projects')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 group"
      >
        <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
        <span>Back to Projects</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} text-white`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </div>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/app/projects/edit/${id}`)}
            className="p-2 rounded-md hover:bg-accent"
          >
            <Edit2 size={20} className="text-muted-foreground" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 rounded-md hover:bg-accent"
          >
            <Trash2 size={20} className="text-destructive" />
          </button>
          <button className="p-2 rounded-md hover:bg-accent">
            <MoreVertical size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-card-foreground">Progress</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={16} />
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} />
                  <span>{project.tasks.completed}/{project.tasks.total} Tasks</span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/90"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onDelete={() => handleDeleteTask(task.id)}
                  onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                />
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No tasks created yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Notes & Attachments */}
        <div className="space-y-6">
          {/* Notes */}
          <Notes projectId={id} />

          {/* Attachments */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Attachments</h2>
              <button className="p-2 rounded-md hover:bg-accent">
                <Plus size={16} className="text-primary" />
              </button>
            </div>
            <div className="space-y-3">
              {project.attachments?.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(file.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {(!project.attachments || project.attachments.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  No attachments added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projectId={id}
        projectTitle={project.title}
        userId={user.uid}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default ProjectDetails; 