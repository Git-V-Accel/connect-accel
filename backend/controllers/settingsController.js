const Settings = require('../models/Settings');
const User = require('../models/User');
const { MESSAGES, STATUS_CODES } = require('../constants');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    // Always fetch the latest user data to ensure profile is up-to-date
    const user = await User.findById(req.user.id).select('name email phone company title location website bio avatar role skills');
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Split name into firstName and lastName
    const nameParts = (user.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    let settings = await Settings.findOne({ user: req.user.id });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = new Settings({
        user: req.user.id,
        profile: {
          firstName: firstName,
          lastName: lastName,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
          company: user.company || '',
          title: user.title || '',
          website: user.website || '',
          avatar: user.avatar || '',
          role: user.role,
          skills: user.skills || [],
          timezone: 'UTC',
          language: 'en'
        }
      });
      await settings.save();
    } else {
      // Sync profile data with latest user data (but preserve settings-specific fields like timezone, language)
      // Only update firstName/lastName if they're not already set in settings
      const currentFirstName = settings.profile.firstName || firstName;
      const currentLastName = settings.profile.lastName || lastName;
      
      settings.profile = {
        ...settings.profile,
        firstName: currentFirstName,
        lastName: currentLastName,
        name: user.name,
        email: user.email,
        phone: user.phone || settings.profile.phone || '',
        location: user.location || settings.profile.location || '',
        bio: user.bio || settings.profile.bio || '',
        company: user.company || settings.profile.company || '',
        title: user.title || settings.profile.title || '',
        website: user.website || settings.profile.website || '',
        avatar: user.avatar || settings.profile.avatar || '',
        role: user.role,
        skills: user.skills || settings.profile.skills || [],
        // Preserve settings-specific fields
        timezone: settings.profile.timezone || 'UTC',
        language: settings.profile.language || 'en'
      };
      await settings.save();
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Get settings by user ID (for admin/superadmin)
// @route   GET /api/settings/user/:userId
// @access  Private (Admin/Superadmin only)
const getSettingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is admin or superadmin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: 'Access denied. Admin or Superadmin privileges required.'
      });
    }

    let settings = await Settings.findOne({ user: userId });

    if (!settings) {
      // Return default structure if settings don't exist
      return res.status(STATUS_CODES.OK).json({
        success: true,
        data: null,
        message: 'Settings not found for this user'
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings by user ID error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Create or update user settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const {
      profile,
      notifications,
      appearance,
      security,
      payment,
      privacy,
      customSettings
    } = req.body;

    // Find existing settings or create new
    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      // Get user data to populate profile
      const user = await User.findById(req.user.id).select('name email phone company title location website bio avatar');
      
      settings = new Settings({
        user: req.user.id,
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
          company: user.company || '',
          title: user.title || '',
          website: user.website || '',
          avatar: user.avatar || '',
          timezone: 'UTC',
          language: 'en'
        }
      });
    }

    // Update only provided fields
    if (profile) {
      settings.profile = { ...settings.profile, ...profile };
    }

    if (notifications) {
      if (notifications.email) {
        settings.notifications.email = { ...settings.notifications.email, ...notifications.email };
      }
      if (notifications.push) {
        settings.notifications.push = { ...settings.notifications.push, ...notifications.push };
      }
      if (notifications.sms) {
        settings.notifications.sms = { ...settings.notifications.sms, ...notifications.sms };
      }
    }

    if (appearance) {
      settings.appearance = { ...settings.appearance, ...appearance };
    }

    if (security) {
      settings.security = { ...settings.security, ...security };
    }

    if (payment) {
      settings.payment = { ...settings.payment, ...payment };
    }

    if (privacy) {
      settings.privacy = { ...settings.privacy, ...privacy };
    }

    if (customSettings) {
      settings.customSettings = { ...settings.customSettings, ...customSettings };
    }

    // Sync profile changes to User model if profile data is updated
    if (profile) {
      const userUpdate = {};
      if (profile.name) userUpdate.name = profile.name;
      if (profile.email) userUpdate.email = profile.email;
      if (profile.phone !== undefined) userUpdate.phone = profile.phone;
      if (profile.location !== undefined) userUpdate.location = profile.location;
      if (profile.bio !== undefined) userUpdate.bio = profile.bio;
      if (profile.company !== undefined) userUpdate.company = profile.company;
      if (profile.title !== undefined) userUpdate.title = profile.title;
      if (profile.website !== undefined) userUpdate.website = profile.website;
      if (profile.avatar !== undefined) userUpdate.avatar = profile.avatar;

      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(req.user.id, userUpdate);
      }
    }

    await settings.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Update specific settings section
