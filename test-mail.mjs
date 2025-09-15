import nodemailer from 'nodemailer';

console.log('Testing email connection...');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@itwhip.com',
    pass: 'Xianns8686*'
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Connection failed:', error.message);
    if (error.response) console.log('SMTP response:', error.response);
  } else {
    console.log('Connection successful! Sending test email...');
    transporter.sendMail({
      from: 'info@itwhip.com',
      to: 'hxris08@gmail.com',
      subject: 'ItWhip Test',
      text: 'Email system is working!'
    }, (err, info) => {
      if (err) {
        console.log('Send failed:', err.message);
      } else {
        console.log('Email sent! ID:', info.messageId);
      }
    });
  }
});
