import React from 'react';
import { Calendar, Clock, Tag, Edit2, Trash2, MoreVertical } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-500/10 text-red-500',
      'medium': 'bg-yellow-500/10 text-yellow-500',
      'low': 'bg-green-500/10 text-green-500'
    };
    return colors[priority] || 'text-muted-foreground';
  };

  const getStatusBg = (status) => {
    const colors = {
      'completed': 'bg-green-500/10 text-green-500 border border-green-500/20',
      'in-progress': 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
      'todo': 'bg-red-500/10 text-red-500 border border-red-500/20',
      'blocked': 'bg-red-700/10 text-red-700 border border-red-700/20'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow relative group">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-card-foreground">
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {task.description}
          </p>
        </div>
        <div 
          className="cursor-pointer hover:scale-105 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task.status === 'completed' ? 'todo' : 'completed');
          }}
          title={task.status === 'completed' ? 'Mark as Todo' : 'Mark as Completed'}
        >
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBg(task.status)}`}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Project Tag */}
      <div className="flex items-center gap-1.5 mb-3 hover:text-foreground transition-colors">
        <Tag size={14} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{task.projectTitle}</span>
      </div>

      {/* Task Info and Actions */}
      <div className="flex items-center justify-between mt-4">
        {/* Task Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          {task.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{task.estimatedTime}</span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
            <Tag size={14} />
            <span className="capitalize">{task.priority}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 hover:bg-accent rounded-full transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Edit2 size={16} />
            <span className="text-sm hidden group-hover:inline">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-2 hover:bg-destructive/10 rounded-full transition-colors flex items-center gap-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
            <span className="text-sm hidden group-hover:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 