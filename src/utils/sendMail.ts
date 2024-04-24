import nodemailer from "nodemailer";
require("dotenv").config();

//1. VIA ETHEREAL --
const etherealTransporter = nodemailer.createTransport({
    host: process.env.HOST_LOCAL_SMTP, //smtp.forwardemail.net
    port: 587,
    // secure: true,
    auth: {
        user: process.env.USER_LOCAL_SMTP,
        pass: process.env.PASSWORD_LOCAL_SMTP,
    },
});

const sendEtherealMail = async ({ from, to, subject, html }: any | string) => {
    try {
        await etherealTransporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

//2. VIA GMAIL --
const liveTransporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
        user: "sayyedfahed828@gmail.com",
        pass: "ambagtssyfegabuw",
    },
});

const sendLiveMail = async ({ from, to, subject, html }: any | string) => {
    try {
        await liveTransporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export { sendEtherealMail, sendLiveMail };