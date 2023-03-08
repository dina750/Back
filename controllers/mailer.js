const nodemailer = require('nodemailer');
const  Mailgen  = require('mailgen');
const ejs = require('ejs');
const juice = require('juice');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amine.elj@esprit.tn',
    pass: '213JMT7861'
  }
});

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'My App',
    link: 'https://myapp.com'
  }
});

exports.sendConfirmationEmail = (recipientEmail, code) => {
    const email = {
      body: {
        name: recipientEmail,
        intro: 'Welcome to My App! Please confirm your email address to get started:',
        action: {
          instructions: 'To confirm your email address, please click the button below:',
          button: {
            color: '#33b5e5',
            text: 'Confirm Email Address',
            link: `http://localhost:5000/api/confirmEmail/${code}`
          }
        },
        outro: 'Thank you for using My App!'
      }
    };

  const emailBody = mailGenerator.generate(email);

  const message = {
    from: 'My App <noreply@myapp.com>',
    to: recipientEmail,
    subject: 'Confirm Your Email Address',
    html: emailBody
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('Error occurred. ' + err.message);
      return;
    }
    console.log('Confirmation email sent to %s with messageId %s', recipientEmail, info.messageId);
  });
};
