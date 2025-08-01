import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!formData.password) {
      return 'Password is required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b-2 border-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-black text-gray-900">
                VEDIC<span className="text-blue-600">VISION</span> 🚀
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/register" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                Need an account?
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#272757] rounded-xl border-2 border-gray-900 shadow-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                Welcome Back! 🎯
              </h2>
              <p className="text-gray-600 font-semibold">
                Sign in to continue your coding journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-black text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-black text-gray-900 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-black py-4 px-6 rounded-lg border-2 border-gray-900 shadow-lg hover:shadow-md transition-all duration-200 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In 🚀'
                )}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-gray-600 font-semibold">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-black text-blue-600 hover:text-blue-700 transition-colors">
                    Register here ➡️
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Additional Info Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-[#272757] rounded-xl border-2 border-gray-900 p-4 shadow-lg text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-white font-black text-sm">Quick Access</div>
            </div>
            <div className="bg-orange-500 rounded-xl border-2 border-gray-900 p-4 shadow-lg text-center">
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-white font-black text-sm">Secure Login</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-black text-white mb-4">
            Continue Your Coding Journey! 🎯
          </h3>
          <p className="text-gray-400 font-semibold max-w-2xl mx-auto">
            Access your dashboard and continue building amazing projects with thousands of other developers in the Vedic Vision community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 