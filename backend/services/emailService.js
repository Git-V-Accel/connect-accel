const nodemailer = require('nodemailer');

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // Check for EMAIL_* variables first (from constants), then SMTP_* as fallback
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
    console.log('[emailService] SMTP transporter initialized:', { host, port, user: user.substring(0, 3) + '***' });
    return cachedTransporter;
  }

  // Fallback to Ethereal (dev preview inbox) when SMTP creds are not provided
  console.warn('[emailService] No SMTP credentials found. Using Ethereal test SMTP. Set EMAIL_USER/EMAIL_PASS or SMTP_USER/SMTP_PASS for real emails.');
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.warn('[emailService] Using Ethereal test SMTP. Emails will be sent to test inbox.');
    return cachedTransporter;
  } catch (e) {
    console.error('Failed to initialize fallback Ethereal transporter:', e?.message || e);
    throw e;
  }
}

async function sendEmail(to, subject, html) {
  if (!to) {
    console.warn('sendEmail: No email address provided');
    return;
  }
  
  const from = process.env.MAIL_FROM || process.env.EMAIL_FROM_EMAIL || 'no-reply@connect-accel.com';
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log('Email sent:', { to, subject, messageId: info?.messageId });
    
    // If using Ethereal test account, log preview URL
    if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error('Email send failed:', { to, subject, error: err?.message || err });
    throw err; // Re-throw so caller knows it failed
  }
}

function buildBrandHeader() {
  return `<div style="font-family:Inter,Arial,sans-serif;margin-bottom:16px">
    <h2 style="margin:0;color:#111">Connect - Accel</h2>
  </div>`;
}

function layout(content) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f6f7fb;padding:24px">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px">
      ${buildBrandHeader()}
      ${content}
      <div style="margin-top:24px;color:#6b7280;font-size:12px">This is an automated message. Please do not reply.</div>
    </div>
  </div>`;
}

async function sendShortlistedEmail({ to, freelancerName, projectTitle }) {
  if (!to) {
    console.warn('sendShortlistedEmail: No email address provided');
    return;
  }
  
  const html = layout(`
    <p style="color:#111">Hi ${freelancerName || 'Freelancer'},</p>
    <p>Your proposal has been <strong>shortlisted</strong> for the project <strong>${projectTitle}</strong>.</p>
    <p>We will notify you once the client takes a final decision.</p>
  `);
  
    await sendEmail(to, `You're shortlisted for ${projectTitle}`, html);
}

async function sendAcceptedEmail({ to, freelancerName, projectTitle }) {
  const html = layout(`
    <p style="color:#111">Hi ${freelancerName || 'Freelancer'},</p>
    <p>Great news! Your proposal for <strong>${projectTitle}</strong> has been <strong>accepted</strong>.</p>
    <p>Our team will contact you shortly with next steps.</p>
  `);
    await sendEmail(to, `Your proposal was accepted - ${projectTitle}`, html);
}

async function sendNotSelectedEmail({ to, freelancerName, projectTitle }) {
  const html = layout(`
    <p style="color:#111">Hi ${freelancerName || 'Freelancer'},</p>
    <p>Thank you for submitting a proposal for <strong>${projectTitle}</strong>.</p>
    <p>This time, another freelancer has been selected. We encourage you to keep applying to other projects.</p>
  `);
    await sendEmail(to, `Update on your proposal - ${projectTitle}`, html);
}

