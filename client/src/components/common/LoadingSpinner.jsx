import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Loading Spinner with multiple variants
const LoadingSpinner = ({ 
  variant = 'default', 
  size = 'medium', 
  text = 'Loading...',
  showText = true,
  className = '',
  fullScreen = false
}) => {
  // Size configurations
  const sizeConfig = {
    small: { 
      spinner: 'h-6 w-6', 
      container: 'h-32',
      text: 'text-sm',
      dots: 'h-2 w-2',
      bars: 'h-8'
    },
    medium: { 
      spinner: 'h-12 w-12', 
      container: 'h-64',
      text: 'text-base',
      dots: 'h-3 w-3',
      bars: 'h-12'
    },
    large: { 
      spinner: 'h-16 w-16', 
      container: 'h-80',
      text: 'text-lg',
      dots: 'h-4 w-4',
      bars: 'h-16'
    }
  };

  const config = sizeConfig[size];
  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : `flex flex-col items-center justify-center ${config.container}`;

  // Variant 1: Enhanced Spinning Circle
  const SpinningCircle = () => (
    <motion.div
      className={`relative ${config.spinner}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-500"></div>
    </motion.div>
  );

  // Variant 2: Pulse Dots
  const PulseDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${config.dots} bg-blue-600 rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  // Variant 3: Bouncing Bars
  const BouncingBars = () => (
    <div className="flex space-x-1 items-end">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`w-2 ${config.bars} bg-gradient-to-t from-blue-600 to-blue-400 rounded-t`}
          animate={{
            scaleY: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );

  // Variant 4: Orbital Loader
  const OrbitalLoader = () => (
    <div className={`relative ${config.spinner}`}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full"></div>
      </motion.div>
      <motion.div
        className="absolute inset-2"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
      </motion.div>
      <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
    </div>
  );

  // Variant 5: Wave Loader
  const WaveLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
          animate={{
            scaleY: [0.4, 1.2, 0.4],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );

  // Variant 6: Morphing Shape
  const MorphingShape = () => (
    <motion.div
      className={`${config.spinner} bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500`}
      animate={{
        borderRadius: ["20%", "50%", "20%"],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  // Variant 7: Ripple Effect
  const RippleLoader = () => (
    <div className={`relative ${config.spinner}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 border-blue-400 rounded-full"
          animate={{
            scale: [0, 1],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6
          }}
        />
      ))}
    </div>
  );

  // Render appropriate variant
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <PulseDots />;
      case 'bars':
        return <BouncingBars />;
      case 'orbital':
        return <OrbitalLoader />;
      case 'wave':
        return <WaveLoader />;
      case 'morph':
        return <MorphingShape />;
      case 'ripple':
        return <RippleLoader />;
      default:
        return <SpinningCircle />;
    }
  };

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {renderSpinner()}
        
        {showText && (
          <motion.p
            className={`font-medium text-gray-600 ${config.text}`}
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Specialized loading components for different use cases
export const PageLoader = ({ text = "Loading dashboard..." }) => (
  <LoadingSpinner 
    variant="orbital" 
    size="large" 
    text={text}
    fullScreen={true}
  />
);

export const ButtonLoader = ({ text = "Processing..." }) => (
  <LoadingSpinner 
    variant="dots" 
    size="small" 
    text={text}
    className="h-auto py-2"
  />
);

export const CardLoader = ({ text = "Loading content..." }) => (
  <LoadingSpinner 
    variant="wave" 
    size="medium" 
    text={text}
  />
);

export const InlineLoader = () => (
  <LoadingSpinner 
    variant="dots" 
    size="small" 
    showText={false}
    className="h-auto"
  />
);

export default LoadingSpinner; 