import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { findAndConnectToStateDB } from "../../config/dbutil";
import { sendEtherealMail } from "../../utils/sendMail";

require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   host: process.env.HOST_LOCAL_SMTP, //smtp.forwardemail.net
//   port: 587,
//   // secure: true,
//   auth: {
//     user: process.env.USER_LOCAL_SMTP,
//     pass: process.env.PASSWORD_LOCAL_SMTP,
//   },
// });

// TO UPDATE THE ATHLETE PASSWORD THAT WE'VE SENT FIRST TIME TO THE ATHELETE --
export const resetPassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token as string, `${process.env.SECRET_KEY}`) as JwtPayload;
    const { email, stateUnit } = decodedToken;

    console.log(stateUnit,email, "check club");

    if (typeof stateUnit !== "string") {
      return res.status(400).json({ message: "Invalid state from token parameter." });
    }

    const normalizedStateUnit = stateUnit.toLowerCase();

    const stateDB = await findAndConnectToStateDB(normalizedStateUnit);
    const user = await stateDB("users").where({ email }).first();
    console.log("user State:", stateUnit);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(currentPassword, user.password, "check pass");

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await stateDB("users").where({ email }).update({ password: hashedPassword });

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error: any) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", errorMSG: error.message });
  }
};

// IN CASE OF FORGOT PASSWORD --
export const forgotPassword = async (req: Request, res: Response) => {
  const { email, stateUnit } = req.body;

  try {
    if (typeof stateUnit !== "string") {
      return res.status(400).json({ message: "Invalid state from token parameter." });
    }

    const normalizedState = stateUnit.toLowerCase();
    const stateDB = await findAndConnectToStateDB(normalizedState);

    const user = await stateDB("users").where({ email }).first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const secretKey = `${process.env.SECRET_KEY}`;
    const token = jwt.sign({ email, stateUnit }, secretKey, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.SERVER_HOST}/auth/confirm-forgot-password?token=${token}`;

    const forgotPasswordEmailBody = `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <h2 style="color: #007bff;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. To proceed with the password reset, please click the link below:</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </p>
            <p>If you didn't request this, you can ignore this email. Your password won't be changed.</p>
            <p style="margin-top: 20px;">Thank you!</p>
            <p style="font-size: 12px; color: #777;">This email was sent automatically. Please do not reply.</p>
            </div>
        `;

    const mailOptions = {
      from: `"STS" <stspl@gmail.com>`,
      to: email,
      subject: " Your Password Reset Request",
      html: forgotPasswordEmailBody,
    };

    const emailOPT = await sendEtherealMail(mailOptions);
    console.log(emailOPT);

    res.status(201).json({ message: "Request sent successfully!" })

  } catch (error: any) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", errorMSG: error.message });
  }
};

// TO UPDATE THE FORGOT PASSWORD TO THE NEW PASSWORD --
export const confirmPasswordReset = async (req: Request, res: Response) => {
  const { yourPassword, confirmPassword } = req.body;
  const { token } = req.query;

  console.log(yourPassword, confirmPassword, "password--");

  try {
    const decodedToken = jwt.verify(token as string,`${process.env.SECRET_KEY}`) as { email: string; stateUnit: string };

    if (yourPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const { email, stateUnit } = decodedToken;
    console.log(email, stateUnit, "from fgt password --");

    if (typeof stateUnit !== "string") {
      return res.status(400).json({ message: "Invalid state from token parameter." });
    }

    const normalizedState = stateUnit.toLowerCase();
    const stateDB = await findAndConnectToStateDB(normalizedState);

    const user = await stateDB("users").where({ email }).first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(yourPassword, saltRounds);

    await stateDB("users").where({ email }).update({ password: hashedPassword });

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error", errorMSG: error.message });
  }
};
