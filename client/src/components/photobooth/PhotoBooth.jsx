import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, Menu, X, Home, Info, Code, Camera } from "lucide-react";

// Theme detection hook (same as landing page)
const useThemeDetection = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const detectTheme = () => {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;

        const parseRgb = (rgb) => {
          const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            const [, r, g, b] = match.map(Number);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
          }
          return prefersDark;
        };

        const bodyIsDark = bodyBg !== 'rgba(0, 0, 0, 0)' ? parseRgb(bodyBg) : null;
        const htmlIsDark = htmlBg !== 'rgba(0, 0, 0, 0)' ? parseRgb(htmlBg) : null;

        const isDark = bodyIsDark !== null ? bodyIsDark :
          htmlIsDark !== null ? htmlIsDark :
            prefersDark;

        setIsDarkTheme(isDark);
      }
    };

    detectTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => detectTheme();

    mediaQuery.addEventListener('change', handleChange);

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  return isDarkTheme;
};

// Theme-aware color utility (same as landing page)
const getThemeColors = (isDark) => ({
  background: isDark ? '#000000' : '#ffffff',
  text: isDark ? '#e0e0e0' : '#1a1a1a',
  textSecondary: isDark ? '#b0b0b0' : '#4a4a4a',
  border: isDark ? '#404040' : '#e0e0e0',
  cardBg: isDark ? '#1a1a1a' : '#f8f9fa',
  cardBgSecondary: isDark ? '#2a2a2a' : '#ffffff',
  navBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  accent: '#3b82f6',
  orange: '#f97316',
});

