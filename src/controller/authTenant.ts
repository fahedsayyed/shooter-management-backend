import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { findAndConnectToStateDB } from "../config/dbutil";

require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.HOST_LOCAL_SMTP, //smtp.forwardemail.net
  port: 587,
  // secure: true,
  auth: {
    user: process.env.USER_LOCAL_SMTP,
    pass: process.env.PASSWORD_LOCAL_SMTP,
  },
});


// TO UPDATE THE ATHLETE PASSWORD THAT WE'VE SENT FIRST TIME TO THE ATHELETE --
export const tenantResetPassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const { token } = req.query;
  console.log(req.params,"params")
  try {
    const decodedToken = jwt.verify(
      token as string,
      `${process.env.SECRET_KEY}`
    ) as JwtPayload;
    const { email, stateUnit } = decodedToken;


    if (typeof stateUnit !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid state from token parameter." });
    }

    const normalizedStateUnit = stateUnit.toLowerCase()

    const stateDB = await findAndConnectToStateDB(normalizedStateUnit);
    const user = await stateDB("users").where({ email }).first();
    console.log("user State:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(currentPassword, user.password, "check pass");

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    console.log(isPasswordValid,"isPasswordValid")

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await stateDB("users")
      .where({ email })
      .update({ password: hashedPassword });

    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error: any) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", errorMSG: error.message });
  }
};