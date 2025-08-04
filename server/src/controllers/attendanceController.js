import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// Mark attendance (Participants)
export const markAttendance = async (req, res) => {
  try {
    const {
      date,
      session = "full-day",
      status = "present",
      remarks,
    } = req.body;

    // Check if attendance already exists for this date and session
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: new Date(date),
      session,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this session",
      });
    }

    const attendance = new Attendance({
      userId: req.user._id,
      date: new Date(date),
      session,
      status,
      remarks,
      markedBy: req.user._id, // Self-marked attendance
    });

    await attendance.save();
    await attendance.populate("userId", "name email");

    // Update user's total score to include attendance points
    const user = await User.findById(req.user._id);
    await user.updateTotalScore();

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: { attendance },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};

// Mark attendance for a single user (Mentor and Admin)
export const markAttendanceForSingleUser = async (req, res) => {
  try {
    const {
      userId,
      date,
      session = "full-day",
      status = "present",
      remarks,
    } = req.body;

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: "User ID and date are required",
      });
    }

    // If user is a mentor, check if they can mark attendance for this participant
    if (req.user.role === "mentor") {
      const mentor = await User.findById(req.user._id).populate(
        "assignedParticipants"
      );
      const canMark = mentor.assignedParticipants.some(
        (p) => p._id.toString() === userId
      );

      if (!canMark) {
        return res.status(403).json({
          success: false,
          message:
            "You can only mark attendance for your assigned participants",
        });
      }
    }

    // Check if attendance already exists for this date and session
    let attendance = await Attendance.findOne({
      userId,
      date: new Date(date),
      session,
    });

    if (attendance) {
      // Update existing attendance record
      attendance.status = status;
      attendance.remarks = remarks;
      attendance.markedBy = req.user._id;
      attendance.markedAt = new Date();
      await attendance.save();
      await attendance.populate("userId", "name email");
    } else {
      // Create new attendance record
      attendance = new Attendance({
        userId,
        date: new Date(date),
        session,
        status,
        remarks,
        markedBy: req.user._id,
      });

      await attendance.save();
      await attendance.populate("userId", "name email");
    }

    // Update user's total score to include attendance points
    const user = await User.findById(userId);
    await user.updateTotalScore();

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: { attendance },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message,
    });
  }
};

