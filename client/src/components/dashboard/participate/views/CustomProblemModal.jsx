import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle } from 'lucide-react';
import { problemAPI } from '../../../../services/api';

const CustomProblemModal = ({ isOpen, onClose, themeColors, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    suggestedTechnologies: '',
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const domains = ['health', 'sports', 'agriculture', 'yoga', 'education', 'technology'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters long';
    }
    
    if (!formData.domain) {
      newErrors.domain = 'Domain is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await problemAPI.createCustom(formData);
      
      onSuccess('Custom problem statement created successfully!', 'success');
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        domain: '',
        suggestedTechnologies: '',
        topic: ''
      });
      setErrors({});
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create custom problem statement';
      onSuccess(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setErrors({});
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: themeColors.cardBg }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6" style={{ color: themeColors.accent }} />
                  <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
                    Create Custom Problem Statement
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: themeColors.textSecondary }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Banner */}
              <div 
                className="flex items-start gap-3 p-4 rounded-lg mb-6"
                style={{ backgroundColor: `${themeColors.accent}10`, borderLeft: `4px solid ${themeColors.accent}` }}
              >
                <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: themeColors.accent }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                    Create Your Own Problem Statement
                  </p>
                  <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                    You can create one custom problem statement that only you can use. Make sure to provide a detailed description to help your team understand the challenge.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a clear and concise problem title"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: themeColors.backgroundSecondary,
                      borderColor: errors.title ? '#ef4444' : themeColors.border,
                      color: themeColors.text
                    }}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Domain *
                  </label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: themeColors.backgroundSecondary,
                      borderColor: errors.domain ? '#ef4444' : themeColors.border,
                      color: themeColors.text
                    }}
                    disabled={loading}
                  >
                    <option value="">Select a domain</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>
                        {domain.charAt(0).toUpperCase() + domain.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.domain && (
                    <p className="text-red-500 text-sm mt-1">{errors.domain}</p>
                  )}
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Topic (Optional)
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="Specific topic or area within the domain"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: themeColors.backgroundSecondary,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                    disabled={loading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a comprehensive description of the problem, including background, challenges, and expected outcomes. Be as detailed as possible to help your team understand the scope."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all resize-vertical"
                    style={{
                      backgroundColor: themeColors.backgroundSecondary,
                      borderColor: errors.description ? '#ef4444' : themeColors.border,
                      color: themeColors.text
                    }}
                    disabled={loading}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                    {formData.description.length}/500 characters (minimum 50 required)
                  </p>
                </div>

                {/* Suggested Technologies */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Suggested Technologies (Optional)
                  </label>
                  <input
                    type="text"
                    name="suggestedTechnologies"
                    value={formData.suggestedTechnologies}
                    onChange={handleInputChange}
                    placeholder="React, Node.js, Python, MongoDB, etc. (comma-separated)"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: themeColors.backgroundSecondary,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                    disabled={loading}
                  />
                  <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                    Suggest technologies that would be suitable for solving this problem
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: themeColors.backgroundSecondary,
                      color: themeColors.text,
                      border: `2px solid ${themeColors.border}`
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: themeColors.accent }}
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    )}
                    {loading ? 'Creating...' : 'Create Problem Statement'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomProblemModal;