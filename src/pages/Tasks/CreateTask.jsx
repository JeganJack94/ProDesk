import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

const CreateTask = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // for editing existing task
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    projectId: '',
  });

  useEffect(() => {
    fetchProjects();
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchProjects = async () => {
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTask = async () => {
    try {
      const taskDoc = await getDoc(doc(db, 'tasks', id));
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        setFormData({
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate.split('T')[0],
          priority: taskData.priority,
          status: taskData.status,
          projectId: taskData.projectId,
        });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        // Update existing task
        await updateDoc(doc(db, 'tasks', id), formData);
      } else {
        // Create new task
        await addDoc(collection(db, 'tasks'), formData);
      }
      navigate('/tasks');
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Task' : 'Create New Task'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered h-24"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Due Date</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Priority</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Project</span>
          </label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            className="select select-bordered"
            required
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask; 