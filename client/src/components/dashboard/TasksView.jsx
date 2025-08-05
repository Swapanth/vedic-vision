import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, BookOpen, ExternalLink, FileText, ChevronLeft, ChevronRight, Flame, Edit3, RotateCcw, Eye } from 'lucide-react';

const TasksView = ({
  themeColors,
  tasks,
  submissions,
  setSubmissionForm,
  setModalContent,
  setShowModal
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Generate event days (August 4-15, 2025)
  const generateDays = () => {
    const days = [];
    const eventStartDate = new Date(2025, 7, 4); // August 4, 2025 (month is 0-indexed)
    const today = new Date();

    for (let i = 0; i < 12; i++) { // 12 days total (Aug 4-15)
      const date = new Date(eventStartDate);
      date.setDate(eventStartDate.getDate() + i);

      // Determine if it's current day
      const isCurrentDay = date.toDateString() === today.toDateString();

      // Determine phase
      let phase = '';
      if (i < 10) { // Days 1-10 (Aug 4-13)
        phase = 'Bootcamp';
      } else { // Days 11-12 (Aug 14-15)
        phase = 'Hackathon';
      }

      days.push({
        date,
        dayLabel: `Day ${i + 1}`,
        phase,
        isCurrentDay,
        dayNumber: i + 1
      });
    }
    return days;
  };

  const days = generateDays();

  // Navigation functions with responsive behavior
  const getVisibleDays = () => {
    // Check if mobile (you can adjust this breakpoint as needed)
    if (window.innerWidth < 768) return 2; // Show 2 days on mobile
    if (window.innerWidth < 1024) return 4; // Show 4 days on tablet
    return 6; // Show 6 days on desktop
  };

  const scrollLeft = () => {
    const visibleDays = getVisibleDays();
    const scrollAmount = window.innerWidth < 768 ? 1 : 3; // Scroll by 1 on mobile, 3 on desktop
    setScrollPosition(Math.max(0, scrollPosition - scrollAmount));
  };

  const scrollRight = () => {
    const visibleDays = getVisibleDays();
    const scrollAmount = window.innerWidth < 768 ? 1 : 3; // Scroll by 1 on mobile, 3 on desktop
    setScrollPosition(Math.min(days.length - visibleDays, scrollPosition + scrollAmount));
  };

  // Get fire theme colors for hackathon days
  const getFireTheme = (day) => {
    if (day.phase === 'Hackathon') {
      return {
        background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff4757)',
        boxShadow: '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.3)',
        border: '2px solid #ff6b35'
      };
    }
    return null;
  };

  // Filter tasks for selected day
  const getTasksForDay = (dayIndex) => {
    // If no tasks available, return empty array
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Filter tasks based on the day field that matches the selected day
    const selectedDayLabel = days[dayIndex].dayLabel.toLowerCase(); // "day 1" -> "day1"
    const dayFilter = selectedDayLabel.replace(' ', ''); // "day 1" -> "day1"

    const filteredTasks = tasks.filter(task => {
      // Check if task.day matches the selected day (e.g., "day1", "day2", etc.)
      return task.day === dayFilter;
    });

    return filteredTasks;
  };

  const selectedDayTasks = getTasksForDay(selectedDay);
  console.log('Tasks submissions:', submissions);

  const getTaskStatus = (task) => {
    const submission = submissions.find(s => s.taskId._id === task._id);
    console.log('Submission for task', task._id, ':', submission);

    if (submission?.status === 'graded') return 'completed';
    if (submission?.status === 'submitted') return 'under_review';
    return 'not_submitted';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#10b981', text: '#ffffff' }; // Green
      case 'under_review':
        return { bg: '#f59e0b', text: '#ffffff' }; // Orange
      default: // not_submitted
        return { bg: '#6b7280', text: '#ffffff' }; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'under_review':
        return <Eye className="w-4 h-4" />;
      default: // not_submitted
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'under_review':
        return 'Under Review';
      default: // not_ubmitted
        return 'Not Submitted';
    }
  };

  // Helper function to ensure URL has proper protocol
  const formatUrl = (url) => {
    if (!url) return '';

    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL starts with www., add https://
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }

    // For other cases (like bunksafe.com), add https://
    return `https://${url}`;
  };



  const handleSubmitTask = (task) => {
    setSubmissionForm({ description: '', link: '' });
    setModalContent({
      title: `Submit Task: ${task.title}`,
      content: null,
      taskId: task._id
    });
    setShowModal(true);
  };

  const handleEditSubmission = (task, submission) => {
    setSubmissionForm({
      description: submission.content?.linkTitle || submission.content?.text || '',
      link: submission.content?.link || ''
    });
    setModalContent({
      title: `Edit Submission: ${task.title}`,
      content: null,
      taskId: task._id,
      isEdit: true
    });
    setShowModal(true);
  };

  const handleRedoTask = (task) => {
    setSubmissionForm({ description: '', link: '' });
    setModalContent({
      title: `Redo Task: ${task.title}`,
      content: null,
      taskId: task._id,
      isRedo: true
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      <motion.div
        className="rounded-xl backdrop-blur-sm border transition-all duration-300"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: themeColors.text }}>
            <Calendar className="w-5 h-5 mr-2" />
            Select Day
          </h3>

          {/* Navigation Container */}
          <div className="relative">
            {/* Left Arrow */}
            <motion.button
              onClick={scrollLeft}
              disabled={scrollPosition === 0}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: themeColors.cardBgSecondary,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            {/* Right Arrow */}
            <motion.button
              onClick={scrollRight}
              disabled={scrollPosition >= days.length - getVisibleDays()}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: themeColors.cardBgSecondary,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>

            {/* Days Container */}
            <div className="mx-12 overflow-hidden">
              <motion.div
                className="flex gap-2 transition-transform duration-300"
                style={{ transform: `translateX(-${scrollPosition * (100 / getVisibleDays())}%)` }}
              >
                {days.map((day, index) => {
                  const fireTheme = getFireTheme(day);
                  const isHackathon = day.phase === 'Hackathon';

                  return (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedDay(index)}
                      className={`flex-shrink-0 p-3 rounded-lg text-center transition-all duration-300 relative overflow-hidden ${selectedDay === index ? 'scale-105' : 'hover:scale-102'
                        }`}
                      style={{
                        minWidth: '100px',
                        height: '80px',
                        background: fireTheme ? fireTheme.background :
                          selectedDay === index
                            ? themeColors.accent
                            : day.isCurrentDay
                              ? themeColors.success
                              : themeColors.backgroundSecondary,
                        color: themeColors.text,
                        boxShadow: fireTheme ? fireTheme.boxShadow :
                          selectedDay === index ? `0 4px 15px ${themeColors.accent}40` :
                            day.isCurrentDay ? `0 4px 15px ${themeColors.success}40` : 'none',
                        border: fireTheme ? fireTheme.border : `1px solid ${themeColors.border}`
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Fire animation for hackathon days */}
                      {isHackathon && (
                        <motion.div
                          className="absolute top-1 right-1"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 3, -3, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Flame className="w-4 h-4 text-yellow-300" />
                        </motion.div>
                      )}

                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-sm font-bold mb-1">{day.dayLabel}</div>
                        <div className={`text-xs font-medium border px-2 py-0.5 rounded ${isHackathon ? 'bg-red-600 bg-opacity-30' : 'bg-opacity-20'
                          }`}>
                          {day.phase}
                        </div>
                        {day.isCurrentDay && (
                          <div className="text-xs mt-1 font-medium bg-white bg-opacity-20 px-1 py-0.5 rounded">
                            Current
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected Day Tasks */}
      <motion.div
        className="rounded-2xl backdrop-blur-sm border transition-all duration-300"
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold" style={{ color: themeColors.text }}>
              Tasks for {days[selectedDay].dayLabel} - {days[selectedDay].phase}
            </h3>
            <div className="text-sm px-3 py-1 rounded-full" style={{
              backgroundColor: themeColors.backgroundSecondary,
              color: themeColors.textSecondary
            }}>
              {selectedDayTasks.length} tasks
            </div>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>
                No tasks for this day
              </h4>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                Check other days or wait for new assignments!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedDayTasks.map((task, index) => {
                const status = getTaskStatus(task);
                const submission = submissions.find(s => s.taskId._id === task._id);

                return (
                  <motion.div
                    key={task._id}
                    className="rounded-xl p-6  transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                    }}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Task Header */}
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold" style={{ color: themeColors.text }}>
                        {task.title}
                      </h4>
                      {/* Status Badge */}
                      <div
                        className="flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: getStatusColor(status).bg,
                          color: getStatusColor(status).text
                        }}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-1">{getStatusText(status)}</span>
                      </div>
                    </div>

                    {/* Task Description */}
                    <div className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                      {task.description.split('\n').map((line, index) => {
                        // Check if line is a numbered list item (starts with number followed by dot)
                        const isNumberedItem = /^\d+\.\s/.test(line.trim());
                        // Check if line is a bullet point (starts with - or *)
                        const isBulletItem = /^[-*]\s/.test(line.trim());
                        
                        if (isNumberedItem || isBulletItem) {
                          return (
                            <div key={index} className="ml-4 mb-1">
                              {line.trim()}
                            </div>
                          );
                        } else if (line.trim() === '') {
                          return <br key={index} />;
                        } else {
                          return (
                            <div key={index} className="mb-1">
                              {line.trim()}
                            </div>
                          );
                        }
                      })}
                    </div>

                    {/* Task Details */}
                    {/* Submission Info */}
                    {submission && (
                      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                        <div className="text-xs font-medium mb-2" style={{ color: themeColors.text }}>
                          Your Submission:
                        </div>
                        {submission.content?.text && (
                          <div className="flex items-start space-x-2 mb-2">
                            <FileText className="w-4 h-4 mt-0.5" style={{ color: themeColors.textSecondary }} />
                            <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                              {submission.content.text}
                            </p>
                          </div>
                        )}
                        {submission.content?.link && (
                          <div className="flex items-center space-x-2 mb-2">
                            <ExternalLink className="w-4 h-4" style={{ color: themeColors.textSecondary }} />
                            <a
                              href={formatUrl(submission.content.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs hover:underline"
                              style={{ color: themeColors.accent }}
                            >
                              View Submission Link
                            </a>
                          </div>
                        )}
                        {submission.score !== undefined && (
                          <div className="text-xs font-bold" style={{ color: themeColors.success }}>
                            Score: {submission.score}/{task.maxScore}
                          </div>
                        )}
                        <div className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Submit Task Button - for not submitted tasks */}
                      {status === 'not_submitted' && (
                        <button
                          onClick={() => handleSubmitTask(task)}
                          className="w-full px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-md transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: themeColors.accent,
                            color: '#ffffff'
                          }}
                        >
                          Submit Task
                        </button>
                      )}

                      {/* Edit and Redo buttons for submitted/under review tasks */}
                      {(status === 'submitted' || status === 'under_review') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubmission(task, submission)}
                            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center"
                            style={{
                              backgroundColor: themeColors.warning,
                              color: '#ffffff'
                            }}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleRedoTask(task)}
                            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center"
                            style={{
                              backgroundColor: themeColors.purple,
                              color: '#ffffff'
                            }}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Redo
                          </button>
                        </div>
                      )}

                      {/* Completed tasks - show completion status */}
                      {status === 'completed' && (
                        <div className="w-full px-4 py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center" style={{
                          backgroundColor: themeColors.success,
                          color: '#ffffff'
                        }}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Task Completed
                        </div>
                      )}


                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TasksView;