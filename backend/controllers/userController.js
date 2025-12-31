const User = require('../models/User');
const { USER_ROLES, MESSAGES, STATUS_CODES, FRONTEND_CONFIG, EMAIL_CONFIG, USER_STATUS } = require('../constants');
const sendEmail = require('../utils/sendEmail');
const { userCreationTemplate } = require('../templates/emailTemplates');
const { generateTemporaryPassword } = require('../utils/passwordGenerator');
const { generateUserId } = require('../utils/userIdGenerator');
const { createAuditLog, detectChanges } = require('../utils/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/auditMessages');
const NotificationService = require('../services/notificationService');
const socketService = require('../services/socketService');

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(STATUS_CODES.OK).json({
      success: true,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
        title: user.title,
        location: user.location,
        website: user.website,
        bio: user.bio,
        skills: user.skills || [],
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone,
      company,
      title,
      location,
      website,
      bio,
      avatar,
      additionalFields
    } = req.body;

    // Check if email is being updated and if it already exists
    if (email && email !== req.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.EMAIL_EXISTS
        });
      }
    }

    // Get current user data for audit log
    const oldUser = await User.findById(req.user.id).select('-password');

    // Prepare update data - include all fields that can be updated
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (title !== undefined) updateData.title = title;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar; // Allow null to remove avatar
    if (additionalFields !== undefined) updateData.additionalFields = additionalFields;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Create audit log for profile update
    const fieldsToCheck = ['name', 'email', 'phone', 'company', 'title', 'location', 'website', 'bio', 'avatar', 'additionalFields'];
    const { changes, previousValues, newValues } = detectChanges(oldUser.toObject(), user.toObject(), fieldsToCheck);
    
    if (Object.keys(changes).length > 0) {
      await createAuditLog({
        performedBy: user,
        targetUser: user,
        action: AUDIT_ACTIONS.USER_PROFILE_UPDATED,
        changes,
        previousValues,
        newValues,
        req
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PROFILE_UPDATED,
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        company: user.company,
        title: user.title,
        location: user.location,
        website: user.website,
        bio: user.bio,
        avatar: user.avatar,
        additionalFields: user.additionalFields,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    // Get user data before deletion for audit log
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Create audit log before deletion
    await createAuditLog({
      performedBy: user,
      targetUser: user,
      action: AUDIT_ACTIONS.USER_DELETED,
      previousValues: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      req
    });

    await User.findByIdAndDelete(req.user.id);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.ACCOUNT_DELETED
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get all users (Admin+Superadmin)
// @route   GET /api/users
// @access  Private (Admin+Superadmin)
const getAllUsers = async (req, res) => {
  try {
    let query = {};
    
    // Admins can only see clients, freelancers, and agents (not other admins or superadmins)
    if (req.user.role === USER_ROLES.ADMIN) {
      query.role = { $in: [USER_ROLES.CLIENT, USER_ROLES.FREELANCER, USER_ROLES.AGENT] };
    }
    // Superadmins can see all users
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get freelancers (Admin or Superadmin)
// @route   GET /api/users/freelancers
// @access  Private/Admin+Superadmin
const getFreelancers = async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    const query = {
      role: USER_ROLES.FREELANCER
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { userID: searchRegex }
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);

    const freelancers = await User.find(query)
      .select('name email userID role skills hourlyRate experience status createdAt')
      .sort({ createdAt: -1 })
      .limit(parsedLimit);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: freelancers.length,
      users: freelancers
    });
  } catch (error) {
    console.error('Get freelancers error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get clients (Admin or Superadmin)
// @route   GET /api/users/clients
// @access  Private/Admin+Superadmin
const getClients = async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    const query = {
      role: USER_ROLES.CLIENT
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { userID: searchRegex },
        { company: searchRegex }
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);

    const clients = await User.find(query)
      .select('name email userID role company phone website location status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(parsedLimit);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: clients.length,
      users: clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get admins (Admin or Superadmin)
// @route   GET /api/users/admins
// @access  Private/Admin+Superadmin
const getAdmins = async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;
    const query = {
      role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN] }
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { userID: searchRegex }
      ];
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);

    const admins = await User.find(query)
      .select('name email userID role adminRole status createdAt')
      .sort({ createdAt: -1 })
      .limit(parsedLimit);

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: admins.length,
      users: admins
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get user by ID (Admin+Superadmin+Agent)
// @route   GET /api/users/:id
// @access  Private (Admin+Superadmin+Agent)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Admins can only view clients, freelancers, and agents (not other admins or superadmins)
    if (req.user.role === USER_ROLES.ADMIN) {
      if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Access denied. You can only view client, freelancer, and agent profiles.'
        });
      }
    }

    // Agents can only view freelancers and clients (not admins or superadmins)
    if (req.user.role === USER_ROLES.AGENT) {
      // Agents cannot view admins or superadmins
      if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPERADMIN) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Access denied. You can only view freelancer and client profiles.'
        });
      }
      // Agents can view freelancers and clients (they manage bids for their projects)
      // No additional restriction needed as agents need to view bidder profiles
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Update user role (Superadmin only)
// @route   PUT /api/users/:id/role
// @access  Private/Superadmin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !Object.values(USER_ROLES).includes(role)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PROVIDE_VALID_ROLE
      });
    }

    // Get old user data for audit log
    const oldUser = await User.findById(req.params.id).select('-password');
    
    if (!oldUser) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Create audit log for role update
    const performedByUser = await User.findById(req.user.id).select('-password');
    await createAuditLog({
      performedBy: performedByUser,
      targetUser: user,
      action: AUDIT_ACTIONS.USER_ROLE_UPDATED,
      changes: { role: { from: oldUser.role, to: user.role } },
      previousValues: { role: oldUser.role },
      newValues: { role: user.role },
      req
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.USER_ROLE_UPDATED,
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Create new user (Admin+Superadmin)
// @route   POST /api/users
// @access  Private (Admin+Superadmin)
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      avatar,
      // Admin specific fields
      adminRole,
      // Freelancer specific fields
      skills,
      hourlyRate,
      experience,
      bio,
      // Client specific fields
      company,
      website,
      location,
      title
    } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Name, email, and role are required'
      });
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Invalid role provided'
      });
    }

    // Restrict admin users from creating admin or superadmin users
    if (req.user.role === USER_ROLES.ADMIN) {
      if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to create admin or superadmin users'
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Generate unique user ID
    const userID = await generateUserId(role);

    // Prepare user data
    const userData = {
      userID,
      name,
      email,
      password: temporaryPassword,
      role,
      phone: phone || undefined,
      avatar: avatar || undefined,
      isFirstLogin: true,
      status: USER_STATUS.PENDING // Set user as pending until first login and password change
    };

    // Add role-specific fields
    if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN) {
      userData.adminRole = adminRole || 'admin';
    }

    if (role === USER_ROLES.FREELANCER) {
      // Handle skills - can be string (comma-separated) or array
      if (skills) {
        userData.skills = Array.isArray(skills) 
          ? skills.map(s => String(s).trim()).filter(s => s)
          : String(skills).split(',').map(s => s.trim()).filter(s => s);
      } else {
        userData.skills = [];
      }
      userData.hourlyRate = hourlyRate || 0;
      userData.experience = experience || 'beginner';
      userData.bio = bio || '';
    }

    if (role === USER_ROLES.CLIENT) {
      userData.company = company || '';
      userData.website = website || '';
      userData.location = location || '';
      userData.title = title || '';
    }

    // Create user
    const user = await User.create(userData);

    // Create audit log for user creation
    const performedByUser = await User.findById(req.user.id).select('-password');
    const auditLog = await createAuditLog({
      performedBy: performedByUser,
      targetUser: user,
      action: AUDIT_ACTIONS.USER_CREATED,
      newValues: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        userID: user.userID
      },
      req
    });

    // Notifications: Admin/Superadmin dashboard notification
    try {
      await NotificationService.notifyUserCreated(
        user._id.toString(),
        req.user.id,
        user.role,
        auditLog?._id?.toString?.() || auditLog?._id
      );
    } catch (notificationError) {
      console.error('Failed to create user creation notifications:', notificationError);
    }

    // Send welcome email with credentials
    let emailSent = false;
    try {
      // Check if email credentials are configured
      if (!EMAIL_CONFIG.USER || !EMAIL_CONFIG.PASS ) {
        console.log('Email credentials not configured, skipping email sending');
      } else {
        const loginUrl = `${FRONTEND_CONFIG.URL}/login`;
        const emailMessage = userCreationTemplate(
          user.name,
          user.email,
          temporaryPassword,
          user.role,
          loginUrl,
          user.userID
        );

        await sendEmail({
          email: user.email,
          subject: 'Welcome toConnect-Accel - Your Account Has Been Created',
          message: emailMessage
        });

        console.log(`Welcome email sent to ${user.email}`);
        emailSent = true;
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail user creation if email fails
    }

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: emailSent 
        ? 'User created successfully and welcome email sent'
        : 'User created successfully (email not sent - credentials not configured)',
      user: {
        id: user._id,
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        adminRole: user.adminRole,
        skills: user.skills,
        hourlyRate: user.hourlyRate,
        experience: user.experience,
        bio: user.bio,
        company: user.company,
        phone: user.phone,
        website: user.website,
        location: user.location,
        title: user.title,
        avatar: user.avatar,
        status: user.status,
        isFirstLogin: user.isFirstLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    // Return more specific error message
    const errorMessage = error.message || MESSAGES.SERVER_ERROR;
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update user status (Superadmin only)
// @route   PUT /api/users/:id/status
// @access  Private/Superadmin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Please provide a valid status (active or inactive)'
      });
    }

    // Get old user data for audit log
    const oldUser = await User.findById(req.params.id).select('-password');
    
    if (!oldUser) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Create audit log for status update
    const performedByUser = await User.findById(req.user.id).select('-password');
    const auditLog = await createAuditLog({
      performedBy: performedByUser,
      targetUser: user,
      action: AUDIT_ACTIONS.USER_STATUS_UPDATED,
      changes: { status: { from: oldUser.status, to: user.status } },
      previousValues: { status: oldUser.status },
      newValues: { status: user.status },
      req
    });

    // Notifications: treat non-active status as suspension for notification purposes
    try {
      const becameInactive = oldUser.status === 'active' && user.status !== 'active';
      if (becameInactive) {
        await NotificationService.notifyUserSuspended(
          user._id.toString(),
          req.user.id,
          auditLog?._id?.toString?.() || auditLog?._id
        );
      }
    } catch (notificationError) {
      console.error('Failed to create user status notifications:', notificationError);
    }

    // Realtime dashboard refresh
    try {
      socketService.emitDashboardRefresh({
        entity: 'user',
        action: 'status_updated',
        userId: user._id.toString(),
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `User status updated to ${status}`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Delete user (Superadmin only)
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    // Create audit log before deletion
    const performedByUser = await User.findById(req.user.id).select('-password');
    const auditLog = await createAuditLog({
      performedBy: performedByUser,
      targetUser: user,
      action: AUDIT_ACTIONS.USER_DELETED,
      previousValues: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        userID: user.userID
      },
      req
    });

    // Notifications
    try {
      await NotificationService.notifyUserDeleted(
        user._id.toString(),
        req.user.id,
        auditLog?._id?.toString?.() || auditLog?._id
      );
    } catch (notificationError) {
      console.error('Failed to create user deletion notifications:', notificationError);
    }

    await User.findByIdAndDelete(req.params.id);

    // Realtime dashboard refresh
    try {
      socketService.emitDashboardRefresh({
        entity: 'user',
        action: 'deleted',
        userId: req.params.id,
      });
    } catch (emitError) {
      console.error('Failed to emit dashboard refresh:', emitError);
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.USER_DELETED
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  getMe,
  updateProfile,
  deleteAccount,
  getAllUsers,
  getClients,
  getFreelancers,
  getAdmins,
  getUserById,
  updateUserRole,
  updateUserStatus,
  createUser,
  deleteUser
};
