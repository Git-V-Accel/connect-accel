const ProjectNote = require('../models/ProjectNote');
const Project = require('../models/Project');
const ActivityLogger = require('../services/activityLogger');
const socketService = require('../services/socketService');
const mongoose = require('mongoose');
const { MESSAGES, STATUS_CODES, USER_ROLES } = require('../constants');

// Helper function to check if a user is the assigned freelancer
const isAssignedFreelancerForProject = (project, userId) => {
  if (!userId) return false;
  
  const userIdStr = userId.toString();
  
  // Check assignedFreelancerId (proper ObjectId reference)
  if (project.assignedFreelancerId) {
    const freelancerIdStr = project.assignedFreelancerId.toString();
    if (freelancerIdStr === userIdStr) {
      return true;
    }
    
    // Also check if it's a populated object with _id
    if (typeof project.assignedFreelancerId === 'object' && project.assignedFreelancerId._id) {
      if (project.assignedFreelancerId._id.toString() === userIdStr) {
        return true;
      }
    }
  }
  
  // Check legacy assignedFreelancer field (string, might be ObjectId string)
  if (project.assignedFreelancer && typeof project.assignedFreelancer === 'string') {
    // Check if it's a valid ObjectId string matching the userId
    if (mongoose.Types.ObjectId.isValid(project.assignedFreelancer)) {
      if (project.assignedFreelancer === userIdStr) {
        return true;
      }
    }
  }
  
  return false;
};

// Helper function to check if freelancer has accepted bid for project
const hasAcceptedBidForProject = async (projectId, freelancerId) => {
  try {
    const Bidding = require('../models/Bidding');
    const acceptedBid = await Bidding.findOne({
      projectId: projectId,
      freelancerId: freelancerId,
      isAccepted: true
    });
    return !!acceptedBid;
  } catch (error) {
    console.error('Error checking accepted bid:', error);
    return false;
  }
};

