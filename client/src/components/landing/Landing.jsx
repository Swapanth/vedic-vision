"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Users,
  User,
  Zap,
  MapPin,
  Mail,
  Phone,
  Instagram,
  LinkedinIcon,
  ChevronDown,
  ChevronLeft,
  GithubIcon,
  ChevronRight,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./Landing.css";

// Import track images
import track1 from "../../assets/1.png";
import track2 from "../../assets/2.png";
import track3 from "../../assets/3.png";
import track4 from "../../assets/4.png";
import track5 from "../../assets/5.png";
import track6 from "../../assets/6.png";
import track7 from "../../assets/7.png";
import track8 from "../../assets/8.png";
import track9 from "../../assets/9.png";
import track10 from "../../assets/10.png";
import track11 from "../../assets/11.png";
import track12 from "../../assets/12.png";
import track13 from "../../assets/13.png";
import track14 from "../../assets/14.png";
import track15 from "../../assets/15.png";
import track16 from "../../assets/16.jpeg";
import track17 from "../../assets/17.jpeg";
import track18 from "../../assets/18.jpeg";
import track19 from "../../assets/19.jpg";
import track20 from "../../assets/20.jpeg";
import img1 from "../../assets/image1.png";
import img2 from "../../assets/image2.png";
import img3 from "../../assets/image3.png";
import img4 from "../../assets/image4.jpg";
import img5 from "../../assets/image5.png";
import shirtimg from "../../assets/shirt.png";



// Holi Color Drop Effect
function RainbowCursorTrail() {
  const [colorDrops, setColorDrops] = useState([]);
  const dropIdRef = useRef(0);
  const lastMoveTimeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = Date.now();
      lastMoveTimeRef.current = now;

      // Create gentle holi-like color drops
      if (Math.random() < 0.4) { // 40% chance to create a drop
        // Holi festival colors - vibrant but natural
        const holiColors = [
          { hue: 340, saturation: 85, lightness: 65 }, // Pink
          { hue: 45, saturation: 90, lightness: 60 },  // Orange
          { hue: 60, saturation: 85, lightness: 65 },  // Yellow
          { hue: 120, saturation: 70, lightness: 55 }, // Green
          { hue: 240, saturation: 80, lightness: 60 }, // Blue
          { hue: 280, saturation: 75, lightness: 65 }, // Purple
          { hue: 15, saturation: 85, lightness: 60 },  // Red-Orange
        ];

        const randomColor = holiColors[Math.floor(Math.random() * holiColors.length)];

        const newDrop = {
          id: dropIdRef.current++,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          timestamp: now,
          color: randomColor,
          size: 6 + Math.random() * 8,
          velocityX: (Math.random() - 0.5) * 2,
          velocityY: Math.random() * 3 + 1, // Slight downward drift
        };

        setColorDrops(prev => [...prev, newDrop]);

        // Clean up drops after 3 seconds
        setTimeout(() => {
          setColorDrops(prev => prev.filter(drop => drop.id !== newDrop.id));
        }, 3000);
      }
    };

    // Clean up drops when mouse stops moving
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastMoveTimeRef.current > 150) {
        setColorDrops(prev => prev.filter(drop => now - drop.timestamp < 3000));
      }
    }, 150);

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {colorDrops.map((drop) => {
        const age = Date.now() - drop.timestamp;
        const opacity = Math.max(0, 0.8 - age / 3000); // Start with lower opacity
        const scale = Math.max(0.3, 1 - age / 4000); // Slower scale down

        // Gentle movement
        const driftX = drop.velocityX * (age / 100);
        const driftY = drop.velocityY * (age / 100);

        return (
          <div
            key={drop.id}
            className="absolute rounded-full"
            style={{
              left: drop.x + driftX - drop.size / 2,
              top: drop.y + driftY - drop.size / 2,
              width: drop.size,
              height: drop.size,
              background: `hsl(${drop.color.hue}, ${drop.color.saturation}%, ${drop.color.lightness}%)`,
              opacity: opacity,
              transform: `scale(${scale})`,
              transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
              boxShadow: `0 0 ${drop.size * 0.5}px hsla(${drop.color.hue}, ${drop.color.saturation}%, ${drop.color.lightness}%, 0.3)`,
              filter: 'blur(0.3px)',
            }}
          />
        );
      })}
    </div>
  );
}

