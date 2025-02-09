import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { 
  Search, 
  Plus, 
  Filter,
  SlidersHorizontal,
  FolderKanban,
  Edit2,
  Trash2,
  Calendar,
  Clock
} from 'lucide-react';
import ProjectCard from '../../components/ProjectCard';
import { databaseService } from '../../lib/database';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const ProjectList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [user?.uid]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (!user?.uid) return;

      console.log('Fetching projects for user:', user.uid);

      const result = await databaseService.listProjects(user.uid, {
        status: statusFilter !== 'all' ? statusFilter : null,
        search: searchQuery,
        sortBy
      });

      console.log('Fetch result:', result);

      if (result.success) {
        setProjects(result.projects);
        setError('');
      } else {
        setError('Failed to load projects');
        toast.error('Failed to load projects');
      }
    } catch (error) {
      console.error('Fetch projects error:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const handleSearch = (value) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      fetchProjects(value);
    }, 500));
  };

  // Delete project
  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      if (!user?.uid) return;
      try {
        const result = await databaseService.deleteProject(user.uid, projectId);
        if (result.success) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
          toast.success('Project deleted successfully');
        } else {
          toast.error('Failed to delete project');
        }
      } catch (error) {
        console.error('Delete project error:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Search Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-2">Manage and track your projects</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                size={20} 
              />
              <input
                type="text"
                placeholder="Search projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`
                  w-full bg-zinc-800/50 text-white 
                  pl-12 pr-4 py-2.5
                  rounded-lg border border-zinc-700/50
                  focus:outline-none focus:border-red-500/50
                  placeholder:text-gray-500 placeholder:pl-3
                `}
              />
            </div>

            {/* Add Project Button */}
            <button
              onClick={() => navigate('/app/projects/create')}
              className={`
                flex items-center gap-2 px-4 py-2 
                bg-red-500 hover:bg-red-600 
                text-white rounded-lg transition-colors
                whitespace-nowrap
              `}
            >
              <Plus size={20} />
              Add Project
            </button>
          </div>
        </div>

        {/* Projects List */}
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="group relative bg-card hover:shadow-lg transition-all duration-200 rounded-lg border border-border"
              >
                <div 
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      project.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock size={16} />
                        {project.tasks?.completed || 0}/{project.tasks?.total || 0} Tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/projects/edit/${project.id}`);
                        }}
                        className="p-2 hover:bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {loading ? (
              <Loader />
            ) : (
              <>
                <FolderKanban size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first project
                </p>
                <button
                  onClick={() => navigate('/app/projects/create')}
                  className="btn btn-primary"
                >
                  Create Project
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList; 