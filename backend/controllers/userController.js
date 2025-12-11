const User = require('../models/User');
const { USER_ROLES, MESSAGES, STATUS_CODES, FRONTEND_CONFIG, EMAIL_CONFIG } = require('../constants');
const sendEmail = require('../utils/sendEmail');
const { userCreationTemplate } = require('../templates/emailTemplates');
const { generateTemporaryPassword } = require('../utils/passwordGenerator');
const { generateUserId } = require('../utils/userIdGenerator');

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
    
    const users = await User.find(query).select('-password');

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

// @desc    Get user by ID (Admin+Superadmin)
// @route   GET /api/users/:id
// @access  Private (Admin+Superadmin)
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
      confirmEmail,
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
    if (!name || !email || !confirmEmail || !role) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Name, email, confirm email, and role are required'
      });
    }

    // Validate email confirmation
    if (email !== confirmEmail) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Email and confirm email do not match'
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
      phone,
      avatar: avatar || null,
      isFirstLogin: true
    };

    // Add role-specific fields
    if (role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN) {
      userData.adminRole = adminRole || 'admin';
    }

    if (role === USER_ROLES.FREELANCER) {
      userData.skills = skills ? skills.split(',').map(s => s.trim()) : [];
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
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
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

// @desc    Update user (Superadmin only)
// @route   PUT /api/users/:id
// @access  Private/Superadmin
const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
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

    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar; // Allow null to remove avatar

    // Add role-specific fields
    if (adminRole) updateData.adminRole = adminRole;

    if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (experience) updateData.experience = experience;
    if (bio) updateData.bio = bio;

    if (company) updateData.company = company;
    if (website) updateData.website = website;
    if (location) updateData.location = location;
    if (title) updateData.title = title;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
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
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND
      });
    }

    await User.findByIdAndDelete(req.params.id);

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
  updateUser,
  createUser,
  deleteUser
};
