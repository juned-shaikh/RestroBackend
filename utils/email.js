// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use smtp config
  auth: {
    user: process.env.EMAIL_USER,      // Your email
    pass: process.env.EMAIL_PASSWORD,  // Your app password (not regular email pass!)
  },
});

exports.sendBookingEmail = async (to, bookingDetails) => {
  const mailOptions = {
    from: `"Your Restaurant" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Booking Confirmation',
    html: `
      <h3>Hi ${bookingDetails.name},</h3>
      <p>Your booking has been confirmed:</p>
      <ul>
        <li><strong>Date:</strong> ${bookingDetails.date}</li>
        <li><strong>Time:</strong> ${bookingDetails.time}</li>
        <li><strong>People:</strong> ${bookingDetails.people}</li>
        <li><strong>Message:</strong> ${bookingDetails.message || 'N/A'}</li>
      </ul>
      <p>Thank you for choosing us!</p>
    `
  };

  await transporter.sendMail(mailOptions);
};
