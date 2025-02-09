import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = () => {
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, formData.name);
      if (!result.success) {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-8">
      <div className="bg-background/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-8 border border-border/50">
        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">ProDesk</h1>
          <h2 className="mt-6 text-2xl font-bold text-foreground">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to get started with ProDesk
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-muted-foreground" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Create a password"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:text-primary/90 font-medium">
              Sign in
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 