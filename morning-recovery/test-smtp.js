const nodemailer = require('nodemailer');

// Test with Microsoft 365 settings
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@itwhip.com',
    pass: 'Xianns8686*'
  }
});

transporter.sendMail({
  from: 'info@itwhip.com',
  to: 'hxris08@gmail.com',
  subject: 'Test from ItWhip App',
  text: 'If you see this, Microsoft 365 SMTP works!'
}, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info);
  }
});