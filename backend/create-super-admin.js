// Script to create initial super admin user
// Run this with: node create-super-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DATABASE_CONFIG, USER_ROLES } = require('./constants');
const { generateUserId } = require('./utils/userIdGenerator');

// Import User model
const User = require('./models/User');

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DATABASE_CONFIG.URI);
    console.log('✅ Connected to MongoDB');

    // Super admin user data
    const superAdminEmail = 'selvakumar@v-accel.ai';
    
    // Check if super admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: superAdminEmail },
        { role: USER_ROLES.SUPERADMIN }
      ]
    });
    
    if (existingAdmin) {
      console.log('\n⚠️  Super admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('\nTo update the existing user, please delete it first or use the update script.');
      process.exit(0);
    }

    // Generate unique user ID for super admin
    const userID = await generateUserId(USER_ROLES.SUPERADMIN);

    // Create super admin user
    const superAdminData = {
      userID: userID,
      name: 'Super Admin',
      email: superAdminEmail,
      password: 'Admin@123', // This will be hashed automatically by the User model middleware
      role: USER_ROLES.SUPERADMIN,
      adminRole: 'superadmin',
      company: 'V-Accel',
      phone: '9944796546',
      permissions: [
        'user_management',
        'project_management',
        'billing_management',
        'system_settings'
      ],
      isEmailVerified: true,
      isFirstLogin: false,
      status: 'active'
    };

    console.log('\n📝 Creating super admin user...');
    console.log('Details:');
    console.log('  Name:', superAdminData.name);
    console.log('  Email:', superAdminData.email);
    console.log('  Company:', superAdminData.company);
    console.log('  Phone:', superAdminData.phone);
    console.log('  User ID:', superAdminData.userID);
    
    const superAdmin = await User.create(superAdminData);
    
    console.log('\n✅ Super admin created successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email ID:   ', superAdmin.email);
    console.log('Password:   ', 'Admin@123');
    console.log('User ID:    ', superAdmin.userID);
    console.log('Role:       ', superAdmin.role);
    console.log('Admin Role: ', superAdmin.adminRole);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Store these credentials securely!');
    console.log('⚠️  Consider changing the password after first login for security.');
    
  } catch (error) {
    console.error('\n❌ Error creating super admin:');
    if (error.code === 11000) {
      console.error('A user with this email or userID already exists!');
    } else {
      console.error('Error:', error.message);
    }
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📡 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createSuperAdmin();
