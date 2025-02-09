import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../lib/auth';
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        passwordConfirm: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Get userId and secret from URL parameters
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    useEffect(() => {
        if (!userId || !secret) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [userId, secret]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.passwordConfirm) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const result = await authService.completePasswordReset(
                userId,
                secret,
                formData.password,
                formData.passwordConfirm
            );

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                    <div className="flex flex-col items-center justify-center text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
                        <p className="mt-2 text-gray-600">
                            Your password has been successfully reset. You will be redirected to the login page shortly.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div>
                    <Link to="/login" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                    </Link>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="password" className="sr-only">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="New Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={8}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="passwordConfirm" className="sr-only">Confirm New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    type="password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirm New Password"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    minLength={8}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !userId || !secret}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 