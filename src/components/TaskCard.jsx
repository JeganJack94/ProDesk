import React from 'react';
import { Calendar, Clock, Tag, Edit2, Trash2, MoreVertical } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-destructive',
      'medium': 'text-yellow-500',
      'low': 'text-green-500'
    };
    return colors[priority] || 'text-muted-foreground';
  };

  const getStatusBg = (status) => {
    const colors = {
      'completed': 'bg-green-500/10 text-green-500',
      'in-progress': 'bg-primary/10 text-primary',
      'todo': 'bg-muted text-muted-foreground',
      'blocked': 'bg-destructive/10 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow relative group">
      {/* Actions */}
      <div className="flex items-center gap-2 absolute top-4 right-4">
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

      {/* Task Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Calendar size={14} />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Clock size={14} />
          <span>{task.timeSpent || '0h'}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${getPriorityColor(task.priority)}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          <span className="text-xs font-medium">
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 