const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const brandedEmail = ({ title, greeting, message, code, note }) => `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7f4;font-family:Arial,Helvetica,sans-serif;color:#14231b"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #dce8df;border-radius:16px;overflow:hidden"><tr><td style="background:#0b3b24;color:#fff;padding:24px 28px"><div style="font-size:22px;font-weight:700">Digital Desk</div><div style="font-size:13px;color:#cce5d5;margin-top:4px">Your digital world, in one place</div></td></tr><tr><td style="padding:28px"><h1 style="font-size:21px;margin:0 0 12px;color:#14231b">${escapeHtml(title)}</h1><p style="font-size:15px;line-height:1.6;margin:0 0 12px">${escapeHtml(greeting)}</p><p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 18px">${escapeHtml(message)}</p>${code ? `<div style="background:#e8f5eb;border:1px solid #b9dfc5;border-radius:12px;color:#0b3b24;text-align:center;font-size:30px;font-weight:700;letter-spacing:8px;padding:16px;margin:20px 0">${escapeHtml(code)}</div>` : ''}<p style="font-size:12px;line-height:1.5;color:#64748b;margin:18px 0 0">${escapeHtml(note || 'If you did not request this, you can ignore this email.')}</p></td></tr><tr><td style="background:#f3f7f4;padding:16px 28px;color:#64748b;font-size:11px">&copy; ${new Date().getFullYear()} Digital Desk &middot; This is an automated account security email.</td></tr></table></td></tr></table></body></html>`;
const sendBrandedOtp = async (user, subject, title, message, code) => {
  try { const transporter = createTransporter(); if (!transporter) { if (config.nodeEnv === 'development') { logger.info(`[DEV EMAIL SIMULATION] ${subject} for ${user.email}: ${code}`); return true; } logger.error(`Cannot send ${subject} to ${user.email}: SMTP is not configured.`); return false; } await transporter.sendMail({ from: config.smtp.from, to: user.email, subject, html: brandedEmail({ title, greeting: `Hello ${user.name},`, message, code, note: 'This code expires in 10 minutes. Never share it with anyone.' }) }); return true; }
  catch (error) { logger.error(`Failed to send ${subject} to ${user.email}:`, error); return false; }
};
const sendEmailVerificationOtp = (user, code) => sendBrandedOtp(user, 'Verify your Digital Desk email', 'Verify your email address', 'Enter this one-time code in Digital Desk to confirm that this email address belongs to you.', code);
const sendAccountDeletionOtp = (user, code) => sendBrandedOtp(user, 'Confirm Digital Desk account deletion', 'Confirm account deletion', 'A request was made to permanently delete your Digital Desk account and its workspace data. Enter this one-time code to confirm the request.', code);

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
  const subject = `Welcome to Digital Desk, ${user.name.split(' ')[0]}! 🚀`;
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
          <h2 style="font-size: 22px; color: #0B3B24; margin-top: 0;">Welcome aboard, ${user.name}! 👋</h2>
          <p style="line-height: 1.6; font-size: 15px; color: #334155;">
            We are thrilled to have you join <strong>Digital Desk</strong>. Your unified personal digital command center is officially set up and ready to organize your digital workflow.
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
      logger.info(`[DEV EMAIL SIMULATION] Welcome email generated for ${user.email}`);
      return true;
    }
    await transporter.sendMail({
      from: config.smtp.from,
      to: user.email,
      subject,
      html,
    });
    logger.info(`Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send welcome email to ${user.email}:`, error);
    return false;
  }
};

/**
 * Send 6-digit OTP verification email for Password Reset
 */
const sendOtpEmail = async (user, otpCode) => {
  return sendBrandedOtp(user, 'Reset your Digital Desk password', 'Password reset request', 'Enter this one-time code in Digital Desk to reset your password.', otpCode);
  /*
  const subject = `Your Digital Desk Password Reset OTP`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAF6; margin: 0; padding: 0; color: #0F172A; }
        .container { max-width: 550px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(15,81,50,0.06); }
        .header { background: #0B3B24; padding: 28px 24px; text-align: center; color: #ffffff; }
        .content { padding: 32px 24px; text-align: center; }
        .otp-box { display: inline-block; background-color: #E8F5EB; border: 2px solid #10B981; color: #0B3B24; font-size: 36px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; margin: 20px 0; }
        .footer { background: #F1F5F2; padding: 16px; text-align: center; font-size: 12px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0; font-size: 24px;">Digital Desk Security</h2>
        </div>
        <div class="content">
          <h3 style="font-size: 20px; color: #0F172A; margin-top: 0;">Password Reset Request</h3>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Hello ${user.name}, use the 6-digit OTP code below to verify your identity and reset your password:
          </p>

          <div class="otp-box">${otpCode}</div>

          <p style="font-size: 13px; color: #EF4444; font-weight: 600;">
            This OTP code is valid for 10 minutes only.
          </p>
          <p style="font-size: 12px; color: #94A3B8;">
            If you did not request a password reset, please ignore this email.
          </p>
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
      logger.info(`[DEV OTP SIMULATION] Reset OTP for ${user.email} is: [ ${otpCode} ]`);
      return true;
    }
    await transporter.sendMail({
      from: config.smtp.from,
      to: user.email,
      subject,
      html,
    });
    logger.info(`OTP reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send OTP email to ${user.email}:`, error);
    return false;
  }
  */
};

const sendNotificationEmail = async (user, notification) => {
  const transporter = createTransporter();
  if (!transporter) return false;
  try {
    const html = brandedEmail({ title: notification.title, greeting: `Hello ${user.name},`, message: notification.message || notification.title, note: `Open Digital Desk to view this update: ${config.frontendUrl}${notification.link || '/'}` });
    await transporter.sendMail({ from: config.smtp.from, to: user.email, subject: `Digital Desk: ${notification.title}`, html, text: `${notification.message || notification.title}\n\nOpen Digital Desk: ${config.frontendUrl}${notification.link || '/'}` });
    return true;
  } catch (error) { logger.error(`Notification email failed for ${user.email}:`, error); return false; }
};

module.exports = {
  sendWelcomeEmail,
  sendOtpEmail,
  sendNotificationEmail,
  sendEmailVerificationOtp,
  sendAccountDeletionOtp,
};
