import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);
      if (!result.success) {
        toast.error(result.error || 'Failed to sign in');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="bg-background/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-8 border border-border/50">
          {/* Logo and Title */}
          <div className="text-center space-y-2">
            <div className="inline-block">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ProDesk
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 rounded-lg border border-input bg-background/50 px-3 py-2.5 text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-2 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 rounded-lg border border-input bg-background/50 px-3 py-2.5 text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary/90 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? (
                <Loader small />
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-primary hover:text-primary/90 font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;