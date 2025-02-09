import React, { useState, useEffect } from 'react';
import { X, Loader2, Mail, Phone, Building2, User } from 'lucide-react';
import { databaseService } from '../lib/database';
import { toast } from 'react-hot-toast';

const EditClientModal = ({ isOpen, onClose, client, userId, onClientUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
      });
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await databaseService.updateClient(userId, client.id, {
        ...formData,
        updatedAt: new Date()
      });

      if (result.success) {
        onClientUpdated({
          ...client,
          ...formData
        });
        onClose();
      } else {
        toast.error(result.error || 'Failed to update client');
      }
    } catch (error) {
      console.error('Update client error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Edit Client</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Details Card */}
          <div className="bg-background rounded-lg border border-border p-4 space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Company Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-background rounded-lg border border-border p-4 space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Address
              </label>
              <textarea
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-input bg-background text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                'Update Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal; 