import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme, themeColors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      style={{
        backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
        focusRingOffsetColor: themeColors.background
      }}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Toggle background */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: isDarkMode ? '#4f46e5' : '#f59e0b'
        }}
      />
      
      {/* Toggle circle */}
      <div
        className={`relative w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDarkMode ? 'translate-x-3' : '-translate-x-3'
        }`}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3 text-indigo-600" />
        ) : (
          <Sun className="w-3 h-3 text-amber-600" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;