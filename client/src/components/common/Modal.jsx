import React from 'react';

const Modal = ({ isOpen, onClose, title, children, className = "max-w-md" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] modal-overlay z-[9999] p-4">
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-2xl ${className} w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[10000] animate-fade-in modal-content`}>
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors bg-white rounded-full p-1 hover:bg-gray-100"
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