import createCsvWriter from 'csv-writer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Submission from '../models/Submission.js';
import Task from '../models/Task.js';

// Ensure exports directory exists
const ensureExportsDir = () => {
  const exportsDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  return exportsDir;
};

// Export attendance records (Admin only)
export const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, session, status, format = 'csv' } = req.query;

    // Build query
    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (session) query.session = session;
    if (status) query.status = status;

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1, userId: 1 });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attendance records found for the specified criteria'
      });
    }

    // Prepare data for export
    const exportData = attendanceRecords.map(record => ({
      name: record.userId.name,
      email: record.userId.email,
      date: record.date.toISOString().split('T')[0],
      session: record.session,
      status: record.status,
      markedAt: record.markedAt.toISOString(),
      remarks: record.remarks || ''
    }));

    if (format === 'json') {
      return res.json({
        success: true,
        data: exportData
      });
    }

    // Generate CSV file
    const exportsDir = ensureExportsDir();
    const filename = `attendance_${Date.now()}_${uuidv4().slice(0, 8)}.csv`;
    const filePath = path.join(exportsDir, filename);

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'date', title: 'Date' },
        { id: 'session', title: 'Session' },
        { id: 'status', title: 'Status' },
        { id: 'markedAt', title: 'Marked At' },
        { id: 'remarks', title: 'Remarks' }
      ]
    });

    await csvWriter.writeRecords(exportData);

    // Send file as download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      }, 60000); // Delete after 1 minute
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export attendance data',
      error: error.message
    });
  }
};

// Export task submissions (Admin only)
export const exportSubmissions = async (req, res) => {
  try {
    const { taskId, status, startDate, endDate, format = 'csv' } = req.query;

    // Build query
    const query = {};
    if (taskId) query.taskId = taskId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    // Get submissions
    const submissions = await Submission.find(query)
      .populate('userId', 'name email')
      .populate('taskId', 'title day maxScore')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No submissions found for the specified criteria'
      });
    }

    // Prepare data for export
    const exportData = submissions.map(submission => ({
      participantName: submission.userId.name,
      participantEmail: submission.userId.email,
      taskTitle: submission.taskId.title,
      taskDay: submission.taskId.day,
      maxScore: submission.taskId.maxScore,
      submissionType: submission.submissionType,
      submittedAt: submission.submittedAt.toISOString(),
      status: submission.status,
      score: submission.score || 0,
      feedback: submission.feedback || '',
      gradedBy: submission.gradedBy ? submission.gradedBy.name : '',
      gradedAt: submission.gradedAt ? submission.gradedAt.toISOString() : '',
      isLate: submission.isLate ? 'Yes' : 'No',
      fileUrl: submission.content?.fileUrl || '',
      fileName: submission.content?.fileName || '',
      link: submission.content?.link || '',
      textContent: submission.content?.text || ''
    }));

    if (format === 'json') {
      return res.json({
        success: true,
        data: exportData
      });
    }

    // Generate CSV file
    const exportsDir = ensureExportsDir();
    const filename = `submissions_${Date.now()}_${uuidv4().slice(0, 8)}.csv`;
    const filePath = path.join(exportsDir, filename);

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'participantName', title: 'Participant Name' },
        { id: 'participantEmail', title: 'Participant Email' },
        { id: 'taskTitle', title: 'Task Title' },
        { id: 'taskDay', title: 'Task Day' },
        { id: 'maxScore', title: 'Max Score' },
        { id: 'submissionType', title: 'Submission Type' },
        { id: 'submittedAt', title: 'Submitted At' },
        { id: 'status', title: 'Status' },
        { id: 'score', title: 'Score' },
        { id: 'feedback', title: 'Feedback' },
        { id: 'gradedBy', title: 'Graded By' },
        { id: 'gradedAt', title: 'Graded At' },
        { id: 'isLate', title: 'Late Submission' },
        { id: 'fileUrl', title: 'File URL' },
        { id: 'fileName', title: 'File Name' },
        { id: 'link', title: 'Link' },
        { id: 'textContent', title: 'Text Content' }
      ]
    });

    await csvWriter.writeRecords(exportData);

    // Send file as download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      }, 60000);
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export submissions data',
      error: error.message
    });
  }
};

