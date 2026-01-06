const InHouse = require('../models/InHouse');
const Project = require('../models/Project');
const User = require('../models/User');

// Get all in-house projects
exports.getInHouseProjects = async (req, res) => {
  try {
    const { status, agentId, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (agentId && agentId !== 'all') {
      query.assignedAgentId = agentId;
    }

    // Search functionality
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { 'project.title': { $regex: search, $options: 'i' } },
          { 'project.client_name': { $regex: search, $options: 'i' } },
          { 'project.description': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const inHouseProjects = await InHouse.find(query)
      .populate({
        path: 'project',
        match: searchQuery,
        populate: [
          { path: 'client', select: 'name email' }
        ]
      })
      .populate('assignedAgentId', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out projects that don't match search criteria
    const filteredProjects = inHouseProjects.filter(item => item.project);

    const total = await InHouse.countDocuments(query);

    res.json({
      success: true,
      data: filteredProjects,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching in-house projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch in-house projects',
      error: error.message
    });
  }
};

// Move project to in-house
exports.moveToInHouse = async (req, res) => {
  try {
    const { projectId, notes, priority, estimatedCompletionDate } = req.body;
    const userId = req.user.id;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project is already in in-house
    const existingInHouse = await InHouse.findOne({ project: projectId });
    if (existingInHouse) {
      return res.status(400).json({
        success: false,
        message: 'Project is already in in-house'
      });
    }

    // Create in-house record
    const inHouseProject = new InHouse({
      project: projectId,
      assignedBy: userId,
      notes,
      priority,
      estimatedCompletionDate
    });

    await inHouseProject.save();

    // Update project status
    await Project.findByIdAndUpdate(projectId, {
      status: 'assigned',
      assignment_type: 'in_house',
      assigned_agent_id: null
    });

    // Populate and return the created record
    const populatedInHouse = await InHouse.findById(inHouseProject._id)
      .populate('project')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project moved to in-house successfully',
      data: populatedInHouse
    });
  } catch (error) {
    console.error('Error moving project to in-house:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move project to in-house',
      error: error.message
    });
  }
};

// Assign agent to in-house project
exports.assignAgentToInHouse = async (req, res) => {
  try {
    const { inHouseId, agentId } = req.body;
    const userId = req.user.id;

    // Check if in-house project exists
    const inHouseProject = await InHouse.findById(inHouseId);
    if (!inHouseProject) {
      return res.status(404).json({
        success: false,
        message: 'In-house project not found'
      });
    }

    // Check if agent exists and is an agent
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({
        success: false,
        message: 'Agent not found or invalid role'
      });
    }

    // Update in-house project
    await InHouse.findByIdAndUpdate(inHouseId, {
      assignedAgentId: agentId,
      status: 'in_progress'
    });

    // Update project
    await Project.findByIdAndUpdate(inHouseProject.project, {
      assigned_agent_id: agentId,
      assignment_type: 'in_house'
    });

    // Return updated record
    const updatedInHouse = await InHouse.findById(inHouseId)
      .populate('project')
      .populate('assignedAgentId', 'name email')
      .populate('assignedBy', 'name email');

    res.json({
      success: true,
      message: 'Agent assigned to in-house project successfully',
      data: updatedInHouse
    });
  } catch (error) {
    console.error('Error assigning agent to in-house project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign agent to in-house project',
      error: error.message
    });
  }
};

// Update in-house project status
exports.updateInHouseStatus = async (req, res) => {
  try {
    const { inHouseId, status, notes } = req.body;

    const inHouseProject = await InHouse.findById(inHouseId);
    if (!inHouseProject) {
      return res.status(404).json({
        success: false,
        message: 'In-house project not found'
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (status === 'completed') updateData.actualCompletionDate = new Date();

    await InHouse.findByIdAndUpdate(inHouseId, updateData);

    // Update project status if needed
    const projectStatusMap = {
      'pending': 'assigned',
      'in_progress': 'in_progress',
      'completed': 'completed',
      'on_hold': 'hold'
    };

    await Project.findByIdAndUpdate(inHouseProject.project, {
      status: projectStatusMap[status] || 'assigned'
    });

    const updatedInHouse = await InHouse.findById(inHouseId)
      .populate('project')
      .populate('assignedAgentId', 'name email')
      .populate('assignedBy', 'name email');

    res.json({
      success: true,
      message: 'In-house project status updated successfully',
      data: updatedInHouse
    });
  } catch (error) {
    console.error('Error updating in-house project status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update in-house project status',
      error: error.message
    });
  }
};

// Remove project from in-house
exports.removeFromInHouse = async (req, res) => {
  try {
    const { inHouseId } = req.params;

    const inHouseProject = await InHouse.findById(inHouseId);
    if (!inHouseProject) {
      return res.status(404).json({
        success: false,
        message: 'In-house project not found'
      });
    }

    // Reset project
    await Project.findByIdAndUpdate(inHouseProject.project, {
      status: 'pending',
      assignment_type: null,
      assigned_agent_id: null
    });

    // Delete in-house record
    await InHouse.findByIdAndDelete(inHouseId);

    res.json({
      success: true,
      message: 'Project removed from in-house successfully'
    });
  } catch (error) {
    console.error('Error removing project from in-house:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove project from in-house',
      error: error.message
    });
  }
};

// Remove project from in-house by project ID
exports.removeFromInHouseByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find in-house project by project ID
    const inHouseProject = await InHouse.findOne({ project: projectId });

    if (!inHouseProject) {
      return res.status(404).json({
        success: false,
        message: 'In-house project not found'
      });
    }

    // Reset project
    await Project.findByIdAndUpdate(projectId, {
      status: 'pending',
      assignment_type: null,
      assigned_agent_id: null
    });

    // Delete in-house record
    await InHouse.findByIdAndDelete(inHouseProject._id);

    res.json({
      success: true,
      message: 'Project removed from in-house successfully'
    });
  } catch (error) {
    console.error('Error removing project from in-house:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove project from in-house',
      error: error.message
    });
  }
};

// Get in-house project statistics
exports.getInHouseStats = async (req, res) => {
  try {
    const stats = await InHouse.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching in-house stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch in-house statistics',
      error: error.message
    });
  }
};
