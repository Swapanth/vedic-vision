import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, className = "max-w-md" }) => {
  const { themeColors } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-[2px] modal-overlay z-[9999] p-4"
      style={{ backgroundColor: themeColors.modalOverlay }}
    >
      <div 
        className={`rounded-lg shadow-2xl ${className} w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[10000] animate-fade-in modal-content`}
        style={{ 
          backgroundColor: themeColors.modalBg,
          border: `1px solid ${themeColors.border}`
        }}
      >
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ 
            backgroundColor: themeColors.backgroundSecondary,
            borderColor: themeColors.border
          }}
        >
          <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors"
            style={{ 
              color: themeColors.textSecondary,
              backgroundColor: themeColors.background
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = themeColors.hover;
              e.target.style.color = themeColors.text;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = themeColors.background;
              e.target.style.color = themeColors.textSecondary;
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal; 