"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Users,
  Zap,
  MapPin,
  Mail,
  Phone,
  Instagram,
  Linkedin,
  MessageCircle,
  Rocket,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";


// Countdown Timer Component
function CountdownTimer({ targetDate }) {
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
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
                <div className="rounded-2xl border-2 border-gray-500 p-6 shadow-lg">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#e0e0e0' }}>
            Hackathon starts in
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="text-center">
              <div className="bg-[#272757] text-white rounded-xl p-3 border border-gray-300">
                <div className="text-3xl font-bold" style={{ color: '#e0e0e0' }}>
                  {value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs uppercase font-semibold" style={{ color: '#e0e0e0' }}>{unit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}

// Custom Badge Component
function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${className}`}
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
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default:
      "bg-red-600 hover:bg-blue-700 text-white border-2 border-gray-500 shadow-lg hover:shadow-md focus:ring-blue-500",
    outline:
      "bg-transparent border-2 text-current hover:bg-current hover:text-white focus:ring-blue-500",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg",
    default: "px-4 py-2 rounded-lg",
    lg: "px-8 py-4 text-lg rounded-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Custom Accordion Component
function Accordion({ children }) {
  return <div className="space-y-4">{children}</div>;
}

function AccordionItem({ children, value }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-value={value}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
}

function AccordionTrigger({ children, className = "", isOpen, setIsOpen }) {
  return (
    <button
      className={`w-full text-left font-black text-lg px-8 py-6 text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span>{children}</span>
      <ChevronDown
        className={`w-5 h-5 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

function AccordionContent({ children, className = "", isOpen }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-200 ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className={`px-8 pb-6 text-gray-600 font-semibold ${className}`}>
        {children}
      </div>
    </div>
  );
}

const tracks = [
  { icon: "🧠", title: "AI/ML", description: "Artificial Intelligence and Machine Learning solutions" },
  { icon: "🌐", title: "Web3", description: "Blockchain and decentralized applications" },
  { icon: "❤️", title: "HealthTech", description: "Healthcare and medical technology innovations" },
  { icon: "📱", title: "Mobile Apps", description: "iOS and Android application development" },
  { icon: "💻", title: "Web Dev", description: "Full-stack web applications and platforms" },
  { icon: "⚡", title: "IoT", description: "Internet of Things and embedded systems" },
];

const timelineData = [
  { date: "Aug 4", title: "Day 1", description: "Kickoff + Intro", icon: "🎉" },
  { date: "Aug 5", title: "Day 2", description: "Frontend Basics", icon: "🖥️" },
  { date: "Aug 6", title: "Day 3", description: "React Crash Course", icon: "⚛️" },
  { date: "Aug 7", title: "Day 4", description: "Backend Intro", icon: "🔧" },
  { date: "Aug 8", title: "Day 5", description: "API Building", icon: "🌐" },
  { date: "Aug 9", title: "Day 6", description: "Database Integration", icon: "🗃️" },
  { date: "Aug 10", title: "Day 7", description: "Auth & Security", icon: "🔐" },
  { date: "Aug 11", title: "Day 8", description: "Full-stack Demo", icon: "🧪" },
  { date: "Aug 12", title: "Day 9", description: "Mini Project", icon: "📱" },
  { date: "Aug 13", title: "Day 10", description: "Team Formation", icon: "👥" },
  { date: "Aug 14", title: "Hackathon Day 1", description: "Coding Marathon Begins", icon: "⚡" },
  { date: "Aug 15", title: "Hackathon Day 2", description: "Submissions & Awards", icon: "🏆" },
];

const rewards = [
  {
    title: "Cash Prizes",
    description: "₹50,000 total prize pool",
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
    title: "Job Opportunities",
    description: "Direct recruitment opportunities",
    icon: "💼",
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

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const hackathonDate = new Date("2024-03-15T09:00:00");

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: "#000000ff" }}>
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-gray-500 sticky top-4 z-50">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-2xl font-black text-gray-200">
                  VEDIC VISION<span className="text-blue-600">&nbsp;2K25</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="#about"
                  className="font-semibold text-gray-200 hover:text-blue-600 transition-colors"
                  style={{ color: '#e0e0e0' }}
                >
                  About
                </a>
                <a
                  href="#tracks"
                  className="font-semibold text-gray-200 hover:text-blue-600 transition-colors"
                  style={{ color: '#e0e0e0' }}
                >
                  Tracks
                </a>
                <a
                  href="#timeline"
                  className="font-semibold text-gray-200 hover:text-blue-600 transition-colors"
                  style={{ color: '#e0e0e0' }}
                >
                  Timeline
                </a>
                <a
                  href="#rewards"
                  className="font-semibold text-gray-200 hover:text-blue-600 transition-colors"
                  style={{ color: '#e0e0e0' }}
                >
                  Rewards
                </a>
                <a
                  href="/photo-booth"
                  className="font-semibold text-gray-200 hover:text-blue-600 transition-colors"
                  style={{ color: '#e0e0e0' }}
                >
                  Photo Booth
                </a>

                <Button
                  onClick={() => window.open("/register", "_blank")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg border-2 border-gray-500 shadow-lg hover:shadow-md transition-all"
                >
                  Register Now 🎯
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md bg-white border-2 border-gray-500"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
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
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border-2 border-gray-500">
            <div className="px-8 py-6 space-y-2">
              <a
                href="#about"
                className="block px-3 py-2 font-semibold"
                style={{ color: '#e0e0e0' }}
              >
                About
              </a>
              <a
                href="#tracks"
                className="block px-3 py-2 font-semibold"
                style={{ color: '#e0e0e0' }}
              >
                Tracks
              </a>
              <a
                href="#timeline"
                className="block px-3 py-2 font-semibold"
                style={{ color: '#e0e0e0' }}
              >
                Timeline
              </a>
              <a
                href="#rewards"
                className="block px-3 py-2 font-semibold"
                style={{ color: '#e0e0e0' }}
              >
                Rewards
              </a>
              <a
                href="/photo-booth"
                className="block px-3 py-2 font-semibold"
                style={{ color: '#e0e0e0' }}
              >
                Photo Booth
              </a>
              <div className="px-3 py-2">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  Register Now 🎯
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Main Hero Card */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border-2 border-gray-500 p-8 shadow-lg h-full">
                <Badge className="mb-4 bg-white text-gray-900 font-bold px-4 py-2 border-2 border-gray-500">
                  March 10-16, 2024 📅
                </Badge>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight" style={{ color: '#e0e0e0' }}>
                  Join us for
                  <br />
                  <span style={{ color: '#e0e0e0' }}>
                    wonder of
                    <br />
                    wonders
                  </span>
                  <br />
                  <span className="text-3xl sm:text-4xl lg:text-5xl" style={{ color: '#e0e0e0' }}>
                    of coding
                  </span>
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl font-semibold" style={{ color: '#e0e0e0' }}>
                  Transform from a random coder into a strategic innovation
                  artist! Build anonymous projects, calculate impact, all while
                  maintaining your reputation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-4 text-lg rounded-lg border-2 border-gray-500 shadow-lg hover:shadow-md transition-all"
                  >
                    get tickets 🎫
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-black px-8 py-4 text-lg rounded-lg"
                  >
                    Learn More ➡️
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side Cards */}
            <div className="lg:col-span-4 space-y-6">
              <CountdownTimer targetDate={hackathonDate} />

              {/* Swag and Prize Pool Cards Side by Side */}
              <div className="flex gap-4">
                {/* Swag Card */}
                <div className="bg-[#272757] rounded-2xl border-2 border-gray-500 p-6 shadow-lg flex-[3]">
                  <h3 className="text-2xl font-black mb-4" style={{ color: '#e0e0e0' }}>
                    Bag your swags 🎒
                  </h3>
                  <div className="rounded-xl p-4 mb-4">
                    <div className="w-16 h-20 rounded-lg mx-auto"></div>
                  </div>
                  <p className="font-bold" style={{ color: '#e0e0e0' }}>
                    Amazing swags waiting for you!
                  </p>
                </div>

                {/* Prize Pool Card */}
                <div className="bg-[#8686AC] rounded-2xl border-2 border-red-100 p-6 shadow-lg flex-[1]">
                  <h3 className="text-lg font-black mb-2" style={{ color: '#e0e0e0' }}>
                    PRIZE POOL
                  </h3>
                  <div className="text-4xl font-black" style={{ color: '#e0e0e0' }}>₹30,000</div>
                </div>
              </div>

                              <div className="bg-orange-500 rounded-2xl border-2 border-gray-500 p-6 shadow-lg">
                <h3 className="text-lg font-black mb-2" style={{ color: '#e0e0e0' }}>
                  PRIZE POOL
                </h3>
                <div className="text-4xl font-black" style={{ color: '#e0e0e0' }}>₹30,000</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8 px-4 sm:px-26 lg:px-18">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Mission Card */}
            <div
              className="rounded-2xl border-2 border-red-100 p-5 shadow-lg flex flex-col justify-between"
              style={{ minHeight: "309px" }}
            >
              <div
                className="font-bold text-sm mb-2 rounded-2xl border-2 border-gray-500 inline-block"
                style={{ width: 110, color: '#e0e0e0' }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MISSION
              </div>
              <div
                className="font-black"
                style={{ fontSize: "3.5rem", lineHeight: "1.1", color: '#e0e0e0' }}
              >
                <span>Learn</span>
                <br />
                <span>Connect</span>
                <br />
                <span>Grow</span>.
              </div>
            </div>
            {/* 2x2 Small Stats */}
            <div className="col-span-1 md:col-span-1 flex flex-col h-[309px]">
                              <div className="flex flex-1 gap-6 mb-3">
                  <div className=" rounded-2xl border-2 border-gray-500 p-6 shadow-lg text-center flex-1 flex flex-col justify-center">
                  <div className="text-4xl font-black" style={{ color: '#e0e0e0' }}>6+</div>
                  <div className="font-bold text-sm" style={{ color: '#e0e0e0' }}>
                    Flagship Events
                  </div>
                </div>
                <div className=" rounded-2xl border-2 border-gray-500 p-6 shadow-lg text-center flex-1 flex flex-col justify-center">
                  <div className="text-4xl font-black" style={{ color: '#e0e0e0' }}>800+</div>
                  <div className="font-bold text-sm" style={{ color: '#e0e0e0' }}>
                    Participants
                  </div>
                </div>
              </div>
              <div className="flex flex-1 gap-6">
                <div className=" rounded-2xl border-2 border-gray-500 p-6 shadow-lg text-center flex-1 flex flex-col justify-center">
                  <div className="text-4xl font-black" style={{ color: '#e0e0e0' }}>10</div>
                  <div className="font-bold text-sm" style={{ color: '#e0e0e0' }}>Days</div>
                </div>
                <div className=" rounded-2xl border-2 border-gray-500 p-6 shadow-lg text-center flex-1 flex flex-col justify-center">
                  <div className="text-4xl font-black" style={{ color: '#e0e0e0' }}>TBA</div>
                  <div className="font-bold text-sm" style={{ color: '#e0e0e0' }}>
                    Workshops
                  </div>
                </div>
              </div>
            </div>

            <div
              className=" rounded-2xl border-2 border-gray-500 p-5 shadow-lg flex flex-col justify-between"
              style={{ minHeight: "309px", width: "630px" }}
            >
              {/* //image */}
            </div>
          </div>
        </div>
      </section>
      
      
      <section className="bg-black text-white py-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black mb-12 text-center" style={{ color: '#e0e0e0' }}>Choose Your Track</h2>

        <div
          className={`flex flex-row transition-all duration-300 ${
            selectedIndex !== null ? "items-start gap-10" : "justify-center"
          }`}
        >
          {/* Left Side – Cards */}
          <div
            className={`grid ${
              selectedIndex !== null ? "grid-cols-3 grid-rows-2 gap-4" : "grid-cols-6 gap-6"
            } transition-all duration-300`}
          >
            {tracks.map((track, index) => (
              <div
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`bg-[#1c1c1c] border border-gray-700 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 
                ${
                  selectedIndex !== null
                    ? "w-24 h-24 text-xs"
                    : "w-40 h-40 text-base"
                } flex flex-col items-center justify-center hover:bg-gray-800 ${
                  selectedIndex === index ? "ring-2 ring-red-500" : ""
                }`}
              >
                <div className="text-xl mb-1">{track.icon}</div>
                <div className="font-bold">{track.title}</div>
              </div>
            ))}
          </div>

          {/* Right Side – Description Panel */}
          {selectedIndex !== null && (
            <div className="flex-1 bg-gray-900 p-8 rounded-xl shadow-md max-w-lg h-[180px] transition-opacity duration-300" style={{ width: '100%', maxWidth: 'none' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#e0e0e0' }}>{tracks[selectedIndex].title}</h3>
              <p className="text-gray-300 text-lg leading-relaxed" style={{ color: '#e0e0e0' }}>
                {tracks[selectedIndex].description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>

      {/* Benefits Box Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="w-full px-8 border-2 border-gray-500 py-12 rounded-2xl" style={{ backgroundColor: "#000000ff" }}>
            <h4 className="px-8 py-2 border-2 border-gray-500 w-max rounded-full mb-3 text-sm" style={{ color: '#e0e0e0' }}>benefits</h4>
            <div className="ml-3">
              <h1 className="text-2xl font-bold mb-4" style={{ color: '#e0e0e0' }}>What's in it for me?</h1>
              <p className="text-base mb-6 max-w-[48ch]" style={{ color: '#e0e0e0' }}>We have something for everyone this WoW, whether you are a budding entrepreneur or a passionate developer.<br/>We got you all cover! Join us for the biggest bash of the year.</p>
              <h2 className="text-xl font-semibold mt-8 mb-4" style={{ color: '#e0e0e0' }}>I want to</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <div className="h-full rounded-xl overflow-hidden shadow group cursor-pointer">
                  <div className="relative h-48">
                    <img alt="learn tech from the experts" loading="lazy" className="w-full h-full object-cover rounded-xl" src="https://www.gitam.edu/sites/default/files/banners/know-gitam_0.jpg" />
                    <div className="absolute top-[-1px] right-[-1px] p-3 rounded-bl-2xl" style={{ backgroundColor: "#000000ff" }}>
                      <div className="text-white text-center px-6 py-2 rounded-lg text-[12px]" style={{ backgroundColor: "rgb(23, 78, 166)", width: "140px" }}>
                        <p>learn tech from the experts</p>
                      </div>
                    </div>
                    <div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 rounded-bl-xl hidden group-hover:block" style={{ backgroundColor: "rgb(23, 78, 166)", opacity: 0.92 }}>
                        <p className="text-white mb-2 text-sm">• Exposure to Industry Experts & Technologies, Discover new career opportunities, new skills, professional contacts</p>
                        <p className="text-white mb-2 text-sm">• Hands-on Hackathon Experience to Boost Practical Skills, Learn how to work in a team.</p>
                        <p className="text-white mb-2 text-sm">• Networking Opportunities with Peers and Professionals</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-full rounded-xl overflow-hidden shadow group cursor-pointer">
                  <div className="relative h-48">
                    <img alt="build a startup" loading="lazy" className="w-full h-full object-cover rounded-xl" src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/220304_GGstartups_interior_4350.width-1300.jpg" />
                    <div className="absolute top-[-1px] right-[-1px] p-3 rounded-bl-2xl" style={{ backgroundColor: "#000000ff" }}>
                      <div className="text-white text-center px-6 py-2 rounded-lg text-[12px]" style={{ backgroundColor: "rgb(13, 101, 45)", width: "140px" }}>
                        <p>build a startup</p>
                      </div>
                    </div>
                    <div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 rounded-bl-xl hidden group-hover:block" style={{ backgroundColor: "rgb(13, 101, 45)", opacity: 0.92 }}>
                        <p className="text-white mb-2 text-sm">• Connect with Potential Collaborators and Mentors</p>
                        <p className="text-white mb-2 text-sm">• Gain Insights from Industry Leaders through Panel Discussions, Learn business tips from successful people.</p>
                        <p className="text-white mb-2 text-sm">• Showcase Startup Ideas and Explore Partnership Avenues</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-full rounded-xl overflow-hidden shadow group cursor-pointer">
                  <div className="relative h-48">
                    <img alt="build a career in Tech" loading="lazy" className="w-full h-full object-cover rounded-xl" src="https://heinzegers.com/wp-content/uploads/2017/08/Visiting-Google-1024x576.jpg" />
                    <div className="absolute top-[-1px] right-[-1px] p-3 rounded-bl-2xl" style={{ backgroundColor: "#000000ff" }}>
                      <div className="text-white text-center px-6 py-2 rounded-lg text-[12px]" style={{ backgroundColor: "rgb(176, 96, 0)", width: "140px" }}>
                        <p>build a career in Tech</p>
                      </div>
                    </div>
                    <div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 rounded-bl-xl hidden group-hover:block" style={{ backgroundColor: "rgb(176, 96, 0)", opacity: 0.92 }}>
                        <p className="text-white mb-2 text-sm">• Brand Visibility through Sponsorships and Talks</p>
                        <p className="text-white mb-2 text-sm">• Engage with Young Tech Talent, Connect with other companies and startups, business connections, collaborations</p>
                        <p className="text-white mb-2 text-sm">• Opportunities to Collaborate on Innovative Projects & Hackathon Solutions, Support student innovation through sponsorship.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-full rounded-xl overflow-hidden shadow group cursor-pointer">
                  <div className="relative h-48">
                    <img alt="be a freelancer" loading="lazy" className="w-full h-full object-cover rounded-xl" src="https://images.businessnewsdaily.com/app/uploads/2022/04/04072326/freelancer_Prostock-Studio_getty.jpg" />
                    <div className="absolute top-[-1px] right-[-1px] p-3 rounded-bl-2xl" style={{ backgroundColor: "#000000ff" }}>
                      <div className="text-white text-center px-6 py-2 rounded-lg text-[12px]" style={{ backgroundColor: "rgb(179, 20, 18)", width: "140px" }}>
                        <p>be a freelancer</p>
                      </div>
                    </div>
                    <div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 rounded-bl-xl hidden group-hover:block" style={{ backgroundColor: "rgb(179, 20, 18)", opacity: 0.92 }}>
                        <p className="text-white mb-2 text-sm">• Explore the talks and workshops to understand where and when to make your next step.</p>
                        <p className="text-white mb-2 text-sm">• Build a network of like minded people that can help you reach the next level.</p>
                        <p className="text-white mb-2 text-sm">• Ask and get the best practices from the amazing line-up of speakers to reach the correct clients and companies.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Timeline Section */}
      <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-black text-white mb-12" style={{ color: '#e0e0e0' }}>
          Your Bootcamp Journey 🚌
        </h2>
        <div className="relative space-y-20">
          {timelineData.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div 
                key={index} 
                className={`flex ${isLeft ? "justify-start" : "justify-end"} relative`}
                initial={{ opacity: 0, y: 50, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Connecting Line */}
                {index < timelineData.length - 1 && (
                  <motion.div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full border-l-2 border-dashed border-indigo-400 z-0"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    transition={{ duration: 1, delay: index * 0.3 }}
                    viewport={{ once: true }}
                  />
                )}

                <motion.div 
                  className="relative z-10 w-[90%] md:w-[45%] bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-xl shadow-md text-white"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <motion.span 
                      className="text-2xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {item.icon}
                    </motion.span>
                    <span className="text-sm font-bold text-indigo-300 uppercase" style={{ color: '#e0e0e0' }}>{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#e0e0e0' }}>{item.title}</h3>
                  <p className="text-gray-300" style={{ color: '#e0e0e0' }}>{item.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>


      {/* Rewards Section */}
     <section id="rewards" className="py-20 px-4 sm:px-6 lg:px-8  overflow-hidden relative">
      {/* Background falling coins animation (CSS-based optional enhancement) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="animate-[falling_15s_linear_infinite] text-4xl opacity-20">💸</div>
        <div className="absolute top-1/3 left-1/4 animate-[falling_12s_linear_infinite] text-5xl opacity-10">🪙</div>
        <div className="absolute top-2/3 left-3/4 animate-[falling_20s_linear_infinite] text-3xl opacity-10">💰</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4 text-yellow-900 drop-shadow-lg">
            Perks & Rewards 🎁
          </h2>
          <p className="text-xl text-gray-700 font-medium">
            Amazing prizes and opportunities await you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {rewards.map((reward, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.7, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border-yellow-200 border-2 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden"
            >

              <h3 className="text-2xl font-black mb-3 text-gray-200">
                {reward.title}
              </h3>
              <p className="text-gray-300 font-semibold">{reward.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Grand Prize */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white rounded-3xl p-10 shadow-2xl text-center max-w-2xl mx-auto"
        >
          <div className="text-6xl mb-4 drop-shadow-lg animate-pulse">🏆</div>
          <h3 className="text-4xl font-extrabold mb-4">
            GRAND PRIZE
          </h3>
          <p className="text-2xl font-bold">
            ₹25,000 + Direct Interview + 1-Year Mentorship
          </p>
        </motion.div>
      </div>

      {/* Falling coin animation keyframes */}
      <style jsx>{`
        @keyframes falling {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </section>



      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4 text-gray-900">FAQ 🤔</h2>
            <p className="text-xl text-gray-600 font-semibold">
              Got questions? We've got answers.
            </p>
          </div>
          <Accordion>
            {[
              {
                question: "How do I register for the event?",
                answer:
                  "Click the register button and fill out the registration form. Registration is free and open to all eligible participants.",
              },
              {
                question: "What is the team size limit?",
                answer:
                  "Teams can have 2-4 members. You can register individually and find teammates during the team formation phase.",
              },
              {
                question: "Is this event online or offline?",
                answer:
                  "The bootcamp will be conducted online, while the hackathon will be a hybrid event with both online and offline participation options.",
              },
              {
                question: "What should I bring to the hackathon?",
                answer:
                  "Bring your laptop, chargers, and any hardware you might need for your project. We'll provide internet, food, and workspace.",
              },
              {
                question: "Are there any prerequisites?",
                answer:
                  "Basic programming knowledge is recommended. The bootcamp will cover essential concepts before the hackathon begins.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-gray-500 shadow-lg"
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <a className="hover:text-[#1a73e8] font-medium transition-colors" href="/#">VEDIC VISION 2K25</a>
            <a className="hover:text-[#1a73e8] font-medium transition-colors" href="/agenda">Agenda</a>
            <a className="hover:text-[#1a73e8] font-medium transition-colors" href="/faq">FAQ</a>
            <a className="hover:text-[#1a73e8] font-medium transition-colors" href="/terms-conditions">Terms & Conditions</a>
            <a className="hover:text-[#1a73e8] font-medium transition-colors" href="/privacy-policy">Privacy Policy</a>
            <a className="hover:text-[#1a73e8] font-medium transition-colors" href="/coc">Community Guidelines</a>
          </div>
          <div className="border-t border-gray-500 pt-6 text-center">
            <p className="text-gray-400 font-semibold" style={{ color: '#e0e0e0' }}>
              &copy; 2024 VEDIC VISION 2K25. All rights reserved. Made with ❤️ for the
              developer community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