// Custom Button Component (same as landing page)
function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  onClick,
  disabled = false,
  themeColors,
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return {
          backgroundColor: "transparent",
          color: themeColors.text,
          borderColor: themeColors.border,
          border: "2px solid"
        };
      default:
        return {
          backgroundColor: disabled ? themeColors.border : themeColors.orange,
          color: disabled ? themeColors.textSecondary : "#ffffff",
          borderColor: themeColors.border,
          border: "2px solid"
        };
    }
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg",
    default: "px-4 py-2 rounded-lg",
    lg: "px-8 py-4 text-lg rounded-lg",
  };

  return (
    <button
      className={`${baseClasses} ${sizes[size]} ${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'}`}
      style={getVariantStyles()}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

const PhotoBooth = () => {
  const [preview, setPreview] = useState(null);
  const [shape, setShape] = useState("Original");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const isDarkTheme = useThemeDetection();
  const themeColors = getThemeColors(isDarkTheme);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!preview) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;

      // Draw the image with the selected shape
      ctx.save();

      if (shape === "Circle") {
        ctx.beginPath();
        ctx.arc(200, 200, 200, 0, Math.PI * 2);
        ctx.clip();
      } else if (shape === "Square") {
        // No clipping for square, just draw normally
      } else {
        // Original shape with rounded corners
        ctx.beginPath();
        ctx.roundRect(0, 0, 400, 400, 20);
        ctx.clip();
      }

      ctx.drawImage(img, 0, 0, 400, 400);
      ctx.restore();

      // Add WOW frame elements (emojis) at bottom right
      ctx.font = '32px Arial';
      ctx.fillText('🦊', 320, 370);
      ctx.fillText('🐛', 350, 370);
      ctx.fillText('👓', 320, 390);
      ctx.fillText('🍍', 350, 390);

      // Download the canvas as image
      const link = document.createElement('a');
      link.download = `vedic-vision-badge-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src = preview;
  };

  const shapes = [
    { id: "Original", name: "Original" },
    { id: "Square", name: "Square" },
    { id: "Circle", name: "Circle" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      {/* Navigation - Same as Landing Page */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav
          className="backdrop-blur-xl rounded-2xl border-2 sticky top-4 z-50"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
        >
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-2xl font-black" style={{ color: themeColors.text }}>
                  VEDIC VISION<span style={{ color: themeColors.accent }}>&nbsp;2K25</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="/"
                  className="flex items-center space-x-2 font-semibold transition-colors hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </a>
                <a
                  href="/#about"
                  className="flex items-center space-x-2 font-semibold transition-colors hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  <Info className="w-5 h-5" />
                  <span>About</span>
                </a>
                <a
                  href="/#tracks"
                  className="flex items-center space-x-2 font-semibold transition-colors hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  <Code className="w-5 h-5" />
                  <span>Tracks</span>
                </a>
                <a
                  href="/photo-booth"
                  className="flex items-center space-x-2 font-semibold"
                  style={{ color: themeColors.accent }}
                >
                  <Camera className="w-5 h-5" />
                  <span>Photo Booth</span>
                </a>
 
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md border-2"
                  style={{
                    backgroundColor: themeColors.cardBg,
                    borderColor: themeColors.border
                  }}
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" style={{ color: themeColors.text }} />
                  ) : (
                    <Menu className="h-6 w-6" style={{ color: themeColors.text }} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div
            className="backdrop-blur-xl rounded-2xl border-2"
            style={{
              backgroundColor: themeColors.navBg,
              borderColor: themeColors.border
            }}
          >
            <div className="px-8 py-6 space-y-2">
              {["Home", "About", "Tracks"].map((item) => (
                <a
                  key={item}
                  href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                  className="block px-3 py-2 font-semibold"
                  style={{ color: themeColors.text }}
                >
                  {item}
                </a>
              ))}
              <a
                href="/photo-booth"
                className="block px-3 py-2 font-semibold"
                style={{ color: themeColors.accent }}
              >
                Photo Booth
              </a>
              <div className="px-3 py-2">
                <Button
                  className="w-full font-bold"
                  themeColors={themeColors}
                >
                  Register Now 🎯
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div
            className="rounded-2xl border-2 p-8 shadow-lg"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
                  Badge
                </h1>
                <p style={{ color: themeColors.textSecondary }}>
                  Upload an image and generate a personalized badge with the WOW frame.
                </p>
              </div>

              {/* Select an Image */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.text }}>
                  Select an Image
                </h3>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="font-bold flex items-center gap-2"
                  themeColors={themeColors}
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </div>

              {/* Image Shape */}
              <div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: themeColors.text }}>
                  Image Shape
                </h3>
                <div className="flex gap-3">
                  {shapes.map((shapeOption) => (
                    <button
                      key={shapeOption.id}
                      onClick={() => setShape(shapeOption.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors duration-200 font-semibold ${shape === shapeOption.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'hover:opacity-80'
                        }`}
                      style={{
                        backgroundColor: shape === shapeOption.id ? `${themeColors.accent}20` : themeColors.cardBgSecondary,
                        borderColor: shape === shapeOption.id ? themeColors.accent : themeColors.border,
                        color: shape === shapeOption.id ? themeColors.accent : themeColors.text
                      }}
                    >
                      {shapeOption.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              {preview && (
                <div>
                  <Button
                    onClick={handleDownload}
                    className="font-bold flex items-center gap-2 w-full justify-center"
                    themeColors={themeColors}
                  >
                    <Download className="w-5 h-5" />
                    Download Badge
                  </Button>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                * We respect your privacy and are not storing your pictures on our servers.
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex justify-center items-start">
            <div
              className="w-full max-w-md rounded-2xl border-2 p-6 shadow-lg"
              style={{
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.border
              }}
            >
             
              <div
                className="aspect-square rounded-lg  flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: themeColors.cardBgSecondary,
                  borderColor: themeColors.border
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className={`w-full h-full object-cover ${shape === "Circle"
                        ? "rounded-full"
                        : shape === "Square"
                          ? "rounded-none"
                          : "rounded-lg"
                      }`}
                  />
                ) : (
                  <div className="text-center" style={{ color: themeColors.textSecondary }}>
                   
                  </div>
                )}

                {/* WOW Frame Characters - positioned at bottom right */}
                {preview && (
                  <div className="absolute bottom-2 right-2">
                    <div className="flex items-center space-x-1">
                      <div className="text-2xl">🦊</div>
                      <div className="text-2xl">🐛</div>
                      <div className="text-2xl">👓</div>
                      <div className="text-2xl">🍍</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoBooth; 