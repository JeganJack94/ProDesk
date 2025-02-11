import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { databaseService } from '../../lib/database';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'in-progress',
    priority: 'medium',
    clientId: '',
    progress: 0
  });

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchProject();
    fetchClients();
  }, [user?.uid, id]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const result = await databaseService.listClients(user.uid);
      if (result.success) {
        setClients(result.clients);
      } else {
        toast.error('Failed to load clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchProject = async () => {
    try {
      const result = await databaseService.getProject(user.uid, id);
      if (result.success) {
        setFormData({
          title: result.project.title || '',
          description: result.project.description || '',
          deadline: result.project.deadline?.split('T')[0] || '',
          status: result.project.status || 'in-progress',
          priority: result.project.priority || 'medium',
          clientId: result.project.client?.id || '',
          progress: result.project.progress || 0
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedClient = clients.find(client => client.id === formData.clientId);
      
      const updatedProject = {
        ...formData,
        client: selectedClient ? {
          id: selectedClient.id,
          name: selectedClient.name,
          company: selectedClient.company,
          email: selectedClient.email
        } : null,
        updatedAt: new Date(),
        searchTerms: [
          formData.title.toLowerCase(),
          formData.description.toLowerCase(),
          formData.status.toLowerCase(),
          formData.priority.toLowerCase()
        ].filter(Boolean),
        titleLower: formData.title.toLowerCase()
      };

      const result = await databaseService.updateProject(user.uid, id, updatedProject);

      if (result.success) {
        toast.success('Project updated successfully');
        navigate(`/app/projects/${id}`);
      } else {
        setError(result.error || 'Failed to update project');
        toast.error(result.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Update project error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(error.message || 'An unexpected error occurred');
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/app/projects/${id}`)}
          className="p-2 rounded-full hover:bg-accent"
        >
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Edit Project</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Basic Information</h2>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Project Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter project title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter project description"
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-2">
                Deadline <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Calendar 
                  size={20} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Client
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={loadingClients}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.company}
                  </option>
                ))}
              </select>
              {loadingClients && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader small />
                  <span>Loading clients...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/app/projects/${id}`)}
            className="px-4 py-2 rounded-md border border-input bg-background text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin mx-auto" />
            ) : (
              'Update Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject; 