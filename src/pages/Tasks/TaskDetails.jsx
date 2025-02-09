import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Clock, AlertCircle, Calendar } from 'lucide-react';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLog, setTimeLog] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const taskDoc = await getDoc(doc(db, 'tasks', id));
      if (taskDoc.exists()) {
        setTask({ id: taskDoc.id, ...taskDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeLogSubmit = async (e) => {
    e.preventDefault();
    const totalMinutes = (timeLog.hours * 60) + parseInt(timeLog.minutes);
    const newTimeLog = {
      timestamp: new Date().toISOString(),
      duration: totalMinutes,
    };

    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, {
        timeLogs: [...(task.timeLogs || []), newTimeLog],
      });
      
      // Refresh task data
      fetchTask();
      setTimeLog({ hours: 0, minutes: 0 });
    } catch (error) {
      console.error('Error updating time log:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!task) {
    return <div className="p-6">Task not found</div>;
  }

  const totalMinutes = (task.timeLogs || []).reduce((acc, log) => acc + log.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <button
          onClick={() => navigate(`/tasks/${id}/edit`)}
          className="btn btn-outline"
        >
          Edit Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Details</h2>
            <p className="text-gray-600">{task.description}</p>
            
            <div className="flex items-center gap-2 mt-4">
              <AlertCircle className="w-4 h-4" />
              <span className="capitalize">{task.priority} Priority</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Time Tracking</h2>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" />
              <span>Total Time: {totalHours}h {remainingMinutes}m</span>
            </div>

            <form onSubmit={handleTimeLogSubmit} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Hours"
                  className="input input-bordered w-full"
                  value={timeLog.hours}
                  onChange={(e) => setTimeLog(prev => ({ ...prev, hours: e.target.value }))}
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Minutes"
                  className="input input-bordered w-full"
                  value={timeLog.minutes}
                  onChange={(e) => setTimeLog(prev => ({ ...prev, minutes: e.target.value }))}
                  min="0"
                  max="59"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Log Time
              </button>
            </form>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Time Logs</h3>
              <div className="space-y-2">
                {(task.timeLogs || []).map((log, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    <span>{Math.floor(log.duration / 60)}h {log.duration % 60}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails; 