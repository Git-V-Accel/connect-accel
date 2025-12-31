const mongoose = require('mongoose');

const Project = require('../models/Project');
const Bid = require('../models/Bid');
const ConsultationRequest = require('../models/ConsultationRequest');
const { STATUS_CODES } = require('../constants');

const sendResponse = (res, success, data = null, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

const handleError = (res, error, message) => {
  console.error(message, error);
  return sendResponse(res, false, null, message, STATUS_CODES.INTERNAL_SERVER_ERROR);
};

const toObjectId = (id) => {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

const projectStatusCounts = async (match = {}) => {
  const rows = await Project.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = {};
  rows.forEach((r) => {
    map[r._id] = r.count;
  });
  return map;
};

const sumCompletedRevenue = async (match = {}) => {
  const rows = await Project.aggregate([
    {
      $match: {
        ...match,
        status: 'completed',
      },
    },
    { $group: { _id: null, total: { $sum: '$budget' } } },
  ]);
  return rows[0]?.total || 0;
};

const getRecentProjects = async (match = {}, limit = 5) => {
  return Project.find(match)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title clientTitle budget status createdAt updatedAt client assignedAgentId assignedFreelancerId')
    .populate('client', 'name email')
    .lean();
};

const getPendingMilestoneApprovalsForClient = async (clientId) => {
  const id = toObjectId(clientId);
  if (!id) return { pendingApprovals: 0, pendingActions: [] };

  const rows = await Project.aggregate([
    { $match: { client: id } },
    { $unwind: { path: '$milestones', preserveNullAndEmptyArrays: false } },
    { $match: { 'milestones.status': 'submitted' } },
    {
      $project: {
        projectId: '$_id',
        projectTitle: '$title',
        milestoneId: '$milestones._id',
        milestoneTitle: '$milestones.title',
        submittedAt: '$milestones.updatedAt',
      },
    },
    { $sort: { submittedAt: -1 } },
  ]);

  return {
    pendingApprovals: rows.length,
    pendingActions: rows.slice(0, 3).map((r) => ({
      id: `${r.projectId}-${r.milestoneId}`,
      text: `Review milestone "${r.milestoneTitle}" for ${r.projectTitle}`,
      link: `/client/projects/${r.projectId}`,
    })),
  };
};

// ---------------- Role controllers ----------------

const getSuperAdminDashboard = async (req, res) => {
  try {
    const statusMap = await projectStatusCounts({ status: { $ne: 'draft' } });

    const pendingReview = (statusMap.pending_review || 0) + (statusMap.pending || 0);
    const inBidding = statusMap.in_bidding || statusMap.bidding || 0;
    const activeProjects =
      (statusMap.in_progress || 0) + (statusMap.assigned || 0) + (statusMap.hold || 0);
    const openDisputes = statusMap.disputed || 0;
    const totalProjects = Object.values(statusMap).reduce((a, b) => a + b, 0);

    const totalBids = await Bid.countDocuments();
    const totalRevenue = await sumCompletedRevenue({ status: { $ne: 'draft' } });
    const consultations = await ConsultationRequest.countDocuments({ status: 'pending' });

    const recentProjects = (await getRecentProjects({ status: { $ne: 'draft' } }, 5)).map((p) => ({
      id: p._id,
      title: p.title,
      client: p.client?.name || '',
      amount: p.budget ? `₹${Number(p.budget).toLocaleString()}` : '',
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
      status: p.status,
    }));

    return sendResponse(res, true, {
      stats: {
        pendingReview,
        inBidding,
        activeProjects,
        openDisputes,
        totalProjects,
        totalBids,
        totalRevenue,
        consultations,
      },
      recentProjects,
      pendingActions: {
        reviewBids: await Bid.countDocuments({ status: 'pending' }),
        openDisputes,
      },
    });
  } catch (error) {
    return handleError(res, error, 'Failed to load superadmin dashboard');
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const statusMap = await projectStatusCounts({ status: { $ne: 'draft' } });

    const pendingReview = (statusMap.pending_review || 0) + (statusMap.pending || 0);
    const inBidding = statusMap.in_bidding || statusMap.bidding || 0;
    const activeProjects =
      (statusMap.in_progress || 0) + (statusMap.assigned || 0) + (statusMap.hold || 0);
    const totalProjects = Object.values(statusMap).reduce((a, b) => a + b, 0);

    const totalRevenue = await sumCompletedRevenue({ status: { $ne: 'draft' } });

    const recentProjects = await getRecentProjects({ status: { $ne: 'draft' } }, 5);

    return sendResponse(res, true, {
      stats: {
        pendingReview,
        inBidding,
        activeProjects,
        totalProjects,
        totalRevenue,
        consultations: await ConsultationRequest.countDocuments({ status: 'pending' }),
        totalBids: await Bid.countDocuments(),
      },
      recentProjects: recentProjects.map((p) => ({
        id: p._id,
        title: p.title,
        client_name: p.client?.name || '',
        created_at: p.createdAt,
        status: p.status,
        client_budget: p.budget,
      })),
      pending: {
        consultationsRequested: await ConsultationRequest.countDocuments({ status: 'pending' }),
        bidsPending: await Bid.countDocuments({ status: 'pending' }),
      },
    });
  } catch (error) {
    return handleError(res, error, 'Failed to load admin dashboard');
  }
};

const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user._id;

    const statusMap = await projectStatusCounts({ assignedAgentId: agentId, status: { $ne: 'draft' } });

    const activeProjects = statusMap.in_progress || 0;
    const inBidding = statusMap.in_bidding || 0;
    const completedProjects = statusMap.completed || 0;

    const totalAgentProjects = await Project.countDocuments({
      assignedAgentId: agentId,
      status: { $ne: 'draft' },
    });

    const activeClientsAgg = await Project.aggregate([
      { $match: { assignedAgentId: agentId, status: { $ne: 'draft' } } },
      { $group: { _id: '$client' } },
      { $count: 'count' },
    ]);
    const activeClients = activeClientsAgg[0]?.count || 0;

    const freelancersAssignedAgg = await Project.aggregate([
      {
        $match: {
          assignedAgentId: agentId,
          status: { $ne: 'draft' },
          assignedFreelancerId: { $ne: null },
        },
      },
      { $group: { _id: '$assignedFreelancerId' } },
      { $count: 'count' },
    ]);
    const freelancersAssigned = freelancersAssignedAgg[0]?.count || 0;

    const totalRevenue = await sumCompletedRevenue({ assignedAgentId: agentId, status: { $ne: 'draft' } });

    // Recent projects (agent-specific)
    const recentProjects = await getRecentProjects({ assignedAgentId: agentId, status: { $ne: 'draft' } }, 5);

    // Active bids for projects assigned to agent
    const bids = await Bid.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      { $match: { 'project.assignedAgentId': agentId } },
      { $sort: { submittedAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          projectId: '$projectId',
          projectTitle: '$projectTitle',
          bidderName: '$bidderName',
          status: '$status',
          bidAmount: '$bidAmount',
          submittedAt: '$submittedAt',
        },
      },
    ]);

    const pendingBids = await Bid.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      { $match: { 'project.assignedAgentId': agentId, status: 'pending' } },
      { $count: 'count' },
    ]);

    const shortlistedBids = await Bid.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      { $match: { 'project.assignedAgentId': agentId, status: 'shortlisted' } },
      { $count: 'count' },
    ]);

    const upcomingConsultations = await ConsultationRequest.countDocuments({
      assignedTo: agentId,
      status: 'assigned',
    });

    const acceptedBidsAgg = await Bid.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      { $match: { 'project.assignedAgentId': agentId, status: 'accepted' } },
      { $count: 'count' },
    ]);
    const acceptedBids = acceptedBidsAgg[0]?.count || 0;

    const totalAgentBidsAgg = await Bid.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },
      { $match: { 'project.assignedAgentId': agentId } },
      { $count: 'count' },
    ]);
    const totalAgentBids = totalAgentBidsAgg[0]?.count || 0;

    const successRate = totalAgentProjects > 0 ? Math.round((completedProjects / totalAgentProjects) * 100) : 0;
    const bidSuccessRate = totalAgentBids > 0 ? Math.round((acceptedBids / totalAgentBids) * 100) : 0;
    const avgRevenuePerProject = completedProjects > 0 ? Math.round(totalRevenue / completedProjects) : 0;

    return sendResponse(res, true, {
      stats: {
        activeProjects,
        inBidding,
        completedProjects,
        totalRevenue,
        pendingBids: pendingBids[0]?.count || 0,
        shortlistedBids: shortlistedBids[0]?.count || 0,
        upcomingConsultations,
        activeClients,
        freelancersAssigned,
        successRate,
        bidSuccessRate,
        avgRevenuePerProject,
      },
      recentProjects: recentProjects.map((p) => ({
        id: p._id,
        title: p.title,
        client_name: p.client?.name || '',
        status: p.status,
        client_budget: p.budget,
        updated_at: p.updatedAt,
      })),
      activeBids: bids.map((b) => ({
        id: b._id,
        project_id: b.projectId,
        project_title: b.projectTitle,
        freelancer_name: b.bidderName,
        status: b.status,
        amount: b.bidAmount,
      })),
    });
  } catch (error) {
    return handleError(res, error, 'Failed to load agent dashboard');
  }
};

