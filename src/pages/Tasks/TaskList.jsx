import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Search, 
  Plus, 
  Filter,
  SlidersHorizontal,
  ClipboardList
} from 'lucide-react';
import TaskCard from '../../components/TaskCard';
import CreateTaskModal from '../../components/CreateTaskModal';
import EditTaskModal from '../../components/EditTaskModal';
import { databaseService } from '../../lib/database';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const TaskList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchTasks();
  }, [user?.uid]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Fetch all projects to get their tasks
      const projectsResult = await databaseService.listProjects(user.uid);
      
      if (projectsResult.success) {
        const allTasks = [];
        
        // Fetch tasks for each project
        for (const project of projectsResult.projects) {
          const tasksResult = await databaseService.listProjectTasks(user.uid, project.id);
          if (tasksResult.success) {
            allTasks.push(...tasksResult.tasks.map(task => ({
              ...task,
              projectId: project.id,
              projectTitle: project.title
            })));
          }
        }

        setTasks(allTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    toast.success('Task created successfully');
  };

  const handleDeleteTask = async (projectId, taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await databaseService.deleteTask(user.uid, projectId, taskId);
        if (result.success) {
          setTasks(prev => prev.filter(task => task.id !== taskId));
          toast.success('Task deleted successfully');
        }
      } catch (error) {
        console.error('Delete task error:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (projectId, taskId, newStatus) => {
    try {
      const result = await databaseService.updateTask(user.uid, projectId, taskId, {
        status: newStatus
      });
      if (result.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
        toast.success('Task status updated');
      }
    } catch (error) {
      console.error('Update task error:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    toast.success('Task updated successfully');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
            size={20} 
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border min-w-[150px]"
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tasks List */}
      {loading ? (
        <Loader />
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={() => handleDeleteTask(task.projectId, task.id)}
              onStatusChange={(status) => handleStatusChange(task.projectId, task.id, status)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardList size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first task'}
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Create Task
            </button>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user.uid}
        onTaskCreated={handleTaskCreated}
        standalone={true}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        userId={user.uid}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};

export default TaskList; 