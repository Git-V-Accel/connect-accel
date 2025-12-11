// Email Templates for V-Accel

const { FRONTEND_CONFIG } = require("../constants");

const passwordResetTemplate = (resetUrl, userName = 'User') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - V-Accel</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: #ffffff !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #45a049;
                color: #ffffff !important;
                text-decoration: none !important;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Connect-Accel</div>
                <h2>Password Reset Request</h2>
            </div>
            
            <div class="content">
                <p>Hello ${userName},</p>
                
                <p>We received a request to reset your password for your Connect-Accel account. If you made this request, click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <div class="warning">
                    <strong>Important:</strong> This password reset link will expire in 10 minutes for security reasons.
                </div>
                
              
                
                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                
                <p>For security reasons, we recommend:</p>
                <ul>
                    <li>Using a strong, unique password</li>
                    <li>Not sharing your password with anyone</li>
                    <li>Logging out from shared devices</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>This email was sent from Connect-Accel. If you have any questions, please contact our support team.</p>
                <p>&copy; 2025 Connect-Accel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const otpVerificationTemplate = (otpCode, { userName = 'User', isResend = false } = {}) => {
  const headline = isResend ? 'Here is your new OTP code' : 'Verify your email address';
  const introText = isResend
    ? 'As requested, we have generated a new One-Time Password (OTP) for your V-Accel account.'
    : 'Welcome to V-Accel! Please use the One-Time Password (OTP) below to verify your email address and activate your account.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - V-Accel</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 10px;
            }
            .otp-box {
                background-color: #f4f4f4;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 25px 0;
                border: 2px dashed #4CAF50;
            }
            .otp-code {
                font-size: 36px;
                letter-spacing: 12px;
                color: #1a1a1a;
                font-weight: bold;
                margin: 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .info-box {
                background-color: #fff3cd;
                border-left: 4px solid #ffb200;
                padding: 15px 20px;
                border-radius: 8px;
                margin: 20px 0;
                color: #856404;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">V-Accel</div>
                <h2>${headline}</h2>
            </div>
            
            <div class="content">
                <p>Hello ${userName},</p>
                <p>${introText}</p>
                
                <div class="otp-box">
                    <p style="margin: 0 0 10px; color: #666;">Your verification code</p>
                    <p class="otp-code">${otpCode}</p>
                </div>
                
                <p>This OTP will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
                
                <div class="info-box">
                    <strong>Need a new code?</strong>
                    <p>You can request a new OTP from the login or signup page if this one expires.</p>
                </div>
                
                <p>If you did not request this verification code, please ignore this email or contact our support team.</p>
                
                <p>Best regards,<br/>The V-Accel Team</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from V-Accel. If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 V-Accel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const welcomeTemplate = (userName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to V-Accel</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">V-Accel</div>
                <h2>Welcome to V-Accel!</h2>
            </div>
            
            <div class="content">
                <p>Hello ${userName},</p>
                
                <p>Welcome to V-Accel! We're excited to have you on board.</p>
                
                <p>Your account has been successfully created. You can now:</p>
                <ul>
                    <li>Access all our features</li>
                    <li>Manage your profile</li>
                    <li>Connect with other users</li>
                    <li>Explore our platform</li>
                </ul>
                
                <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                
                <p>Thank you for choosing V-Accel!</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from V-Accel. If you have any questions, please contact our support team.</p>
                <p>&copy; 2024 V-Accel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const userCreationTemplate = (userName, email, temporaryPassword, role, loginUrl, userID) => {
  const roleDisplayName = role === 'admin' ? 'Administrator' : 
                         role === 'freelancer' ? 'Freelancer' : 
                         role === 'client' ? 'Client' : 
                         role === 'agent' ? 'Agent' : 'User';
    
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created -Connect-Accel</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4F46E5;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .credentials-box {
                background-color: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .credential-item {
                margin: 10px 0;
                font-family: 'Courier New', monospace;
            }
            .credential-label {
                font-weight: bold;
                color: #495057;
            }
            .credential-value {
                background-color: #e9ecef;
                padding: 5px 10px;
                border-radius: 4px;
                margin-left: 10px;
            }
            .button {
                display: inline-block;
                background-color: #4F46E5;
                color: #ffffff !important;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #4338CA;
                color: #ffffff;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .info {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Connect - Accel</div>
                <h2>Your Account Has Been Created!</h2>
            </div>
            
            <div class="content">
                <p>Hello ${userName},</p>
                
                <p>Welcome to Connect-Accel! Your account has been successfully created with the role of <strong>${roleDisplayName}</strong>.</p>
                
                <div class="credentials-box">
                    <h3 style="margin-top: 0; color: #495057;">Your Account Information:</h3>
                    <div class="credential-item">
                        <span class="credential-label">User ID:</span>
                        <span class="credential-value">${userID}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Email:</span>
                        <span class="credential-value">${email}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Temporary Password:</span>
                        <span class="credential-value">${temporaryPassword}</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${loginUrl}" class="button">Login to Your Account</a>
                </div>
                
                <div class="warning">
                    <strong>Important Security Notice:</strong>
                    <ul style="margin: 10px 0;">
                        <li>You must change your password on your first login</li>
                        <li>This temporary password will expire after your first login</li>
                        <li>Keep your credentials secure and don't share them</li>
                    </ul>
                </div>
                
                <div class="info">
                    <strong>What happens next?</strong>
                    <ol style="margin: 10px 0;">
                        <li>Click the login button above or visit: ${loginUrl}</li>
                        <li>Use the credentials provided above</li>
                        <li>You'll be prompted to change your password</li>
                        <li>After changing your password, you'll have access to all features based on your role</li>
                    </ol>
                </div>
                
                <p>If you have any questions or need assistance, please contact our support team.</p>
                
                <p>Thank you for joining Connect-Accel!</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Connect-Accel. If you have any questions, please contact our support team.</p>
                <p>&copy; 2025 Connect-Accel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const biddingAcceptedTemplate = (freelancerName, projectTitle, adminName, bidAmount, timeline) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bid Accepted -Connect-Accel</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4F46E5;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .success-box {
                background-color: #d4edda;
                border: 2px solid #c3e6cb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .success-icon {
                font-size: 48px;
                color: #28a745;
                margin-bottom: 10px;
            }
            .project-details {
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .detail-item {
                margin: 10px 0;
                display: flex;
                justify-content: space-between;
            }
            .detail-label {
                font-weight: bold;
                color: #495057;
            }
            .detail-value {
                color: #6c757d;
            }
            .button {
                display: inline-block;
                background-color: #28a745;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #218838;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Connect - Accel</div>
                <h2>🎉 Congratulations! Your Bid Has Been Accepted!</h2>
            </div>
            
            <div class="content">
                <p>Hello ${freelancerName},</p>
                
                <div class="success-box">
                    <div class="success-icon">✅</div>
                    <h3 style="margin: 0; color: #28a745;">Your proposal has been accepted!</h3>
                </div>
                
                <p>Great news! Your bid for the project has been accepted by <strong>${adminName}</strong>. You can now start working on this project.</p>
                
                <div class="project-details">
                    <h3 style="margin-top: 0; color: #495057;">Project Details:</h3>
                    <div class="detail-item">
                        <span class="detail-label">Project Title:</span>
                        <span class="detail-value">${projectTitle}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Accepted Bid Amount:</span>
                        <span class="detail-value">$${bidAmount}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Timeline:</span>
                        <span class="detail-value">${timeline}</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${FRONTEND_CONFIG.URL}/freelancer/projects" class="button">View Project Details</a>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Review the project requirements carefully</li>
                    <li>Contact the admin if you have any questions</li>
                    <li>Start working on the project according to the timeline</li>
                    <li>Keep the admin updated on your progress</li>
                </ol>
                
                <p>If you have any questions about this project, please don't hesitate to contact the admin or our support team.</p>
                
                <p>Good luck with your project!</p>
            </div>
            
            <div class="footer">
                <p>This email was sent fromConnect-Accel. If you have any questions, please contact our support team.</p>
                <p>&copy; 2024Connect-Accel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const biddingDeclinedTemplate = (freelancerName, projectTitle, adminName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bid Declined -Connect-Accel</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4F46E5;
                margin-bottom: 10px;
            }
            .content {
                margin-bottom: 30px;
            }
            .info-box {
                background-color: #d1ecf1;
                border: 2px solid #bee5eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .info-icon {
                font-size: 48px;
                color: #0c5460;
                margin-bottom: 10px;
            }
            .project-details {
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .detail-item {
                margin: 10px 0;
                display: flex;
                justify-content: space-between;
            }
            .detail-label {
                font-weight: bold;
                color: #495057;
            }
            .detail-value {
                color: #6c757d;
            }
            .button {
                display: inline-block;
                background-color: #4F46E5;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            .button:hover {
                background-color: #4338CA;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Connect - Accel</div>
                <h2>Bid Update</h2>
            </div>
            
            <div class="content">
                <p>Hello ${freelancerName},</p>
                
                <div class="info-box">
                    <div class="info-icon">ℹ️</div>
                    <h3 style="margin: 0; color: #0c5460;">Your bid was not selected for this project</h3>
                </div>
                
                <p>We wanted to inform you that your bid for the project has been declined by <strong>${adminName}</strong>. While this particular project didn't work out, there are many other opportunities available.</p>
                
                <div class="project-details">
                    <h3 style="margin-top: 0; color: #495057;">Project Details:</h3>
                    <div class="detail-item">
                        <span class="detail-label">Project Title:</span>
                        <span class="detail-value">${projectTitle}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Admin:</span>
                        <span class="detail-value">${adminName}</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${FRONTEND_CONFIG.URL}/freelancer/bidding" class="button">Browse More Projects</a>
                </div>
                
                <p><strong>Don't be discouraged!</strong> Here are some tips for future bids:</p>
                <ul>
                    <li>Review project requirements carefully before bidding</li>
                    <li>Provide detailed descriptions of your approach</li>
                    <li>Set competitive but realistic pricing</li>
                    <li>Highlight relevant experience and skills</li>
                    <li>Respond promptly to any questions</li>
                </ul>
                
                <p>Keep an eye out for new projects that match your skills and interests. We're confident you'll find the right opportunity soon!</p>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Connect-Accel. If you have any questions, please contact our support team.</p>
                <p>&copy; 2024   Connect-Accel. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  passwordResetTemplate,
  otpVerificationTemplate,
  welcomeTemplate,
  userCreationTemplate,
  biddingAcceptedTemplate,
  biddingDeclinedTemplate
};
