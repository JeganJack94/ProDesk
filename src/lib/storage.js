import { 
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
    async uploadFile(file, path) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            return {
                success: true,
                url: downloadURL,
                path: snapshot.ref.fullPath
            };
        } catch (error) {
            console.error('Upload file error:', error);
            return { success: false, error: error.message };
        }
    },

    async deleteFile(path) {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
            return { success: true };
        } catch (error) {
            console.error('Delete file error:', error);
            return { success: false, error: error.message };
        }
    },

    async getFileUrl(path) {
        try {
            const storageRef = ref(storage, path);
            const url = await getDownloadURL(storageRef);
            return { success: true, url };
        } catch (error) {
            console.error('Get file URL error:', error);
            return { success: false, error: error.message };
        }
    }
}; 