import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Theme colors object
  const themeColors = {
    // Backgrounds
    background: isDarkMode ? '#000000' : '#ffffff',
    backgroundSecondary: isDarkMode ? '#1e293b' : '#f8fafc',
    cardBg: isDarkMode ? '#000000' : '#ffffff',
    cardBgSecondary: isDarkMode ? '#334155' : '#f8fafc',
    
    // Text colors
    text: isDarkMode ? '#f1f5f9' : '#1f2937',
    textSecondary: isDarkMode ? '#94a3b8' : '#6b7280',
    textMuted: isDarkMode ? '#64748b' : '#9ca3af',
    
    // Accent colors
    accent: isDarkMode ? '#3b82f6' : '#3b82f6',
    accentHover: isDarkMode ? '#2563eb' : '#2563eb',
    
    // Status colors
    success: isDarkMode ? '#10b981' : '#10b981',
    successBg: isDarkMode ? '#ecfdf5' : '#ecfdf5',
    warning: isDarkMode ? '#f59e0b' : '#f59e0b',
    warningBg: isDarkMode ? '#fffbeb' : '#fffbeb',
    error: isDarkMode ? '#ef4444' : '#ef4444',
    errorBg: isDarkMode ? '#7f1d1d' : '#fef2f2',
    
    // UI colors
    purple: isDarkMode ? '#a78bfa' : '#7c3aed',      // brighter in dark mode, deeper in light
    purpleBg: isDarkMode ? '#4c1d95' : '#f3e8ff',    // deep indigo for dark, soft lavender for light
    
    blue: isDarkMode ? '#60a5fa' : '#2563eb',        // lighter, vibrant blue in dark, bold blue in light
    blueBg: isDarkMode ? '#1e3a8a' : '#eff6ff',      // keep deep navy in dark, airy blue in light
    
    green: isDarkMode ? '#34d399' : '#059669',       // fresh minty green in dark, rich emerald in light
    greenBg: isDarkMode ? '#064e3b' : '#ecfdf5',     // forest green in dark, pale mint in light
    
    orange: isDarkMode ? '#fb923c' : '#ea580c',      // sunset orange in dark, bold pumpkin in light
    orangeBg: isDarkMode ? '#7c2d12' : '#fff7ed',    // deep burnt orange in dark, warm cream in light
    
    
    // Borders and dividers
    border: isDarkMode ? '#334155' : '#e5e7eb',
    borderLight: isDarkMode ? '#475569' : '#f3f4f6',
    
    // Interactive elements
    hover: isDarkMode ? '#334155' : '#f9fafb',
    active: isDarkMode ? '#475569' : '#f3f4f6',
    
    // Navbar specific
    navbarBg: isDarkMode ? '#1e293b' : '#ffffff',
    navbarBorder: isDarkMode ? '#334155' : '#e5e7eb',
    
    // Sidebar specific
    sidebarBg: isDarkMode ? '#1e293b' : '#ffffff',
    sidebarHover: isDarkMode ? '#334155' : '#f9fafb',
    
    // Modal specific
    modalBg: isDarkMode ? '#1e293b' : '#ffffff',
    modalOverlay: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
  };

  const value = {
    isDarkMode,
    toggleTheme,
    themeColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};