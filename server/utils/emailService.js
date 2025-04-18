const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
  logger: true 
});

transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const emailTemplates = {
  appointmentRequested: (appointment, userName, storeName) => ({
    subject: 'Appointment Request Confirmation',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <div style="background-color: #007bff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Appointment Request Confirmation</h2>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px;">Dear ${userName},</p>
          <p style="color: #333; font-size: 16px;">Your appointment request at <strong>${storeName}</strong> has been received.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Appointment Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0; color: #555;">📅 Date: ${new Date(appointment.appointment_time).toLocaleDateString()}</li>
              <li style="margin: 10px 0; color: #555;">⏰ Time: ${new Date(appointment.appointment_time).toLocaleTimeString()}</li>
              <li style="margin: 10px 0; color: #555;">⌛ Duration: ${appointment.duration_minutes} minutes</li>
            </ul>
          </div>

          <p style="color: #666; font-size: 14px;">We will notify you once the store owner reviews your request.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #888; font-size: 14px;">Thank you for choosing our service!</p>
            <p style="color: #888; font-size: 12px;">If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      </div>
    `
  }),

  appointmentUpdated: (appointment, userName, storeName, status) => ({
    subject: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
        <div style="background-color: ${status === 'approved' ? '#28a745' : '#dc3545'}; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
        </div>
        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px;">Dear ${userName},</p>
          <p style="color: #333; font-size: 16px;">Your appointment at <strong>${storeName}</strong> has been <strong>${status}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: ${status === 'approved' ? '#28a745' : '#dc3545'}; margin-top: 0;">Appointment Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0; color: #555;">📅 Date: ${new Date(appointment.appointment_time).toLocaleDateString()}</li>
              <li style="margin: 10px 0; color: #555;">⏰ Time: ${new Date(appointment.appointment_time).toLocaleTimeString()}</li>
              <li style="margin: 10px 0; color: #555;">⌛ Duration: ${appointment.duration_minutes} minutes</li>
            </ul>
          </div>

          ${status === 'approved' ? `
          <p style="color: #28a745; font-weight: bold;">We look forward to seeing you!</p>
          ` : `
          <p style="color: #666;">We apologize for any inconvenience. Feel free to book another appointment.</p>
          `}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #888; font-size: 14px;">Thank you for choosing our service!</p>
            <p style="color: #888; font-size: 12px;">If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      </div>
    `
  })
};

const sendEmail = async (to, template) => {
  try {
    console.log('Preparing to send email to:', to);
    console.log('Email template:', template);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
    };

    console.log('Mail options:', mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
};