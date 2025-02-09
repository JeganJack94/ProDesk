import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const isAuthenticated = !!context.user;
  const isLoading = context.loading;

  return {
    ...context,
    isAuthenticated,
    isLoading,
  };
};

export default useAuth; 