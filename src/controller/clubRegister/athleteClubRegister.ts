import { Request, Response } from "express";
import { CreateAthleteSchema } from "../../schema/athleteSchema";

import jwt from "jsonwebtoken";

let userId;

import {
  connectToDatabase,
  authenticateToken,
  findAndConnectToStateDB,
} from "../../config/dbutil";
import { uploadOnCloudinary } from "../../utils/cloudinary";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import ApiResponse from "../../utils/constants";
import { generateResetPasswordEmailBody } from "../../utils/emailBody";

require("dotenv").config();





const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com", //smtp.forwardemail.net
  port: 587,
  // secure: true,

  auth: {
    user: "sayyedfahed828@gmail.com",
    pass: "ambagtssyfegabuw",
  },
});

// const transporter = nodemailer.createTransport({
//   host: process.env.HOST_LOCAL_SMTP, //smtp.forwardemail.net
//   port: 587,
//   // secure: true,
//   auth: {
//     user: "daija.oreilly@ethereal.email",
//     pass: "QKgak2r64rubyXnQBk",
//   },
// });

async function generateMembershipId(
  state: string,
  dateOfBirth: string,
  clubName: string
): Promise<string> {
  console.log(clubName, state, "in generative");
  const clubDB = await findAndConnectToStateDB(clubName);

  const maxLastTwoDigits: any = await clubDB("athlete")
    .max(clubDB.raw("CAST(RIGHT(membership_id, 2) AS UNSIGNED)"))
    .first();

  let nextTwoDigits: number;
  if (
    !maxLastTwoDigits ||
    maxLastTwoDigits[`max(CAST(RIGHT(membership_id, 2) AS UNSIGNED))`] === null
  ) {
    nextTwoDigits = 1;
  } else {
    nextTwoDigits =
      parseInt(
        maxLastTwoDigits[`max(CAST(RIGHT(membership_id, 2) AS UNSIGNED))`]
      ) + 1;
  }
  return `${state.slice(0, 3).toUpperCase()}${dateOfBirth.replace(
    /-/g,
    ""
  )}${nextTwoDigits.toString().padStart(2, "0")}`;
}