const getClientDashboard = async (req, res) => {
  try {
    const clientId = req.user._id;

    const statusMap = await projectStatusCounts({ client: clientId });
    const activeProjectsCount =
      (statusMap.in_progress || 0) + (statusMap.assigned || 0) + (statusMap.in_bidding || 0);

    const { pendingApprovals, pendingActions } = await getPendingMilestoneApprovalsForClient(
      clientId.toString()
    );

    // Upcoming deadlines not available in backend schema (no end_date field) -> keep 0
    const upcomingDeadlines = 0;

    // Payments model not present -> keep 0
    const totalSpent = 0;

    const activeProjects = await Project.find({
      client: clientId,
      status: { $in: ['in_progress', 'assigned', 'in_bidding'] },
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status budget updatedAt assignedFreelancerId milestones')
      .populate('assignedFreelancerId', 'name')
      .lean();

    const activeProjectsWithProgress = activeProjects.map((p) => {
      const milestones = Array.isArray(p.milestones) ? p.milestones : [];
      const completed = milestones.filter((m) => m.status === 'approved' || m.status === 'paid').length;
      const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
      const dueDate = milestones.length > 0
        ? new Date(
          milestones
            .map((m) => m.dueDate)
            .filter(Boolean)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
        ).toLocaleDateString()
        : 'N/A';

      return {
        id: p._id,
        name: p.title,
        status: p.status,
        statusKey: p.status,
        freelancer: p.assignedFreelancerId?.name || 'Pending',
        progress,
        dueDate,
      };
    });

    return sendResponse(res, true, {
      stats: {
        activeProjects: activeProjectsCount,
        pendingApprovals,
        upcomingDeadlines,
        totalSpent,
      },
      activeProjects: activeProjectsWithProgress,
      pendingActions,
      recentActivity: [],
    });
  } catch (error) {
    return handleError(res, error, 'Failed to load client dashboard');
  }
};

const getFreelancerDashboard = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const statusMap = await projectStatusCounts({
      assignedFreelancerId: freelancerId,
      status: { $ne: 'draft' },
    });

    const activeProjects = (statusMap.in_progress || 0) + (statusMap.assigned || 0);

    const pendingBidsAgg = await Bid.aggregate([
      { $match: { bidderId: freelancerId, status: { $in: ['pending', 'shortlisted'] } } },
      { $count: 'count' },
    ]);
    const pendingBids = pendingBidsAgg[0]?.count || 0;

    // Payments model not present in backend yet -> keep 0
    const earnings = 0;

    const availableProjectsAgg = await Project.aggregate([
      {
        $match: {
          status: { $in: ['in_bidding', 'bidding'] },
          isOpenForBidding: true,
        },
      },
      { $count: 'count' },
    ]);
    const availableProjects = availableProjectsAgg[0]?.count || 0;

    const recentActiveProjects = await Project.find({
      assignedFreelancerId: freelancerId,
      status: { $in: ['in_progress', 'assigned'] },
    })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select('title status budget updatedAt client assignedFreelancerId')
      .populate('client', 'name')
      .lean();

    const recentBids = await Bid.find({ bidderId: freelancerId })
      .sort({ submittedAt: -1 })
      .limit(3)
      .select('projectId projectTitle bidAmount status submittedAt')
      .lean();

    return sendResponse(res, true, {
      stats: {
        activeProjects,
        pendingBids,
        earnings,
        availableProjects,
      },
      activeProjects: recentActiveProjects.map((p) => ({
        id: p._id,
        title: p.title,
        client_name: p.client?.name || '',
        freelancer_budget: p.budget,
        status: p.status,
      })),
      recentBids: recentBids.map((b) => ({
        id: b._id,
        project_id: b.projectId,
        project_title: b.projectTitle,
        amount: b.bidAmount,
        status: b.status,
        created_at: b.submittedAt,
      })),
    });
  } catch (error) {
    return handleError(res, error, 'Failed to load freelancer dashboard');
  }
};

module.exports = {
  getSuperAdminDashboard,
  getAdminDashboard,
  getAgentDashboard,
  getClientDashboard,
  getFreelancerDashboard,
};