// @route   PATCH /api/settings/:section
// @access  Private
const updateSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;

    const allowedSections = ['profile', 'notifications', 'appearance', 'security', 'payment', 'privacy', 'customSettings'];

    if (!allowedSections.includes(section)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `Invalid section. Allowed sections: ${allowedSections.join(', ')}`
      });
    }

    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      // Get user data to populate profile
      const user = await User.findById(req.user.id).select('name email phone company title location website bio avatar');
      
      settings = new Settings({
        user: req.user.id,
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
          company: user.company || '',
          title: user.title || '',
          website: user.website || '',
          avatar: user.avatar || '',
          timezone: 'UTC',
          language: 'en'
        }
      });
    }

    // Update the specific section
    if (section === 'profile') {
      settings.profile = { ...settings.profile, ...updateData };
      
      // Sync profile changes to User model
      const userUpdate = {};
      
      // Combine firstName and lastName into name if provided
      if (updateData.firstName || updateData.lastName) {
        const firstName = updateData.firstName || settings.profile.firstName || '';
        const lastName = updateData.lastName || settings.profile.lastName || '';
        userUpdate.name = `${firstName} ${lastName}`.trim();
      } else if (updateData.name) {
        userUpdate.name = updateData.name;
      }
      
      if (updateData.email) userUpdate.email = updateData.email;
      if (updateData.phone !== undefined) userUpdate.phone = updateData.phone;
      if (updateData.location !== undefined) userUpdate.location = updateData.location;
      if (updateData.bio !== undefined) userUpdate.bio = updateData.bio;
      if (updateData.company !== undefined) userUpdate.company = updateData.company;
      if (updateData.title !== undefined) userUpdate.title = updateData.title;
      if (updateData.website !== undefined) userUpdate.website = updateData.website;
      if (updateData.avatar !== undefined) userUpdate.avatar = updateData.avatar;
      if (updateData.skills !== undefined) userUpdate.skills = updateData.skills;

      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(req.user.id, userUpdate);
      }
    } else if (section === 'notifications') {
      if (updateData.email) {
        settings.notifications.email = { ...settings.notifications.email, ...updateData.email };
      }
      if (updateData.push) {
        settings.notifications.push = { ...settings.notifications.push, ...updateData.push };
      }
      if (updateData.sms) {
        settings.notifications.sms = { ...settings.notifications.sms, ...updateData.sms };
      }
    } else {
      settings[section] = { ...settings[section], ...updateData };
    }

    await settings.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: `${section} settings updated successfully`,
      data: settings
    });
  } catch (error) {
    console.error('Update settings section error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || MESSAGES.SERVER_ERROR
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
const resetSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone company title location website bio avatar');

    const defaultSettings = {
      user: req.user.id,
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        company: user.company || '',
        title: user.title || '',
        website: user.website || '',
        avatar: user.avatar || '',
        timezone: 'UTC',
        language: 'en'
      },
      notifications: {
        email: {
          updates: true,
          promotions: false,
          project_updates: true,
          bid_updates: true,
          payment_updates: true,
          consultation_reminders: true
        },
        push: {
          updates: true,
          reminders: true,
          project_updates: true,
          bid_updates: true
        },
        sms: {
          important_updates: false,
          payment_alerts: false
        }
      },
      appearance: {
        theme: 'system',
        fontSize: 'medium',
        compactMode: false
      },
      security: {
        twoFactorEnabled: false,
        loginAlerts: true,
        sessionTimeout: 30
      },
      payment: {
        paymentMethod: 'bank_transfer',
        currency: 'USD',
        autoWithdraw: false,
        minimumWithdrawAmount: 50
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowMessages: true
      },
      customSettings: {}
    };

    await Settings.findOneAndUpdate(
      { user: req.user.id },
      defaultSettings,
      { upsert: true, new: true }
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Settings reset to default successfully',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

module.exports = {
  getSettings,
  getSettingsByUserId,
  updateSettings,
  updateSettingsSection,
  resetSettings
};

