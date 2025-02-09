import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Mail, Phone, Building2, FileText } from 'lucide-react';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientAndProjects();
  }, [id]);

  const fetchClientAndProjects = async () => {
    try {
      // Fetch client details
      const clientDoc = await getDoc(doc(db, 'clients', id));
      if (clientDoc.exists()) {
        setClient({ id: clientDoc.id, ...clientDoc.data() });
      }

      // Fetch associated projects
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('clientId', '==', id));
      const projectsSnapshot = await getDocs(q);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <button
          onClick={() => navigate(`/clients/${id}/edit`)}
          className="btn btn-outline"
        >
          Edit Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Contact Information</h2>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${client.email}`} className="link link-hover">
                  {client.email}
                </a>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${client.phone}`} className="link link-hover">
                  {client.phone}
                </a>
              </div>
              
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{client.company}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Projects</h2>
              <Link 
                to="/projects/create" 
                state={{ clientId: id }}
                className="btn btn-sm btn-primary"
              >
                New Project
              </Link>
            </div>
            
            <div className="space-y-3 mt-4">
              {projects.map(project => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
              
              {projects.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No projects yet
                </p>
              )}
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="card bg-base-100 shadow-xl md:col-span-2">
            <div className="card-body">
              <h2 className="card-title">Notes</h2>
              <p className="whitespace-pre-wrap">{client.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails; 