// Theme detection hook
const useThemeDetection = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const detectTheme = () => {
      if (typeof window !== 'undefined') {
        // Check for dark mode preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Check background color of the page
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;

        // Parse RGB values to determine if background is dark
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

// Theme-aware color utility
const getThemeColors = (isDark) => ({
  background: isDark ? '#000000' : '#ffffff',
  text: isDark ? '#e0e0e0' : '#1a1a1a',
  textSecondary: isDark ? '#b0b0b0' : '#4a4a4a',
  border: isDark ? '#404040' : '#000000',
  cardBg: isDark ? '#000000' : '#ffffff',
  cardBgSecondary: isDark ? '#2a2a2a' : '#ffffff',
  navBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  accent: '#3b82f6',
});

// Countdown Timer Component
function CountdownTimer({ targetDate, themeColors }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div
      className="rounded-2xl border-2 p-3 shadow-lg"
      style={{
        borderColor: themeColors.border,
        backgroundColor: themeColors.cardBg,
        borderRadius: 50,

      }}
    >
      <div className="text-center">
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="text-center">
            <div

            >
              <div className="text-4xl font-bold" style={{ color: themeColors.text }}>
                {value.toString().padStart(2, "0")}
              </div>
              <div className="text-xs uppercase font-semibold" style={{ color: themeColors.textSecondary }}>
                {unit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom Badge Component
function Badge({ children, className = "", themeColors }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 ${className}`}
      style={{
        backgroundColor: themeColors.cardBgSecondary,
        color: themeColors.text,
        borderColor: themeColors.border
      }}
    >
      {children}
    </span>
  );
}

// Custom Button Component
function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  onClick,
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
          color: "#ffffff",
          borderColor: themeColors.border,
          border: "2px solid",
          borderRadius: 50
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
      className={`${baseClasses} ${sizes[size]} ${className}`}
      style={getVariantStyles()}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

const tracks = [
  { icon: "🌐", title: "Game Development", description: "Blockchain and decentralized applications", image: track1 },
  { icon: "🧠", title: "AI/ML", description: "Artificial Intelligence and Machine Learning solutions", image: track4 },
  { icon: "📱", title: "Mobile Apps", description: "iOS and Android application development", image: track5 },
  { icon: "💻", title: "Web Dev", description: "Full-stack web applications and platforms", image: track3 },
  { icon: "⚡", title: "IoT", description: "Internet of Things and embedded systems", image: track6 },
  { icon: "❤️", title: "HealthTech", description: "Healthcare and medical technology innovations", image: track2 },

];

const bootcampJourney = [
  {
    day: 1,
    title: "Java Foundations",
    topics: "Java setup & IDE, Data types, Variables, Operators, Loops & Conditionals, Functions & Arrays",
    icon: "☕",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    color: "#ED8B00",
    bgGradient: "from-orange-500 to-red-500"
  },
  {
    day: 2,
    title: "Object-Oriented Programming",
    topics: "Classes & Objects, Constructors, Inheritance, Polymorphism, Encapsulation & Abstraction",
    icon: "🏗️",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    color: "#4ECDC4",
    bgGradient: "from-teal-500 to-cyan-500"
  },
  {
    day: 3,
    title: "Web Fundamentals",
    topics: "HTML structure (headings, forms, tables), CSS selectors, Colors, Fonts, Box model, Flexbox",
    icon: "🌐",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    color: "#E34F26",
    bgGradient: "from-orange-500 to-red-500"
  },
  {
    day: 4,
    title: "Bootstrap & Responsive Design",
    topics: "Bootstrap grid system, Navbar, Cards, Buttons, Forms, Responsive design basics",
    icon: "📱",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    color: "#7952B3",
    bgGradient: "from-purple-500 to-indigo-500"
  },
  {
    day: 5,
    title: "JavaScript Essentials",
    topics: "JavaScript Variables (var/let/const), Functions & Events, DOM manipulation, Arrays & Objects",
    icon: "⚡",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    color: "#F7DF1E",
    bgGradient: "from-yellow-400 to-orange-500"
  },
  {
    day: 6,
    title: "Database Management",
    topics: "MySQL installation, CREATE, SELECT, INSERT, UPDATE, DELETE, Joins & Relationships",
    icon: "🗄️",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
    color: "#4479A1",
    bgGradient: "from-blue-500 to-indigo-600"
  },
  {
    day: 7,
    title: "Spring Boot Backend",
    topics: "Spring Boot Intro, REST API basics, @RestController, @GetMapping, @PostMapping, Connect to MySQL with JPA",
    icon: "🍃",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
    color: "#6DB33F",
    bgGradient: "from-green-500 to-emerald-600"
  },
  {
    day: 8,
    title: "Advanced Backend",
    topics: "JPA & Hibernate basics, Repository pattern, CRUD operations (Create, Read, Update, Delete)",
    icon: "⚙️",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
    color: "#F7DC6F",
    bgGradient: "from-amber-500 to-yellow-500"
  },
  {
    day: 9,
    title: "React Frontend",
    topics: "React setup (CRA or Vite), Components & Props, State & Hooks (useState), Fetching data from Spring Boot API",
    icon: "⚛️",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    color: "#61DAFB",
    bgGradient: "from-cyan-400 to-blue-500"
  },
  {
    day: 10,
    title: "Deployment & Git",
    topics: "Git basics (clone, add, commit, push), GitHub repo setup, Deploy React frontend to Vercel, (Optional) Deploy Spring Boot backend to Render/Heroku",
    icon: "🚀",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    color: "#F05032",
    bgGradient: "from-orange-500 to-red-500"
  }
];

// Swag Carousel Component
function SwagCarousel() {
  const swagItems = [
    {
      image: shirtimg,
    },

  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % swagItems.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [swagItems.length]);

  return (
    <div className="relative h-full flex flex-col justify-center">
      <div className="relative overflow-hidden rounded-xl">
        <motion.div
          className="flex"
          animate={{
            x: `-${currentIndex * 100}%`
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
        >
          {swagItems.map((item, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 flex flex-col items-center justify-center p-4"
            >
              <div className="w-50 h-50 mb-3 rounded-xl overflow-hidden  flex items-center justify-center">
                <img
                  src={item.image}
                  className="w-50 h-50"

                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<div style="width: 80px; height: 80px; background: rgba(255,255,255,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎁</div>`;
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>


    </div>
  );
}

// Rewards Carousel Component
function RewardsCarousel({ themeColors }) {
  const rewardData = [
    { image: track8, title: "Networking", subtitle: "Connect & Grow" },
    { image: track9, title: "Swag & Goodies", subtitle: "T-shirts & Stickers" },
    { image: track10, title: "Mentorship", subtitle: "Industry Guidance" },
    { image: track11, title: "Cash Prizes", subtitle: "₹35,000 Prize Pool" },
    { image: track7, title: "Certificates", subtitle: "Digital Recognition" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (rewardData.length - 2)); // Show 3 at a time
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [rewardData.length]);

  return (
    <div className="w-full max-w-5xl mx-auto mb-16">
      <div className="relative overflow-hidden" style={{ height: '350px' }}>
        <motion.div
          className="flex gap-8 px-4"
          animate={{
            x: `-${currentIndex * 33.33}%`
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          {rewardData.map((reward, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-center"
              style={{ width: 'calc(33.33% - 32px)' }}
            >
              {/* Image Container */}
              <div
                className="w-full rounded-xl overflow-hidden  mb-4"
                style={{ height: '240px' }}
              >
                <img
                  src={reward.image}
                  alt={reward.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; font-size: 36px; color: white; border-radius: 12px;">🏆</div>`;
                  }}
                />
              </div>

              {/* Title and Subtitle */}
              <div className="space-y-1">
                <h3
                  className="text-lg font-bold"
                  style={{ color: themeColors.text }}
                >
                  {reward.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: themeColors.textSecondary }}
                >
                  {reward.subtitle}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Simple Navigation Dots */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: rewardData.length - 2 }).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
              ? 'bg-blue-500 w-6'
              : 'bg-gray-400 hover:bg-gray-500'
              }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

// Event Images Carousel Component
function EventImagesCarousel() {
  const eventImages = [track16, track17, track18, track19, track20];
  const duplicatedImages = [...eventImages, ...eventImages]; // To make seamless loop

  return (
    <div className="w-full h-full relative overflow-hidden">
      <motion.div
        className="flex h-full"
        animate={{ x: ["0%", `-${100 / 2}%`] }} // Scroll half because we duplicated
        transition={{
          duration: 10, // Slower, smoother scroll
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ width: `${(duplicatedImages.length) * 200 / eventImages.length}%` }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={index}
          >
            <img
              src={image}
              alt={`Event ${index + 1}`}
              className="h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">📸</div>`;
              }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Attendance Calendar Preview Component - Exact UI from AttendanceCalendar
function AttendanceCalendarPreview({ attendance, themeColors }) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Calculate status by date from attendance data
  const statusByDate = React.useMemo(() => {
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
  const days = React.useMemo(() => {
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

  const getBlockStyle = (date) => {
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
          const dayLabel = getDayLabel(date);

          return (
            <div
              key={index}
              style={getBlockStyle(date)}
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
}

// Tasks Section Component with expandable task details
function TasksSection({ mockData, themeColors }) {
  const [selectedTask, setSelectedTask] = useState(mockData.activeTasks[0] || null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const handleTaskClick = (task) => {
    setSelectedTask(selectedTask?._id === task._id ? null : task);
    setUploadedFile(null); // Reset file when switching tasks
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);
  };

  const handleSubmitTask = () => {
    if (uploadedFile) {
      alert(`Task "${selectedTask.title}" submitted with file: ${uploadedFile.name}`);
      setUploadedFile(null);
      setSelectedTask(null);
    } else {
      alert('Please upload a file before submitting.');
    }
  };

  return (
    <motion.div
      className="rounded-xl border-2 p-6 shadow-lg"
      style={{
        backgroundColor: themeColors.cardBg,
        borderColor: themeColors.border
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
          Recent Tasks
        </h3>
        <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-600">
          {mockData.activeTasks.length} active
        </span>
      </div>

      <div className="space-y-4">
        {mockData.activeTasks.slice(0, 3).map((task, index) => {
          const isCompleted = mockData.completedSubmissions.some(sub => sub.taskId === task._id);
          const isPending = mockData.pendingSubmissions.some(sub => sub.taskId === task._id);
          const isSelected = selectedTask?._id === task._id;

          return (
            <div key={task._id} className="space-y-3">
              {/* Task Header */}
              <div
                onClick={() => handleTaskClick(task)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                style={{
                  backgroundColor: themeColors.cardBgSecondary,
                  borderColor: themeColors.border
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : isPending ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} />
                  <div>
                    <div className="font-medium" style={{ color: themeColors.text }}>
                      {task.title}
                    </div>
                    <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' :
                    isPending ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                    {isCompleted ? 'Completed' : isPending ? 'Pending' : 'Not Started'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''
                      }`}
                    style={{ color: themeColors.textSecondary }}
                  />
                </div>
              </div>

              {/* Expanded Task Details */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-lg border-2 border-dashed space-y-4"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border
                    }}
                  >
                    {/* Task Description */}
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: themeColors.text }}>
                        Task Description
                      </h4>

                    </div>

                    {/* Requirements */}
                    <div>

                      <ul className="text-sm space-y-1" style={{ color: themeColors.textSecondary }}>
                        <li>• Complete the assigned coding exercise</li>
                        <li>• Include proper documentation and comments</li>
                        <li>• Test your solution thoroughly</li>
                        <li>• Submit as a ZIP file or GitHub repository link</li>
                      </ul>
                    </div>

                    {/* File Upload Section */}
                    {!isCompleted && (
                      <div>
                        <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>
                          Submit Your Work
                        </h4>

                        <div className="space-y-3">
                          {/* File Upload Input */}
                          <div
                            className="border-2 border-dashed rounded-lg p-4 text-center transition-colors hover:border-blue-400"
                            style={{ borderColor: themeColors.border }}
                          >
                            <input
                              type="file"
                              id={`file-upload-${task._id}`}
                              className="hidden"
                              onChange={handleFileUpload}
                              accept=".zip,.rar,.pdf,.doc,.docx,.txt,.js,.html,.css,.py,.java"
                            />
                            <label
                              htmlFor={`file-upload-${task._id}`}
                              className="cursor-pointer"
                            >
                              <div className="space-y-2">
                                <div className="text-2xl">📁</div>
                                <div className="text-sm font-medium" style={{ color: themeColors.text }}>
                                  {uploadedFile ? uploadedFile.name : 'Click to upload file'}
                                </div>
                                <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                                  Supported: ZIP, PDF, DOC, TXT, Code files
                                </div>
                              </div>
                            </label>
                          </div>

                          {/* Upload Status */}
                          {uploadedFile && (
                            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-700">
                                File ready: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedTask(null)}
                              className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                              style={{
                                color: themeColors.textSecondary,
                                borderColor: themeColors.border,
                                backgroundColor: themeColors.background
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSubmitTask}
                              disabled={!uploadedFile}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${uploadedFile
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                              Submit Task
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Completed Task Info */}
                    {isCompleted && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-sm font-medium text-green-700">
                            Task completed successfully!
                          </span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Score: {mockData.completedSubmissions.find(sub => sub.taskId === task._id)?.score || 'N/A'}/100
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Mentor Dashboard Preview Component
function MentorDashboardPreview({ themeColors }) {
  const mockMentorData = {
    assignedParticipants: [
      { _id: '1', name: 'Shyamala', email: 'shyamala@gmail.com', progress: 85, lastActive: '2025-08-18', team: 'Code Warriors' },
      { _id: '2', name: 'Rajesh Kumar', email: 'rajesh@gmail.com', progress: 92, lastActive: '2025-08-18', team: 'Tech Titans' },
      { _id: '3', name: 'Priya Singh', email: 'priya@gmail.com', progress: 78, lastActive: '2025-08-17', team: 'Innovation Hub' },
      { _id: '4', name: 'Arjun Reddy', email: 'arjun@gmail.com', progress: 88, lastActive: '2025-08-18', team: 'Code Warriors' }
    ],
    pendingReviews: [
      { _id: '1', participant: 'Shyamala', task: 'Java Basics Assignment', submittedAt: '2025-08-17', priority: 'high' },
      { _id: '2', participant: 'Rajesh Kumar', task: 'REST API Project', submittedAt: '2025-08-18', priority: 'medium' },
      { _id: '3', participant: 'Priya Singh', task: 'Frontend Integration', submittedAt: '2025-08-16', priority: 'high' }
    ],
    mentorStats: {
      totalParticipants: 15,
      activeParticipants: 12,
      avgProgress: 84,
      pendingReviews: 8,
      completedReviews: 45
    }
  };

  return (
    <div className="space-y-8">
      {/* Mentor Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              My Participants
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockMentorData.mentorStats.totalParticipants}
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            {mockMentorData.mentorStats.activeParticipants} active today
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-lg">📈</span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Avg Progress
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockMentorData.mentorStats.avgProgress}%
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Across all participants
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 text-lg">⏳</span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Pending Reviews
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockMentorData.mentorStats.pendingReviews}
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Awaiting feedback
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-lg">✅</span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Completed Reviews
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockMentorData.mentorStats.completedReviews}
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            This bootcamp
          </div>
        </motion.div>
      </div>

      {/* Mentor Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Participants */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
              My Participants
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-600">
              {mockMentorData.assignedParticipants.length} assigned
            </span>
          </div>
          <div className="space-y-4">
            {mockMentorData.assignedParticipants.slice(0, 4).map((participant) => (
              <div
                key={participant._id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {participant.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: themeColors.text }}>
                      {participant.name}
                    </div>
                    <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                      {participant.team}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: themeColors.text }}>
                    {participant.progress}%
                  </div>
                  <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                    Progress
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Reviews */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
              Pending Reviews
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-600">
              {mockMentorData.pendingReviews.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {mockMentorData.pendingReviews.map((review) => (
              <div
                key={review._id}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium" style={{ color: themeColors.text }}>
                    {review.participant}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${review.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                    {review.priority} priority
                  </span>
                </div>
                <div className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>
                  {review.task}
                </div>
                <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                  Submitted: {new Date(review.submittedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Admin Dashboard Preview Component
function AdminDashboardPreview({ themeColors }) {
  const mockAdminData = {
    overallStats: {
      totalParticipants: 250,
      activeMentors: 20,
      completedTasks: 1250,
      avgAttendance: 87,
      totalTeams: 50
    },
    recentActivity: [
      { type: 'registration', user: 'New participant registered', time: '2 mins ago', status: 'success' },
      { type: 'submission', user: 'Task submitted by Shyamala', time: '5 mins ago', status: 'pending' },
      { type: 'mentor', user: 'Mentor assigned to Team Alpha', time: '10 mins ago', status: 'success' },
      { type: 'alert', user: 'Low attendance alert for Day 7', time: '15 mins ago', status: 'warning' }
    ],
    topPerformers: [
      { name: 'Rajesh Kumar', score: 950, team: 'Tech Titans', rank: 1 },
      { name: 'Priya Singh', score: 920, team: 'Innovation Hub', rank: 2 },
      { name: 'Arjun Reddy', score: 895, team: 'Code Warriors', rank: 3 },
      { name: 'Shyamala', score: 850, team: 'Code Warriors', rank: 4 }
    ],
    systemHealth: {
      serverStatus: 'healthy',
      dbConnections: 45,
      activeUsers: 180,
      responseTime: '120ms'
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Total Participants
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockAdminData.overallStats.totalParticipants}
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Registered users
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Active Mentors
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockAdminData.overallStats.activeMentors}
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Guiding participants
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-lg">📋</span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Tasks Completed
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockAdminData.overallStats.completedTasks}
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Across all participants
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 text-lg">📅</span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Avg Attendance
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockAdminData.overallStats.avgAttendance}%
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Bootcamp average
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-lg">👥</span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
              Total Teams
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>
            {mockAdminData.overallStats.totalTeams}
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Formed teams
          </div>
        </motion.div>
      </div>

      {/* Admin Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
              Recent Activity
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-600">
              Live
            </span>
          </div>
          <div className="space-y-4">
            {mockAdminData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg"
                style={{ backgroundColor: themeColors.cardBgSecondary }}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: themeColors.text }}>
                    {activity.user}
                  </div>
                  <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
              Top Performers
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-600">
              Leaderboard
            </span>
          </div>
          <div className="space-y-4">
            {mockAdminData.topPerformers.map((performer) => (
              <div
                key={performer.rank}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: themeColors.cardBgSecondary }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${performer.rank === 1 ? 'bg-yellow-500' :
                    performer.rank === 2 ? 'bg-gray-400' :
                      performer.rank === 3 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                    {performer.rank}
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: themeColors.text }}>
                      {performer.name}
                    </div>
                    <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                      {performer.team}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: themeColors.text }}>
                    {performer.score}
                  </div>
                  <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                    points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{ backgroundColor: themeColors.cardBg, borderColor: themeColors.border }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
              System Health
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-600">
              All Systems Operational
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: themeColors.cardBgSecondary }}>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium" style={{ color: themeColors.text }}>Server Status</span>
              </div>
              <span className="text-sm" style={{ color: themeColors.textSecondary }}>Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: themeColors.cardBgSecondary }}>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium" style={{ color: themeColors.text }}>Active Users</span>
              </div>
              <span className="text-sm" style={{ color: themeColors.textSecondary }}>{mockAdminData.systemHealth.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: themeColors.cardBgSecondary }}>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm font-medium" style={{ color: themeColors.text }}>DB Connections</span>
              </div>
              <span className="text-sm" style={{ color: themeColors.textSecondary }}>{mockAdminData.systemHealth.dbConnections}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: themeColors.cardBgSecondary }}>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium" style={{ color: themeColors.text }}>Response Time</span>
              </div>
              <span className="text-sm" style={{ color: themeColors.textSecondary }}>{mockAdminData.systemHealth.responseTime}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Dashboard Tabs Component
function DashboardTabs({ themeColors }) {
  const [activeTab, setActiveTab] = useState('participant');

  const tabs = [
    { id: 'participant', label: 'Participant View', icon: '👨‍🎓' },
    { id: 'mentor', label: 'Mentor View', icon: '👨‍🏫' },
    { id: 'admin', label: 'Admin View', icon: '👨‍💼' }
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div
          className="flex rounded-xl border-2 p-2"
          style={{
            backgroundColor: themeColors.cardBgSecondary,
            borderColor: themeColors.border
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === tab.id ? 'shadow-md' : 'hover:opacity-70'
                }`}
              style={{
                backgroundColor: activeTab === tab.id ? themeColors.cardBg : 'transparent',
                color: activeTab === tab.id ? themeColors.text : themeColors.textSecondary,
                border: activeTab === tab.id ? `2px solid ${themeColors.border}` : '2px solid transparent'
              }}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'participant' && <DashboardPreview themeColors={themeColors} />}
        {activeTab === 'mentor' && <MentorDashboardPreview themeColors={themeColors} />}
        {activeTab === 'admin' && <AdminDashboardPreview themeColors={themeColors} />}
      </motion.div>
    </div>
  );
}

// Dashboard Preview Component - Using actual dashboard UI
function DashboardPreview({ themeColors }) {
  // Mock data similar to the actual dashboard
  const mockData = {
    activeTasks: [
      { _id: '1', title: 'Complete Java Basics', description: 'Learn Java fundamentals', dueDate: '2025-08-10', isActive: true },
      { _id: '2', title: 'Build REST API', description: 'Create a Spring Boot API', dueDate: '2025-08-12', isActive: true },
      { _id: '3', title: 'Frontend Integration', description: 'Connect React with API', dueDate: '2025-08-14', isActive: true }
    ],
    attendance: [
      { date: '2025-08-04', status: 'present' },
      { date: '2025-08-05', status: 'present' },
      { date: '2025-08-06', status: 'present' },
      { date: '2025-08-07', status: 'absent' },
      { date: '2025-08-08', status: 'present' },
      { date: '2025-08-09', status: 'present' },
      { date: '2025-08-10', status: 'present' },
      { date: '2025-08-11', status: 'present' },
      { date: '2025-08-12', status: 'absent' },
      { date: '2025-08-13', status: 'present' },
      { date: '2025-08-14', status: 'present' },
      { date: '2025-08-15', status: 'present' },
      { date: '2025-08-16', status: 'present' },
      { date: '2025-08-17', status: 'absent' },
      { date: '2025-08-18', status: 'present' },
      { date: '2025-08-19', status: 'present' },
      { date: '2025-08-20', status: 'present' },
      { date: '2025-08-21', status: 'present' },
      { date: '2025-08-22', status: 'present' },
      { date: '2025-08-23', status: 'absent' },
      { date: '2025-08-24', status: 'present' },
      { date: '2025-08-25', status: 'present' },
      { date: '2025-08-26', status: 'present' },
      { date: '2025-08-27', status: 'present' },
      { date: '2025-08-28', status: 'present' },
      { date: '2025-08-29', status: 'present' },

    ],
    completedSubmissions: [
      { taskId: '1', status: 'completed', score: 95 },
      { taskId: '2', status: 'completed', score: 88 }
    ],
    pendingSubmissions: [
      { taskId: '3', status: 'pending' }
    ],
    team: {
      name: 'Code Warriors',
      members: ['John Doe', 'Jane Smith', 'Mike Johnson']
    },
    mentor: {
      name: 'Swapanth Vakapalli',
      mobile: '+1234567890',
      skills: ['Nodejs', 'React', 'System Architecture'],
      profilePicture: null
    }
  };

  const presentDays = mockData.attendance.filter(a => a.status === 'present').length;
  const totalDays = mockData.attendance.length;
  const attendancePercentage = Math.round((presentDays / totalDays) * 100);
  const attendanceStreak = 3;
  const overviewScore = 850;
  const mentor = mockData.mentor;
  const user = { name: 'Syamala' }; // Mock user for preview

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overview Score Card */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-lg">📊</span>
              </div>
              <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
                Overall Score
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold" style={{ color: themeColors.text }}>
              {overviewScore}
            </div>
            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
              Points earned
            </div>
          </div>
        </motion.div>

        {/* Attendance Card */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-lg">📅</span>
              </div>
              <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
                Attendance
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold" style={{ color: themeColors.text }}>
              {attendancePercentage}%
            </div>
            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
              {presentDays}/{totalDays} days present
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs" style={{ color: themeColors.textSecondary }}>Streak:</span>
              <span className="text-xs font-semibold text-orange-600">{attendanceStreak} days 🔥</span>
            </div>
          </div>
        </motion.div>

        {/* Mentor Card */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="">
            <p className=" mb-4 flex items-center" style={{ color: themeColors.text }}>
              <Users className="w-5 h-5 mr-2" />
              Mentor Details
            </p>

            {/* Mentor Section */}
            <div className="mb-4">
              {mentor ? (
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      {mentor.profilePicture ? (
                        <img
                          src={mentor.profilePicture}
                          alt={mentor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg mb-1" style={{ color: themeColors.text }}>{mentor.name}</div>
                      <div className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>{mentor.email}</div>
                      {mentor.mobile && (
                        <div className="flex items-center justify-between">

                          <button
                            onClick={() => {
                              const message = `Hi, I'm ${user?.name || 'a participant'}`;
                              const whatsappUrl = `https://wa.me/${mentor.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                            title="Chat on WhatsApp"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                            </svg>
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {mentor.skills?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold mb-2" style={{ color: themeColors.textSecondary }}>EXPERTISE</div>
                      <div className="flex flex-wrap gap-1">
                        {mentor.skills.map((skill, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {skill.replace(/"/g, '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}


                </div>
              ) : (
                <div className="p-6 rounded-xl text-center" style={{ backgroundColor: themeColors.backgroundSecondary }}>
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-sm font-medium mb-1" style={{ color: themeColors.text }}>No mentor assigned yet</div>
                  <div className="text-xs" style={{ color: themeColors.textSecondary }}>You'll be assigned a mentor soon to guide you through your journey</div>
                </div>
              )}
            </div>

          </div>
        </motion.div>


        {/* Team Card */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 text-lg">👥</span>
              </div>
              <h3 className="text-sm font-semibold" style={{ color: themeColors.textSecondary }}>
                Team
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-bold" style={{ color: themeColors.text }}>
              {mockData.team.name}
            </div>
            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
              {mockData.team.members.length} members
            </div>
          </div>
        </motion.div>
      </div>

      {/* Participant Overview Section */}


      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <TasksSection mockData={mockData} themeColors={themeColors} />

        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
              Participant Overview
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-600">
              Active Participant
            </span>
          </div>

          <div className="">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg" style={{ color: themeColors.text }}>
                    Shyamala
                  </h4>
                  <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                    Shyamala@gmail.com
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                      Verified
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                      Bootcamp Participant
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: themeColors.textSecondary }}>Registration:</span>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>Aug 1, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: themeColors.textSecondary }}>Track:</span>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>Full Stack Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: themeColors.textSecondary }}>Experience:</span>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>Beginner</span>
                </div>
              </div>
            </div>

            {/* Progress Metrics */}
            <div className="space-y-4">
              <h5 className="font-semibold" style={{ color: themeColors.text }}>Progress Metrics</h5>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: themeColors.textSecondary }}>Bootcamp Progress</span>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>Day 8/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: themeColors.textSecondary }}>Task Completion</span>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>{mockData.completedSubmissions.length}/{mockData.activeTasks.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(mockData.completedSubmissions.length / mockData.activeTasks.length) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements & Stats */}
            <div className="space-y-4">
              <h5 className="font-semibold" style={{ color: themeColors.text }}>Achievements</h5>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs font-medium text-yellow-800">Top Performer</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-xs font-medium text-green-800">{attendanceStreak} Day Streak</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs font-medium text-blue-800">Fast Learner</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs font-medium text-purple-800">Goal Oriented</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: themeColors.textSecondary }}>Rank:</span>
                  <span className="text-sm font-bold text-orange-600">#12 of 250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: themeColors.textSecondary }}>Points Earned:</span>
                  <span className="text-sm font-bold text-blue-600">{overviewScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: themeColors.textSecondary }}>Team:</span>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>{mockData.team.name}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Attendance Calendar */}
        <motion.div
          className="rounded-xl border-2 p-6 shadow-lg"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
              Attendance Overview
            </h3>
            <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-600">
              {attendancePercentage}% present
            </span>
          </div>
          <AttendanceCalendarPreview attendance={mockData.attendance} themeColors={themeColors} />
        </motion.div>
      </div>
    </div>
  );
}

// Tech Marquee Component
function TechMarquee() {
  const hackathonTechs = [
    {
      name: "React",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      color: "#61DAFB"
    },
    {
      name: "Node.js",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
      color: "#339933"
    },
    {
      name: "Python",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      color: "#3776AB"
    },
    {
      name: "JavaScript",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      color: "#F7DF1E"
    },
    {
      name: "Docker",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
      color: "#2496ED"
    },
    {
      name: "MongoDB",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
      color: "#47A248"
    },
    {
      name: "Firebase",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
      color: "#FFCA28"
    },
    {
      name: "TensorFlow",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
      color: "#FF6F00"
    },
    {
      name: "AWS",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
      color: "#FF9900"
    },
    {
      name: "Flutter",
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
      color: "#02569B"
    }
  ];

  // Duplicate the array for seamless loop
  const duplicatedTechs = [...hackathonTechs, ...hackathonTechs];

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="relative w-full h-full overflow-hidden">
        {/* Mobile: Horizontal scrolling */}
        <div className="block sm:hidden h-full w-full">
          <motion.div
            className="flex gap-2 h-full items-center"
            animate={{
              x: [0, -48 * hackathonTechs.length]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ width: 'max-content' }}
          >
            {duplicatedTechs.map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "54px",
                  height: "54px",
                  minWidth: "54px",
                  minHeight: "54px"
                }}
              >
                <div className="w-30 h-30 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-sm">
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-7 h-7"
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div style="width: 22px; height: 22px; background: ${tech.color}; border-radius: 4px;"></div>`;
                    }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Desktop: Vertical scrolling */}
        <div className="hidden sm:block h-full">
          <motion.div
            className="flex flex-col gap-3 h-full justify-center"
            animate={{
              y: [0, -50 * hackathonTechs.length]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {duplicatedTechs.map((tech, index) => (
              <motion.div
                key={`${tech.name}-${index}`}
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "60px",
                  height: "60px",
                  minWidth: "60px",
                  minHeight: "60px"
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                  <img
                    src={tech.icon}
                    alt={tech.name}
                    className="w-8 h-8"
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div style="width: 24px; height: 24px; background: ${tech.color}; border-radius: 4px;"></div>`;
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Scroll-Triggered Timeline Component
function ScrollTriggeredTimeline({ bootcampJourney, themeColors }) {
  const containerRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    const updateViewportWidth = () => {
      if (typeof window !== 'undefined') {
        setViewportWidth(window.innerWidth);
      }
    };

    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.2", "end 0.8"]
  });

  // Calculate smooth horizontal movement
  const cardWidth = 400; // Increased width for better timeline look
  const gap = 24;
  const totalWidth = bootcampJourney.length * cardWidth + (bootcampJourney.length - 1) * gap;
  const containerPadding = 100;
  const visibleWidth = Math.min(viewportWidth - containerPadding, 1200);
  const maxScroll = Math.max(0, totalWidth - visibleWidth);

  // Smooth horizontal movement with better easing
  const x = useTransform(scrollYProgress, [0, 1], [50, -maxScroll + 50]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative h-screen" style={{ marginTop: '-200px' }}>
      {/* Progress Line */}
      <div
        className="absolute top-1/2 left-0 right-0 h-1 z-0 mx-8"
        style={{ backgroundColor: themeColors.border }}
      >
        <motion.div
          className="h-full"
          style={{
            backgroundColor: themeColors.accent,
            width: progressWidth
          }}
        />
      </div>

      {/* Fixed Container for Horizontal Movement */}
      <div className=" absolute inset-0 flex items-center overflow-hidden">
        <motion.div
          className="flex gap-6 w-max px-8"
          style={{ x }}
        >
          {bootcampJourney.map((day, index) => (
            <motion.div
              key={day.day}
              className="relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 120
              }}
              viewport={{ once: true }}
            >
              {/* Timeline Card - Clean Design */}
              <motion.div
                className="w-96 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 relative"
                style={{
                  backgroundColor: themeColors.cardBgSecondary,
                  borderColor: themeColors.themeColors
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                }}
                transition={{ duration: 0.2 }}
              >
                {/* Left Side - Tech Logo */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${day.color}15` }}
                  >
                    <img
                      src={day.logo}
                      alt={day.title}
                      className="w-10 h-10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<span style="font-size: 24px;">${day.icon}</span>`;
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-xl font-bold"
                        style={{ color: themeColors.text }}
                      >
                        {day.title}
                      </h3>
                      <div className="text-right">
                        <div
                          className="text-2xl font-black"
                          style={{ color: themeColors.textSecondary }}
                        >
                          {day.day}
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: themeColors.textSecondary }}
                        >
                          Day
                        </div>
                      </div>
                    </div>

                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Learning Path
                    </p>

                    <div className="space-y-2">
                      {day.topics.split(', ').slice(0, 3).map((topic, topicIndex) => (
                        <div
                          key={topicIndex}
                          className="flex items-start gap-2"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: day.color }}
                          />
                          <span
                            className="text-sm leading-relaxed"
                            style={{ color: themeColors.text }}
                          >
                            {topic}
                          </span>
                        </div>
                      ))}
                      {day.topics.split(', ').length > 3 && (
                        <div
                          className="text-xs font-medium"
                          style={{ color: day.color }}
                        >
                          +{day.topics.split(', ').length - 3} more topics
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div
                    className="w-8 h-8 rounded-full border-4 flex items-center justify-center text-xs font-black"
                    style={{
                      backgroundColor: day.color,
                      borderColor: themeColors.background,
                      color: '#ffffff'
                    }}
                  >
                    {day.day}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm"
          style={{
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.border,
            color: themeColors.textSecondary
          }}
        >
          <span className="text-sm font-medium">Scroll to explore journey</span>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ↓
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isDarkTheme = useThemeDetection();
  const themeColors = getThemeColors(isDarkTheme);

  const hackathonDate = new Date("2025-08-14T10:00:00");

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeColors.background,
        cursor: 'url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3ctext x=\'0\' y=\'20\' font-size=\'20\'%3e🖌️%3c/text%3e%3c/svg%3e") 12 12, auto'
      }}
    >
      {/* Rainbow Cursor Trail */}
      <RainbowCursorTrail />

      {/* Navigation */}
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
                {["About", "Tracks", "Timeline", "Rewards"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="font-semibold transition-colors hover:opacity-80"
                    style={{ color: themeColors.text }}
                  >
                    {item}
                  </a>
                ))}
                <a
                  href="/photo-booth"
                  className="font-semibold transition-colors hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  Photo Booth
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
              {["About", "Tracks", "Timeline", "Rewards", "Photo Booth"].map((item) => (
                <a
                  key={item}
                  href={item === "Photo Booth" ? "/photo-booth" : `#${item.toLowerCase()}`}
                  className="block px-3 py-2 font-semibold"
                  style={{ color: themeColors.text }}
                >
                  {item}
                </a>
              ))}
              <div className="px-3 py-2">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 w-full font-bold px-4 py-2 rounded-lg text-white border-2 border-solid"
                  style={{
                    color: "#ffffff",
                    borderColor: themeColors.border,
                    borderRadius: 50
                  }}
                >
                  Check Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="about" className="py-4 sm:py-8 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

            {/* Main Hero Card */}
            <div className="lg:col-span-8 order-1 lg:order-1">
              <div
                className="rounded-[24px] sm:rounded-[50px] border-2 shadow-lg h-full px-6 sm:px-12 lg:px-20 py-6 sm:py-10"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.cardBg,
                }}
              >
                <p
                  className="text-[20px] sm:text-[24px] lg:text-[30px] text-black dark:text-white leading-tight font-normal"
                  style={{ color: themeColors.text }}
                >
                  <span>Join us for</span>
                  <br />
                  <span className="font-semibold text-[28px] sm:text-[36px] lg:text-[50px]">
                    Innovate, Elevate,<br className="hidden sm:block" /> Energize
                  </span>
                  <br />
                  <span className="font-normal">of learning</span>
                </p>

                <div className="my-6 sm:my-8">
                  <div
                    className="h-0.5 mb-4 sm:mb-6"
                    style={{ backgroundColor: themeColors.textSecondary, width: '160px' }}
                  />
                  <div
                    className="text-base sm:text-lg font-normal mb-4 sm:mb-6"
                    style={{ color: themeColors.textSecondary }}
                  >
                    August 04–15, 2025
                  </div>
                  <p
                    className="text-sm sm:text-base lg:text-lg leading-relaxed font-normal"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Code with purpose — create innovative solutions for yoga sessions, meditation spaces, physical fitness, and holistic well-being.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="px-6 sm:px-8 py-3 sm:py-4 font-medium transition-all duration-200 hover:scale-105 text-white bg-yellow rounded-full text-base sm:text-lg"
                    onClick={() => navigate("/login")}
                    style={{ color: 'white', backgroundColor: '#3b82f6' }}
                  >
                    Let's Build
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Cards */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6 order-2 lg:order-2">
              <CountdownTimer targetDate={hackathonDate} themeColors={themeColors} />

              {/* Swag & Tech Cards */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Swag Card */}
                <div
                  className="w-full sm:w-[72%] p-4 sm:p-6 rounded-xl border-2 shadow-md h-[200px] sm:h-[300px]"
                  style={{
                    backgroundColor: '#19afc3',
                    borderColor: themeColors.border,
                  }}
                >
                  <p className="text-white font-semibold text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-3">
                    Bag your <br /> swags
                  </p>
                  <div className="flex-1 min-h-[100px] sm:min-h-[100px]">
                    <SwagCarousel />
                  </div>
                </div>

                {/* Tech Marquee Card */}
                <div
                  className="w-full sm:w-[28%] rounded-xl border-2 shadow-md relative overflow-hidden h-[120px] sm:h-[300px]"
                  style={{
                    backgroundColor: '#D1EED8',
                    borderColor: themeColors.border,
                  }}
                >
                  <TechMarquee />
                </div>
              </div>


              {/* Prize Pool */}
              <div
                className="rounded-[24px] sm:rounded-[40px] p-4 sm:p-6 shadow-md text-center sm:text-left"
                style={{
                  backgroundColor: '#F8BB15',
                  borderColor: themeColors.border,
                  border: '2px solid',
                  fontFamily: 'sans-serif',
                }}
              >
                <p
                  className="text-xl sm:text-2xl font-semibold mb-2"
                  style={{ color: themeColors.border }}
                >
                  PRIZE POOL
                </p>
                <h1
                  className="text-[2.5rem] sm:text-[3rem] lg:text-[3.5rem] font-bold"
                  style={{ color: themeColors.border }}
                >
                  ₹35,000
                </h1>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Stats Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Mission Card */}
            <div
              className="rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[280px] sm:min-h-[309px]"
              style={{
                backgroundColor: '#5C8C3D',
                borderColor: themeColors.border
              }}
            >
              <div
                className="text-sm mb-2 rounded-2xl border-2 inline-block px-4 py-1"
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.text,
                  width: "fit-content"
                }}
              >
                MISSION
              </div>
              <div
                className="font-black"
                style={{
                  fontSize: "2.5rem", // responsive control will handle scale
                  lineHeight: "1.1",
                  color: themeColors.text
                }}
              >
                <span>Learn</span><br />
                <span>Connect</span><br />
                <span>Grow</span>.
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-3 h-full">
              {[
                { number: "20+", label: "Mentors" },
                { number: "250+", label: "Participants" },
                { number: "10+2", label: "Days" },
                { number: "Full Stack", label: "Bootcamp" }
              ].map((stat, index) => {
                const backgroundColor = (index === 0 || index === 3) ? '#FF6B39' : '#F7931E';

                return (
                  <div
                    key={index}
                    className="p-4 sm:p-6 text-center flex flex-col justify-center rounded-3xl shadow-lg w-full"
                    style={{
                      background: backgroundColor,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div className="text-xl sm:text-2xl md:text-3xl font-black mb-1 text-white">
                      {stat.number}
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-white">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Event Images Carousel */}
            <div
              className="rounded-3xl shadow-lg overflow-hidden w-full lg:w-[500px] xl:w-[600px]"
              style={{
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.border
              }}
            >
              <EventImagesCarousel />
            </div>

          </div>
        </div>
      </section>


      {/* Dashboard Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: themeColors.cardBg }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4"
              style={{ color: themeColors.text }}
            >
              Track Your Progress
            </h2>
            <p
              className="text-lg sm:text-xl max-w-3xl mx-auto"
              style={{ color: themeColors.textSecondary }}
            >
              Stay organized and motivated with our comprehensive dashboard featuring calendar, leaderboards, task tracking, and attendance monitoring
            </p>
          </div>

          <DashboardTabs themeColors={themeColors} />
        </div>
      </section>


{/* Tracks Section */}
<section
        id="tracks"
        className="py-12 sm:py-20 px-4 sm:px-6 lg:px-12"
        style={{ backgroundColor: themeColors.cardBg }}
      >
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 sm:mb-12 text-center"
            style={{ color: themeColors.text }}
          >
            Choose Your Track
          </h2>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            {/* Track Cards */}
            <div className="w-full lg:w-[35%]">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {tracks.map((track, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`border-2 rounded-xl p-2 sm:p-3 text-center cursor-pointer transition-all duration-300 
          h-20 sm:h-24 text-xs sm:text-sm flex flex-col items-center justify-center hover:opacity-80 
          ${selectedIndex === index ? "ring-2 ring-red-500" : ""}`}
                    style={{
                      backgroundColor: themeColors.cardBgSecondary,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    <div className="text-lg sm:text-xl mb-1">{track.icon}</div>
                    <div className="font-bold leading-tight">{track.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Panel */}
            {selectedIndex !== null && (
              <div
                className="border-2 w-full lg:flex-[2] p-4 sm:p-6 lg:p-8 h-40 lg:h-38  xl:h-52 rounded-xl shadow-md transition-opacity duration-300"
                style={{
                  backgroundColor: themeColors.cardBgSecondary,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 sm:gap-6">
                  {/* Text Content */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3
                      className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
                      style={{ color: themeColors.text }}
                    >
                      {tracks[selectedIndex].title}
                    </h3>
                    <p
                      className="text-sm sm:text-base lg:text-lg leading-relaxed"
                      style={{ color: themeColors.textSecondary }}
                    >
                      {tracks[selectedIndex].description}
                    </p>
                  </div>

                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={tracks[selectedIndex].image}
                      alt={tracks[selectedIndex].title}
                      className="w-35 h-35 sm:w-34 sm:h-34 lg:w-40 lg:h-40 xl:w-60 xl:h-50 object-cover"
                      style={{
                        filter: isDarkTheme ? 'brightness(0.9)' : 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>


      {/* Bootcamp Journey Section with Scroll-Triggered Horizontal Movement */}
      <section id="timeline" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-black mb-4"
              style={{ color: themeColors.text }}
            >
              Your 10-Day Bootcamp Journey
            </h2>
            <p
              className="text-xl max-w-3xl mx-auto"
              style={{ color: themeColors.textSecondary }}
            >
              From Java fundamentals to full-stack deployment - master the complete development cycle in just 10 days
            </p>
          </div>

          <ScrollTriggeredTimeline bootcampJourney={bootcampJourney} themeColors={themeColors} />

        </div>
      </section>


      {/* Benefits Box Section */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="w-full px-8 border-2 py-12 rounded-2xl"
            style={{
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.border
            }}
          >
            <h4
              className="px-8 py-2 border-2 w-max rounded-full mb-3 text-sm font-semibold"
              style={{
                color: themeColors.text,
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBgSecondary
              }}
            >
              benefits
            </h4>
            <div className="ml-3">
              <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text }}>
                What's in it for me?
              </h1>
              <p className="text-base mb-6 max-w-[48ch]" style={{ color: themeColors.textSecondary }}>
                Build real-world tech solutions for yoga, health, and wellness — and win prizes, recognition, and<br />
                swags while elevating your mind and skills.
              </p>
              <h2 className="text-xl font-semibold mt-8 mb-4" style={{ color: themeColors.text }}>
                I want to
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {[
                  {
                    title: "learn tech from the experts",
                    image: "https://www.gitam.edu/sites/default/files/banners/know-gitam_0.jpg",
                    color: "rgb(23, 78, 166)",
                    benefits: [
                      "Exposure to Industry Experts & Technologies, Discover new career opportunities, new skills, professional contacts",
                      "Hands-on Hackathon Experience to Boost Practical Skills, Learn how to work in a team.",
                      "Networking Opportunities with Peers and Professionals"
                    ]
                  },
                  {
                    title: "build a startup",
                    image: "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/220304_GGstartups_interior_4350.width-1300.jpg",
                    color: "rgb(13, 101, 45)",
                    benefits: [
                      "Connect with Potential Collaborators and Mentors",
                      "Gain Insights from Industry Leaders through Panel Discussions, Learn business tips from successful people.",
                      "Showcase Startup Ideas and Explore Partnership Avenues"
                    ]
                  },
                  {
                    title: "build a career in Tech",
                    image: "https://heinzegers.com/wp-content/uploads/2017/08/Visiting-Google-1024x576.jpg",
                    color: "rgb(176, 96, 0)",
                    benefits: [
                      "Brand Visibility through Sponsorships and Talks",
                      "Engage with Young Tech Talent, Connect with other companies and startups, business connections, collaborations",
                      "Opportunities to Collaborate on Innovative Projects & Hackathon Solutions, Support student innovation through sponsorship."
                    ]
                  },
                  {
                    title: "be a freelancer",
                    image: "https://images.businessnewsdaily.com/app/uploads/2022/04/04072326/freelancer_Prostock-Studio_getty.jpg",
                    color: "rgb(179, 20, 18)",
                    benefits: [
                      "Explore the talks and workshops to understand where and when to make your next step.",
                      "Build a network of like minded people that can help you reach the next level.",
                      "Ask and get the best practices from the amazing line-up of speakers to reach the correct clients and companies."
                    ]
                  }
                ].map((item, index) => (
                  <div key={index} className="h-full rounded-xl overflow-hidden shadow group cursor-pointer">
                    <div className="relative h-48">
                      <img
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover rounded-xl"
                        src={item.image}
                      />
                      <div
                        className="absolute top-[-1px] right-[-1px] p-3 rounded-bl-2xl"
                        style={{ backgroundColor: themeColors.background }}
                      >
                        <div
                          className="text-white text-center px-6 py-2 rounded-lg text-[12px]"
                          style={{ backgroundColor: item.color, width: "140px" }}
                        >
                          <p>{item.title}</p>
                        </div>
                      </div>
                      <div>
                        <div
                          className="absolute bottom-0 left-0 right-0 p-4 rounded-bl-xl hidden group-hover:block"
                          style={{ backgroundColor: item.color, opacity: 0.92 }}
                        >
                          {item.benefits.map((benefit, benefitIndex) => (
                            <p key={benefitIndex} className="text-white mb-2 text-sm">
                              • {benefit}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Rewards Section */}
      <section id="rewards" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-black text-center mb-12"
            style={{ color: themeColors.text }}
          >
            What You'll Win
          </h2>

          {/* Rewards Carousel */}
          <RewardsCarousel themeColors={themeColors} />


        </div>
      </section>




      {/* Our Sponsors Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ marginTop: '-150px' }}>
        <div className="max-w-4xl mx-auto">
          {/* Main Title */}
          <div className="mb-12">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: themeColors.text }}
            >
              Our Partners
            </h2>
            <p
              className="text-lg"
              style={{ color: themeColors.textSecondary }}
            >
              Sponsors dedicated to building remarkable experience!
            </p>
          </div>

          {/* Sponsors Section */}
          <div className="mb-16">
            <div className="flex justify-start">
              <div
                className="border-1 rounded-lg "
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: 'white',
                  padding: '-120px'
                }}
              >

                <img
                  src={track14}
                  alt="Physical department"
                  className="h-22  w-45 object-contain fit-content"
                />

              </div>

              <div
                className="border-1 rounded-lg  ml-2"
                style={{
                  backgroundColor: 'white',
                }}
              >
                <img
                  src={track12}
                  alt="CSD & CSIT"
                  className="h-22  w-45 object-contain fit-content"
                />


              </div>
            </div>
          </div>

          {/* Partners Section */}
          <div>
            <h3
              className="text-2xl font-bold mb-8"
              style={{ color: themeColors.text }}
            >
              Organizers
            </h3>
            <div className="flex justify-start">
              <div
                className="border-1 rounded-lg "
                style={{
                  backgroundColor: 'white',
                  padding: '-120px'
                }}
              >
                <img
                  src={track13}
                  alt="CSD & CSIT"
                  className="h-22  w-45 object-contain fit-content"
                />


              </div>

              <div
                className="border-1 rounded-lg  ml-2"
                style={{
                  backgroundColor: 'white',
                }}
              >
                <img
                  src={track15}
                  alt="Physical department"
                  className="h-22  w-45 object-contain fit-content"
                />


              </div>
            </div>
          </div>
        </div>
      </section>

{/*       <div className="mb-8 justify-items-center">
            <h3 className="text-2xl font-bold text-center mb-6" style={{ color: themeColors.text }}>
              Meet the Developers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center" >
              {[
                {
                  name: "Swapanth Vakapalli",
                  role: "Full Stack Developer & UI/UX",
                  email: "swapanthvakapalli@gmail.com",
                  linkedin: "https://linkedin.com/in/swapanth-vakapalli",
                  github: "https://github.com/swapanth",
                  avatar: img1,
                  experience: "2+ years"
                },
                {
                  name: "Syamal Chintapalli",
                  role: "Full Stack Developer",
                  email: "syamalachintapalli@gmail.com",
                  linkedin: "https://www.linkedin.com/in/naga-syamala-chintapalli-0507122bb/",
                  github: "https://github.com/Syamala4747",
                  avatar: img3,
                  experience: "1+ years"
                },
                {
                  name: "Teressa borra",
                  role: "Full Stack Developer",
                  email: "teressaborra@gmail.com",
                  linkedin: "http://www.linkedin.com/in/teressa-borra",
                  github: "https://github.com/teressaborra",
                  avatar: img2,
                  experience: "1+ years"
                },
                {
                  name: "Ramtej Telagarapu",
                  role: "Full Stack Developer",
                  email: "vignaramtej46@gmail.com",
                  linkedin: "https://linkedin.com/in/vignaramtej",
                  github: "https://github.com/ramtejvigna",
                  avatar: img4,
                  experience: "2+ years"
                },
                 {
                  name: "Avinasha Ryali",
                  role: "Full Stack Developer",
                  email: "ssriavinasha5599@gmail.com",
                  linkedin: "https://www.linkedin.com/in/tejassriavinasha/",
                  github: "https://github.com/tejassriavinasha",
                  avatar: img5,
                  experience: "2+ years"
                },
                
              ].map((dev, index) => (
                <motion.div
                  key={index}
                  className="group relative flex items-center gap-4 rounded-xl border p-4 hover:shadow-md transition-all duration-300 justify-items-center"
                  style={{
                    backgroundColor: themeColors.cardBgSecondary,
                    borderColor: themeColors.border,
                    height: "100px", // keeps under 200px
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm">
                      <img
                        src={dev.avatar}
                        alt={dev.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-hidden">
                    <h4
                      className="font-semibold text-lg mb-1 truncate"
                      style={{ color: themeColors.text }}
                    >
                      {dev.name}
                    </h4>
                    <p className="text-sm text-blue-600 font-medium mb-2">{dev.role}</p>

                    <div className="flex gap-3" style={{ marginTop: '-5px' }}>

                      <p className="text-xs text-gray-500 mb-3">{dev.experience} experience</p>

                      {/* Social Links */}
                      <div className="flex gap-3">
                        <a
                          href={`mailto:${dev.email}`}
                          className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <a
                          href={dev.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
                        >
                          <LinkedinIcon className="w-4 h-4" />
                        </a>
                        <a
                          href={dev.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                        >

                          <GithubIcon className="w-4 h-4" />

                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

              ))}
            </div>
          </div> */}

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto ">
          <h2
            className="text-4xl md:text-5xl font-black text-center mb-12"
            style={{ color: themeColors.text }}
          >
            Frequently Asked Questions
          </h2>
          <Accordion>
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger themeColors={themeColors}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent themeColors={themeColors}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>



      {/* Footer - Super Simple */}
      <footer
        className="py-12 px-4 border-t "
        style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <div className="max-w-6xl mx-auto " >
          {/* Developers Section */}
          

          {/* Footer Bottom */}
          <div className="border-t pt-8" style={{ borderColor: themeColors.border }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Brand */}
              <div className="text-lg font-bold" style={{ color: themeColors.text }}>
                VEDIC VISION<span style={{ color: themeColors.accent }}> 2K25</span>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3">
                {[
                  { icon: Instagram, href: "#" },
                  { icon: LinkedinIcon, href: "#" },
                  { icon: Mail, href: "mailto:contact@vedicvision.com" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="p-2 rounded-full hover:opacity-70 transition-opacity"
                    style={{ color: themeColors.textSecondary }}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Copyright */}
              <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                © 2025 All rights reserved
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
// Custom Accordion Components for FAQ
function Accordion({ children }) {
  return <div className="space-y-4">{children}</div>;
}

function AccordionItem({ children, value }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-value={value} >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
}

function AccordionTrigger({ children, className = "", isOpen, setIsOpen, themeColors }) {
  return (
    <button
      className={`w-full text-left font-black text-lg px-8 py-6 flex items-center justify-between hover:opacity-80 transition-colors ${className}`}
      style={{
        color: themeColors.text,
        backgroundColor: themeColors.cardBgSecondary,
        borderRadius: 50
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span>{children}</span>
      <ChevronDown
        className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
          }`}
        style={{ color: themeColors.text }}
      />
    </button>
  );
}

function AccordionContent({ children, className = "", isOpen, themeColors }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
    >
      <div
        className={`px-8 pb-6 font-semibold ${className}`}
        style={{ color: themeColors.textSecondary }}
      >
        {children}
      </div>
    </div>
  );
}

// FAQ data
const faqData = [
  {
    question: "What is Vedic Vision 2K25?",
    answer: "Vedic Vision 2K25 is a comprehensive 10-day coding bootcamp followed by a 2-day hackathon. It's designed to transform beginners into skilled developers through hands-on learning, expert mentorship, and real-world project building."
  },

  {
    question: "What technologies will be covered?",
    answer: "We'll cover frontend basics, React, backend development, API building, database integration, authentication & security, and full-stack development. You'll also work on AI/ML, Web3, HealthTech, Mobile Apps, Web Dev, and IoT tracks."
  },
  {
    question: "Do I need to bring my own laptop?",
    answer: "Yes, participants are required to bring their own laptops with basic development tools installed. We'll provide a setup guide before the event starts."
  },
  {
    question: "What's included in the registration fee?",
    answer: "Registration includes access to all workshops, mentorship sessions, meals during the event, swags, certificates, and eligibility for prizes worth ₹35,000+."
  },
  {
    question: "How are teams formed for the hackathon?",
    answer: "Team formation happens on Day 10 of the bootcamp. You can form teams of 5-6 members. If you don't have a team, we'll help you find teammates based on your interests and skills."
  },
  {
    question: "What are the judging criteria?",
    answer: "Projects will be judged based on innovation, technical implementation, user experience, presentation, and potential impact. Our panel includes industry experts and experienced developers."
  },
  {
    question: "Are there any prerequisites?",
    answer: "No specific prerequisites are required. Basic computer literacy and enthusiasm to learn are all you need. We'll start from the fundamentals and build up gradually."
  }
];

// Rewards data
const rewards = [
  {
    title: "Cash Prizes",
    description: "₹35,000 total prize pool",
    icon: "💰",
  },
  {
    title: "Certificates",
    description: "Digital certificates for all participants",
    icon: "🏆",
  },
  {
    title: "Swags & Goodies",
    description: "T-shirts, stickers, and tech goodies",
    icon: "🎁",
  },
  {
    title: "Mentorship",
    description: "Guidance from industry experts",
    icon: "🎯",
  },
  {
    title: "Networking",
    description: "Connect with like-minded developers",
    icon: "🤝",
  },
];

