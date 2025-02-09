import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../lib/database';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Notes = ({ projectId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const fetchNotes = async () => {
    try {
      const result = await databaseService.listNotes(user.uid, projectId);
      if (result.success) {
        setNotes(result.notes);
      } else {
        toast.error('Failed to load notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const noteData = {
        content: newNote.trim(),
        createdBy: user.displayName || 'Anonymous',
        createdByEmail: user.email
      };

      const result = await databaseService.addNote(user.uid, projectId, noteData);
      if (result.success) {
        setNotes(prev => [result.note, ...prev]);
        setNewNote('');
        toast.success('Note added successfully');
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const result = await databaseService.deleteNote(user.uid, projectId, noteId);
      if (result.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        toast.success('Note deleted successfully');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-xl border border-red-500/20 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 bg-zinc-900/50 text-white rounded-lg border border-zinc-700/50 px-4 py-2 focus:outline-none focus:border-red-500/50"
          />
          <button
            type="submit"
            disabled={submitting || !newNote.trim()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Plus size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Notes List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={24} className="animate-spin text-red-500" />
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group bg-zinc-900/30 rounded-lg p-4 flex items-start justify-between"
              >
                <div>
                  <p className="text-white mb-2">{note.content}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{note.createdBy}</span>
                    <span>•</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {notes.length === 0 && (
            <p className="text-center text-gray-400 py-4">No notes yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes; 