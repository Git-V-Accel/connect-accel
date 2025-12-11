const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // Profile Settings
  profile: {
    firstName: String,
    lastName: String,
    name: String,
    email: String,
    phone: String,
    location: String,
    bio: String,
    company: String,
    title: String,
    website: String,
    avatar: String,
    role: String,
    skills: [String],
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  // Notification Settings
  notifications: {
    email: {
      updates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: false
      },
      project_updates: {
        type: Boolean,
        default: true
      },
      bid_updates: {
        type: Boolean,
        default: true
      },
      payment_updates: {
        type: Boolean,
        default: true
      },
      consultation_reminders: {
        type: Boolean,
        default: true
      }
    },
    push: {
      updates: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      },
      project_updates: {
        type: Boolean,
        default: true
      },
      bid_updates: {
        type: Boolean,
        default: true
      }
    },
    sms: {
      important_updates: {
        type: Boolean,
        default: false
      },
      payment_alerts: {
        type: Boolean,
        default: false
      }
    }
  },
  // Appearance Settings
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    compactMode: {
      type: Boolean,
      default: false
    }
  },
  // Security Settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number, // in minutes
      default: 30
    },
    lastPasswordChange: Date
  },
  // Payment Settings (for freelancers/agents)
  payment: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    accountHolder: String,
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'other'],
      default: 'bank_transfer'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    autoWithdraw: {
      type: Boolean,
      default: false
    },
    minimumWithdrawAmount: {
      type: Number,
      default: 50
    }
  },
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'contacts_only'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    allowMessages: {
      type: Boolean,
      default: true
    }
  },
  // Additional custom settings (flexible JSON field)
  customSettings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
settingsSchema.index({ user: 1 });

// Pre-save middleware to sync profile data with User model if needed
settingsSchema.pre('save', function(next) {
  // You can add logic here to sync with User model if needed
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);