export const clubRegisterAthlete = async (req: Request, res: Response) => {
  const {
    stateUnit: stateU,
    firstName,
    lastName,
    dateOfBirth,
    email,
    contactNumber,
    alternateContactNumber,
    gender,
    pincode,
    clubName,
    playingEvents,
    aadhar,
    membership,
    stateName: state,
    cityName: city,
    address,
    safetyCourse,
    education,
  }: any = req.body;
  // const {
  //   slideOne: {
  //     stateUnit: state,
  //     firstName,
  //     lastName,
  //     dateOfBirth,
  //     email,
  //     contactNumber: phone,
  //     alternateContactNumber: alternateNo,
  //     gender,
  //     playingEvents: events,
  //     education,
  //     safetyCourse,
  //   },
  //   slideTwo: {
  //     clubName,
  //     membership: membershipType,
  //     aadhar: aadharCard,
  //     address,
  //     cityName: city,
  //     pincode: pincode,
  //   },
  // } = req.body;

  if (!clubName) {
    return res.status(400).json({ error: "Club name is required" });
  }

  console.log(req.body, "req");

  const uploadedFiles = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  let profilePhotoPath: string | undefined;
  let addressProofPhotoPath: string | undefined;

  if (uploadedFiles) {
    if ("profilePhoto" in uploadedFiles) {
      const profilePhoto = uploadedFiles["profilePhoto"][0];
      const profilePhotoResponse = await uploadOnCloudinary(profilePhoto.path);
      if (profilePhotoResponse) {
        profilePhotoPath = profilePhotoResponse.url;
      }
    }

    if ("addressProof" in uploadedFiles) {
      const addressProofPhoto = uploadedFiles["addressProof"][0];
      const addressProofPhotoResponse = await uploadOnCloudinary(
        addressProofPhoto.path
      );
      if (addressProofPhotoResponse) {
        addressProofPhotoPath = addressProofPhotoResponse.url;
      }
    }
  }

  try {
    const userEmail = email;
    const userDOB = dateOfBirth;
    const userState = clubName;

    const halfEmail = userEmail.slice(0, userEmail.indexOf("@") / 2);
    const dobPart = userDOB.split("-")[2];
    const statePart = userState.slice(0, 3);
    const randomString = Math.random().toString(36).slice(-8);

    const generatedPassword = `${halfEmail}${dobPart}${statePart}${randomString}`;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

    const token = jwt.sign(
      {
        email: email,
        role: "athlete",
        stateUnit: clubName,
      },
      `${process.env.SECRET_KEY}`,
      { expiresIn: "1d" }
    );

    // const emailBody = `
    //   <!DOCTYPE html>
    //   <html lang="en">
    //   <head>
    //     <meta charset="UTF-8">
    //     <title>Welcome to Our Platform!</title>
    //   </head>
    //   <body>
    //     <h2>Welcome, ${firstName} ${lastName}</h2>
    //     <p>Thank you for registering with us.</p>
    //     <p>Here are your login details:</p>
    //     <p>
    //       <strong>Email:</strong> ${userEmail}<br>
    //       <strong>Password:</strong> ${generatedPassword}
    //     </p>
    //     <p>
    //       Please use this password along with the following link to set up a new password:
    //       Your temporary password: ${generatedPassword}. Please use this password along with the following link to set up a new password
    //       <a href="http://localhost:3000/auth/update-password?token=${token}">Reset Password</a>
    //     </p>
    //     <p>We're excited to have you on board!</p>
    //   </body>
    //   </html>
    // `;

const emailBody =generateResetPasswordEmailBody(firstName, lastName, userEmail, generatedPassword, token)

    const clubDB = await findAndConnectToStateDB(clubName);

    // const states = await clubDB("state_master")
    //   .select("name")
    //   .where("id", state)
    //   .first();

    // if (!states) {
    //   return res.status(404).json({ error: "stateName not found" });
    // }

    // console.log(states.name, "hii");

    const emailExists = await clubDB("athlete")
      .select("email")
      .where("email", "=", userEmail);

    if (emailExists.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const membership_id = await generateMembershipId(
      stateU,
      dateOfBirth,
      clubName
    );

    const playingEventsObj = JSON.parse(playingEvents);

    const eventLabels: any = {
      rifle: "Rifle",
      pistol: "Pistol",
      shotgun: "Shotgun",
      bigbore: "Big Bore",
    };

    const eventNames = Object.keys(playingEventsObj).filter(
      (eventName) => playingEventsObj[eventName]
    );

    const eventsString = eventNames
      .map((eventName) => eventLabels[eventName])
      .join(", ");

    // const info = await transporter.sendMail({
    //   from: '"Deepak G 👻" <daija.oreilly@ethereal.email>',
    //   to: userEmail,
    //   subject: "Welcome to Our Platform!",
    //   html: emailBody,
    // });


     const info = await transporter.sendMail({
      from: `"Deepak G 👻" <${process.env.USER_LOCAL_SMTP}>`,
      to: userEmail,
      subject: "Reset Password!",
      html: emailBody,
    });

    console.log("Email sent: %s", info.messageId);

    userId = await clubDB("users").insert({
      // athlete_id: athleteId,
      password: hashedPassword,
      permissions: "club_athlete",
      last_login: null,
      email,
      contact_number: contactNumber,
      state_id: null,
      enroll_id: null,
      is_admin: null,
      club_dra_listing_id: null,
      is_comp: null,
      password_change_flag: null,
      first_name: firstName,
      last_name: lastName,
      district_unit_Id: null,
      gender: gender,
      remember_token: null,
      status: null,
      flag: null,
    });

    const athleteId = await clubDB("athlete").insert({
      state_unit: stateU,
      first_name: firstName,
      last_name: lastName,
      dOB: dateOfBirth,
      email: email,
      phone: contactNumber,
      alternate_no: alternateContactNumber,
      gender: gender,
      pincode: pincode,
      club_name: clubName,
      event: eventsString,
      safety_course: safetyCourse,
      membership_type: membership,
      aadhar_card: aadhar,
      address_proof: addressProofPhotoPath,
      profile_photo: profilePhotoPath,
      state_id: state,
      city: city,
      address: address,
      password: hashedPassword,
      membership_id: membership_id,
      education: education,
      user_id: userId,
    });

    const successResponse = ApiResponse.status(200, {
      message: "Athlete registered successfully",
    });
    return res.json(successResponse);
  } catch (error: any) {
    console.log(error.message);

    const failureResponse = ApiResponse.failure(
      "Internal Server Error",
      error.message
    );
    return res.status(500).json(failureResponse);
  }
};

export const getAllClubShooters = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const clubDB = await connectToDatabase(decoded);
    const clubShooters = await clubDB("athlete").select(
      "id",
      "state_unit",
      "first_name",
      "last_name",
      "dOB",
      "email",
      "phone",
      "alternate_no",
      "gender",
      "pincode",
      "club_name",
      "event",
      "safety_course",
      "membership_type",
      "aadhar_card",
      "address_proof",
      "profile_photo",
      "state_id",
      "city",
      "address",
      "education"
    );

    return res.json(clubShooters);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getClubShootersById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const clubDB = await connectToDatabase(decoded);

    const { id } = req.params;

    const clubShooter = await clubDB("athlete")
      .where("id", id)
      .select(
        "state_unit",
        "first_name",
        "last_name",
        "dOB",
        "email",
        "phone",
        "alternate_no",
        "gender",
        "pincode",
        "club_name",
        "event",
        "safety_course",
        "membership_type",
        "aadhar_card",
        "address_proof",
        "profile_photo",
        "state_id",
        "city",
        "address",
        "education"
      )
      .first();

    if (!clubShooter) {
      return res.status(404).json({ error: "Club shooter not found" });
    }

    // Return the details of the shooter
    return res.json(clubShooter);
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateClubShooterById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const clubDB = await connectToDatabase(decoded);

    const { id } = req.params;
    console.log(id, "hii");
    const {
      stateUnit,
      firstName,
      lastName,
      dateOfBirth,
      email,
      phone,
      alternateNo,
      gender,
      pincode,
      clubName,
      event,
      aadhar,
      membership,
      stateName,
      cityName,
      address,
      safetyCourse,
      education,
    }: any = req.body;

    // const {
    //   slideOne: {
    //     stateUnit: state,
    //     firstName,
    //     lastName,
    //     dateOfBirth,
    //     email,
    //     contactNumber: phone,
    //     alternateContactNumber: alternateNo,
    //     gender,
    //     playingEvents: events,
    //     education,
    //     safetyCourse,
    //   },
    //   slideTwo: {
    //     clubName,
    //     membership: membershipType,
    //     aadhar: aadharCard,
    //     address,
    //     cityName: city,
    //     pincode: pincode,
    //   },
    // } = req.body;

    console.log(req.body, "body");

    console.log(dateOfBirth, "dob");
    const existingAthlete = await clubDB("athlete").where("id", id).first();
    if (!existingAthlete) {
      return res.status(404).json({ error: "Athlete not found" });
    }
    const isEmailUpdated = email !== existingAthlete.email;
    // Check if the dateOfBirth is being updated
    const isDOBUpdated =
      dateOfBirth !== existingAthlete.dOB.toISOString().slice(0, 10);

    // File upload logic
    const uploadedFiles = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    let profilePhotoPath: string | undefined = existingAthlete.profile_photo;
    let addressProofPhotoPath: string | undefined =
      existingAthlete.address_proof;

    if (uploadedFiles) {
      if ("profilePhoto" in uploadedFiles) {
        const profilePhoto = uploadedFiles["profilePhoto"][0];
        const profilePhotoResponse = await uploadOnCloudinary(
          profilePhoto.path
        );
        if (profilePhotoResponse) {
          profilePhotoPath = profilePhotoResponse.url;
        }
      }

      if ("addressProofPhoto" in uploadedFiles) {
        const addressProofPhoto = uploadedFiles["addressProofPhoto"][0];
        const addressProofPhotoResponse = await uploadOnCloudinary(
          addressProofPhoto.path
        );
        if (addressProofPhotoResponse) {
          addressProofPhotoPath = addressProofPhotoResponse.url;
        }
      }
    }

    await clubDB("athlete").where("id", id).update({
      state_unit: stateUnit,
      first_name: firstName,
      last_name: lastName,
      dOB: dateOfBirth,
      email: email,
      phone: phone,
      alternate_no: alternateNo,
      gender: gender,
      pincode: pincode,
      club_name: clubName,
      event: event,
      safety_course: safetyCourse,
      membership_type: membership,
      aadhar_card: aadhar,
      state_id: stateName,
      city: cityName,
      address: address,
      education: education,
      profile_photo: profilePhotoPath,
      address_proof: addressProofPhotoPath,
    });

    if (isDOBUpdated) {
      const oldDOBString = existingAthlete.dOB.toISOString().slice(0, 10);
      const newDOBString = dateOfBirth;
      //const newDOBString = "2024-02-20";
      console.log(oldDOBString, newDOBString, "check it");
      const updatedMembershipId =
        existingAthlete.membership_id.substring(0, 3) +
        newDOBString.replace(/-/g, "") +
        existingAthlete.membership_id.substring(11);

      // console.log(updatedMembershipId, "memid");

      await clubDB("athlete")
        .where("id", id)
        .update({ membership_id: updatedMembershipId });
    }

    if (isEmailUpdated) {
      const halfEmail = email.slice(0, email.indexOf("@") / 2);
      const dobPart = dateOfBirth.split("-")[2];
      const statePart = clubName.slice(0, 3);
      const randomString = Math.random().toString(36).slice(-8);
      const generatedPassword = `${halfEmail}${dobPart}${statePart}${randomString}`;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

      await clubDB("athlete").where("id", id).update({
        password: hashedPassword,
      });

      const token = jwt.sign(
        {
          email: email,
          role: "athlete",
          stateUnit: clubName,
        },
        `${process.env.SECRET_KEY}`,
        { expiresIn: "1d" }
      );

      const emailBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Reset Password</title>
        </head>
        <body>
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password. Here is your temporary password:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
          <p>Please use this password along with the following link to set up a new password:</p>
          <p><a href="http://localhost:3000/auth/update-password?token=${token}">Reset Password</a></p>
        </body>
        </html>
      `;

      const info = await transporter.sendMail({
        from: '"Deepak G 👻" <daija.oreilly@ethereal.email>',
        to: email,
        subject: "Reset Your Password",
        html: emailBody,
      });

      console.log("Email sent: %s", info.messageId);

      await clubDB("users").where("athlete_id", id).update({
        email,
        contact_number: phone,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        gender,
      });
    }

    return res
      .status(200)
      .json({ message: "Athlete details updated successfully" });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const searchFieldInAthlete = async (req: Request, res: Response) => {
  try {
    const { email, contactNumber, aadhar, clubName } = req.query;
    console.log(req.query, "hello");
    const systemDB = await findAndConnectToStateDB(clubName as string);

    if (!email && !contactNumber && !aadhar) {
      return res.status(400).json({
        error:
          "At least one field (email, contactNumber, or aadhar) must be provided.",
      });
    }

    let errorMessages: string[] = [];

    if (email) {
      const existsEmail = await systemDB("athlete")
        .where("email", "=", email as string)
        .first();
      if (existsEmail) {
        errorMessages.push("Email already exists");
      }
    }

    if (contactNumber) {
      const existsContactNumber = await systemDB("athlete")
        .where("phone", "=", contactNumber as string)
        .first();
      if (existsContactNumber) {
        errorMessages.push("Contact number already exists");
      }
    }

    if (aadhar) {
      const existsAadhar = await systemDB("athlete")
        .where("aadhar_card", "=", aadhar as string)
        .first();
      if (existsAadhar) {
        errorMessages.push("Aadhar already exists");
      }
    }

    // if (errorMessages.length > 0) {
    //   return res.status(200).json({ error: errorMessages.join(", ") });
    // }

    if (errorMessages.length > 0) {
      let errorMessage = errorMessages[0];
      if (errorMessages.length > 1) {
        errorMessage = errorMessage.split(" ")[0] + " and " + errorMessages[1];
      }
      return res.status(200).json({ error: errorMessage });
    } else {
      return res.json({ message: "Fields are available" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};
