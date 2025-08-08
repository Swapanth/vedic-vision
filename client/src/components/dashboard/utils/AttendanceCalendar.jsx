import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceCalendar = ({ attendance, themeColors }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Calculate status by date from attendance data
  const statusByDate = useMemo(() => {
    const statusMap = {};
    if (attendance && attendance.length > 0) {
      attendance.forEach(record => {
        const dateKey = new Date(record.date).toISOString().split('T')[0];
        // Prioritize statuses: present > late > absent
        if (!statusMap[dateKey] ||
          (record.status === 'present' && statusMap[dateKey] !== 'present') ||
          (record.status === 'late' && statusMap[dateKey] === 'absent')) {
          statusMap[dateKey] = record.status;
        }
      });
    }
    return statusMap;
  }, [attendance]);

  // Generate calendar days for current month
  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const calendarDays = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || calendarDays.length < 42) { // 6 weeks max
      calendarDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendarDays;
  }, [currentMonth]);

  const getBlockStyle = (date, status) => {
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const dateKey = date.toISOString().split('T')[0];
    const attendanceStatus = statusByDate[dateKey];

    // Check if this is August 2025 and date is between 4-15
    const isHighlightedDate = currentMonth.getMonth() === 7 && // August (0-indexed)
      currentMonth.getFullYear() === 2025 &&
      date.getDate() >= 4 && date.getDate() <= 15;

    const baseStyle = {
      width: '100%',
      height: '50px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent'
    };

    if (!isCurrentMonth) {
      return {
        ...baseStyle,
        backgroundColor: '#f3f4f6',
        color: '#9ca3af'
      };
    }

    // Apply attendance status colors
    if (attendanceStatus === 'present') {
      return {
        ...baseStyle,
        backgroundColor: '#dcfce7', // Light green background
        color: '#166534', // Dark green text
        border: '2px solid #22c55e' // Green border
      };
    }

    if (attendanceStatus === 'absent') {
      return {
        ...baseStyle,
        backgroundColor: '#fef2f2', // Light red background
        color: '#991b1b', // Dark red text
        border: '2px solid #ef4444' // Red border
      };
    }

    if (attendanceStatus === 'late') {
      return {
        ...baseStyle,
        backgroundColor: '#fef3c7', // Light yellow background
        color: '#92400e', // Dark yellow text
        border: '2px solid #f59e0b' // Yellow border
      };
    }

    // If it's a highlighted date (August 4-15, 2025), add light gray border
    if (isHighlightedDate) {
      return {
        ...baseStyle,
        backgroundColor: '#ffffff',
        color: '#374151',
        border: '2px solid #e5e7eb' // Light gray border like in the image
      };
    }

    // Default style for current month dates without attendance
    return {
      ...baseStyle,
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      border: '2px solid transparent'
    };
  };

  const formatDate = (date) => {
    return date.getDate();
  };

  const getDayLabel = (date) => {
    // Check if this is August 2025 and date is between 4-15
    const isHighlightedDate = currentMonth.getMonth() === 7 && // August (0-indexed)
      currentMonth.getFullYear() === 2025 &&
      date.getDate() >= 4 && date.getDate() <= 15;

    if (isHighlightedDate) {
      // Return D1, D2, D3, etc. for August 4-15
      const dayNumber = date.getDate();
      const sessionNumber = dayNumber - 3; // August 4 = D1, August 5 = D2, etc.
      return `D${sessionNumber}`;
    }

    return ''; // No label for other dates
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: themeColors.textSecondary }} />
        </button>
        <h4 className="text-lg font-semibold" style={{ color: themeColors.text }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" style={{ color: themeColors.textSecondary }} />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium py-2"
            style={{ color: themeColors.textSecondary }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
          const status = statusByDate[dateKey];
          const dayLabel = getDayLabel(date);

          return (
            <div
              key={index}
              style={getBlockStyle(date, status)}
              className="hover:scale-105 transition-transform"
            >
              <div className="text-xs font-bold">{formatDate(date)}</div>
              {dayLabel && (
                <div className="text-xs text-blue-400 font-medium">{dayLabel}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-4 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="text-sm" style={{ color: themeColors.textSecondary }}>Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
          <span className="text-sm" style={{ color: themeColors.textSecondary }}>Absent</span>
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500 mt-2">
        Loaded {attendance?.length || 0} attendance records
      </div>
    </div>
  );
};

export default AttendanceCalendar;


