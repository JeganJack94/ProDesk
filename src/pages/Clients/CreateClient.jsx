import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

const CreateClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const clientDoc = await getDoc(doc(db, 'clients', id));
      if (clientDoc.exists()) {
        setFormData(clientDoc.data());
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        // Update existing client
        await updateDoc(doc(db, 'clients', id), formData);
      } else {
        // Create new client
        await addDoc(collection(db, 'clients'), formData);
      }
      navigate('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Client' : 'Create New Client'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Phone</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Company</span>
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="textarea textarea-bordered h-24"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update Client' : 'Create Client')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient; 