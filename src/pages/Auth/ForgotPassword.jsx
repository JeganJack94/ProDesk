import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(true);
        setEmail(''); // Clear email after successful submission
      } else {
        setError(result.error || 'Failed to send reset instructions');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-primary hover:text-primary/90"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to login
        </Link>

        {/* Logo and Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">ProDesk</h1>
          <h2 className="mt-6 text-2xl font-bold text-foreground">Reset your password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-500 p-4 rounded-md flex items-start gap-3">
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We've sent you a link to reset your password. The link will expire in 24 hours.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : success ? (
              'Instructions Sent'
            ) : (
              'Send Reset Instructions'
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:text-primary/90 font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 