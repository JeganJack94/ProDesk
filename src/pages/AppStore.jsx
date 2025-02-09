import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Copy, 
  Share2, 
  ExternalLink, 
  Image as ImageIcon,
  X,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { imageStorage } from '../utils/imageStorage';

const AppStore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newApp, setNewApp] = useState({
    title: '',
    company: '',
    link: '',
    description: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApps();
  }, [user]);

  const fetchApps = async () => {
    try {
      const result = await databaseService.listApps(user.uid);
      if (result.success) {
        setApps(result.apps);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      toast.error('Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(file => databaseService.uploadAppImage(user.uid, file))
      );
      setNewApp(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls.filter(url => url)]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await databaseService.createApp(user.uid, newApp);
      if (result.success) {
        toast.success('App added successfully');
        setShowAddModal(false);
        setNewApp({ title: '', company: '', link: '', description: '', images: [] });
        fetchApps();
      }
    } catch (error) {
      console.error('Error creating app:', error);
      toast.error('Failed to add app');
    }
  };

  const handleEdit = (app) => {
    setSelectedApp(app);
    setNewApp({
      title: app.title,
      company: app.company,
      link: app.link,
      description: app.description,
      images: app.images
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await databaseService.updateApp(user.uid, selectedApp.id, newApp);
      if (result.success) {
        toast.success('App updated successfully');
        setShowEditModal(false);
        setSelectedApp(null);
        setNewApp({ title: '', company: '', link: '', description: '', images: [] });
        fetchApps();
      }
    } catch (error) {
      console.error('Error updating app:', error);
      toast.error('Failed to update app');
    }
  };

  const handleDelete = async (appId) => {
    if (window.confirm('Are you sure you want to delete this app?')) {
      try {
        const result = await databaseService.deleteApp(user.uid, appId);
        if (result.success) {
          // Clean up images from localStorage
          apps.find(app => app.id === appId).images.forEach(imageKey => imageStorage.deleteImage(imageKey));
          toast.success('App deleted successfully');
          fetchApps();
        }
      } catch (error) {
        console.error('Error deleting app:', error);
        toast.error('Failed to delete app');
      }
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  const shareApp = async (app) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: app.title,
          text: `Check out ${app.title} by ${app.company}`,
          url: app.link
        });
      } else {
        copyLink(app.link);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">App Store</h1>
            <p className="text-gray-400 mt-2">Showcase and discover amazing applications</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Add App
          </motion.button>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, index) => (
            <AppCard
              key={app.id}
              app={app}
              index={index}
              onCopy={copyLink}
              onShare={shareApp}
              onEdit={() => handleEdit(app)}
              onDelete={() => handleDelete(app.id)}
            />
          ))}
        </div>

        {/* Add/Edit App Modal */}
        {(showAddModal || showEditModal) && (
          <AddAppModal
            newApp={newApp}
            setNewApp={setNewApp}
            onClose={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedApp(null);
              setNewApp({ title: '', company: '', link: '', description: '', images: [] });
            }}
            onSubmit={showEditModal ? handleUpdate : handleSubmit}
            onImageUpload={handleImageUpload}
            uploading={uploading}
            isEditing={showEditModal}
          />
        )}
      </div>
    </div>
  );
};

const AppCard = ({ app, index, onCopy, onShare, onEdit, onDelete }) => {
  const getImageUrl = (imageKey) => {
    return imageStorage.getImage(imageKey);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-zinc-800/50 rounded-xl border border-red-500/20 p-6 hover:border-red-500/40 transition-all duration-300"
    >
      {/* Image Carousel */}
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        {app.images?.length > 0 ? (
          <ImageCarousel images={app.images.map(getImageUrl)} />
        ) : (
          <div className="w-full h-full bg-zinc-700/50 flex items-center justify-center">
            <ImageIcon size={48} className="text-zinc-500" />
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-white mb-2">{app.title}</h2>
      <p className="text-sm text-gray-400 mb-4">by {app.company}</p>
      <p className="text-gray-300 mb-4 line-clamp-3">{app.description}</p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onCopy(app.link)}
          className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
        >
          <Copy size={18} className="text-gray-400" />
        </button>
        <button
          onClick={() => onShare(app)}
          className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
        >
          <Share2 size={18} className="text-gray-400" />
        </button>
        <a
          href={app.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
        >
          <ExternalLink size={18} className="text-gray-400" />
        </a>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
        >
          <Pencil size={18} className="text-gray-400" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-zinc-700/50 hover:bg-red-700 transition-colors"
        >
          <Trash2 size={18} className="text-gray-400 hover:text-red-400" />
        </button>
      </div>
    </motion.div>
  );
};

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.filter(Boolean).map((imageData, index) => (
        <motion.img
          key={index}
          src={imageData}
          alt={`App screenshot ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentIndex ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </div>
  );
};

const AddAppModal = ({ newApp, setNewApp, onClose, onSubmit, onImageUpload, uploading, isEditing }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-800 rounded-xl p-6 w-full max-w-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit App' : 'Add New App'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="App Title"
            value={newApp.title}
            onChange={(e) => setNewApp(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white"
            required
          />
          <input
            type="text"
            placeholder="Company Name"
            value={newApp.company}
            onChange={(e) => setNewApp(prev => ({ ...prev, company: e.target.value }))}
            className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white"
            required
          />
          <input
            type="url"
            placeholder="App Link"
            value={newApp.link}
            onChange={(e) => setNewApp(prev => ({ ...prev, link: e.target.value }))}
            className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white"
            required
          />
          <textarea
            placeholder="App Description"
            value={newApp.description}
            onChange={(e) => setNewApp(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white h-32 resize-none"
            required
          />
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              App Screenshots (max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
            <label
              htmlFor="image-upload"
              className="w-full px-4 py-2 bg-zinc-700 rounded-lg text-white flex items-center justify-center cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <ImageIcon size={20} className="mr-2" />
                  Upload Images
                </>
              )}
            </label>
          </div>
          {newApp.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {newApp.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            {isEditing ? 'Update App' : 'Add App'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AppStore; 