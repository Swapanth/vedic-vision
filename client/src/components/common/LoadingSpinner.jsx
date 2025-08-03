import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Main loading container */}
      <div className="relative flex flex-col items-center space-y-8">

        {/* Ornamental divider */}
        <div className="flex items-center space-x-4 opacity-60">
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
          <div className="w-3 h-3 border-2 border-yellow-400 rotate-45 animate-spin"></div>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-[bounce_1.4s_ease-in-out_infinite] opacity-80"></div>
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-[bounce_1.4s_ease-in-out_0.2s_infinite] opacity-80"></div>
          <div className="w-3 h-3 bg-red-400 rounded-full animate-[bounce_1.4s_ease-in-out_0.4s_infinite] opacity-80"></div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>

       
      </div>

      {/* Custom CSS animations */}
      <style jsx>{`
        @keyframes typewriter {
          0%, 100% {
            width: 0;
            opacity: 0;
          }
          20%, 80% {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(10px);
          }
          50% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        .animate-typewriter {
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 