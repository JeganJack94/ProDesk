import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
    // Create a new user account
    async createAccount(email, password, name) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile with name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            return {
                success: true,
                user: {
                    id: userCredential.user.uid,
                    email: userCredential.user.email,
                    name: userCredential.user.displayName
                }
            };
        } catch (error) {
            console.error('Create account error:', error);
            return { success: false, error: error.message };
        }
    },

    // Login user
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return {
                success: true,
                user: {
                    id: userCredential.user.uid,
                    email: userCredential.user.email,
                    name: userCredential.user.displayName
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    // Logout user
    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    },

    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, (user) => {
            if (user) {
                callback({
                    id: user.uid,
                    email: user.email,
                    name: user.displayName
                });
            } else {
                callback(null);
            }
        });
    }
}; 