const sgMail = require('@sendgrid/mail');

const sendGridApiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridApiKey);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'franco.bianco93@hotmail.com',
        subject: `Hi ${name}, welcome to Task Manager APP`,
        text: `We are happy you join us!`
    }).then((result) => {
    }).catch((e) => console.log(e.response.body));
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'franco.bianco93@hotmail.com',
        subject: `Hi ${name}, we are sad 'cause you leave us!`,
        text: `We wish you the best, regards!`
    }).then((result) => {
    }).catch((e) => console.log(e.response.body));
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}