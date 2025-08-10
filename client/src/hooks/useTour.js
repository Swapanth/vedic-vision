import { useState, useEffect } from "react";

export const useTour = (tourKey, steps = []) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user has completed this tour
    const completed =
      localStorage.getItem(`tour_completed_${tourKey}`) === "true";
    setHasCompletedTour(completed);
  }, [tourKey]);

  const startTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  const completeTour = () => {
    localStorage.setItem(`tour_completed_${tourKey}`, "true");
    setHasCompletedTour(true);
    setIsTourOpen(false);
  };

  const resetTour = () => {
    localStorage.removeItem(`tour_completed_${tourKey}`);
    setHasCompletedTour(false);
  };

  return {
    isTourOpen,
    hasCompletedTour,
    startTour,
    closeTour,
    completeTour,
    resetTour,
  };
};

// Single comprehensive tour that covers all views
export const tourSteps = {
  complete: [
    // === HOME DASHBOARD SECTION ===
    {
      target: '[data-tour="summary-cards"]',
      title: "Welcome to Your Hackathon Dashboard! 🎉",
      content:
        "Let's take a complete tour of the platform! These cards show your key metrics: active tasks, attendance rate, pending submissions, and completed tasks. Keep an eye on these to track your progress!",
      section: "home",
    },
    {
      target: '[data-tour="attendance-calendar"]',
      title: "Attendance Calendar 📅",
      content:
        "Track your daily attendance here. Green dots show days you were present. Maintaining good attendance is crucial for your hackathon success!",
      section: "home",
    },
    {
      target: '[data-tour="participant-overview"]',
      title: "Your Performance Overview 🏆",
      content:
        'This comprehensive card shows your total score, current rank, achievement badges, progress bars, and daily tips. Click the "Details" button to see your complete score breakdown!',
      section: "home",
    },
    {
      target: '[data-tour="score-details-btn"]',
      title: "Score Details Button 📊",
      content:
        "Click this button anytime to see exactly how your score is calculated. It breaks down your attendance points (10 per day) and task completion scores!",
      section: "home",
    },
    {
      target: '[data-tour="mentor-team-section"]',
      title: "Mentor 👥",
      content:
        "Here you can see your assigned mentor . Please feel free to reach to them!",
      section: "home",
    },
    {
      target: '[data-tour="team-formation"]',
      title: "Team Formation 🚀",
      content:
        "Here we can create a new team or join an existing one. Teams can have up to 6 members and work together on problem statements!",
      section: "home",
    },
    {
      target: '[data-tour="active-tasks-card"]',
      title: "Your Active Tasks 📋",
      content:
        "This shows how many tasks you currently have to complete. Now let's explore the Tasks section to see how to manage your daily assignments!",
      section: "home",
      navigationHint:
        'Next, we\'ll explore the Tasks section. Please click on the "Tasks" tab to continue the tour.',
    },

    // === TASKS SECTION ===
    {
      target: '[data-tour="day-selector"]',
      title: "Daily Task Navigation 📅",
      content:
        "Welcome to the Tasks section! Select different days to view your tasks. The hackathon runs for 12 days - 10 bootcamp days (Aug 4-13) and 2 hackathon days (Aug 14-15). Each day has specific tasks to complete.",
      section: "tasks",
    },
    {
      target: '[data-tour="tasks-list"]',
      title: "Your Daily Tasks 📋",
      content:
        "Here are your tasks for the selected day. Each task shows its status: Not Submitted (gray), Under Review (orange), or Completed (green). Complete tasks to earn points and climb the leaderboard!",
      section: "tasks",
      navigationHint:
        'Next, let\'s explore Problem Statements where you can form teams. Please click on the "Problem Statements" tab to continue.',
    },

    // === PROBLEM STATEMENTS SECTION ===
    {
      target: '[data-tour="custom-problem-section"]',
      title: "Create Custom Problems 💡",
      content:
        "Welcome to Problem Statements! Can't find the perfect problem? Create your own custom problem statement that only you can use. This gives you complete creative freedom!",
      section: "problemStatements",
    },

    {
      target: '[data-tour="filter-section"]',
      title: "Filter by Domain 🔍",
      content:
        "Use these domain filters to find problems that match your interests: Health, Sports, Agriculture, Yoga, Education, and Technology. Each domain has its own icon for easy identification!",
      section: "problemStatements",
    },

    {
      target: '[data-tour="problem-list"]',
      title: "Problem Statements 📋",
      content:
        'Browse through available problems here. Each shows the team selection count (max 4 teams per problem). Problems marked as "FULL" cannot be selected anymore!',
      section: "problemStatements",
    },

    {
      target: '[data-tour="select-problem-btn"]',
      title: "Select Problem Button ✅",
      content:
        "Click this button to select a problem for your team. This will open the team creation modal where you can form your team around this specific problem!",
      section: "problemStatements",
    },
    {
      target: '[data-tour="technology-tags"]',
      title: "Technology Suggestions 💻",
      content:
        "These tags show the recommended technologies for each problem. Use them as guidance for what skills your team might need or what you'll be working with!",
      section: "problemStatements",
    },
    {
      target: '[data-tour="completed-tasks-card"]',
      title: "Tour Complete! 🎉",
      content:
        "Congratulations! You've completed the full platform tour. You now know how to track your progress, complete tasks, and form teams. Good luck with your hackathon journey!",
      section: "home",
      navigationHint:
        'Feel free to click on the "Home" tab to return to your dashboard and start your hackathon journey!',
    },
  ],
};

export default useTour;
