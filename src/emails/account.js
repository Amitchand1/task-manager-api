const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (email, name) => {
  try {
    await sgMail.send({
      from: 'amit99chand@gmail.com',
      to: email,
      subject: 'Welcome to the App',
      text: `Welcome to App, ${name}. Let me know your experience with the app`,
    });
  } catch (error) {
    console.log(error);
  }
};

const cancelEmail = async (email, name) => {
  try {
    await sgMail.send({
      to: email,
      from: 'amit99chand@gmail.com',
      subject: 'Sorry to see you go',
      text: `GoodBye ${name}. Hope we will meet soon`,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendWelcomeEmail,
  cancelEmail,
};
