import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, Menu, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const letterVariants = {
    initial: { y: 0 },
    hover: i => ({
      y: [-2, 2],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: "reverse",
        delay: i * 0.1
      }
    })
  };

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time notifications
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('createdAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 border-b backdrop-blur
      ${theme === 'dark' 
        ? 'bg-gray-900/95 border-gray-800 text-white' 
        : 'bg-white/95 border-gray-200 text-gray-900'
      }
    `}>
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuClick}
            className={`
              p-2 rounded-lg transition-all duration-300
              ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
            `}
          >
            <Menu className={`
              transform transition-transform duration-300
              ${!isSidebarOpen ? 'rotate-180' : 'rotate-0'}
            `} />
          </button>
          <motion.div 
            className="flex items-center"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div
              className="flex items-center"
              initial="initial"
              animate={isHovered ? "hover" : "initial"}
            >
              {"ProDesk".split('').map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  className={`
                    text-2xl font-bold
                    ${letter === 'P' || letter === 'D' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent'
                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }
                  `}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
            <motion.div
              className="h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full mt-1"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isHovered ? "100%" : 0,
                opacity: isHovered ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>

        {/* Center section - can be used for breadcrumbs or additional navigation */}
        <div className="flex-1 flex justify-center">
          {/* Add any center content here if needed */}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="relative">
            <button 
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`
                absolute right-0 mt-2 w-80 rounded-md shadow-lg
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
              `}>
                <div className="p-2">
                  <h3 className="text-sm font-medium px-3 py-2">Notifications</h3>
                  <div className="divide-y divide-gray-200">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt.toDate()).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-sm text-gray-500 p-3">No notifications</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Avatar Circle */}
          <div className="
            h-8 w-8 rounded-full flex items-center justify-center
            bg-gradient-to-br from-red-500 to-red-600
            hover:from-red-600 hover:to-red-700
            transition-all duration-300
            text-white shadow-lg shadow-red-500/20
            cursor-pointer
          ">
            <span className="text-sm font-medium">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 