import { Request, Response } from "express";
import { CreateAthleteSchema } from "../../schema/athleteSchema";
import jwt from "jsonwebtoken";
import {
  connectToDatabase,
  authenticateToken,
  findAndConnectToStateDB,
} from "../../config/dbutil";
import { uploadOnCloudinary } from "../../utils/cloudinary";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import ApiResponse from "../../utils/constants";
import CustomError from "./CustomError";
import { sendEtherealMail } from "../../utils/sendMail";

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

let AthleteID: any;
let UserID: number | undefined;

export const athleteRegister = async (req: Request, res: Response) => {
  const {
    // Basic details --
    stateUnit,
    firstName,
    lastName,
    mainEvent,
    playingEvents,
    education,
    dateOfBirth,
    placeOfBirth,
    email,
    contactNumber,
    alternateContactNumber,
    gender,
    // Personal details --
    motherName,
    fatherName,
    maritalStatus,
    spouseName,
    height,
    weight,
    trackSuit,
    tshirtSize,
    shoeSize,
    // address --
    address,
    stateName,
    cityName,
    pincode,
    mailingAddress,
    addressProof,
    // passport --
    passportNumber,
    dateOfIssue,
    passportIssueAuthority,
    dateOfExpiry,
    placeOfIssue,
    passportImage,
    selectLifeOthers,
    // Shooter membership --
    main, // Type of member
    type, // What type / select rifle club district
    subtype, // Name of rifle/club/district
    membershipNumber,
    paymentRemark,
    // nraiShooterId,
    feesFirstYear,
    feesYearlyRenewal,
    feesOnUpdate,
    showValidity,
    arjunaAwardeeCertificate,
    internationalAwardeeCertificate,
    validity,
    membershipOfClubDru,
    arjunaAwardee,
    internationalAwardee,
    bondSubmissionDate,
    indemnityBond,
    // Club DRA listing --
    name,
    approval,
    status,
    // Coach details --
    coachName,
    fromDate,
    toDate,
    // Weapon details --
    fireArms,
    coachDetails,
  }: any = req.body;

  const uploadedFiles = req.files as | { [fieldname: string]: Express.Multer.File[] } | undefined;

  let profilePhotoPath: string | undefined;
  let birthProofPhotoPath: string | undefined;
  let actionPhotoPath: string | undefined;
  let addressProofPath: string | undefined;

  let passportImagePath: string | undefined;
  let arjunaAwardeeCertificatePath: string | undefined;
  let internationalAwardeeCertificatePath: string | undefined;
  let membershipAssociationCertificatePath: string | undefined;

  if (uploadedFiles) {
    console.log(uploadedFiles, "uploaded Files --");

    if ("profilePhoto" in uploadedFiles) {
      const profilePhoto = uploadedFiles["profilePhoto"][0];
      const profilePhotoResponse = await uploadOnCloudinary(profilePhoto.path);
      if (profilePhotoResponse) {
        profilePhotoPath = profilePhotoResponse.url;
      }
    }

    if ("birthProof" in uploadedFiles) {
      const birthProofPhoto = uploadedFiles["birthProof"][0];
      const birthProofResponse = await uploadOnCloudinary(birthProofPhoto.path);
      if (birthProofResponse) {
        birthProofPhotoPath = birthProofResponse.url;
      }
    }

    if ("actionPhoto" in uploadedFiles) {
      const actionPhoto = uploadedFiles["actionPhoto"][0];
      const actionPhotoResponse = await uploadOnCloudinary(actionPhoto.path);
      if (actionPhotoResponse) {
        actionPhotoPath = actionPhotoResponse.url;
      }
    }

    if ("addressProof" in uploadedFiles) {
      const addressProof = uploadedFiles["addressProof"][0];
      const addressProofResponse = await uploadOnCloudinary(addressProof.path);
      if (addressProofResponse) {
        addressProofPath = addressProofResponse.url;
      }
    }

    if ("passportImage" in uploadedFiles) {
      const passportImage = uploadedFiles["passportImage"][0];
      const passportImageResponse = await uploadOnCloudinary(
        passportImage.path
      );
      if (passportImageResponse) {
        passportImagePath = passportImageResponse.url;
      }
    }
    if ("arjunaAwardeeCertificate" in uploadedFiles) {
      const arjunaAwardee = uploadedFiles["arjunaAwardeeCertificate"][0];
      const arjunaAwardeeResponse = await uploadOnCloudinary(arjunaAwardee.path);
      if (arjunaAwardeeResponse) {
        arjunaAwardeeCertificatePath = arjunaAwardeeResponse.url;
      }
    }
    if ("internationalAwardeeCertificate" in uploadedFiles) {
      const internationalAwardee = uploadedFiles["internationalAwardeeCertificate"][0];
      const internationalAwardeeResponse = await uploadOnCloudinary(internationalAwardee.path);
      if (internationalAwardeeResponse) {
        internationalAwardeeCertificatePath = internationalAwardeeResponse.url;
      }
    }
    if ("membershipAssociationCertificate" in uploadedFiles) {
      const membershipAssociation = uploadedFiles["membershipAssociationCertificate"][0];
      const membershipAssociationResponse = await uploadOnCloudinary(membershipAssociation.path);
      if (membershipAssociationResponse) {
        membershipAssociationCertificatePath = membershipAssociationResponse.url;
      }
    }
  }

  try {
    const stateToFind = stateUnit;

    if (typeof stateToFind !== "string") {
      return res.status(400).json({ message: "Invalid state from token parameter." });
    }

    const normalizedStateUnit = stateToFind.toLowerCase();
    const stateDB = await findAndConnectToStateDB(normalizedStateUnit);

    await stateDB.transaction(async (trx: any) => {
      const binaryPlayingEvents: any = {};

      for (const key in playingEvents) {
        const value = playingEvents[key];
        binaryPlayingEvents[key] = value === "true" ? 1 : 0;
      }

      const playingEventsString = JSON.stringify(binaryPlayingEvents);

      const existingEmail = await trx("basic_details").where({ email: email }).first();

      if (existingEmail) {
        throw new Error("This email already exists.");
      }

      const basicDetailsID = await trx("basic_details").insert({
        first_name: firstName,
        last_name: lastName,
        main_event: mainEvent,
        playing_events: playingEventsString,
        education: education,
        date_of_birth: dateOfBirth,
        place_of_birth: placeOfBirth,
        email: email,
        contact_number: contactNumber,
        alternate_contact_number: alternateContactNumber,
        gender: gender,
        profile_photo: profilePhotoPath,
        action_photo: actionPhotoPath,
        birth_proof: birthProofPhotoPath,
      });

      const cityId = await trx("cities_master").where({ name: cityName }).first();

      if (!cityId) {
        throw new Error("City not found.");
      }

      // const stateId = await trx("state_master").where({ name: stateName }).first();
      const stateId = stateName;

      if (!stateId) {
        throw new Error("State not found.");
      }

      const stateUnitID = await trx("state_unit_master").where({ name: stateUnit }).first();

      if (!stateUnitID) {
        throw new Error("State/Unit not found.");
      }

      const addressDetailsID = await trx("address").insert({
        state_id: stateId,
        city_id: cityId.id,
        address: address,
        pincode: pincode,
        mailing_address: mailingAddress,
        address_proof: addressProofPath,
      });

      const personalDetailsID = await trx("personal_detail").insert({
        address_id: addressDetailsID,
        mother_name: motherName,
        father_name: fatherName,
        marital_status: maritalStatus,
        spouse_name: spouseName,
        height: height,
        weight: weight,
        track_suit: trackSuit,
        tshirt_size: tshirtSize,
        shoe_size: shoeSize,
      });

      const existingPassport = await trx("passport")
        .where({ passport_number: passportNumber })
        .first();

      if (
        passportNumber !== "" &&
        existingPassport !== null &&
        existingPassport !== undefined
      ) {
        throw new Error("Passport number already exists.");
      }

      const passportID = await trx("passport").insert({
        passport_number: passportNumber || null,
        date_of_issue: dateOfIssue || null,
        passport_issue_authority: passportIssueAuthority || null,
        date_of_expiry: dateOfExpiry || null,
        place_of_issue: placeOfIssue || null,
        passport_image: passportImagePath || null,
      });

      const membershiPlanID = trx("membership_detail_master")
        .where({
          main: main,
          type,
          subtype,
        })
        .first();

      const shooterMembershipDetailsID = await trx("shooter_membership").insert(
        {
          membership_plan_id: membershiPlanID.id,
          main: main,
          type: type,
          subtype: subtype,
          life_others: selectLifeOthers,
          membership_number: membershipNumber,
          validity: validity,
          arjuna_awardee: arjunaAwardee,
          international_awardee: internationalAwardee,
          arjuna_awardee_certificate: arjunaAwardeeCertificatePath,
          international_awardee_certificate: internationalAwardeeCertificatePath,
          membership_association_certificate: membershipAssociationCertificatePath,
          // bond_submission_date: bondSubmissionDate,
          // indemnity_bond: indemnityBond,
        }
      );

      const weaponData = fireArms.map((fireArm: any) => ({
        shooter_membership_id: shooterMembershipDetailsID[0],
        weapon_type: fireArm.weapon_type,
        make: fireArm.make,
        model: fireArm.model,
        calibre: fireArm.calibre,
        serial_no: fireArm.serial_no,
        sticker: fireArm.sticker,
      }));

      await trx("weapon_detail").insert(weaponData);

      const coachData = coachDetails.map((coach: any) => ({
        shooter_membership_id: shooterMembershipDetailsID[0],
        coach_name: coach.coach_name,
        from_date: coach.from_date || null,
        to_date: coach.to_date || null,
      }));

      await trx("coach_details").insert(coachData);

      const userEmail = email;
      const userDOB = dateOfBirth;
      const userState = stateName;

      const halfEmail = userEmail.slice(0, userEmail.indexOf("@") / 2);
      const dobPart = userDOB.split("-")[2];
      const statePart = userState.slice(0, 3);
      const randomString = Math.random().toString(36).slice(-8);

      const generatedPassword = `${halfEmail}${dobPart}${statePart}${randomString}`;

      const token = jwt.sign(
        {
          email: email,
          role: "athlete",
          stateUnit: stateUnit,
        },
        `${process.env.SECRET_KEY}`,
        { expiresIn: "1d" }
      );

      const emailBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Our Platform!</title>
        </head>
        <body>
          <h2>Welcome, ${firstName} ${lastName}</h2>
          <p>Thank you for registering with us.</p>
          <p>Here are your login details:</p>
          <p>
            <strong>Email:</strong> ${userEmail}<br>
            <strong>Password:</strong> ${generatedPassword}
          </p>
          <p>
            Please use this password along with the following link to set up a new password:
            Your temporary password: ${generatedPassword}. Please use this password along with the following link to set up a new password
            <a href=${process.env.LOCAL_HOST}/auth/update-password?token=${token} target="_blank" rel="noopener noreferrer">Reset Password</a>
          </p>
          <p>We're excited to have you on board!</p>
        </body>
        </html>
      `;

      const info = {
        from: `"Sumit Singh 👻" ${process.env.USER_LOCAL_SMTP}`,
        to: userEmail,
        subject: "Welcome to Our Platform!",
        html: emailBody,
      };

      const regEmail = await sendEtherealMail(info)

      console.log("Email sent: %s", info);

      const emailExists = await stateDB("users").select("email").where("email", "=", userEmail);

      if (emailExists.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

      UserID = await trx("users").insert({
        athlete_id: AthleteID,
        password: hashedPassword,
        permissions: "athlete",
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

      AthleteID = await trx("athlete").insert({
        basic_detail_id: basicDetailsID,
        shooter_membership_id: shooterMembershipDetailsID,
        personal_detail_id: personalDetailsID,
        passportId: passportID,
        approved_by: req.body.approved_by,
        state_unit_id: stateUnitID.id,
        payment_remark: paymentRemark,
        user_id: UserID,
        // previous_status: req.body.previous_status,
      });

      await trx.commit();
    });

    // const successResponse = ApiResponse.status(200, { message: 'Athlete registered succesfully' });
    return res.status(200).json({ message: "Athlete registered succesfully" });
  } catch (error: any) {
    console.log(error.message);

    const failureResponse = ApiResponse.failure(
      "Internal Server Error",
      error.message
    );
    return res.status(500).json(error.message);
  }
};

export const getAthleteDetails = async (req: Request, res: Response) => {
  const token = authenticateToken(req, res);
  const stateDB = await connectToDatabase(token);

  try {
    // const { state } = req.query;

    // if (typeof state !== "string") {
    //   return res.status(400).json({ message: "Invalid state parameter." });
    // }

    // const stateDB = await findAndConnectToStateDB(state);
    const athleteDetails = await stateDB("athlete")
      .select(
        "state_unit_master.name as stateUnit",
        "shooter_membership.*",
        "weapon_detail.*",
        "coach_details.*",
        "passport.*",
        "address.*",
        "personal_detail.*",
        "basic_details.*",
        "athlete.*"
      )
      .leftJoin("basic_details", "athlete.basic_detail_id", "basic_details.id")
      .leftJoin("passport", "athlete.passportId", "passport.id")
      .leftJoin(
        "shooter_membership",
        "athlete.shooter_membership_id",
        "shooter_membership.id"
      )
      .leftJoin(
        "weapon_detail",
        "shooter_membership.id",
        "weapon_detail.shooter_membership_id"
      )
      .leftJoin(
        "personal_detail",
        "athlete.personal_detail_id",
        "personal_detail.id"
      )
      .leftJoin("address", "personal_detail.address_id", "address.id")
      .leftJoin(
        "state_unit_master",
        "athlete.state_unit_id",
        "state_unit_master.id"
      )
      .leftJoin(
        "coach_details",
        "shooter_membership.id",
        "coach_details.shooter_membership_id"
      );

    if (!athleteDetails || athleteDetails.length === 0) {
      return res.status(404).json({ error: "athlete not found" });
    }

    const groupedAthleteDetails: Record<number, any> = {};

    athleteDetails.forEach((athlete: any) => {
      const {
        id,
        basic_detail_id,
        personal_detail_id,
        membership_plan_id,
        passportId,
        address_id,
        coach_name,
        from_date,
        to_date,
        city_id,
        state_id,
        weapon_type,
        make,
        model,
        calibre,
        serial_no,
        ...rest
      } = athlete;

      if (!groupedAthleteDetails[id]) {
        groupedAthleteDetails[id] = {
          id,
          ...rest,
          fireArms: [],
          coachDetails: [],
        };
      }

      if (weapon_type !== null) {
        const existingFireArm = groupedAthleteDetails[id].fireArms.find(
          (fireArm: any) =>
            fireArm.weapon_type === weapon_type &&
            fireArm.make === make &&
            fireArm.model === model &&
            fireArm.calibre === calibre &&
            fireArm.serial_no === serial_no
        );

        if (!existingFireArm) {
          groupedAthleteDetails[id].fireArms.push({
            weapon_type,
            make,
            model,
            calibre,
            serial_no,
          });
        }
      }

      if (coach_name !== null) {
        const existingCoach = groupedAthleteDetails[id].coachDetails.find(
          (coachDetail: any) => coachDetail.coach_name === coach_name
        );

        if (!existingCoach) {
          groupedAthleteDetails[id].coachDetails.push({
            coach_name,
            from_date,
            to_date,
          });
        }
      }
    });

    const refinedAthleteDetails = Object.values(groupedAthleteDetails);
    res.json(refinedAthleteDetails);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//UPDATE THE ATHLETE DATA -- RN WORKING ON THIS --
export const updateAthleteDetails = async (req: Request, res: Response) => {
  try {
    const {
      // Basic details --
      stateUnit,
      firstName,
      lastName,
      mainEvent,
      playingEvents,
      education,
      dateOfBirth,
      placeOfBirth,
      email,
      contactNumber,
      alternateContactNumber,
      gender,
      // Personal details --
      motherName,
      fatherName,
      maritalStatus,
      spouseName,
      height,
      weight,
      trackSuit,
      tshirtSize,
      shoeSize,
      // address --
      address,
      stateName,
      cityName,
      pincode,
      mailingAddress,
      addressProof,
      // passport --
      passportNumber,
      dateOfIssue,
      passportIssueAuthority,
      dateOfExpiry,
      placeOfIssue,
      passportImage,
      // Shooter membership --
      main, // Type of member
      type, // What type / select rifle club district
      subtype, // Name of rifle/club/district
      membershipNumber,
      selectLifeOthers,
      // nraiShooterId,
      feesFirstYear,
      feesYearlyRenewal,
      feesOnUpdate,
      showValidity,
      arjunaAwardeeCertificate,
      internationalAwardeeCertificate,
      validity,
      membershipOfClubDru,
      arjunaAwardee,
      internationalAwardee,
      bondSubmissionDate,
      indemnityBond,
      // Club DRA listing --
      name,
      approval,
      status,
      // Coach details --
      coachName,
      fromDate,
      toDate,
      // Weapon details --
      fireArms,
      coachDetails,
      paymentRemark,
    } = req.body;

    console.log(req.body, 'update req --')

    const athleteId = req.params.id;

    const uploadedFiles = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    // console.log(uploadedFiles, "req.files --");

    let profilePhotoPath: string | undefined;
    let birthProofPhotoPath: string | undefined;
    let actionPhotoPath: string | undefined;
    let addressProofPath: string | undefined;

    let passportImagePath: string | undefined;
    let arjunaAwardeeCertificatePath: string | undefined;
    let internationalAwardeeCertificatePath: string | undefined;
    let membershipAssociationCertificatePath: string | undefined;

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

      if ("birthProof" in uploadedFiles) {
        const birthProofPhoto = uploadedFiles["birthProof"][0];
        const birthProofResponse = await uploadOnCloudinary(
          birthProofPhoto.path
        );
        if (birthProofResponse) {
          birthProofPhotoPath = birthProofResponse.url;
        }
      }

      if ("actionPhoto" in uploadedFiles) {
        const actionPhoto = uploadedFiles["actionPhoto"][0];
        const actionPhotoResponse = await uploadOnCloudinary(actionPhoto.path);
        if (actionPhotoResponse) {
          actionPhotoPath = actionPhotoResponse.url;
        }
      }

      if ("addressProof" in uploadedFiles) {
        const addressProof = uploadedFiles["addressProof"][0];
        const addressProofResponse = await uploadOnCloudinary(
          addressProof.path
        );
        if (addressProofResponse) {
          addressProofPath = addressProofResponse.url;
        }
      }

      if ("passportImage" in uploadedFiles) {
        const passportImage = uploadedFiles["passportImage"][0];
        const passportImageResponse = await uploadOnCloudinary(
          passportImage.path
        );
        if (passportImageResponse) {
          passportImagePath = passportImageResponse.url;
        }
      }
      if ("arjunaAwardeeCertificate" in uploadedFiles) {
        const arjunaAwardee = uploadedFiles["arjunaAwardeeCertificate"][0];
        const arjunaAwardeeResponse = await uploadOnCloudinary(arjunaAwardee.path);
        if (arjunaAwardeeResponse) {
          arjunaAwardeeCertificatePath = arjunaAwardeeResponse.url;
        }
      }
      if ("internationalAwardeeCertificate" in uploadedFiles) {
        const internationalAwardee = uploadedFiles["internationalAwardeeCertificate"][0];
        const internationalAwardeeResponse = await uploadOnCloudinary(internationalAwardee.path);
        if (internationalAwardeeResponse) {
          internationalAwardeeCertificatePath = internationalAwardeeResponse.url;
        }
      }
      if ("membershipAssociationCertificate" in uploadedFiles) {
        const membershipAssociation = uploadedFiles["membershipAssociationCertificate"][0];
        const membershipAssociationResponse = await uploadOnCloudinary(membershipAssociation.path);
        if (membershipAssociationResponse) {
          membershipAssociationCertificatePath = membershipAssociationResponse.url;
        }
      }
    }

    const token = authenticateToken(req, res);
    const stateDB = await connectToDatabase(token);

    const binaryPlayingEvents: any = {};

    for (const key in playingEvents) {
      // console.log(key, 'plev');

      const value = playingEvents[key];
      binaryPlayingEvents[key] = value == "true" ? 1 : 0;
    }

    const playingEventsString = JSON.stringify(binaryPlayingEvents);

    await stateDB.transaction(async (trx: any) => {
      const updateBasicDetails: any = {
        first_name: firstName,
        last_name: lastName,
        main_event: mainEvent,
        playing_events: playingEventsString,
        education: education,
        date_of_birth: dateOfBirth,
        place_of_birth: placeOfBirth,
        email: email,
        contact_number: contactNumber,
        alternate_contact_number: alternateContactNumber,
        gender: gender,
        profile_photo: profilePhotoPath,
        birth_proof: birthProofPhotoPath,
        action_photo: actionPhotoPath,
      };

      if (profilePhotoPath !== undefined)
        updateBasicDetails["profile_photo"] = profilePhotoPath;
      if (actionPhotoPath !== undefined)
        updateBasicDetails["action_photo"] = actionPhotoPath;
      if (birthProofPhotoPath !== undefined)
        updateBasicDetails["birth_proof"] = birthProofPhotoPath;

      function formatToDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 19).replace("T", " ");
      }


      const updateAddressDetails: any = {
        address: address,
        pincode: pincode,
        mailing_address: mailingAddress,
        address_proof: addressProofPath || null,
      };

      if (addressProofPath !== undefined)
        updateAddressDetails["address_proof"] = addressProofPath;

      const updatePersonalDetails: any = {
        mother_name: motherName,
        father_name: fatherName,
        marital_status: maritalStatus,
        spouse_name: spouseName,
        height: height,
        weight: weight,
        track_suit: trackSuit,
        tshirt_size: tshirtSize,
        shoe_size: shoeSize,
      };

      const updatePassportDetails: any = {
        passport_number: passportNumber || null,
        date_of_issue: dateOfIssue || null,
        passport_issue_authority: passportIssueAuthority || null,
        date_of_expiry: dateOfExpiry || null,
        place_of_issue: placeOfIssue || null,
        passport_image: passportImagePath || null,
      };

      const updateShooterMembershipDetails: any = {
        main: main,
        type: type,
        subtype: subtype,
        membership_number: membershipNumber,
        life_others: selectLifeOthers,
        arjuna_awardee: arjunaAwardee,
        international_awardee: internationalAwardee,
        arjuna_awardee_certificate: arjunaAwardeeCertificatePath,
        international_awardee_certificate: internationalAwardeeCertificatePath,
        membership_association_certificate: membershipAssociationCertificatePath,
        validity: formatToDate(validity),
      };

      const updateFieldByID = await trx("athlete").where({ id: athleteId }).first();
      const shooterMembershipId = updateFieldByID.shooter_membership_id;

      await trx("basic_details").update(updateBasicDetails).where({ id: updateFieldByID.basic_detail_id });
      await trx("address").update(updateAddressDetails).where({ id: updateFieldByID.address_id });
      await trx("personal_detail").update(updatePersonalDetails).where({ id: updateFieldByID.personal_detail_id });
      await trx("passport").update(updatePassportDetails).where({ id: updateFieldByID.passportId });
      await trx("shooter_membership").update(updateShooterMembershipDetails).where({ id: updateFieldByID.shooter_membership_id });

      const updateWeaponData = fireArms?.map((fireArm: any) => ({
        shooter_membership_id: shooterMembershipId,
        weapon_type: fireArm.weapon_type,
        make: fireArm.make,
        model: fireArm.model,
        calibre: fireArm.calibre,
        serial_no: fireArm.serial_no,
        sticker: fireArm.sticker,
      }));

      const updateCoachData = coachDetails?.map((coach: any) => ({
        shooter_membership_id: shooterMembershipId,
        coach_name: coach.coach_name,
        from_date: formatToDate(coach.from_date),
        to_date: formatToDate(coach.to_date),
      }));

      if (updateWeaponData && updateWeaponData.length > 0) {
        await trx("weapon_detail").where({ shooter_membership_id: shooterMembershipId }).del();
        await trx("weapon_detail").insert(updateWeaponData);
      } else {
        console.warn("No weapon details to update.");
      }

      if (updateCoachData && updateCoachData.length > 0) {
        await trx("coach_details").where({ shooter_membership_id: shooterMembershipId }).del();
        await trx("coach_details").insert(updateCoachData);
      } else {
        console.warn("No coach details to update.");
      }

      AthleteID = await trx("athlete")
        .update({
          payment_remark: paymentRemark[0],
        })
        .where({ id: athleteId });

      await trx.commit();
    });

    // return ApiResponse.status(200, "Athlete updated succesfully")
    return res.status(200).json({ message: "Athlete updated succesfully" });
  } catch (error: any) {
    console.log(error.message);

    const failureResponse = ApiResponse.failure(
      "Internal server error",
      error.message
    );
    return res.status(400).json(error.message);
  }
};

//GET THE SINGLE ATHLETE --
export const getAthleteDetailsById = async (req: Request, res: Response) => {
  const athleteId: any = req.params.id;

  const token = authenticateToken(req, res);
  const stateDB = await connectToDatabase(token);

  try {
    const athleteDetails = await stateDB("athlete as a")
      .select(
        "bd.*",
        "p.*",
        "pd.*",
        "ad.*",
        "a.*",
        "shooter_membership.*",
        "state_unit_master.name as stateUnit",
        "state_master.name as stateName",
        "cities_master.name as cityName"
      )
      .leftJoin("basic_details as bd", "a.basic_detail_id", "=", "bd.id")
      .leftJoin("personal_detail as pd", "a.personal_detail_id", "=", "pd.id")
      .leftJoin("address as ad", "pd.address_id", "=", "ad.id")
      .leftJoin("state_unit_master", "a.state_unit_id", "state_unit_master.id")
      .leftJoin("cities_master", "ad.city_id", "cities_master.id")
      .leftJoin("state_master", "ad.state_id", "state_master.id")
      .leftJoin(
        "shooter_membership",
        "a.shooter_membership_id",
        "shooter_membership.id"
      )
      .leftJoin(
        "membership_detail_master",
        "shooter_membership.membership_plan_id",
        "membership_detail_master.id"
      )
      .leftJoin("passport as p", "a.passportId", "p.id")
      .where("a.id", "=", athleteId)
      .first();

    if (!athleteDetails) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    // athleteDetails.playing_events = JSON.parse(athleteDetails.playing_events || "{}");

    const parsedPlayingEvents = JSON.parse(
      athleteDetails.playing_events || "{}"
    );
    console.log(parsedPlayingEvents);

    const convertedPlayingEvents: any = {};

    for (const key in parsedPlayingEvents) {
      const value = parsedPlayingEvents[key];
      convertedPlayingEvents[key] = value == "1" ? true : false;
    }

    athleteDetails.playing_events = convertedPlayingEvents;

    const firearms = await stateDB("weapon_detail as wd")
      .select("wd.*")
      .where(
        "wd.shooter_membership_id",
        "=",
        athleteDetails.shooter_membership_id
      );

    const coachDetails = await stateDB("coach_details as cd")
      .select("cd.*")
      .where(
        "cd.shooter_membership_id",
        "=",
        athleteDetails.shooter_membership_id
      );

    return res.json({ ...athleteDetails, firearms, coachDetails });
  } catch (error: any) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", errorMSG: error.message });
  }
};

export const updateAthleteStatus = async (req: Request, res: Response) => {
  const decodeToGetState = authenticateToken(req, res);
  const stateDB = await connectToDatabase(decodeToGetState);

  try {
    const id = req.params.id;
    const { rejected_reason, approved_by, rejected_by, block_reason } =
      req.body;

    // Determine athlete status based on the presence of rejected_reason
    const athleteStatus = rejected_reason ? "rejected" : "approved";

    // Determine approval status based on the presence of approved_by
    const approvalStatus = approved_by ? "approved" : "rejected";

    await stateDB("athlete")
      .where("id", id)
      .update({
        is_approved: athleteStatus === "approved" ? approvalStatus : null,
        is_rejected: athleteStatus === "rejected" ? "rejected" : null,
        rejected_reason: rejected_reason || null,
        is_blocked: block_reason ? "blocked" : null,
        block_reason: block_reason,
        approved_by: athleteStatus === "approved" ? approved_by || null : null,
        rejected_by: athleteStatus === "rejected" ? rejected_by || null : null,
      });

    return res
      .status(200)
      .json({ message: "User status updated successfully" });
  } catch (error: any) {
    console.error("Error updating user_status:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
