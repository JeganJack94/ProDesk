import React from 'react';
import { Calendar, Clock, MoreVertical } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ProjectCard = ({ project }) => {
  const { theme } = useTheme();

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-500',
      'in-progress': 'bg-blue-500',
      'on-hold': 'bg-yellow-500',
      'delayed': 'bg-destructive'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className={`
      rounded-lg border p-4 transition-all duration-200
      ${theme === 'dark'
        ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-red-500/10'
        : 'bg-white border-gray-200 hover:shadow-lg hover:shadow-red-500/10'
      }
    `}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {project.title}
          </h3>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {project.description}
          </p>
        </div>
        <button className="p-1 hover:bg-accent rounded-full">
          <MoreVertical size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{project.progress}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full">
          <div 
            className="h-full bg-red-500 rounded-full transition-all"
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Project Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar size={16} />
          <span>{new Date(project.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={16} />
          <span>{project.tasks?.completed || 0}/{project.tasks?.total || 0} Tasks</span>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} text-white`}>
          {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 