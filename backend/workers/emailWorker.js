const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const { getRedisClient, isRedisAvailable } = require('../config/redis');
const { REDIS_CONFIG } = require('../constants');

// Email sending function (direct, not queued)
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
    console.log('[emailWorker] SMTP transporter initialized:', { host, port, user: user.substring(0, 3) + '***' });
    return cachedTransporter;
  }

  // Fallback to Ethereal (dev preview inbox) when SMTP creds are not provided
  console.warn('[emailWorker] No SMTP credentials found. Using Ethereal test SMTP. Set EMAIL_USER/EMAIL_PASS or SMTP_USER/SMTP_PASS for real emails.');
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.warn('[emailWorker] Using Ethereal test SMTP. Emails will be sent to test inbox.');
    return cachedTransporter;
  } catch (e) {
    console.error('Failed to initialize fallback Ethereal transporter:', e?.message || e);
    throw e;
  }
}

async function sendEmailDirect(to, subject, html) {
  if (!to) {
    console.warn('[emailWorker] sendEmailDirect: No email address provided');
    return;
  }
  
  const from = process.env.MAIL_FROM || process.env.EMAIL_FROM_EMAIL || 'no-reply@connect-accel.com';

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from, to, subject, html });
    
    // If using Ethereal test account, log preview URL
    if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
      console.log('[emailWorker] Email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    console.log('[emailWorker] Email sent successfully:', { to, subject, messageId: info?.messageId });
    return info;
  } catch (err) {
    console.error('[emailWorker] Email send failed:', { to, subject, error: err?.message || err });
    throw err;
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

// Email queue name
const EMAIL_QUEUE_NAME = 'email-queue';

/**
 * Initialize email worker
 */
const initializeEmailWorker = () => {
  const connection = {
    host: REDIS_CONFIG.HOST,
    port: REDIS_CONFIG.PORT,
    password: REDIS_CONFIG.PASSWORD,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('Email worker: Redis connection failed after 3 attempts. Worker will not process jobs.');
        return null; // Stop retrying
      }
      return Math.min(times * 50, 1000);
    },
    lazyConnect: true,
  };

  const worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const { type, data } = job.data;

      try {
        switch (type) {
          case 'sendEmail':
            await sendEmailDirect(data.to, data.subject, data.html);
            break;

          case 'sendShortlistedEmail': {
            const html = layout(`
              <p style="color:#111">Hi ${data.freelancerName || 'Freelancer'},</p>
              <p>Your proposal has been <strong>shortlisted</strong> for the project <strong>${data.projectTitle}</strong>.</p>
              <p>We will notify you once the client takes a final decision.</p>
            `);
            await sendEmailDirect(data.to, `You're shortlisted for ${data.projectTitle}`, html);
            break;
          }

          case 'sendAcceptedEmail': {
            const html = layout(`
              <p style="color:#111">Hi ${data.freelancerName || 'Freelancer'},</p>
              <p>Great news! Your proposal for <strong>${data.projectTitle}</strong> has been <strong>accepted</strong>.</p>
              <p>Our team will contact you shortly with next steps.</p>
            `);
            await sendEmailDirect(data.to, `Your proposal was accepted - ${data.projectTitle}`, html);
            break;
          }

          case 'sendNotSelectedEmail': {
            const html = layout(`
              <p style="color:#111">Hi ${data.freelancerName || 'Freelancer'},</p>
              <p>Thank you for submitting a proposal for <strong>${data.projectTitle}</strong>.</p>
              <p>This time, another freelancer has been selected. We encourage you to keep applying to other projects.</p>
            `);
            await sendEmailDirect(data.to, `Update on your proposal - ${data.projectTitle}`, html);
            break;
          }

          case 'sendConsultationRequestEmail': {
            const html = layout(`
              <p style="color:#111">Hi ${data.adminName || 'Admin'},</p>
              <p>A client has requested a consultation. Please review the client details below:</p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
                <h3 style="margin-top:0;color:#111;font-size:16px;font-weight:600">Client Information</h3>
                <p style="margin:8px 0"><strong>Name:</strong> ${data.clientName || 'N/A'}</p>
                <p style="margin:8px 0"><strong>Email:</strong> ${data.clientEmail || 'N/A'}</p>
                <p style="margin:8px 0"><strong>Phone:</strong> ${data.clientPhone || 'N/A'}</p>
                ${data.clientCompany ? `<p style="margin:8px 0"><strong>Company:</strong> ${data.clientCompany}</p>` : ''}
                ${data.projectDetails ? `
                  <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb">
                    <h4 style="margin:0 0 8px 0;color:#111;font-size:14px;font-weight:600">Project Details:</h4>
                    <p style="margin:4px 0;color:#6b7280;font-size:13px">${data.projectDetails}</p>
                  </div>
                ` : ''}
              </div>
              <p style="color:#111;margin-top:16px">Please contact the client at your earliest convenience to schedule a consultation.</p>
              <div style="margin-top:24px;padding:12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px">
                <p style="margin:0;color:#1e40af;font-size:13px"><strong>Action Required:</strong> Contact the client to discuss their project requirements and provide guidance.</p>
              </div>
            `);
            await sendEmailDirect(data.to, `Consultation Request from ${data.clientName || 'Client'}`, html);
            break;
          }

          case 'sendPasswordChangedEmail': {
            const html = layout(`
              <p style="color:#111">Hi ${data.userName || 'User'},</p>
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
            await sendEmailDirect(data.to, 'Password Changed Successfully - Connect Accel', html);
            break;
          }

          default:
            console.warn(`Unknown email job type: ${type}`);
        }

        return { success: true };
      } catch (error) {
        console.error(`Email worker error for job ${job.id}:`, error);
        throw error; // Re-throw to trigger retry
      }
    },
    {
      connection,
      concurrency: 5, // Process up to 5 emails concurrently
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 1000, // Keep max 1000 completed jobs
      },
      removeOnFail: {
        age: 24 * 3600, // Keep failed jobs for 24 hours
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Email worker: Job ${job?.id} failed:`, err.message || err);
  });

  worker.on('error', (err) => {
    // Suppress connection-related errors when Redis is not available
    const isConnectionError = 
      err.code === 'ECONNREFUSED' || 
      err.message?.includes('ECONNREFUSED') ||
      err.message?.includes('Connection is closed') ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ETIMEDOUT';
    
    if (!isConnectionError) {
      console.error('Email worker error:', err);
    }
    // Silently ignore connection errors - Redis is optional
  });

  // Try to connect, but don't fail if Redis is not available
  worker.on('ready', () => {
    console.log('Email worker initialized and ready');
  });

  console.log('Email worker initialized (will connect when Redis is available)');

  return worker;
};

module.exports = {
  initializeEmailWorker,
  EMAIL_QUEUE_NAME,
};