async function sendConsultationRequestEmail({ to, adminName, clientName, clientEmail, clientPhone, clientCompany, projectDetails }) {
  const html = layout(`
    <p style="color:#111">Hi ${adminName || 'Admin'},</p>
    <p>A client has requested a consultation. Please review the client details below:</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="margin-top:0;color:#111;font-size:16px;font-weight:600">Client Information</h3>
      <p style="margin:8px 0"><strong>Name:</strong> ${clientName || 'N/A'}</p>
      <p style="margin:8px 0"><strong>Email:</strong> ${clientEmail || 'N/A'}</p>
      <p style="margin:8px 0"><strong>Phone:</strong> ${clientPhone || 'N/A'}</p>
      ${clientCompany ? `<p style="margin:8px 0"><strong>Company:</strong> ${clientCompany}</p>` : ''}
      ${projectDetails ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb">
          <h4 style="margin:0 0 8px 0;color:#111;font-size:14px;font-weight:600">Project Details:</h4>
          <p style="margin:4px 0;color:#6b7280;font-size:13px">${projectDetails}</p>
        </div>
      ` : ''}
    </div>
    <p style="color:#111;margin-top:16px">Please contact the client at your earliest convenience to schedule a consultation.</p>
    <div style="margin-top:24px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px">
      <p style="margin:0;color:#1e40af;font-size:13px"><strong>Action Required:</strong> Contact the client to discuss their project requirements and provide guidance.</p>
    </div>
  `);
    await sendEmail(to, `Consultation Request from ${clientName || 'Client'}`, html);
}

async function sendPasswordChangedEmail({ to, userName }) {
  if (!to) {
    console.warn('sendPasswordChangedEmail: No email address provided');
    return;
  }
  
  const html = layout(`
    <p style="color:#111">Hi ${userName || 'User'},</p>
    <p>Your password has been <strong>successfully changed</strong>.</p>
    <div style="margin-top:24px;padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px">
      <p style="margin:0;color:#166534;font-size:13px"><strong>✓ Password Changed Successfully</strong></p>
      <p style="margin:8px 0 0 0;color:#166534;font-size:13px">Your account password was updated on ${new Date().toLocaleString()}.</p>
    </div>
    <p style="color:#111;margin-top:16px">If you did not make this change, please contact our support team immediately.</p>
    <div style="margin-top:24px;padding:12px;background:#fef3c7;border:1px solid #fde047;border-radius:6px">
      <p style="margin:0;color:#92400e;font-size:13px"><strong>Security Tip:</strong> Keep your password secure and never share it with anyone.</p>
    </div>
  `);
  
    await sendEmail(to, 'Password Changed Successfully - Connect Accel', html);
}

// Status labels mapping
const statusLabels = {
  draft: 'Draft',
  active: 'Pending Review',
  pending_review: 'Pending Review',
  in_bidding: 'In Bidding',
  in_progress: 'In Progress',
  completed: 'Completed',
  hold: 'On Hold',
  cancelled: 'Cancelled',
  assigned: 'Assigned'
};

async function sendProjectStatusChangeEmail({ to, userName, projectTitle, oldStatus, newStatus, changedBy, remark }) {
  if (!to) {
    console.warn('sendProjectStatusChangeEmail: No email address provided');
    return;
  }

  const oldStatusLabel = statusLabels[oldStatus] || oldStatus || 'Unknown';
  const newStatusLabel = statusLabels[newStatus] || newStatus || 'Unknown';
  
  const statusColor = {
    'Pending Review': '#f59e0b',
    'In Bidding': '#3b82f6',
    'In Progress': '#10b981',
    'Completed': '#10b981',
    'On Hold': '#f97316',
    'Cancelled': '#ef4444',
    'Draft': '#6b7280'
  }[newStatusLabel] || '#6b7280';

  const html = layout(`
    <p style="color:#111">Hi ${userName || 'User'},</p>
    <p>The status of project <strong>"${projectTitle}"</strong> has been updated.</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
      <h3 style="margin-top:0;color:#111;font-size:16px;font-weight:600">Status Update</h3>
      <div style="display:flex;align-items:center;gap:12px;margin:12px 0">
        <span style="padding:4px 12px;background:#f3f4f6;border-radius:4px;color:#6b7280;font-size:13px">${oldStatusLabel}</span>
        <span style="color:#9ca3af">→</span>
        <span style="padding:4px 12px;background:${statusColor}15;border-radius:4px;color:${statusColor};font-size:13px;font-weight:600">${newStatusLabel}</span>
      </div>
      ${changedBy ? `<p style="margin:8px 0;color:#6b7280;font-size:13px"><strong>Changed by:</strong> ${changedBy}</p>` : ''}
      ${remark ? `<div style="margin-top:12px;padding:12px;background:#fff;border-left:3px solid ${statusColor};border-radius:4px">
        <p style="margin:0;color:#111;font-size:13px"><strong>Reason/Remark:</strong></p>
        <p style="margin:8px 0 0 0;color:#6b7280;font-size:13px">${remark}</p>
      </div>` : ''}
      <p style="margin:16px 0 0 0;color:#6b7280;font-size:12px">Updated at ${new Date().toLocaleString()}</p>
    </div>
    <p style="color:#111;margin-top:16px">You can view the updated project details in your dashboard.</p>
  `);
  
  await sendEmail(to, `Project Status Updated: ${projectTitle} - ${newStatusLabel}`, html);
}

module.exports = {
  sendEmail,
  sendShortlistedEmail,
  sendAcceptedEmail,
  sendNotSelectedEmail,
  sendConsultationRequestEmail,
  sendPasswordChangedEmail,
  sendProjectStatusChangeEmail,
};


