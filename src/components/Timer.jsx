import React, { useState, useEffect } from 'react';
import { Play, Pause, History, StopCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Timer = ({ projectId, taskId, taskTitle, projectTitle }) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);

  // Timer interval
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        setTime(elapsedTime);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime]);

  // Load time entries
  useEffect(() => {
    const loadTimeEntries = async () => {
      const result = await databaseService.listTimeEntries(user.uid);
      if (result.success) {
        const filteredEntries = result.timeEntries.filter(
          entry => entry.projectId === projectId && entry.taskId === taskId
        );
        setTimeEntries(filteredEntries);
      }
    };
    loadTimeEntries();
  }, [user.uid, projectId, taskId]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!projectId || !taskId) {
      toast.error('Please select a project and task first');
      return;
    }
    setIsRunning(true);
    setStartTime(Date.now());
    setTime(0);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    const newStartTime = Date.now() - (time * 1000);
    setStartTime(newStartTime);
    setIsRunning(true);
  };

  const handleStop = async () => {
    if (!startTime) return;

    setIsRunning(false);
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    try {
      const timeEntry = {
        projectId,
        taskId,
        projectTitle,
        taskTitle,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        createdAt: new Date(),
        userId: user.uid,
        status: 'completed',
        type: 'time_entry'
      };

      const result = await databaseService.createTimeEntry(user.uid, timeEntry);
      
      if (result.success) {
        toast.success('Time entry saved successfully');
        setTime(0);
        setStartTime(null);
        const updatedEntries = await databaseService.listTimeEntries(user.uid);
        if (updatedEntries.success) {
          const filteredEntries = updatedEntries.timeEntries.filter(
            entry => entry.projectId === projectId && entry.taskId === taskId
          );
          setTimeEntries(filteredEntries);
        }
      } else {
        toast.error('Failed to save time entry');
      }
    } catch (error) {
      toast.error('Failed to save time entry');
    }
  };

  // Calculate total time spent from all entries
  const getTotalTimeSpent = () => {
    return timeEntries
      .filter(entry => entry.projectId === projectId && entry.taskId === taskId)
      .reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl border border-red-500/20 p-6 shadow-lg hover:shadow-red-500/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{taskTitle}</h3>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-400 hover:text-white transition-colors"
              title="View History"
            >
              <History size={18} />
            </motion.button>
            {isRunning && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-400 hover:text-white transition-colors"
                title="Stop Timer"
              >
                <StopCircle size={18} />
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-4xl font-bold font-mono text-red-500 tracking-wider">
              {formatTime(time)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Total: {formatTime(getTotalTimeSpent())}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRunning ? handlePause : (time > 0 ? handleResume : handleStart)}
            className={`
              p-4 rounded-lg flex items-center justify-center
              ${isRunning 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
              }
              transition-colors
            `}
          >
            {isRunning ? (
              <Pause className="text-white" size={24} />
            ) : (
              <Play className="text-white" size={24} />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && timeEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-lg border border-border p-4"
          >
            <h4 className="text-lg font-semibold mb-4">Time History</h4>
            <div className="space-y-3">
              {timeEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm">
                      {new Date(entry.startTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Duration: {formatTime(entry.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timer; 