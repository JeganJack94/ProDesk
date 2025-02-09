import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    setDoc,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export const databaseService = {
    // Projects
    async createProject(userId, projectData) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            if (!projectData.title) {
                throw new Error('Project title is required');
            }

            const projectRef = doc(collection(db, `users/${userId}/projects`));
            
            const newProject = {
                ...projectData,
                id: projectRef.id,
                title: projectData.title.trim(),
                description: projectData.description?.trim() || '',
                status: projectData.status || 'in-progress',
                priority: projectData.priority || 'medium',
                progress: Number(projectData.progress) || 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                active: true,
                archived: false,
                tasks: {
                    total: 0,
                    completed: 0,
                    list: []
                },
                files: [],
                notes: [],
                titleLower: projectData.title.toLowerCase().trim(),
                searchTerms: projectData.searchTerms || [
                    projectData.title.toLowerCase().trim(),
                    projectData.description?.toLowerCase().trim()
                ].filter(Boolean)
            };
            
            Object.keys(newProject).forEach(key => 
                newProject[key] === undefined && delete newProject[key]
            );
            
            await setDoc(projectRef, newProject);
            return { success: true, project: newProject };
        } catch (error) {
            console.error('Error creating project:', error);
            return { success: false, error: error.message };
        }
    },

    async getProject(userId, projectId) {
        try {
            const projectRef = doc(db, `users/${userId}/projects`, projectId);
            const projectDoc = await getDoc(projectRef);
            
            if (projectDoc.exists()) {
                return { success: true, project: { id: projectDoc.id, ...projectDoc.data() }};
            }
            return { success: false, error: 'Project not found' };
        } catch (error) {
            console.error('Error fetching project:', error);
            return { success: false, error: error.message };
        }
    },

    async listProjects(userId, filters = {}) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            console.log('Listing projects for user:', userId); // Debug log

            const projectsRef = collection(db, `users/${userId}/projects`);
            
            let conditions = [
                orderBy('createdAt', 'desc')
            ];

            const q = query(projectsRef, ...conditions);
            const snapshot = await getDocs(q);
            
            console.log('Found documents:', snapshot.size); // Debug log

            const projects = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Document data:', data); // Debug log
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                };
            });

            return { success: true, projects };
        } catch (error) {
            console.error('Error listing projects:', error);
            return { success: false, error: error.message };
        }
    },

    async updateProject(userId, projectId, projectData) {
        try {
            if (!userId || !projectId) {
                throw new Error('User ID and Project ID are required');
            }

            const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
            
            const updatedProject = {
                ...projectData,
                updatedAt: serverTimestamp(),
            };
            
            await updateDoc(projectRef, updatedProject);
            
            return { 
                success: true, 
                project: {
                    id: projectId,
                    ...updatedProject
                }
            };
        } catch (error) {
            console.error('Error updating project:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteProject(userId, projectId) {
        try {
            const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
            await deleteDoc(projectRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting project:', error);
            return { success: false, error: error.message };
        }
    },

    // Tasks
    async createTask(userId, projectId, taskData) {
        try {
            const taskRef = doc(collection(db, `users/${userId}/projects/${projectId}/tasks`));
            const newTask = {
                ...taskData,
                id: taskRef.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: taskData.status || 'todo',
                priority: taskData.priority || 'medium',
                reminderTime: taskData.reminderTime || null,
                timeSpent: '0h'
            };

            // Update project task count
            const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
            await updateDoc(projectRef, {
                'tasks.total': increment(1)
            });

            await setDoc(taskRef, newTask);
            return { success: true, task: newTask };
        } catch (error) {
            console.error('Create task error:', error);
            return { success: false, error: error.message };
        }
    },

    async listProjectTasks(userId, projectId) {
        try {
            const tasksRef = collection(db, `users/${userId}/projects/${projectId}/tasks`);
            const q = query(tasksRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            }));

            return { success: true, tasks };
        } catch (error) {
            console.error('Error listing tasks:', error);
            return { success: false, error: error.message };
        }
    },

    async updateTask(userId, projectId, taskId, taskData) {
        try {
            const taskRef = doc(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`);
            
            // If status is changing to completed, update project completed tasks count
            if (taskData.status === 'completed') {
                const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
                await updateDoc(projectRef, {
                    'tasks.completed': increment(1)
                });
            }

            await updateDoc(taskRef, {
                ...taskData,
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating task:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteTask(userId, projectId, taskId) {
        try {
            const taskRef = doc(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`);
            
            // Get task data to check if it was completed
            const taskDoc = await getDoc(taskRef);
            const taskData = taskDoc.data();

            // Update project task counts
            const projectRef = doc(db, `users/${userId}/projects/${projectId}`);
            await updateDoc(projectRef, {
                'tasks.total': increment(-1),
                ...(taskData.status === 'completed' ? { 'tasks.completed': increment(-1) } : {})
            });

            await deleteDoc(taskRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting task:', error);
            return { success: false, error: error.message };
        }
    },

    // Clients
    async createClient(userId, clientData) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const clientRef = doc(collection(db, `users/${userId}/clients`));
            
            const newClient = {
                ...clientData,
                id: clientRef.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                active: true
            };
            
            await setDoc(clientRef, newClient);
            
            return { 
                success: true, 
                client: {
                    ...newClient,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            };
        } catch (error) {
            console.error('Error creating client:', error);
            return { success: false, error: error.message };
        }
    },

    async listClients(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const clientsRef = collection(db, `users/${userId}/clients`);
            const q = query(clientsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const clients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            }));

            return { success: true, clients };
        } catch (error) {
            console.error('Error listing clients:', error);
            return { success: false, error: error.message };
        }
    },

    async updateClient(userId, clientId, clientData) {
        try {
            if (!userId || !clientId) {
                throw new Error('User ID and Client ID are required');
            }

            const clientRef = doc(db, `users/${userId}/clients/${clientId}`);
            
            const updatedClient = {
                ...clientData,
                updatedAt: serverTimestamp()
            };
            
            await updateDoc(clientRef, updatedClient);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating client:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteClient(userId, clientId) {
        try {
            if (!userId || !clientId) {
                throw new Error('User ID and Client ID are required');
            }

            const clientRef = doc(db, `users/${userId}/clients/${clientId}`);
            await deleteDoc(clientRef);
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting client:', error);
            return { success: false, error: error.message };
        }
    },

    // Time Tracking
    async createTimeEntry(userId, projectId, timeData) {
        try {
            const timeEntryRef = doc(collection(db, `users/${userId}/projects/${projectId}/tasks/${timeData.taskId}/timeEntries`));
            const newTimeEntry = {
                ...timeData,
                id: timeEntryRef.id,
                startTime: timeData.startTime,
                endTime: null,
                duration: 0,
                status: 'running',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            await setDoc(timeEntryRef, newTimeEntry);
            
            return { 
                success: true, 
                timeEntry: {
                    ...newTimeEntry,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            };
        } catch (error) {
            console.error('Error creating time entry:', error);
            return { success: false, error: error.message };
        }
    },

    async updateTimeEntry(userId, projectId, timeEntryId, timeData) {
        try {
            const timeEntryRef = doc(db, `users/${userId}/projects/${projectId}/tasks/${timeData.taskId}/timeEntries/${timeEntryId}`);
            
            await updateDoc(timeEntryRef, {
                ...timeData,
                updatedAt: serverTimestamp()
            });

            // Update task total time
            const taskRef = doc(db, `users/${userId}/projects/${projectId}/tasks/${timeData.taskId}`);
            await updateDoc(taskRef, {
                totalTime: increment(timeData.duration)
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating time entry:', error);
            return { success: false, error: error.message };
        }
    },

    async listTimeEntries(userId, projectId, taskId) {
        try {
            const timeEntriesRef = collection(db, `users/${userId}/projects/${projectId}/tasks/${taskId}/timeEntries`);
            const q = query(timeEntriesRef, orderBy('startTime', 'desc'));
            const snapshot = await getDocs(q);

            const timeEntries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, timeEntries };
        } catch (error) {
            console.error('Error listing time entries:', error);
            return { success: false, error: error.message };
        }
    },

    // Settings
    async getSettings(userId) {
        try {
            const settingsRef = doc(db, `users/${userId}/settings/preferences`);
            const snapshot = await getDoc(settingsRef);
            
            if (snapshot.exists()) {
                return { 
                    success: true, 
                    settings: snapshot.data() 
                };
            }
            
            // Return default settings if none exist
            return { 
                success: true, 
                settings: {
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
                }
            };
        } catch (error) {
            console.error('Error getting settings:', error);
            return { success: false, error: error.message };
        }
    },

    async updateSettings(userId, settings) {
        try {
            const settingsRef = doc(db, `users/${userId}/settings/preferences`);
            await setDoc(settingsRef, {
                ...settings,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating settings:', error);
            return { success: false, error: error.message };
        }
    },

    async updatePassword(userId, currentPassword, newPassword) {
        try {
            // First reauthenticate
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            
            await reauthenticateWithCredential(user, credential);
            
            // Then update password
            await updatePassword(user, newPassword);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating password:', error);
            return { 
                success: false, 
                error: error.code === 'auth/wrong-password' 
                    ? 'Current password is incorrect' 
                    : error.message 
            };
        }
    },

    // App Store functions
    async listApps(userId) {
        try {
            const appsRef = collection(db, `users/${userId}/apps`);
            const q = query(appsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            const apps = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));
            
            return { success: true, apps };
        } catch (error) {
            console.error('Error listing apps:', error);
            return { success: false, error: error.message };
        }
    },

    async createApp(userId, appData) {
        try {
            const appRef = doc(collection(db, `users/${userId}/apps`));
            await setDoc(appRef, {
                ...appData,
                id: appRef.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error creating app:', error);
            return { success: false, error: error.message };
        }
    },

    async uploadAppImage(userId, file) {
        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // Store image in localStorage with a unique key
                    const imageKey = `app_image_${userId}_${Date.now()}_${file.name}`;
                    try {
                        localStorage.setItem(imageKey, reader.result);
                        resolve(imageKey); // Return the key instead of URL
                    } catch (error) {
                        // Handle localStorage quota exceeded
                        if (error.name === 'QuotaExceededError') {
                            reject(new Error('Local storage is full. Please delete some images first.'));
                        } else {
                            reject(error);
                        }
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    },

    async updateApp(userId, appId, appData) {
        try {
            const appRef = doc(db, `users/${userId}/apps/${appId}`);
            await updateDoc(appRef, {
                ...appData,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating app:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteApp(userId, appId) {
        try {
            const appRef = doc(db, `users/${userId}/apps/${appId}`);
            await deleteDoc(appRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting app:', error);
            return { success: false, error: error.message };
        }
    },

    // Notes functions
    async addNote(userId, projectId, noteData) {
        try {
            const noteRef = doc(collection(db, `users/${userId}/projects/${projectId}/notes`));
            const newNote = {
                id: noteRef.id,
                content: noteData.content,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: noteData.createdBy || 'Anonymous',
                createdByEmail: noteData.createdByEmail
            };
            
            await setDoc(noteRef, newNote);
            return { 
                success: true, 
                note: {
                    ...newNote,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            };
        } catch (error) {
            console.error('Error adding note:', error);
            return { success: false, error: error.message };
        }
    },

    async listNotes(userId, projectId) {
        try {
            const notesRef = collection(db, `users/${userId}/projects/${projectId}/notes`);
            const q = query(notesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            const notes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date()
            }));
            
            return { success: true, notes };
        } catch (error) {
            console.error('Error listing notes:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteNote(userId, projectId, noteId) {
        try {
            const noteRef = doc(db, `users/${userId}/projects/${projectId}/notes/${noteId}`);
            await deleteDoc(noteRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting note:', error);
            return { success: false, error: error.message };
        }
    }
}; 