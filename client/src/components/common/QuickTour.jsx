import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, SkipForward } from 'lucide-react';

const QuickTour = ({
  isOpen,
  onClose,
  steps = [],
  themeColors,
  onComplete,
  tourKey = 'default',
  setActiveTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    if (isOpen && steps.length > 0) {
      setIsVisible(true);
      setCurrentStep(0);
      // Don't prevent body scroll - we need it for auto-scrolling to work
    } else {
      // Reset any scroll restrictions
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, steps]);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      updateHighlight();
    }
  }, [currentStep, isVisible]);

  // Handle window resize and scroll to reposition tour elements
  useEffect(() => {
    const updateHighlightPosition = () => {
      if (!isVisible || !steps[currentStep]) return;

      const step = steps[currentStep];
      const targetElement = document.querySelector(step.target);
      if (!targetElement || !highlightRef.current) return;

      const rect = targetElement.getBoundingClientRect();

      // Update highlight position in real-time
      highlightRef.current.style.position = 'fixed';
      highlightRef.current.style.top = `${rect.top - 2}px`;
      highlightRef.current.style.left = `${rect.left - 2}px`;
      highlightRef.current.style.width = `${rect.width + 4}px`;
      highlightRef.current.style.height = `${rect.height + 4}px`;
    };

    const handleResize = () => {
      if (isVisible && steps[currentStep]) {
        setTimeout(() => updateHighlight(), 100);
      }
    };

    const handleScroll = () => {
      if (isVisible && steps[currentStep]) {
        updateHighlightPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible, currentStep]);

  const updateHighlight = () => {
    const step = steps[currentStep];
    if (!step?.target) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      console.warn(`Tour target not found: ${step.target}`);
      return;
    }

    // Scroll element into view with better positioning
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // Wait longer for scroll to complete and update both highlight and tooltip
    setTimeout(() => {
      const rect = targetElement.getBoundingClientRect();

      if (highlightRef.current) {
        // Use fixed positioning relative to the viewport (not document)
        // This way the highlight stays in place even when scrolling
        highlightRef.current.style.position = 'fixed';
        highlightRef.current.style.top = `${rect.top - 2}px`;
        highlightRef.current.style.left = `${rect.left - 2}px`;
        highlightRef.current.style.width = `${rect.width + 4}px`;
        highlightRef.current.style.height = `${rect.height + 4}px`;
      }

      // Force a re-render to update tooltip position after scroll
      setCurrentStep(prev => prev);
    }, 600); // Increased timeout to ensure scroll is fully complete
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStepData = steps[currentStep + 1];

      // Handle automatic navigation between tabs
      if (nextStepData?.section && setActiveTab) {
        const currentStepSection = steps[currentStep]?.section;

        // If we're moving to a different section, navigate automatically
        if (nextStepData.section !== currentStepSection) {
          // Map section names to tab names
          const sectionToTab = {
            'home': 'home',
            'tasks': 'tasks',
            'problemStatements': 'problems'
          };

          const targetTab = sectionToTab[nextStepData.section];
          if (targetTab) {
            setActiveTab(targetTab);

            // Wait a bit for the tab to load before advancing the step
            setTimeout(() => {
              setCurrentStep(currentStep + 1);
            }, 500);
            return;
          }
        }
      }

      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsVisible(false);
    // Mark tour as completed in localStorage
    localStorage.setItem(`tour_completed_${tourKey}`, 'true');
    onComplete?.();
    onClose();
  };

  const getTooltipPosition = () => {
    const step = steps[currentStep];
    if (!step?.target) return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90vw',
      width: '320px'
    };

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90vw',
      width: '320px'
    };

    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Responsive tooltip dimensions
    const isMobile = viewportWidth < 768;
    const tooltipWidth = isMobile ? Math.min(280, viewportWidth - 40) : 320;
    const spacing = 20;

    let position = 'fixed';
    let top, left, transform;
    let maxWidth = isMobile ? '90vw' : '320px';
    let width = isMobile ? 'auto' : '320px';

    // Calculate available space in each direction
    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;

    // Simplified positioning logic - prioritize readability and viewport bounds
    const tooltipHeight = 280; // Approximate tooltip height

    if (spaceBottom >= tooltipHeight + spacing) {
      // Below target (most readable)
      top = `${rect.bottom + spacing}px`;

      // Keep tooltip centered in viewport if possible
      const idealLeft = rect.left + (rect.width / 2);
      const tooltipHalfWidth = tooltipWidth / 2;

      if (idealLeft - tooltipHalfWidth < 20) {
        // Too far left, align to left edge
        left = '20px';
        transform = 'translateX(0)';
      } else if (idealLeft + tooltipHalfWidth > viewportWidth - 20) {
        // Too far right, align to right edge
        left = `${viewportWidth - 20}px`;
        transform = 'translateX(-100%)';
      } else {
        // Center on target
        left = `${idealLeft}px`;
        transform = 'translateX(-50%)';
      }
    } else if (spaceTop >= tooltipHeight + spacing) {
      // Above target
      top = `${rect.top - spacing}px`;
      left = '50%';
      transform = 'translate(-50%, -100%)';

      const idealLeft = rect.left + (rect.width / 2);
      const tooltipHalfWidth = tooltipWidth / 2;

      if (idealLeft - tooltipHalfWidth < 20) {
        left = '20px';
        transform = 'translateY(-100%)';
      } else if (idealLeft + tooltipHalfWidth > viewportWidth - 20) {
        left = `${viewportWidth - 20}px`;
        transform = 'translate(-100%, -100%)';
      } else {
        left = `${idealLeft}px`;
        transform = 'translate(-50%, -100%)';
      }
    } else if (!isMobile && spaceRight >= tooltipWidth + spacing) {
      // Right of target (desktop only)
      top = `${Math.max(20, rect.top + (rect.height / 2) - (tooltipHeight / 2))}px`;
      left = `${rect.right + spacing}px`;
      transform = 'translateY(0)';

      // Ensure tooltip doesn't go below viewport
      const calculatedTop = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      if (calculatedTop + tooltipHeight > viewportHeight - 20) {
        top = `${viewportHeight - tooltipHeight - 20}px`;
      }
    } else if (!isMobile && spaceLeft >= tooltipWidth + spacing) {
      // Left of target (desktop only)
      top = `${Math.max(20, rect.top + (rect.height / 2) - (tooltipHeight / 2))}px`;
      left = `${rect.left - spacing}px`;
      transform = 'translateX(-100%)';

      // Ensure tooltip doesn't go below viewport
      const calculatedTop = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      if (calculatedTop + tooltipHeight > viewportHeight - 20) {
        top = `${viewportHeight - tooltipHeight - 20}px`;
      }
    } else {
      // Fallback: position to the right side of viewport for better readability
      top = `${Math.max(20, rect.top)}px`;
      left = `${Math.min(viewportWidth - tooltipWidth - 20, rect.right + spacing)}px`;
      transform = 'translateY(0)';
      maxWidth = '90vw';
      width = 'auto';

      // If tooltip would go below viewport, move it up
      const calculatedTop = rect.top;
      if (calculatedTop + tooltipHeight > viewportHeight - 20) {
        top = `${Math.max(20, viewportHeight - tooltipHeight - 20)}px`;
      }
    }

    return {
      position,
      top,
      left,
      transform,
      maxWidth,
      width,
      zIndex: 10001
    };
  };

  if (!isVisible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999]">
          {/* Overlay */}
          <div
            ref={overlayRef}
            className="absolute inset-0  bg-opacity-50"
          />

          {/* Highlight */}
          <div
            ref={highlightRef}
            className="absolute pointer-events-none transition-all duration-300 ease-out"
            style={{
              border: `3px solid ${themeColors.accent}`,
              borderRadius: '12px',
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px ${themeColors.accent}`,
              zIndex: 10000
            }}
          />

          {/* Tooltip */}
          <motion.div
            className="z-[10001]"
            style={{
              ...getTooltipPosition(),
              backgroundColor: themeColors.cardBg,
              border: `2px solid ${themeColors.border}`,
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: themeColors.accent }}
                  >
                    {currentStep + 1}
                  </div>
                  <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <button
                  onClick={skipTour}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: themeColors.textSecondary }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2" style={{ color: themeColors.text }}>
                  {currentStepData.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: themeColors.textSecondary }}>
                  {currentStepData.content}
                </p>
                {/* Navigation Hint */}
                {currentStepData.navigationHint && (
                  <div className="mt-4 p-3 rounded-lg border-l-4" style={{
                    backgroundColor: `${themeColors.accent}10`,
                    borderColor: themeColors.accent
                  }}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: themeColors.accent }}>
                        🧭 Navigation Required
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                      {currentStepData.navigationHint}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: themeColors.accent,
                      width: `${((currentStep + 1) / steps.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${currentStep === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105'
                    }`}
                  style={{
                    backgroundColor: currentStep === 0 ? themeColors.backgroundSecondary : themeColors.accent,
                    color: currentStep === 0 ? themeColors.textSecondary : '#ffffff'
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={skipTour}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105"
                    style={{
                      backgroundColor: themeColors.backgroundSecondary,
                      color: themeColors.textSecondary
                    }}
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip Tour</span>
                  </button>

                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105"
                    style={{
                      backgroundColor: themeColors.accent,
                      color: '#ffffff'
                    }}
                  >
                    <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
                    {currentStep === steps.length - 1 ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickTour;