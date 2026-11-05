const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const brandedEmail = ({ title, greeting, message, code, note }) => `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7f4;font-family:Arial,Helvetica,sans-serif;color:#14231b"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #dce8df;border-radius:16px;overflow:hidden"><tr><td style="background:#0b3b24;color:#fff;padding:24px 28px"><div style="font-size:22px;font-weight:700">Digital Desk</div><div style="font-size:13px;color:#cce5d5;margin-top:4px">Your digital world, in one place</div></td></tr><tr><td style="padding:28px"><h1 style="font-size:21px;margin:0 0 12px;color:#14231b">${escapeHtml(title)}</h1><p style="font-size:15px;line-height:1.6;margin:0 0 12px">${escapeHtml(greeting)}</p><p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 18px">${escapeHtml(message)}</p>${code ? `<div style="background:#e8f5eb;border:1px solid #b9dfc5;border-radius:12px;color:#0b3b24;text-align:center;font-size:30px;font-weight:700;letter-spacing:8px;padding:16px;margin:20px 0">${escapeHtml(code)}</div>` : ''}<p style="font-size:12px;line-height:1.5;color:#64748b;margin:18px 0 0">${escapeHtml(note || 'If you did not request this, you can ignore this email.')}</p><p style="font-size:14px;line-height:1.6;color:#475569;margin:22px 0 0">With care,<br><strong>The Digital Desk team</strong></p></td></tr><tr><td style="background:#f3f7f4;padding:16px 28px;color:#64748b;font-size:11px">&copy; ${new Date().getFullYear()} Digital Desk &middot; This is an automated account security email.</td></tr></table></td></tr></table></body></html>`;
const sendBrandedOtp = async (user, subject, title, message, code) => {
  try { const transporter = createTransporter(); if (!transporter) { logger.warn(`${subject} could not be sent because SMTP is not configured.`); return false; } await transporter.sendMail({ from: config.smtp.from, to: user.email, subject, html: brandedEmail({ title, greeting: `Hello ${user.name},`, message, code, note: 'This code expires in 10 minutes. Never share it with anyone.' }) }); return true; }
  catch (error) { logger.error(`Failed to send ${subject}:`, error); return false; }
};
const sendEmailVerificationOtp = (user, code) => sendBrandedOtp(user, 'A little welcome from Digital Desk — verify your email', 'Your workspace is waiting', 'Enter this one-time code to confirm your email and step into your new workspace. We are glad you are here.', code);
const sendAccountDeletionOtp = (user, code) => sendBrandedOtp(user, "We'll miss you — please confirm your account deletion", 'Before you go', 'We are sorry to see you leave. Enter this one-time code to confirm the permanent deletion of your Digital Desk account and workspace data. If you change your mind, simply leave this request unfinished. We hope you will visit again.', code);

// Create reusable transporter
const createTransporter = () => {
  if (!config.smtp.user || config.smtp.user.includes('your_email')) {
    return null; // Local development mode fallback (console output)
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // true for 465, false for 587
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
};

/**
 * Send personalized Welcome Email to newly registered user
 */
const sendWelcomeEmail = async (user) => {
  const safeName = escapeHtml(user.name);
  const subject = 'A warm welcome to Digital Desk';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAF6; margin: 0; padding: 0; color: #0F172A; }
        .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(15,81,50,0.06); }
        .header { background: #0B3B24; padding: 36px 30px; text-align: center; color: #ffffff; }
        .content { padding: 36px 30px; }
        .button { display: inline-block; background-color: #0F5132; color: #ffffff !important; font-weight: bold; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin-top: 20px; }
        .footer { background: #F1F5F2; padding: 20px; text-align: center; font-size: 12px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 28px; letter-spacing: -0.02em;">Digital Desk</h1>
          <p style="margin: 6px 0 0; opacity: 0.85; font-size: 14px;">Your digital world, in one place.</p>
        </div>
        <div class="content">
          <h2 style="font-size: 22px; color: #0B3B24; margin-top: 0;">A warm welcome, ${safeName}.</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #334155;">
            We are so glad you made a little space for Digital Desk. Your personal workspace is ready whenever you are, and we hope it helps your days feel a bit more organized and a lot more yours.
          </p>
          
          <div style="background: #E8F5EB; border-left: 4px solid #10B981; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <strong style="color: #0B3B24;">What you can do right now:</strong>
            <ul style="margin: 8px 0 0; padding-left: 20px; color: #0F5132; font-size: 14px; line-height: 1.5;">
              <li>Manage your daily tasks with real-time status tracking</li>
              <li>View your upcoming meetings and calendar events</li>
              <li>Monitor GitHub repositories and unread Gmail notifications</li>
              <li>Control your background music and check live weather updates</li>
            </ul>
          </div>

          <p style="line-height:1.6;font-size:15px;color:#334155">Take your time exploring. You can connect the tools you already use, shape your workspace around your routines, and come back whenever you need a calmer place to land.</p>

          <div style="text-align: center;">
            <a href="${config.frontendUrl}/dashboard" class="button">Open Your Digital Desk</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Digital Desk. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = createTransporter();
    if (!transporter) {
      logger.warn('Welcome email could not be sent because SMTP is not configured.');
      return false;
    }
    await transporter.sendMail({
      from: config.smtp.from,
      to: user.email,
      subject,
      html,
    });
    logger.info(`Welcome email sent.`);
    return true;
  } catch (error) {
    logger.error(`Failed to send welcome email:`, error);
    return false;
  }
};

/**
 * Send 6-digit OTP verification email for Password Reset
 */
const sendOtpEmail = async (user, otpCode) => {
  return sendBrandedOtp(user, 'Your Digital Desk workspace is here when you are ready', 'Let’s get you back in', 'Enter this one-time code to choose a new password and return to your workspace. We will be right here when you are ready.', otpCode);
};

const sendNotificationEmail = async (user, notification) => {
  const transporter = createTransporter();
  if (!transporter) return false;
  try {
    const html = brandedEmail({ title: notification.title, greeting: `Hello ${user.name},`, message: notification.message || notification.title, note: `Open Digital Desk to view this update: ${config.frontendUrl}${notification.link || '/'}` });
    const safeSubject = String(notification.title || 'Workspace update').replace(/[\r\n]/g, ' ').slice(0, 120);
    await transporter.sendMail({ from: config.smtp.from, to: user.email, subject: `A note from Digital Desk: ${safeSubject}`, html, text: `${notification.message || notification.title}\n\nOpen Digital Desk: ${config.frontendUrl}${notification.link || '/'}` });
    return true;
  } catch (error) { logger.error(`Notification email failed:`, error); return false; }
};

module.exports = {
  sendWelcomeEmail,
  sendOtpEmail,
  sendNotificationEmail,
  sendEmailVerificationOtp,
  sendAccountDeletionOtp,
};

