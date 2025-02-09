import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        navigate('/app');
        toast.success(`Welcome back, ${result.user.displayName}!`, {
          icon: '👋',
        });
        return { success: true };
      }
      toast.error('Failed to sign in');
      return { success: false, error: 'An unexpected error occurred' };
    } catch (error) {
      console.error('Sign in failed:', error);
      toast.error('Failed to sign in. Please try again.');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/app');
      toast.success(`Welcome to ProDesk, ${name}!`, {
        icon: '🎉',
      });
      return { success: true };
    } catch (error) {
      console.error('Sign up failed:', error);
      toast.error('Failed to create account. Please try again.');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      toast.success('Successfully signed out', {
        icon: '👋',
      });
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Failed to sign out. Please try again.');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Please check your inbox.');
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error('Failed to send reset email. Please try again.');
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateProfile = async (name) => {
    setLoading(true);
    try {
      const result = await updateProfile(user, { displayName: name });
      if (result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: 'An unexpected error occurred' };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut: logout,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 