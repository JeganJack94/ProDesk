import React, { useState, useEffect } from 'react';
import { Play, Pause, Bell, RotateCcw, History, Settings2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Timer = ({ projectId, taskId, taskTitle, reminderTime }) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showHistory, setShowHistory] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [breakTime, setBreakTime] = useState(false);
  const [breakDuration, setBreakDuration] = useState(5); // minutes

  // Debug logs
  useEffect(() => {
    console.log('Timer state:', { isRunning, startTime, elapsedTime, currentEntry });
  }, [isRunning, startTime, elapsedTime, currentEntry]);

  // Load persisted timer state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      const persistedState = localStorage.getItem(`timer_state_${taskId}`);
      if (persistedState) {
        const { isRunning, startTime, currentEntry } = JSON.parse(persistedState);
        if (isRunning && startTime) {
          setIsRunning(true);
          setStartTime(parseInt(startTime));  // Convert to number
          setCurrentEntry(currentEntry);
          setElapsedTime(Date.now() - parseInt(startTime));  // Calculate initial elapsed time
        }
      }
    };

    loadPersistedState();
    checkNotificationPermission();
  }, [taskId]);

  // Request notification permission
  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Persist timer state
  useEffect(() => {
    if (isRunning && startTime && currentEntry) {
      localStorage.setItem(`timer_state_${taskId}`, JSON.stringify({
        isRunning,
        startTime,
        currentEntry
      }));
    } else {
      localStorage.removeItem(`timer_state_${taskId}`);
    }
  }, [isRunning, startTime, currentEntry, taskId]);

  // Timer interval
  useEffect(() => {
    let interval;
    if (isRunning) {
      const updateTimer = () => {
        if (startTime) {
          const newElapsed = Date.now() - startTime;
          setElapsedTime(newElapsed);
          
          // Check for reminder
          if (reminderTime && newElapsed >= reminderTime * 60 * 1000) {
            sendNotification('Time Reminder', `You've been working on "${taskTitle}" for ${reminderTime} minutes!`);
          }
        }
      };
      
      // Update immediately
      updateTimer();
      
      // Then set interval
      interval = setInterval(updateTimer, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime, reminderTime, taskTitle]);

  // Load time entries
  useEffect(() => {
    const loadTimeEntries = async () => {
      const result = await databaseService.listTimeEntries(user.uid, projectId, taskId);
      if (result.success) {
        setTimeEntries(result.timeEntries);
      }
    };
    loadTimeEntries();
  }, [user.uid, projectId, taskId]);

  // Break timer
  useEffect(() => {
    let breakInterval;
    if (breakTime) {
      const breakEndTime = Date.now() + breakDuration * 60 * 1000;
      breakInterval = setInterval(() => {
        const remaining = breakEndTime - Date.now();
        if (remaining <= 0) {
          setBreakTime(false);
          sendNotification('Break Time Over', 'Time to get back to work!');
          clearInterval(breakInterval);
        }
      }, 1000);
    }
    return () => clearInterval(breakInterval);
  }, [breakTime, breakDuration]);

  const sendNotification = (title, body) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png', // Add your app logo path
        badge: '/badge.png', // Add your badge icon path
        vibrate: [200, 100, 200]
      });
    } else {
      toast(body, {
        icon: '⏰',
        duration: 5000
      });
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startTimer = async () => {
    try {
      const now = Date.now();
      const entry = {
        taskId,
        taskTitle,
        startTime: now,
        endTime: null,
        duration: 0,
        status: 'running'
      };

      const result = await databaseService.createTimeEntry(user.uid, projectId, entry);
      if (result.success) {
        const newEntry = {
          ...entry,
          id: result.timeEntry.id
        };
        console.log('Starting timer with:', { now, newEntry });
        setCurrentEntry(newEntry);
        setStartTime(now);
        setElapsedTime(0);
        setIsRunning(true);
        sendNotification('Timer Started', `Started tracking time for "${taskTitle}"`);

        localStorage.setItem(`timer_state_${taskId}`, JSON.stringify({
          isRunning: true,
          startTime: now,
          currentEntry: newEntry
        }));
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error('Failed to start timer');
    }
  };

  const stopTimer = async () => {
    try {
      if (!currentEntry || !startTime) return;

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('Stopping timer with:', { endTime, duration, currentEntry });

      const updatedEntry = {
        ...currentEntry,
        endTime,
        duration,
        status: 'completed'
      };

      const result = await databaseService.updateTimeEntry(
        user.uid,
        projectId,
        currentEntry.id,
        updatedEntry
      );

      if (result.success) {
        setIsRunning(false);
        setStartTime(null);
        setElapsedTime(0);
        setCurrentEntry(null);
        localStorage.removeItem(`timer_state_${taskId}`);
        sendNotification('Timer Stopped', `Tracked ${formatTime(duration)} for "${taskTitle}"`);
        
        const entriesResult = await databaseService.listTimeEntries(user.uid, projectId, taskId);
        if (entriesResult.success) {
          setTimeEntries(entriesResult.timeEntries);
        }
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Failed to save time entry');
    }
  };

  const resetTimer = () => {
    if (window.confirm('Are you sure you want to reset the timer?')) {
      setElapsedTime(0);
      setStartTime(null);
      setIsRunning(false);
      localStorage.removeItem(`timer_state_${taskId}`);
    }
  };

  const startBreak = () => {
    if (isRunning) {
      stopTimer();
    }
    setBreakTime(true);
    sendNotification('Break Started', `Taking a ${breakDuration} minute break`);
  };

  const getTotalTimeSpent = () => {
    return timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl border border-red-500/20 p-6 shadow-lg hover:shadow-red-500/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{taskTitle}</h3>
            {reminderTime && (
              <div className="flex items-center text-sm text-gray-400">
                <Bell size={14} className="mr-1" />
                Reminder: {reminderTime}min
              </div>
            )}
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-400 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>

        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-4xl font-bold font-mono text-red-500 tracking-wider">
              {formatTime(elapsedTime)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Total: {formatTime(getTotalTimeSpent())}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startBreak}
              disabled={breakTime}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${breakTime 
                  ? 'bg-zinc-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                }
                transition-colors
              `}
            >
              Take Break
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRunning ? stopTimer : startTimer}
              disabled={breakTime}
              className={`
                p-4 rounded-lg flex items-center justify-center
                ${isRunning 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
                }
                ${breakTime ? 'opacity-50 cursor-not-allowed' : ''}
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

        {breakTime && (
          <div className="bg-blue-500/10 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-blue-400 font-medium">Break Time</p>
              <p className="text-sm text-gray-400">
                {Math.ceil((breakDuration * 60) - (Date.now() - startTime) / 1000)}s remaining
              </p>
            </div>
            <button
              onClick={() => setBreakTime(false)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              End Break
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-800/50 rounded-xl border border-red-500/20 p-6 overflow-hidden"
          >
            <h4 className="text-lg font-semibold text-white mb-4">Time History</h4>
            <div className="space-y-3">
              {timeEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-zinc-700/30 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-gray-300">
                      {new Date(entry.startTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Duration: {formatTime(entry.duration)}
                    </p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${entry.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
                  `}>
                    {entry.status}
                  </span>
                </div>
              ))}
              {timeEntries.length === 0 && (
                <p className="text-gray-400 text-center py-4">No time entries yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timer; 