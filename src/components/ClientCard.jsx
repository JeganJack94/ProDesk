import React from 'react';
import { Mail, Phone, Building2, Edit2, Trash2 } from 'lucide-react';

const ClientCard = ({ client, onEdit, onDelete }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow relative group">
      {/* Actions */}
      <div className="flex items-center gap-2 absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(client);
          }}
          className="p-2 hover:bg-accent rounded-full transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Edit2 size={16} />
          <span className="text-sm hidden group-hover:inline">Edit</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(client.id);
          }}
          className="p-2 hover:bg-destructive/10 rounded-full transition-colors flex items-center gap-2 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={16} />
          <span className="text-sm hidden group-hover:inline">Delete</span>
        </button>
      </div>

      {/* Client Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
          <p className="text-sm text-muted-foreground">{client.company}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={16} />
            <a href={`mailto:${client.email}`} className="hover:text-foreground transition-colors">
              {client.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={16} />
            <a href={`tel:${client.phone}`} className="hover:text-foreground transition-colors">
              {client.phone}
            </a>
          </div>
          {client.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 size={16} />
              <span className="hover:text-foreground transition-colors">{client.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCard; 