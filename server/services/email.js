const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a password reset code to the user's email.
 */
async function sendPasswordResetEmail(toEmail, resetCode) {
  await transporter.sendMail({
    from: `"Trails App" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Trails Password Reset Code',
    text: `Your password reset code is: ${resetCode}\n\nThis code expires in 15 minutes. If you did not request a reset, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;">
        <h2 style="color:#2D6A4F;">Password Reset</h2>
        <p>Use the code below to reset your Trails account password. It expires in <strong>15 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px 0;color:#1a1a1a;">
          ${resetCode}
        </div>
        <p style="color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
