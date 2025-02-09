import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-blue-500" />
      )}
    </motion.button>
  );
};

export default ThemeToggle; 