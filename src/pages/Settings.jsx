import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Moon,
  Sun,
  Palette,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Save,
  Loader2,
  Camera,
  Lock,
  Key
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      displayName: '',
      jobTitle: '',
      company: '',
      bio: ''
    },
    notifications: {
      email: true,
      push: true,
      projectUpdates: true,
      taskReminders: true,
      deadlineAlerts: true
    },
    appearance: {
      theme: 'system',
      accentColor: 'blue',
      fontSize: 'medium',
      reducedMotion: false
    },
    preferences: {
      language: 'en',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    }
  });
  const [userProfile, setUserProfile] = useState({
    photoURL: user?.photoURL || '',
    displayName: user?.displayName || '',
    email: user?.email || '',
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchSettings();
  }, [user?.uid]);

  const fetchSettings = async () => {
    try {
      const result = await databaseService.getSettings(user.uid);
      if (result.success) {
        setSettings(prev => ({
          ...prev,
          ...result.settings
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await databaseService.updateSettings(user.uid, settings);
      if (result.success) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    setSaving(true);
    try {
      const result = await databaseService.updatePassword(
        user.uid, 
        password.current, 
        password.new
      );
      
      if (result.success) {
        toast.success('Password updated successfully');
        setPassword({ current: '', new: '', confirm: '' });
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/profile-${Date.now()}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update auth profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        photoURL: downloadURL
      }));
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    handleChange('appearance', 'theme', newTheme);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Globe }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const tabVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    <motion.div 
      className="p-6 max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* User Card - Always visible */}
          <div className="md:col-span-4 bg-card rounded-lg border border-border p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {userProfile.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt={userProfile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-muted-foreground" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 cursor-pointer">
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-full">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-semibold">{userProfile.displayName}</h2>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {settings.profile.jobTitle || 'No job title set'}
                  </span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {settings.profile.company || 'No company set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-2">
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                variants={tabVariants}
                animate={activeTab === tab.id ? "active" : "inactive"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-lg border border-border p-6"
            >
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Display Name</label>
                    <input
                      type="text"
                      value={settings.profile.displayName}
                      onChange={(e) => handleChange('profile', 'displayName', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Job Title</label>
                    <input
                      type="text"
                      value={settings.profile.jobTitle}
                      onChange={(e) => handleChange('profile', 'jobTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Company</label>
                    <input
                      type="text"
                      value={settings.profile.company}
                      onChange={(e) => handleChange('profile', 'company', e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Bio</label>
                    <textarea
                      value={settings.profile.bio}
                      onChange={(e) => handleChange('profile', 'bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 rounded-md border border-input"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                  
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium flex items-center gap-2">
                      <Key size={16} />
                      Change Password
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <input
                          type="password"
                          value={password.current}
                          onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
                          className="w-full px-3 py-2 rounded-md border border-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                          type="password"
                          value={password.new}
                          onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
                          className="w-full px-3 py-2 rounded-md border border-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={password.confirm}
                          onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
                          className="w-full px-3 py-2 rounded-md border border-input"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={!password.current || !password.new || !password.confirm}
                        className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <h3 className="text-md font-medium flex items-center gap-2 mb-4">
                      <Shield size={16} />
                      Security Options
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.security?.twoFactor}
                          onChange={(e) => handleChange('security', 'twoFactor', e.target.checked)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <span className="text-sm">Enable Two-Factor Authentication</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.security?.loginAlerts}
                          onChange={(e) => handleChange('security', 'loginAlerts', e.target.checked)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <span className="text-sm">Email alerts for new login attempts</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                  <div className="space-y-3">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleChange('notifications', key, e.target.checked)}
                          className="w-4 h-4 rounded border-input"
                        />
                        <span className="text-sm">{key.split(/(?=[A-Z])/).join(' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Theme</label>
                      <select
                        value={theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Font Size</label>
                      <select
                        value={settings.appearance.fontSize}
                        onChange={(e) => handleChange('appearance', 'fontSize', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.appearance.reducedMotion}
                        onChange={(e) => handleChange('appearance', 'reducedMotion', e.target.checked)}
                        className="w-4 h-4 rounded border-input"
                      />
                      <span className="text-sm">Reduce motion</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">General Preferences</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Language</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handleChange('preferences', 'language', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Date Format</label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => handleChange('preferences', 'dateFormat', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Time Format</label>
                      <select
                        value={settings.preferences.timeFormat}
                        onChange={(e) => handleChange('preferences', 'timeFormat', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input"
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Settings; 