// Export scores/leaderboard (Admin only)
export const exportScores = async (req, res) => {
  try {
    const { format = 'csv', limit } = req.query;

    // Get participants with their scores
    const query = { role: 'participant', isActive: true };
    let participants = User.find(query)
      .select('name email totalScore registrationDate')
      .sort({ totalScore: -1 });

    if (limit) {
      participants = participants.limit(parseInt(limit));
    }

    const participantData = await participants;

    if (participantData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No participants found'
      });
    }

    // Get detailed scores for each participant
    const exportData = await Promise.all(
      participantData.map(async (participant, index) => {
        const submissions = await Submission.find({
          userId: participant._id,
          status: 'graded'
        }).populate('taskId', 'title day');

        const taskScores = submissions.map(sub => ({
          taskTitle: sub.taskId.title,
          taskDay: sub.taskId.day,
          score: sub.score || 0
        }));

        return {
          rank: index + 1,
          name: participant.name,
          email: participant.email,
          totalScore: participant.totalScore,
          registrationDate: participant.registrationDate.toISOString().split('T')[0],
          totalSubmissions: submissions.length,
          averageScore: submissions.length > 0 
            ? Math.round((participant.totalScore / submissions.length) * 100) / 100 
            : 0,
          taskDetails: JSON.stringify(taskScores)
        };
      })
    );

    if (format === 'json') {
      return res.json({
        success: true,
        data: exportData
      });
    }

    // Generate CSV file
    const exportsDir = ensureExportsDir();
    const filename = `scores_${Date.now()}_${uuidv4().slice(0, 8)}.csv`;
    const filePath = path.join(exportsDir, filename);

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'rank', title: 'Rank' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'totalScore', title: 'Total Score' },
        { id: 'registrationDate', title: 'Registration Date' },
        { id: 'totalSubmissions', title: 'Total Submissions' },
        { id: 'averageScore', title: 'Average Score' },
        { id: 'taskDetails', title: 'Individual Task Scores (JSON)' }
      ]
    });

    await csvWriter.writeRecords(exportData);

    // Send file as download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      }, 60000);
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export scores data',
      error: error.message
    });
  }
};

// Export comprehensive report (Admin only)
export const exportComprehensiveReport = async (req, res) => {
  try {
    const { participantId, format = 'csv' } = req.query;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Get participant details
    const participant = await User.findById(participantId).select('-password');
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find({ userId: participantId })
      .sort({ date: -1 });

    // Get submissions
    const submissions = await Submission.find({ userId: participantId })
      .populate('taskId', 'title day maxScore')
      .populate('gradedBy', 'name')
      .sort({ submittedAt: -1 });

    // Prepare comprehensive data
    const reportData = {
      participant: {
        name: participant.name,
        email: participant.email,
        totalScore: participant.totalScore,
        registrationDate: participant.registrationDate.toISOString().split('T')[0]
      },
      attendanceSummary: {
        totalSessions: attendanceRecords.length,
        present: attendanceRecords.filter(a => a.status === 'present').length,
        absent: attendanceRecords.filter(a => a.status === 'absent').length,
        late: attendanceRecords.filter(a => a.status === 'late').length
      },
      submissionsSummary: {
        totalSubmissions: submissions.length,
        gradedSubmissions: submissions.filter(s => s.status === 'graded').length,
        averageScore: submissions.length > 0 
          ? Math.round((participant.totalScore / submissions.length) * 100) / 100 
          : 0
      },
      detailedRecords: {
        attendance: attendanceRecords.map(a => ({
          date: a.date.toISOString().split('T')[0],
          session: a.session,
          status: a.status,
          remarks: a.remarks || ''
        })),
        submissions: submissions.map(s => ({
          taskTitle: s.taskId.title,
          taskDay: s.taskId.day,
          maxScore: s.taskId.maxScore,
          submittedAt: s.submittedAt.toISOString(),
          score: s.score || 0,
          feedback: s.feedback || '',
          gradedBy: s.gradedBy ? s.gradedBy.name : '',
          isLate: s.isLate ? 'Yes' : 'No'
        }))
      }
    };

    if (format === 'json') {
      return res.json({
        success: true,
        data: reportData
      });
    }

    // For CSV, flatten the data
    const flattenedData = submissions.map(submission => {
      const attendanceForDate = attendanceRecords.find(a => 
        a.date.toISOString().split('T')[0] === submission.submittedAt.toISOString().split('T')[0]
      );

      return {
        name: participant.name,
        email: participant.email,
        totalScore: participant.totalScore,
        taskTitle: submission.taskId.title,
        taskDay: submission.taskId.day,
        maxScore: submission.taskId.maxScore,
        submittedAt: submission.submittedAt.toISOString(),
        score: submission.score || 0,
        feedback: submission.feedback || '',
        isLate: submission.isLate ? 'Yes' : 'No',
        attendanceOnSubmissionDate: attendanceForDate ? attendanceForDate.status : 'Not marked'
      };
    });

    // Generate CSV file
    const exportsDir = ensureExportsDir();
    const filename = `participant_report_${participant.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    const filePath = path.join(exportsDir, filename);

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'totalScore', title: 'Total Score' },
        { id: 'taskTitle', title: 'Task Title' },
        { id: 'taskDay', title: 'Task Day' },
        { id: 'maxScore', title: 'Max Score' },
        { id: 'submittedAt', title: 'Submitted At' },
        { id: 'score', title: 'Score' },
        { id: 'feedback', title: 'Feedback' },
        { id: 'isLate', title: 'Late Submission' },
        { id: 'attendanceOnSubmissionDate', title: 'Attendance Status' }
      ]
    });

    await csvWriter.writeRecords(flattenedData);

    // Send file as download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      }, 60000);
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export comprehensive report',
      error: error.message
    });
  }
}; 