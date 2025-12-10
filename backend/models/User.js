const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES, MESSAGES, ADMIN_ROLE_ARRAY, PERMISSIONS_ARRAY, EXPERIENCE_LEVEL_ARRAY, USER_STATUS_ARRAY, ADMIN_ROLE, EXPERIENCE_LEVEL, USER_STATUS } = require('../constants');
const { VALIDATION } = MESSAGES;

const userSchema = new mongoose.Schema({
  userID: {
    type: String,
    unique: true,
    required: [true, VALIDATION.USER.USER_ID_REQUIRED]
  },
  name: {
    type: String,
    required: [true, VALIDATION.USER.NAME_REQUIRED],
    trim: true,
    maxlength: [50, VALIDATION.USER.NAME_MAX_LENGTH]
  },
  email: {
    type: String,
    required: [true, VALIDATION.USER.EMAIL_REQUIRED],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      VALIDATION.USER.EMAIL_INVALID
    ],
    index: true // Explicit index declaration
  },
  password: {
    type: String,
    required: [true, VALIDATION.USER.PASSWORD_REQUIRED],
    minlength: [6, VALIDATION.USER.PASSWORD_MIN_LENGTH],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CLIENT
  },
  // Admin specific fields
  adminRole: {
    type: String,
    enum: ADMIN_ROLE_ARRAY,
    default: ADMIN_ROLE.ADMIN
  },
  permissions: [{
    type: String,
    enum: PERMISSIONS_ARRAY
  }],
  // Freelancer specific fields
  skills: [String],
  hourlyRate: {
    type: Number,
    default: 0
  },
  experience: {
    type: String,
    enum: EXPERIENCE_LEVEL_ARRAY,
    default: EXPERIENCE_LEVEL.BEGINNER
  },
  bio: String,
  // Client specific fields
  company: String,
  phone: String,
  website: String,
  location: String,
  title: String,
  additionalFields: [{
    name: String,
    value: String
  }],
  // Common fields
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: USER_STATUS_ARRAY,
    default: USER_STATUS.ACTIVE
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  otpCode: String,
  otpExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes for better query performance
// Note: email and userID already have indexes from unique: true, so we only add compound indexes
userSchema.index({ role: 1, status: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);
