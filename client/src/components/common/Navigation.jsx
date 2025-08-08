import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Trophy, Layout, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  if (!isAuthenticated) {
    return (
      <nav className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Vedic Vision
                  </span>
                  <span className="text-blue-200 font-light ml-2">2K25</span>
                </h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-3">
              <Link 
                to="/login" 
                className="group relative px-6 py-2.5 text-white/90 hover:text-white font-medium transition-all duration-300 ease-out overflow-hidden rounded-lg"
              >
                <span className="absolute inset-0 bg-white/10 rounded-lg transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                <span className="relative">Login</span>
              </Link>
              <Link 
                to="/register" 
                className="group relative px-6 py-2.5 bg-white/90 backdrop-blur-sm text-indigo-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative">Register</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-out ${isMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="px-4 py-3 space-y-2 bg-indigo-700/50 backdrop-blur-sm border-t border-white/10">
            <Link 
              to="/login" 
              className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="block px-4 py-3 bg-white/90 text-indigo-700 font-semibold rounded-lg hover:bg-white transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shadow-xl backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Vedic Vision
                </span>
                <span className="text-blue-200 font-light ml-2">2K25</span>
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/dashboard" 
                className="group flex items-center px-4 py-2.5 text-white/90 hover:text-white font-medium rounded-lg transition-all duration-300 hover:bg-white/10"
              >
                <Layout size={18} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="group flex items-center px-4 py-2.5 text-white/90 hover:text-white font-medium rounded-lg transition-all duration-300 hover:bg-white/10"
              >
                <User size={18} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                Profile
              </Link>
              <Link 
                to="/leaderboard" 
                className="group flex items-center px-4 py-2.5 text-white/90 hover:text-white font-medium rounded-lg transition-all duration-300 hover:bg-white/10"
              >
                <Trophy size={18} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                Leaderboard
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative z-[9999] user-menu-container">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-3 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-white font-semibold text-sm">{user?.name}</div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-1 py-0.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-white/70 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* User Dropdown */}
              <div className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-300 origin-top-right z-[9999] transform ${
                isUserMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`} style={{ minWidth: '280px', maxWidth: '320px' }}>
                {/* Dropdown arrow */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg px-2">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user?.name}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white mt-1">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User size={18} className="mr-3 text-gray-400" />
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden transition-all duration-300 ease-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-4 py-3 space-y-2 bg-indigo-700/50 backdrop-blur-sm border-t border-white/10">
          <Link 
            to="/dashboard" 
            className="flex items-center px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <Layout size={18} className="mr-3" />
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className="flex items-center px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <User size={18} className="mr-3" />
            Profile
          </Link>
          <Link 
            to="/leaderboard" 
            className="flex items-center px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            <Trophy size={18} className="mr-3" />
            Leaderboard
          </Link>
        </div>
      </div>

      {/* Overlay for mobile user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden" 
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navigation;