// @desc    Get all notes for a project
// @route   GET /api/projects/:id/notes
// @access  Private (Admin and Freelancer only)
const getProjectNotes = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions - only admin, super_admin, or assigned freelancer can see notes
    const isAdmin = req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPERADMIN;
    const isFreelancerRole = req.user.role === 'freelancer';
    const isAssignedFreelancer = isFreelancerRole && isAssignedFreelancerForProject(project, req.user.id);
    
    // Also check if freelancer has an accepted bid for this project
    let hasAcceptedBid = false;
    if (isFreelancerRole && !isAssignedFreelancer) {
      hasAcceptedBid = await hasAcceptedBidForProject(project._id, req.user.id);
    }

    if (!isAdmin && !isAssignedFreelancer && !hasAcceptedBid) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied. Only admins and assigned freelancers can view project notes.'
      });
    }

    const notes = await ProjectNote.find({ project: req.params.id })
      .populate('createdBy', 'name email userID role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Get project notes error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Add a note to a project
// @route   POST /api/projects/:id/notes
// @access  Private (Admin and Freelancer only)
const addProjectNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions - only admin, super_admin, or assigned freelancer can add notes
    const isAdmin = req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPERADMIN;
    const isFreelancerRole = req.user.role === 'freelancer';
    const isAssignedFreelancer = isFreelancerRole && isAssignedFreelancerForProject(project, req.user.id);
    
    // Also check if freelancer has an accepted bid for this project
    let hasAcceptedBid = false;
    if (isFreelancerRole && !isAssignedFreelancer) {
      hasAcceptedBid = await hasAcceptedBidForProject(project._id, req.user.id);
    }

    if (!isAdmin && !isAssignedFreelancer && !hasAcceptedBid) {
      console.error('Access denied for project notes:', {
        userId: req.user.id,
        userRole: req.user.role,
        projectId: req.params.id,
        assignedFreelancerId: project.assignedFreelancerId,
        assignedFreelancer: project.assignedFreelancer,
        isAdmin,
        isFreelancerRole,
        isAssignedFreelancer: isAssignedFreelancerForProject(project, req.user.id),
        hasAcceptedBid
      });
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied. Only admins and assigned freelancers can add project notes.'
      });
    }

    // Create the note
    const note = await ProjectNote.create({
      project: req.params.id,
      content: content.trim(),
      createdBy: req.user.id,
      attachments: req.body.attachments || []
    });

    // Populate the createdBy field
    await note.populate('createdBy', 'name email userID role');

    // Log activity
    try {
      const { ACTIVITY_TYPES } = require('../constants');
      await ActivityLogger.logActivity({
        user: req.user.id,
        project: req.params.id,
        activityType: ACTIVITY_TYPES.PROJECT_NOTE_ADDED,
        title: 'Project Note Added',
        description: `A new note has been added to project "${project.title}" by ${req.user.name}`,
        metadata: {
          noteId: note._id,
          projectTitle: project.title
        },
        visibleToClient: false, // Notes are only visible to admin and freelancer
        visibleToAdmin: true
      }, req);
    } catch (activityError) {
      console.error('Failed to log note addition activity:', activityError);
    }

    // Emit socket event to project room so all users viewing this project get the update
    // Convert note to plain object for socket emission
    const noteData = note.toObject ? note.toObject() : note;
    socketService.emitToProject(req.params.id, 'project-note-added', {
      projectId: req.params.id,
      note: noteData,
      addedBy: req.user.id
    });

    // Also emit as project update for consistency
    socketService.emitProjectUpdate(req.params.id, 'project-note-added', {
      projectId: req.params.id,
      note: noteData,
      addedBy: req.user.id
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: 'Project note added successfully',
      data: note
    });
  } catch (error) {
    console.error('Add project note error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Update a project note
// @route   PUT /api/projects/:id/notes/:noteId
// @access  Private (Admin and Freelancer only - can only update own notes)
const updateProjectNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const note = await ProjectNote.findById(req.params.noteId);

    if (!note) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Verify note belongs to the project
    if (note.project.toString() !== req.params.id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Note does not belong to this project'
      });
    }

    // Check permissions - user can only update their own notes, unless they're admin
    const isAdmin = req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPERADMIN;
    const isNoteOwner = note.createdBy.toString() === req.user.id;

    if (!isAdmin && !isNoteOwner) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied. You can only update your own notes.'
      });
    }

    note.content = content.trim();
    if (req.body.attachments) {
      note.attachments = req.body.attachments;
    }
    await note.save();

    await note.populate('createdBy', 'name email userID role');

    // Emit socket event for note update
    const noteData = note.toObject ? note.toObject() : note;
    socketService.emitToProject(req.params.id, 'project-note-updated', {
      projectId: req.params.id,
      noteId: note._id,
      note: noteData,
      updatedBy: req.user.id
    });
    socketService.emitProjectUpdate(req.params.id, 'project-note-updated', {
      projectId: req.params.id,
      noteId: note._id,
      note: noteData,
      updatedBy: req.user.id
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Project note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Update project note error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Delete a project note
// @route   DELETE /api/projects/:id/notes/:noteId
// @access  Private (Admin and Freelancer only - can only delete own notes)
const deleteProjectNote = async (req, res) => {
  try {
    const note = await ProjectNote.findById(req.params.noteId);

    if (!note) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Verify note belongs to the project
    if (note.project.toString() !== req.params.id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Note does not belong to this project'
      });
    }

    // Check permissions - user can only delete their own notes, unless they're admin
    const isAdmin = req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPERADMIN;
    const isNoteOwner = note.createdBy.toString() === req.user.id;

    if (!isAdmin && !isNoteOwner) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied. You can only delete your own notes.'
      });
    }

    await ProjectNote.findByIdAndDelete(req.params.noteId);

    // Emit socket event for note deletion
    socketService.emitToProject(req.params.id, 'project-note-deleted', {
      projectId: req.params.id,
      noteId: req.params.noteId,
      deletedBy: req.user.id
    });
    socketService.emitProjectUpdate(req.params.id, 'project-note-deleted', {
      projectId: req.params.id,
      noteId: req.params.noteId,
      deletedBy: req.user.id
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Project note deleted successfully'
    });
  } catch (error) {
    console.error('Delete project note error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  getProjectNotes,
  addProjectNote,
  updateProjectNote,
  deleteProjectNote
};

