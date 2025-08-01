import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Camera, RotateCcw, Home, Info, Code, Camera as CameraIcon } from "lucide-react";

const PhotoBooth = () => {
  const [preview, setPreview] = useState(null);
  const [shape, setShape] = useState("original");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (preview) {
      const link = document.createElement('a');
      link.download = 'wow-badge.png';
      link.href = preview;
      link.click();
    }
  };

  const resetImage = () => {
    setPreview(null);
    setShape("original");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const shapes = [
    { id: "original", name: "Original", icon: "📱" },
    { id: "square", name: "Square", icon: "⬜" },
    { id: "circle", name: "Circle", icon: "⭕" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#000000ff" }}>
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="bg-black/50 backdrop-blur-xl rounded-2xl border-2 border-gray-500 sticky top-4 z-50">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-black" style={{ color: '#e0e0e0' }}>
                    VEDIC VISION 2K25
                  </span>
                </a>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="flex items-center space-x-2 font-semibold transition-colors hover:text-blue-400" style={{ color: '#e0e0e0' }}>
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </a>
                <a href="/#about" className="flex items-center space-x-2 font-semibold transition-colors hover:text-blue-400" style={{ color: '#e0e0e0' }}>
                  <Info className="w-5 h-5" />
                  <span>About</span>
                </a>
                <a href="/#tracks" className="flex items-center space-x-2 font-semibold transition-colors hover:text-blue-400" style={{ color: '#e0e0e0' }}>
                  <Code className="w-5 h-5" />
                  <span>Tracks</span>
                </a>
                <a href="/photo-booth" className="flex items-center space-x-2 font-semibold text-blue-400">
                  <CameraIcon className="w-5 h-5" />
                  <span>Photo Booth</span>
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="p-2 rounded-md border-2 border-gray-500">
                  <svg className="w-6 h-6" style={{ color: '#e0e0e0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-gray-500 p-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ color: '#e0e0e0' }}>
                Photo Booth 📸
              </h1>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#e0e0e0' }}>
                Upload your photo and create a personalized VEDIC VISION 2K25 badge with our exclusive frame
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Upload Area */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-gray-500 p-4">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#e0e0e0' }}>
                Upload Your Photo
              </h3>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-500 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#e0e0e0' }} />
                <p className="text-sm mb-1" style={{ color: '#e0e0e0' }}>
                  Drag & drop your image here
                </p>
                <p className="text-xs mb-2" style={{ color: '#e0e0e0' }}>
                  or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Shape Selection */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-gray-500 p-4">
              <h3 className="text-lg font-bold mb-4" style={{ color: '#e0e0e0' }}>
                Choose Shape
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {shapes.map((shapeOption) => (
                  <motion.button
                    key={shapeOption.id}
                    onClick={() => setShape(shapeOption.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      shape === shapeOption.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-500 hover:border-gray-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-lg mb-1">{shapeOption.icon}</div>
                    <div className="text-xs font-semibold" style={{ color: '#e0e0e0' }}>
                      {shapeOption.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleDownload}
                disabled={!preview}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                Download Badge
              </motion.button>
              <motion.button
                onClick={resetImage}
                className="px-4 py-2 border-2 border-gray-500 hover:border-gray-400 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" style={{ color: '#e0e0e0' }} />
                <span style={{ color: '#e0e0e0' }}>Reset</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-gray-500 p-4">
              <h3 className="text-lg font-bold mb-4 text-center" style={{ color: '#e0e0e0' }}>
                Preview
              </h3>
              
              {/* Preview Container */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                {preview ? (
                  <motion.img
                    src={preview}
                    alt="Preview"
                    className={`w-full h-full object-cover ${
                      shape === "circle"
                        ? "rounded-full"
                        : shape === "square"
                        ? "rounded-none"
                        : "rounded-xl"
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <motion.div 
                    className="w-full h-full bg-gray-800/50 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4" style={{ color: '#e0e0e0' }} />
                      <p className="text-lg" style={{ color: '#e0e0e0' }}>No Image</p>
                      <p className="text-sm" style={{ color: '#e0e0e0' }}>Upload to see preview</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Frame Overlay */}
                {preview && (
                  <motion.img
                    src="/images/wow-frame.png"
                    alt="WOW Frame"
                    className="absolute bottom-0 w-full pointer-events-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-8"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border-2 border-blue-500/30 p-6 max-w-2xl mx-auto">
            <p className="text-sm" style={{ color: '#e0e0e0' }}>
              🔒 <strong>Privacy First:</strong> We respect your privacy and do not store your images on our servers. 
              All processing happens locally in your browser.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PhotoBooth; 