import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Search, 
  Plus, 
  Users,
} from 'lucide-react';
import ClientCard from '../../components/ClientCard';
import CreateClientModal from '../../components/CreateClientModal';
import EditClientModal from '../../components/EditClientModal';
import { databaseService } from '../../lib/database';
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';

const ClientList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    fetchClients();
  }, [user?.uid]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const result = await databaseService.listClients(user.uid);
      if (result.success) {
        setClients(result.clients);
      } else {
        setError('Failed to load clients');
        toast.error('Failed to load clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClientCreated = (newClient) => {
    setClients(prev => [newClient, ...prev]);
    toast.success('Client created successfully');
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleClientUpdated = (updatedClient) => {
    setClients(prev => prev.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
    toast.success('Client updated successfully');
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const result = await databaseService.deleteClient(user.uid, clientId);
        if (result.success) {
          setClients(prev => prev.filter(client => client.id !== clientId));
          toast.success('Client deleted successfully');
        }
      } catch (error) {
        console.error('Delete client error:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search 
            size={20} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <Loader />
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No clients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first client'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
            >
              Add Client
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user.uid}
        onClientCreated={handleClientCreated}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        userId={user.uid}
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
};

export default ClientList; 