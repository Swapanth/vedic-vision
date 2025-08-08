import Announcement from '../models/Announcement.js';
import User from '../models/User.js'; // Added missing import for User

// Create announcement (Admin only)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority = 'medium', targetAudience = 'all', expiresAt } = req.body;

    const announcement = new Announcement({
      title,
      content,
      priority,
      targetAudience,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });

    // Handle file attachments if present
    if (req.files && req.files.length > 0) {
      announcement.attachments = req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/announcements/${file.filename}`
      }));
    }

    await announcement.save();
    await announcement.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: { announcement }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
};

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      priority,
      targetAudience,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // For participants, only show announcements targeted to them
    if (req.user.role === 'participant') {
      query.$and = [
        { isActive: true },
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'participants' }
          ]
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get announcements
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // For participants, mark announcements as read
    if (req.user.role === 'participant') {
      const announcementIds = announcements.map(a => a._id);
      await Promise.all(
        announcementIds.map(async (announcementId) => {
          await Announcement.findByIdAndUpdate(
            announcementId,
            {
              $addToSet: {
                readBy: {
                  userId: req.user._id,
                  readAt: new Date()
                }
              }
            }
          );
        })
      );
    }

    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAnnouncements: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message
    });
  }
};

// Get active announcements
export const getActiveAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.role === 'superadmin' ? 'all' : req.user.role;
    
    const announcements = await Announcement.getActiveAnnouncements(userRole);

    // For participants, mark as read
    if (req.user.role === 'participant') {
      const announcementIds = announcements.map(a => a._id);
      await Promise.all(
        announcementIds.map(async (announcementId) => {
          await Announcement.findByIdAndUpdate(
            announcementId,
            {
              $addToSet: {
                readBy: {
                  userId: req.user._id,
                  readAt: new Date()
                }
              }
            }
          );
        })
      );
    }

    res.json({
      success: true,
      data: { announcements }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active announcements',
      error: error.message
    });
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate('createdBy', 'name email')
      .populate('readBy.userId', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check access rights for participants
    if (req.user.role === 'participant') {
      const canAccess = announcement.isActive && 
                       (!announcement.isExpired) &&
                       (announcement.targetAudience === 'all' || 
                        announcement.targetAudience === 'participants');
      
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Mark as read
      await Announcement.findByIdAndUpdate(
        id,
        {
          $addToSet: {
            readBy: {
              userId: req.user._id,
              readAt: new Date()
            }
          }
        }
      );
    }

    res.json({
      success: true,
      data: { 
        announcement: {
          ...announcement.toObject(),
          isExpired: announcement.isExpired
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement',
      error: error.message
    });
  }
};

// Update announcement (Admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating createdBy
    delete updates.createdBy;

    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/announcements/${file.filename}`
      }));
      
      // Add new attachments to existing ones
      const announcement = await Announcement.findById(id);
      if (announcement) {
        updates.attachments = [...(announcement.attachments || []), ...newAttachments];
      }
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('createdBy', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: { announcement }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message
    });
  }
};

// Toggle announcement status (Admin only)
export const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();
    await announcement.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { announcement }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle announcement status',
      error: error.message
    });
  }
};

// Delete announcement (Admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message
    });
  }
};

// Get unread announcements count (Participants)
export const getUnreadCount = async (req, res) => {
  try {
    const userRole = req.user.role === 'superadmin' ? 'all' : req.user.role;
    
    const query = {
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ],
      $and: [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: userRole }
          ]
        },
        {
          'readBy.userId': { $ne: req.user._id }
        }
      ]
    };

    const unreadCount = await Announcement.countDocuments(query);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// Mark announcement as read (Participants)
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark announcement as read',
      error: error.message
    });
  }
};

// Get announcement read statistics (Admin only)
export const getReadStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate('readBy.userId', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Get total target audience count
    let totalTargetUsers = 0;
    if (announcement.targetAudience === 'all') {
      totalTargetUsers = await User.countDocuments({ isActive: true });
    } else {
      totalTargetUsers = await User.countDocuments({ 
        role: announcement.targetAudience,
        isActive: true 
      });
    }

    const readCount = announcement.readBy.length;
    const unreadCount = totalTargetUsers - readCount;
    const readPercentage = totalTargetUsers > 0 ? (readCount / totalTargetUsers) * 100 : 0;

    res.json({
      success: true,
      data: {
        announcement: {
          _id: announcement._id,
          title: announcement.title,
          targetAudience: announcement.targetAudience
        },
        statistics: {
          totalTargetUsers,
          readCount,
          unreadCount,
          readPercentage: Math.round(readPercentage * 100) / 100
        },
        readBy: announcement.readBy
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch read statistics',
      error: error.message
    });
  }
}; 