import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <Navbar onMenuClick={toggleSidebar} isSidebarOpen={sidebarOpen} />
      
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}
        `}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 