// Mark attendance for multiple users (Admin and Mentor)
export const markAttendanceForUsers = async (req, res) => {
  try {
    const { date, session = "full-day", attendees } = req.body;

    if (
      !date ||
      !attendees ||
      !Array.isArray(attendees) ||
      attendees.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Date and attendees array are required",
      });
    }

    // If user is a mentor, get their assigned participants
    let allowedParticipantIds = null;
    if (req.user.role === "mentor") {
      const mentor = await User.findById(req.user._id).populate(
        "assignedParticipants"
      );
      if (mentor && mentor.assignedParticipants) {
        allowedParticipantIds = mentor.assignedParticipants.map((p) =>
          p._id.toString()
        );
      } else {
        return res.status(403).json({
          success: false,
          message: "You have no assigned participants",
        });
      }
    }

    const attendanceDate = new Date(date);
    const results = [];
    const errors = [];

    // Process each attendee
    for (const attendee of attendees) {
      try {
        const { userId, status = "present", remarks } = attendee;

        // If user is a mentor, check if they can mark attendance for this participant
        if (
          req.user.role === "mentor" &&
          !allowedParticipantIds.includes(userId)
        ) {
          errors.push({
            userId,
            error:
              "You can only mark attendance for your assigned participants",
          });
          continue;
        }

        // Check if attendance already exists for this user, date, and session
        let attendance = await Attendance.findOne({
          userId,
          date: attendanceDate,
          session,
        });

        if (attendance) {
          // Update existing attendance record
          attendance.status = status;
          attendance.remarks = remarks;
          attendance.markedBy = req.user._id;
          attendance.markedAt = new Date();
          await attendance.save();
          await attendance.populate("userId", "name email");
        } else {
          // Create new attendance record
          attendance = new Attendance({
            userId,
            date: attendanceDate,
            session,
            status,
            remarks,
            markedBy: req.user._id, // Track who marked the attendance
          });

          await attendance.save();
          await attendance.populate("userId", "name email");
        }

        // Update user's total score to include attendance points
        const user = await User.findById(userId);
        await user.updateTotalScore();

        results.push(attendance);
      } catch (error) {
        errors.push({
          userId: attendee.userId,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${results.length} users`,
      data: {
        successful: results,
        errors: errors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance for users",
      error: error.message,
    });
  }
};

// Get user's attendance history (Participants)
export const getUserAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 30,
      startDate,
      endDate,
      session,
      status,
    } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (session) query.session = session;
    if (status) query.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1, session: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get attendance statistics
    const stats = await Attendance.getAttendanceStats(
      req.user._id,
      startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );

    res.json({
      success: true,
      data: {
        attendance: attendanceRecords,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
};

// Get all attendance records (Admin and Mentor)
export const getAllAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      session,
      status,
      userId,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    // If user is a mentor, only show attendance for their assigned participants
    if (req.user.role === "mentor") {
      const mentor = await User.findById(req.user._id).populate(
        "assignedParticipants"
      );
      if (mentor && mentor.assignedParticipants) {
        const participantIds = mentor.assignedParticipants.map((p) => p._id);
        query.userId = { $in: participantIds };
      } else {
        // If mentor has no assigned participants, return empty result
        query.userId = { $in: [] };
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (session) query.session = session;
    if (status) query.status = status;
    if (userId && req.user.role === "superadmin") query.userId = userId;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate("userId", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        attendance: attendanceRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};

// Update attendance record (Admin only)
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { status, remarks },
      { new: true }
    ).populate("userId", "name email");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // Update user's total score to reflect attendance changes
    const user = await User.findById(attendance.userId._id);
    await user.updateTotalScore();

    res.json({
      success: true,
      message: "Attendance updated successfully",
      data: { attendance },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update attendance",
      error: error.message,
    });
  }
};

// Delete attendance record (Admin and Mentor)
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the attendance record to check permissions
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // If user is a mentor, check if they can delete attendance for this participant
    if (req.user.role === "mentor") {
      const mentor = await User.findById(req.user._id).populate(
        "assignedParticipants"
      );
      const canDelete = mentor.assignedParticipants.some(
        (p) => p._id.toString() === attendance.userId.toString()
      );

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message:
            "You can only delete attendance for your assigned participants",
        });
      }
    }

    // Delete the attendance record
    await Attendance.findByIdAndDelete(id);

    // Update user's total score to reflect attendance deletion
    const user = await User.findById(attendance.userId);
    await user.updateTotalScore();

    res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete attendance record",
      error: error.message,
    });
  }
};

// Get attendance statistics (Admin and Mentor)
export const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // Default to last 30 days if no date range provided
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = new Date();

    const dateQuery = {
      date: {
        $gte: startDate ? new Date(startDate) : defaultStartDate,
        $lte: endDate ? new Date(endDate) : defaultEndDate,
      },
    };

    // If user is a mentor, only show stats for their assigned participants
    if (req.user.role === "mentor") {
      const mentor = await User.findById(req.user._id).populate(
        "assignedParticipants"
      );
      if (mentor && mentor.assignedParticipants) {
        const participantIds = mentor.assignedParticipants.map((p) => p._id);
        dateQuery.userId = { $in: participantIds };
      } else {
        // If mentor has no assigned participants, return empty stats
        dateQuery.userId = { $in: [] };
      }
    } else if (userId && req.user.role === "superadmin") {
      dateQuery.userId = userId;
    }

    // Overall attendance statistics
    const overallStats = await Attendance.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Daily attendance trends
    const dailyTrends = await Attendance.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          attendance: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User-wise attendance summary (if not filtered by specific user)
    let userSummary = [];
    if (!userId) {
      userSummary = await Attendance.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: {
              userId: "$userId",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.userId",
            attendance: {
              $push: {
                status: "$_id.status",
                count: "$count",
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $project: {
            user: { $arrayElemAt: ["$user", 0] },
            attendance: 1,
          },
        },
      ]);
    }

    const statsBreakdown = overallStats.reduce(
      (acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );

    res.json({
      success: true,
      data: {
        overall: statsBreakdown,
        dailyTrends,
        userSummary: userSummary.slice(0, 20), // Limit to top 20 users
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics",
      error: error.message,
    });
  }
};

// Get today's attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build query
    const query = {
      date: { $gte: today, $lt: tomorrow },
    };

    // If user is a mentor, only show today's attendance for their assigned participants
    if (req.user.role === "mentor") {
      const mentor = await User.findById(req.user._id).populate(
        "assignedParticipants"
      );
      if (mentor && mentor.assignedParticipants) {
        const participantIds = mentor.assignedParticipants.map((p) => p._id);
        query.userId = { $in: participantIds };
      } else {
        // If mentor has no assigned participants, return empty result
        query.userId = { $in: [] };
      }
    }

    const todayAttendance = await Attendance.find(query)
      .populate("userId", "name email")
      .sort({ session: 1, markedAt: -1 });

    // Get statistics for today (use the same query filter)
    const todayStats = await Attendance.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsBreakdown = todayStats.reduce(
      (acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );

    res.json({
      success: true,
      data: {
        attendance: todayAttendance,
        stats: statsBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's attendance",
      error: error.message,
    });
  }
};

// Check if user can mark attendance (Participants)
export const canMarkAttendance = async (req, res) => {
  try {
    console.log(
      "canMarkAttendance called. User:",
      req.user._id,
      "Query:",
      req.query,
      "Params:",
      req.params,
      "Body:",
      req.body
    );

    const { date, session } = req.query;

    // Use today's date and default session if not provided
    const checkDate = date || new Date().toISOString().split("T")[0];
    const checkSession = session || "full-day";

    console.log(
      "Checking attendance for date:",
      checkDate,
      "session:",
      checkSession
    );

    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: new Date(checkDate),
      session: checkSession,
    });

    console.log("Existing attendance found:", existingAttendance);

    res.json({
      success: true,
      data: {
        canMark: !existingAttendance,
        alreadyMarked: !!existingAttendance,
        existingRecord: existingAttendance,
      },
    });
  } catch (error) {
    console.error("Error in canMarkAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check attendance status",
      error: error.message,
    });
  }
};
