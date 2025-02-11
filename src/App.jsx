import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Landing from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import ForgotPassword from './pages/Auth/ForgotPassword';
import TaskList from './pages/Tasks/TaskList';
import TaskDetails from './pages/Tasks/TaskDetails';
import CreateTask from './pages/Tasks/CreateTask';
import ClientList from './pages/Clients/ClientList';
import ClientDetails from './pages/Clients/ClientDetails';
import CreateClient from './pages/Clients/CreateClient';
import TimeTracking from './pages/TimeTracking.jsx';
import Reports from './pages/Reports';
import AppStore from './pages/AppStore';
import Settings from './pages/Settings';
import ProjectList from './pages/Projects/ProjectList';
import ProjectDetails from './pages/Projects/ProjectDetails';
import CreateProject from './pages/Projects/CreateProject';
import EditProject from './pages/Projects/EditProject';
import UserManual from './pages/UserManual';
import { db } from './lib/firebase.js';
import { useEffect } from 'react';
import { imageStorage } from './utils/imageStorage';

function App() {
  useEffect(() => {
    const cleanupOldImages = () => {
      const lastCleanup = localStorage.getItem('lastImageCleanup');
      const now = Date.now();
      
      // Clean up once a week
      if (!lastCleanup || (now - parseInt(lastCleanup)) > 7 * 24 * 60 * 60 * 1000) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('app_image_')) {
            const timestamp = key.split('_')[3];
            if (now - parseInt(timestamp) > 30 * 24 * 60 * 60 * 1000) { // 30 days old
              localStorage.removeItem(key);
            }
          }
        });
        localStorage.setItem('lastImageCleanup', now.toString());
      }
    };

    cleanupOldImages();
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/app" element={<Dashboard />} />
                <Route path="/app/projects/create" element={<CreateProject />} />
                <Route path="/app/projects/:id/edit" element={<CreateProject />} />
                <Route path="/app/projects/:id" element={<ProjectDetails />} />
                <Route path="/app/projects" element={<ProjectList />} />
                <Route path="/app/projects/edit/:id" element={<EditProject />} />
                <Route path="/app/tasks/create" element={<CreateTask />} />
                <Route path="/app/tasks/:id/edit" element={<CreateTask />} />
                <Route path="/app/tasks/:id" element={<TaskDetails />} />
                <Route path="/app/tasks" element={<TaskList />} />
                <Route path="/app/clients/create" element={<CreateClient />} />
                <Route path="/app/clients/:id/edit" element={<CreateClient />} />
                <Route path="/app/clients/:id" element={<ClientDetails />} />
                <Route path="/app/clients" element={<ClientList />} />
                <Route path="/app/time-tracking" element={<TimeTracking />} />
                <Route path="/app/reports" element={<Reports />} />
                <Route path="/app-store" element={<AppStore />} />
                <Route path="/app/settings" element={<Settings />} />
                <Route path="/user-manual" element={<UserManual />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;