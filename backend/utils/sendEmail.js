const nodemailer = require('nodemailer');
const { EMAIL_CONFIG } = require('../constants');

const sendEmail = async (options) => {
  try {
    // Validate email configuration
    if (!EMAIL_CONFIG.HOST || !EMAIL_CONFIG.PORT || !EMAIL_CONFIG.USER || !EMAIL_CONFIG.PASS) {
      const missing = [];
      if (!EMAIL_CONFIG.HOST) missing.push('EMAIL_HOST');
      if (!EMAIL_CONFIG.PORT) missing.push('EMAIL_PORT');
      if (!EMAIL_CONFIG.USER) missing.push('EMAIL_USER');
      if (!EMAIL_CONFIG.PASS) missing.push('EMAIL_PASS');
      
      const error = new Error(`Email configuration missing: ${missing.join(', ')}. Please check your environment variables.`);
      console.error('Email configuration error:', error.message);
      throw error;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.HOST,
      port: parseInt(EMAIL_CONFIG.PORT, 10) || 587,
      secure: parseInt(EMAIL_CONFIG.PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_CONFIG.USER,
        pass: EMAIL_CONFIG.PASS,
      },
      // Add timeout and connection settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify transporter configuration
    await transporter.verify();

    // Define email options
    const mailOptions = {
      from: EMAIL_CONFIG.FROM_EMAIL 
        ? `"${EMAIL_CONFIG.FROM_NAME || 'V-Accel'}" <${EMAIL_CONFIG.FROM_EMAIL}>`
        : EMAIL_CONFIG.USER,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Provide more detailed error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to email server. Please check your email configuration.');
    } else if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your email credentials.');
    } else if (error.message && error.message.includes('configuration')) {
    throw error;
    }
    throw new Error(`Email could not be sent: ${error.message || 'Unknown error'}`);
  }
};

module.exports = sendEmail;
