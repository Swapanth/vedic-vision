import React from "react";
import { motion } from "framer-motion";
import { Mail, LinkedinIcon } from "lucide-react";

const DeveloperCards = ({ themeColors }) => {
  const developers = [
    {
      name: "Swapanth Vakapalli",
      role: "Full Stack Developer",
      email: "swapanthvakapalli@gmail.com",
      linkedin: "https://linkedin.com/in/swapanth-vakapalli",
      github: "https://github.com/swapanth",
      avatar: "SV",
      skills: ["React", "Node.js", "MongoDB"],
      experience: "3+ years"
    },
    {
      name: "Sai Kiran",
      role: "Frontend Developer",
      email: "saikiran@gmail.com",
      linkedin: "https://linkedin.com/in/saikiran",
      github: "https://github.com/saikiran",
      avatar: "SK",
      skills: ["React", "TypeScript", "CSS"],
      experience: "2+ years"
    },
    {
      name: "Rahul Sharma",
      role: "Backend Developer",
      email: "rahul@gmail.com",
      linkedin: "https://linkedin.com/in/rahul",
      github: "https://github.com/rahul",
      avatar: "RS",
      skills: ["Python", "Django", "PostgreSQL"],
      experience: "4+ years"
    }
  ];

  return (
    <div className="mb-8">
      <h3 
        className="text-2xl font-bold text-center mb-6" 
        style={{ color: themeColors.text }}
      >
        Meet the Developers
      </h3>
      
      <div className="space-y-3">
        {developers.map((dev, index) => (
          <motion.div
            key={index}
            className="group relative rounded-lg border-2 p-3 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            style={{
              backgroundColor: themeColors.cardBgSecondary,
              borderColor: themeColors.border,
              maxHeight: "80px"
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ x: 5, scale: 1.01 }}
          >
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex items-center space-x-4 relative z-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <span className="text-white text-sm font-bold">{dev.avatar}</span>
                </div>
              </div>
              
              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 
                    className="font-bold text-lg group-hover:text-blue-600 transition-colors duration-300 truncate" 
                    style={{ color: themeColors.text }}
                  >
                    {dev.name}
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium flex-shrink-0">
                    {dev.role}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                    {dev.experience}
                  </span>
                  
                  {/* Skills */}
                  <div className="flex space-x-1">
                    {dev.skills.slice(0, 3).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <a
                  href={`mailto:${dev.email}`}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all duration-200 shadow-sm"
                  title="Email"
                >
                  <Mail className="w-3 h-3" />
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 transition-all duration-200 shadow-sm"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-3 h-3" />
                </a>
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-110 transition-all duration-200 shadow-sm"
                  title="GitHub"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperCards;