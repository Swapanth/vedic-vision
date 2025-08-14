import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

// Theme detection hook (similar to landing page)
const useThemeDetection = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const detectTheme = () => {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkTheme(prefersDark);
      }
    };

    detectTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => detectTheme();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDarkTheme;
};

// Theme-aware color utility (matching landing page)
const getThemeColors = (isDark) => ({
  background: isDark ? '#0a0a0a' : '#ffffff',
  text: isDark ? '#e5e5e5' : '#1a1a1a',
  textSecondary: isDark ? '#a3a3a3' : '#525252',
  border: isDark ? '#404040' : '#e5e5e5',
  cardBg: isDark ? '#1a1a1a' : '#ffffff',
  cardBgSecondary: isDark ? '#262626' : '#f9f9f9',
  navBg: isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  accent: '#3b82f6',
  accentHover: '#2563eb',
});

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const isDarkTheme = useThemeDetection();
  const themeColors = getThemeColors(isDarkTheme);

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
    e.stopPropagation(); // Prevent any event bubbling

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
        if (result.user?.role === 'judge') {
          navigate('/evaluation/judge');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        const message = err.response.data?.message ||
          err.response.data?.error ||
          `Login failed (${err.response.status})`;
        setError(message);
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        backgroundColor: themeColors.background,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {/* Navigation - Same as Landing Page */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.nav
          className="backdrop-blur-xl rounded-2xl border-2 sticky top-4 z-50"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/" className="text-2xl font-black" style={{ color: themeColors.text }}>
                  VEDIC VISION<span style={{ color: themeColors.accent }}>&nbsp;2K25</span>
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/"
                  className="font-semibold transition-colors hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  Home
                </Link>
                <Link
                  to="/photo-booth"
                  className="font-semibold transition-colors hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  Photo Booth
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Login Card - Classic Design */}
          <motion.div
            className="rounded-2xl shadow-2xl p-8 backdrop-blur-sm"
            style={{
              backgroundColor: themeColors.cardBg,
              border: `1px solid ${themeColors.border}`
            }}
            whileHover={{
              boxShadow: isDarkTheme
                ? '0 25px 50px -12px rgba(255, 255, 255, 0.1)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-8">

              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: themeColors.text }}
              >
                Welcome Back
              </h2>
              <p
                className="font-medium"
                style={{ color: themeColors.textSecondary }}
              >
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: themeColors.text }}
                >
                  Email Address
                </label>
                <motion.input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.cardBgSecondary,
                    border: `1px solid ${themeColors.border}`,
                    color: themeColors.text,
                    focusRingColor: themeColors.accent
                  }}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  whileFocus={{ scale: 1.02 }}
                  onFocus={(e) => e.target.style.borderColor = themeColors.accent}
                  onBlur={(e) => e.target.style.borderColor = themeColors.border}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: themeColors.text }}
                >
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                      border: `1px solid ${themeColors.border}`,
                      color: themeColors.text
                    }}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    whileFocus={{ scale: 1.02 }}
                    onFocus={(e) => e.target.style.borderColor = themeColors.accent}
                    onBlur={(e) => e.target.style.borderColor = themeColors.border}
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5 transition-colors duration-200"
                        style={{ color: themeColors.textSecondary }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onMouseEnter={(e) => e.target.style.color = themeColors.accent}
                        onMouseLeave={(e) => e.target.style.color = themeColors.textSecondary}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 transition-colors duration-200"
                        style={{ color: themeColors.textSecondary }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onMouseEnter={(e) => e.target.style.color = themeColors.accent}
                        onMouseLeave={(e) => e.target.style.color = themeColors.textSecondary}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="px-4 py-3 rounded-xl font-medium"
                  style={{
                    backgroundColor: isDarkTheme ? '#7f1d1d' : '#fef2f2',
                    border: `1px solid ${isDarkTheme ? '#dc2626' : '#fca5a5'}`,
                    color: isDarkTheme ? '#fca5a5' : '#dc2626'
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: loading ? themeColors.textSecondary : themeColors.accent,
                  boxShadow: loading ? 'none' : `0 8px 32px ${themeColors.accent}40`
                }}
                whileHover={!loading ? {
                  scale: 1.02,
                  backgroundColor: themeColors.accentHover
                } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = themeColors.accentHover;
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = themeColors.accent;
                }}
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
                  'Sign In'
                )}
              </motion.button>


            </form>
          </motion.div>

          {/* Feature Cards - Classic Style */}
          <motion.div
            className="mt-8 grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="rounded-xl p-4 text-center backdrop-blur-sm"
              style={{
                backgroundColor: themeColors.cardBgSecondary,
                border: `1px solid ${themeColors.border}`
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-semibold" style={{ color: themeColors.text }}>
                Quick Access
              </div>
            </motion.div>
            <motion.div
              className="rounded-xl p-4 text-center backdrop-blur-sm"
              style={{
                backgroundColor: themeColors.cardBgSecondary,
                border: `1px solid ${themeColors.border}`
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-sm font-semibold" style={{ color: themeColors.text }}>
                Secure Login
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Section - Classic Style */}
      <motion.div
        className="py-16"
        style={{
          backgroundColor: isDarkTheme ? '#111111' : '#f8fafc',
          borderTop: `1px solid ${themeColors.border}`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3
            className="text-2xl font-bold mb-4"
            style={{ color: themeColors.text }}
          >
            Continue Your Coding Journey
          </h3>
          <p
            className="font-medium max-w-2xl mx-auto"
            style={{ color: themeColors.textSecondary }}
          >
            Access your dashboard and continue building amazing projects with the Vedic Vision community.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 