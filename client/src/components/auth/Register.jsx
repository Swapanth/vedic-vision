import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
    setValidationErrors([]); // Clear validation errors when user types
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push('Name is required');
    }

    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.mobile.trim()) {
      errors.push('Mobile number is required');
    } else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.mobile.trim())) {
      errors.push('Please enter a valid mobile number');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!formData.confirmPassword) {
      errors.push('Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);

    // Client-side validation
    const clientErrors = validateForm();
    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors.map(error => ({ msg: error })));
      setError('Please fix the validation errors below');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      console.log('Registration successful');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);

      // Check if the error response has validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message || 'Validation errors occurred');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
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
              <a href="/login" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                Already have an account?
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Registration Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-900 shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#272757] rounded-xl border-2 border-gray-900 shadow-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                Join the Revolution! 🎯
              </h2>
              <p className="text-gray-600 font-semibold">
                Create your account and start your coding journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-black text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

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

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-black text-gray-900 mb-2">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all"
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
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
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-black text-gray-900 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-900 rounded-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition-all"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="text-red-800 font-semibold mb-2">Please fix the following errors:</div>
                  <ul className="space-y-1">
                    {validationErrors.map((validationError, index) => (
                      <li key={index} className="text-red-700 text-sm flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{validationError.msg}</span>
                      </li>
                    ))}
                  </ul>
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
                    Creating account...
                  </div>
                ) : (
                  'Create Account 🚀'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600 font-semibold">
                  Already have an account?{' '}
                  <a href="/login" className="font-black text-blue-600 hover:text-blue-700 transition-colors">
                    Sign in here ➡️
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Additional Info Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-[#272757] rounded-xl border-2 border-gray-900 p-4 shadow-lg text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-white font-black text-sm">Fast Setup</div>
            </div>
            <div className="bg-orange-500 rounded-xl border-2 border-gray-900 p-4 shadow-lg text-center">
              <div className="text-2xl mb-2">🎁</div>
              <div className="text-white font-black text-sm">Free Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-black text-white mb-4">
            Ready to Start Your Journey? 🎯
          </h3>
          <p className="text-gray-400 font-semibold max-w-2xl mx-auto">
            Join thousands of developers who are already building amazing projects and transforming their coding skills into strategic innovation artistry.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;