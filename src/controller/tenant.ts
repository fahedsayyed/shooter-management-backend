import { Request, Response } from "express";
import knex from "knex";
import nodemailer from "nodemailer";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import {
  adminInviteRegister,
  generateApprovedEmailBody,
  gettingApprovedAnotherTImes,
  paymentEmailBody,
  updateStatusBody,
} from "../utils/emailBody";
import { sendLiveMail } from "../utils/sendMail";
import bcrypt from "bcrypt";
import { findAndConnectToStateDB } from "../config/dbutil";
import jwt from "jsonwebtoken";

require("dotenv").config();

interface CreateTenant {
  tenantType: string;
  name: string;
  state: string;
  address: string;
  addressTwo: string;
  addressThree: string;
  city: string;
  pincode: string;
  contactPerson: string;
  alternateContactPerson: string;
  email: string;
  alternateEmail: string;
  contactNumber: string;
  alternateContactNumber: string;
  memoRandomProof: any;
  // contracts: Contract[];
  // contractName: string;
  // contractStatus: string;
  // contract_start_date: string;
  // contract_end_date: string;
  password: string;
  user_status: string;
  roleAndPermissions: RoleAndPermission[];
  subscriptionAndPlanId: number;
}

interface Contract {
  contractName: string;
  contractStatus: string;
  contract_start_date: string;
  contract_end_date: string;
  file: {
    path: string;
  };
}

interface RoleAndPermission {
  resources: string;
  permissions: Record<string, boolean>;
}

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

const systemDB: any = knex({
  client: "mysql2",
  connection: {
    host: "192.168.0.62",
    user: "shootingm",
    password: "iWm478*7",
    database: "superadmin",
  },
});

export let GLOBALID: any;

const createTenant = async (req: Request, res: Response) => {
  try {
    const reqData: CreateTenant = req.body;

    console.log(req.body, "body", reqData, "DATA");

    const dbName = reqData.name
      ? reqData.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")
      : "";

    const hasAllRequiredFields =
      reqData.tenantType &&
      reqData.name &&
      reqData.state &&
      reqData.address &&
      reqData.pincode &&
      reqData.city &&
      reqData.contactPerson &&
      reqData.email &&
      reqData.contactNumber;

    const flag = hasAllRequiredFields ? "pending" : "draft";

    // Create database if not exists

    // Check if tenant with the same name already exists
    const existingTenant = await systemDB("tenant_data")
      .where({ name: reqData.name })
      .first();
    if (existingTenant) {
      console.log("already exists");
      return res
        .status(400)
        .json({ message: "Tenant with this name already exists." });
    }

    // Upload file to Cloudinary asynchronously
    let memoRandomDocs: any;

    if (req.file) {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        req.file.path
      );
      memoRandomDocs = cloudinaryResponse.secure_url;
    }

    // Execute SQL script asynchronously
    console.log(process.cwd());

    // Insert data into the Super Admin database using a transaction
    await systemDB.transaction(async (trx: any) => {
      const [tenantDataIdInSuperAdmin] = await trx("tenant_data").insert({
        tenantType: reqData.tenantType,
        name: reqData.name.toLowerCase(),
        contactPerson: reqData.contactPerson,
        alternateContactPerson: reqData.alternateContactPerson,
        email: reqData.email,
        alternateEmail: reqData.alternateEmail,
        contactNumber: reqData.contactNumber,
        alternateContactNumber: reqData.alternateContactNumber,
        password: reqData.password,
        memoRandomProof: memoRandomDocs,
        user_status: flag,
        plan_id: reqData.subscriptionAndPlanId,
      });

      GLOBALID = tenantDataIdInSuperAdmin;

      await Promise.all([
        trx("address").insert({
          tenant_data_id: tenantDataIdInSuperAdmin,
          state: reqData.state,
          address: reqData.address,
          addressTwo: reqData.addressTwo,
          addressThree: reqData.addressThree,
          city: reqData.city,
          pincode: reqData.pincode,
        }),
        trx("club_dra_listing").insert({
          type: reqData.tenantType,
          name: reqData.name,
        }),
      ]);

      // Insert into users table after dynamic tables are created
    });

    sendPaymentEmailToTenant(req, res);
  } catch (error: any) {
    console.error("Global error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const checkUniqueState = async (req: Request, res: Response) => {
  try {
    const selectedState = req.params.state;

    const existingState = await systemDB("address")
      .where("state", selectedState)
      .first();
    if (existingState) {
      return res.json({ unique: false });
    } else {
      return res.json({ unique: true });
    }
  } catch (error) {
    console.error("Error checking unique state:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getClubDraList = async (req: Request, res: Response) => {
  try {
    const uniqueClubDraListingData = await systemDB("club_dra_listing")
      .distinct("name")
      .select();

    return res.status(200).json(uniqueClubDraListingData);
  } catch (error: any) {
    console.error(
      "Error fetching data from Club_Dra_Listing table:",
      error.message
    );
    return res.status(500).json({ error: error.message });
  }
};

const createRolesAndPermissions = async (req: Request, res: Response) => {
  try {
    const { roleAndPermissions } = req.body;
    const tenantId = req.params.id;

    if (!tenantId) {
      return res.status(400).json({ message: "Invalid tenant ID" });
    }

    if (roleAndPermissions && roleAndPermissions.length > 0) {
      await systemDB.transaction(async (trx: any) => {
        try {
          // Ensure that the tenantId corresponds to an existing record in the tenant_data table
          let tenantDataExists = await trx("tenant_data")
            .where("id", tenantId)
            .first();

          // if (!tenantDataExists) {
          //   // If tenantId does not exist, create a new record in the tenant_data table
          //   [tenantDataExists] = await trx('tenant_data')
          //     .insert({
          //       id: tenantId,  // Assuming tenantId should be explicitly set in the table
          //       // Add other columns based on your tenant_data table structure
          //     })
          //     .returning('*');
          // }

          // Iterate over each role and permission and update the role_and_permissions table
          for (const rolePermission of roleAndPermissions) {
            const { resources, permissions } = rolePermission;

            // Check if the role_and_permissions record exists for the given tenantId and resources
            const existingRecord = await trx("role_and_permissions")
              .where("tenant_data_id", tenantId)
              .andWhere("resources", resources)
              .first();

            if (existingRecord) {
              // If the record exists, update it
              await trx("role_and_permissions")
                .where("id", existingRecord.id)
                .update({
                  permissions: JSON.stringify(permissions),
                });
            } else {
              // If the record does not exist, insert a new one
              await trx("role_and_permissions").insert({
                tenant_data_id: tenantId,
                resources,
                permissions: JSON.stringify(permissions),
              });
            }
          }

          // Commit the transaction
          await trx.commit();

          return res
            .status(201)
            .json({ message: "Roles and permissions updated successfully" });
        } catch (error: any) {
          console.error(
            "Error in createRolesAndPermissions transaction:",
            error.message
          );
          // Rollback the transaction
          await trx.rollback();
          throw error;
        }
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid data for roles and permissions" });
    }
  } catch (error: any) {
    console.error("Global error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getRoleAndPermissionsByTenantId = async (req: Request, res: Response) => {
  try {
    // Connect to the Super Admin database

    // Get tenant_id from request parameters
    const { id } = req.params;

    // Retrieve role_and_permissions by tenant_id
    const roleAndPermissions = await systemDB("role_and_permissions")
      .select("id", "resources", "permissions")
      .where("tenant_data_id", id);

    return res.json({ roleAndPermissions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const getTenants = async (req: Request, res: Response) => {
  try {
    // Connect to the Super Admin database

    // Retrieve all tenants from the Super Admin database
    const tenants = await systemDB("tenant_data")
      .select(
        "tenant_data.id",
        "tenant_data.tenantType",
        systemDB.raw(
          "CONCAT(UCASE(LEFT(tenant_data.name, 1)), LCASE(SUBSTRING(tenant_data.name, 2))) as name"
        ),
        "tenant_data.contactPerson",
        "tenant_data.alternateContactPerson",
        "tenant_data.email",
        "tenant_data.alternateEmail",
        "tenant_data.contactNumber",
        "tenant_data.alternateContactNumber",
        "tenant_data.user_status",
        "tenant_data.memoRandomProof",
        "address.state",
        "address.address",
        "address.addressTwo",
        "address.addressThree",
        "address.city",
        "address.pincode"
        // "contract.contractName",
        // "contract.contract_document",
        // "contract.contractStatus",
        // "contract.contract_start_date",
        // "contract.contract_end_date"
      )
      .leftJoin("address", "tenant_data.id", "address.tenant_data_id")
      .leftJoin("contract", "tenant_data.id", "contract.tenant_data_id");

    return res.json(tenants);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const editTenant = async (req: Request, res: Response) => {
  try {
    let memoRandomDocs: any;
    const tenantId = req.params.id;
    console.log(req.body, "edit body");

    if (req.file) {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        req.file.path
      );

      if (cloudinaryResponse.secure_url) {
        memoRandomDocs = cloudinaryResponse.secure_url;
      } else {
        throw new Error("Failed to upload image to Cloudinary");
      }
    }
    // Destructure properties from the request body
    const {
      tenantType,
      name,
      state,
      address,
      addressTwo,
      addressThree,
      city,
      pincode,
      contactPerson,
      alternateContactPerson,
      email,
      alternateEmail,
      contactNumber,
      alternateContactNumber,
      // contractName,
      // contractStatus,
      // contract_start_date,
      // contract_end_date,
      password,
      // user_status,
      // in_active_reason
    } = req.body;

    const hasAllRequiredFields =
      tenantType &&
      name &&
      state &&
      address &&
      city &&
      contactPerson &&
      email &&
      contactNumber &&
      req.file;
    // contract_start_date &&
    // contract_end_date;

    console.log(hasAllRequiredFields, "hasAllRequiredFields");

    const flag = hasAllRequiredFields ? "Pending" : "draft";
    // const user_inactive = req.body.in_active_reason ? "Inactive" : flag;
    // Connect to the Super Admin database

    const memoRandomProof = memoRandomDocs;
    // Update tenant data in the Super Admin database
    await systemDB("tenant_data").where("id", tenantId).update({
      tenantType,
      name,
      contactPerson,
      alternateContactPerson,
      email,
      alternateEmail,
      contactNumber,
      alternateContactNumber,
      password,
      memoRandomProof,
      user_status: flag,
    });

    // Update address data in the Super Admin database
    await systemDB("address").where("tenant_data_id", tenantId).update({
      state,
      address,
      addressTwo,
      addressThree,
      city,
      pincode,
    });

    // Update contract data in the Super Admin database
    // const contractDocument: string = req.file ? req.file.filename : "";

    // await systemDB("contract").where("tenant_data_id", tenantId).update({
    //   contractName,
    //   contractStatus,
    //   contract_start_date,
    //   contract_end_date,
    //   contract_document:contractDocument
    // });

    return res
      .status(200)
      .json({ message: "Tenant data updated successfully" });
  } catch (error: any) {
    console.log(error, "erros");
    return res.status(500).json({ error: error.message });
  }
};

const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;

    const {
      in_active_reason,
      in_active_by,
      contactPerson,
      name,
      tenantType,
      email,
      state,
      contactNumber,
    } = req.body;

    let subject;

    const user_inactive = in_active_reason ? "Inactive" : "Active";
    const status = in_active_reason ? "Rejected" : "Approved";
    const emailSubject = in_active_reason
      ? "We're excited to have you on board!"
      : "Your registration is rejected";

    function toTitleCase(str: any) {
      return str
        .toLowerCase()
        .split(" ")
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const fullName = toTitleCase(contactPerson);
    let emailBody;

    // Update user_status in the Super Admin database
    await systemDB("tenant_data")
      .where("id", tenantId)
      .update({
        user_status: user_inactive,
        in_active_reason: in_active_reason || null,
        in_active_by: in_active_reason ? in_active_by : null,
        active_by: !in_active_reason ? in_active_by : null,
      });

    if (!in_active_reason) {
      // Create a dynamic database with proper handling of spaces in the name
      await systemDB.raw(
        `CREATE DATABASE IF NOT EXISTS \`${name.toLowerCase()}\``
      );

      // Create connection to tenantDB
      const tenantDB = knex({
        client: "mysql2",
        connection: {
          host: "192.168.0.62",
          user: "shootingm",
          password: "iWm478*7",
          database: name,
        },
      });

      // Execute SQL script for creating tables
      const sqlScript = fs
        .readFileSync(
          path.join(process.cwd(), "tables_structure/tables_structure.sql")
        )
        .toString();
      const sqlStatements = sqlScript
        .split(";")
        .filter((statement) => statement.trim() !== "");

      await Promise.all(
        sqlStatements.map(async (sqlStatement) => {
          try {
            await tenantDB.raw(sqlStatement.trim());
          } catch (error) {
            console.error("Error executing SQL statement:", error);
          }
        })
      );

      // Check if the user already exists in the tenantDB
      const existingUser = await tenantDB("users").where({ email }).first();

      if (existingUser) {
        // If the user already exists, update the existing record
        await tenantDB("users")
          .where({ email })
          .update({
            first_name: contactPerson.split(" ").pop(),
            last_name: contactPerson.split(" ").slice(0, -1).join(" "),
            is_admin: 1,
            status,
            contact_number: contactNumber,
          });

        subject = "Welcome to STS Administration";
        emailBody = gettingApprovedAnotherTImes(email);
      } else {
        // If the user does not exist, insert a new record
        const halfEmail = email.slice(0, email.indexOf("@") / 2);
        const statePart = state.slice(0, 3);
        const randomString = Math.random().toString(36).slice(-8);
        const generatedPassword = `${halfEmail}${statePart}${randomString}`;

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        const token = jwt.sign(
          {
            email: email,
            role: "admin",
            stateUnit: name,
          },
          `${process.env.SECRET_KEY}`,
          { expiresIn: "1d" }
        );

        await tenantDB("users").insert({
          email: email,
          first_name: contactPerson.split(" ").pop(),
          last_name: contactPerson.split(" ").slice(0, -1).join(" "),
          is_admin: 1,
          status,
          contact_number: contactNumber,
          password: hashedPassword,
        });

        subject = "Welcome to STS Administration";
        emailBody = generateApprovedEmailBody(
          fullName,
          emailSubject,
          status,
          tenantType,
          name,
          email,
          generatedPassword,
          token
        );
      }
    } else {
      const tenantDB = knex({
        client: "mysql2",
        connection: {
          host: "192.168.0.62",
          user: "shootingm",
          password: "iWm478*7",
          database: name,
        },
      });

      await tenantDB("users")
        .where({ email: email })
        .update({ status: "Rejected" });

      subject =
        "Sorry ! We can't proceed with your details, from STS Administration.";
      emailBody = updateStatusBody(
        fullName,
        emailSubject,
        status,
        tenantType,
        name,
        in_active_reason
      );
    }

    sendApprovedAndRejectEmailToTenant(req, res, subject, emailBody, email);
  } catch (error: any) {
    console.error("Error updating user_status:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getTenant = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;
    // Connect to the Super Admin database

    // Retrieve tenant data from the Super Admin database based on the ID
    const tenantData = await systemDB("tenant_data")
      .select(
        "tenant_data.id as tenant_id",
        "tenant_data.tenantType",
        "tenant_data.payment_status",
        "tenant_data.name",
        "tenant_data.contactPerson",
        "tenant_data.alternateContactPerson",
        "tenant_data.email",
        "tenant_data.alternateEmail",
        "tenant_data.contactNumber",
        "tenant_data.alternateContactNumber",
        "tenant_data.memoRandomProof",
        "tenant_data.user_status",
        "address.state",
        "address.address",
        "address.addressTwo",
        "address.addressThree",
        "address.city",
        "address.pincode"
        // "contract.contractName",
        // "contract.contract_document",
        // "contract.contractStatus",
        // "contract.contract_start_date",
        // "contract.contract_end_date"
      )
      .leftJoin("address", "tenant_data.id", "address.tenant_data_id")
      // .leftJoin("contract", "tenant_data.id", "contract.tenant_data_id")
      .where("tenant_data.id", tenantId)
      .first();

    if (!tenantData) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const responseData = {
      tenant: tenantData,
    };
    console.log(responseData, "responseData");

    return res.json(responseData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

const updateRoleAndPermission = async (req: Request, res: Response) => {
  try {
    const { roleAndPermissions } = req.body;
    const tenantId = req.params.id;

    // Convert the array of objects to a JSON string
    const roleAndPermissionsJSON = roleAndPermissions;

    // Update roles and permissions data
    await systemDB("role_and_permissions")
      .where({ tenant_data_id: tenantId })
      .update({
        role_and_permissions: roleAndPermissionsJSON,
        // tenant_data_id:tenantId
      });

    return res
      .status(200)
      .json({ message: "Roles and permissions data updated successfully" });
  } catch (error: any) {
    console.error("Error updating roles and permissions data:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getAllMasters = async (req: Request, res: Response) => {
  try {
    // Connect to the Super Admin database and retrieve all records from the "masters" table
    const mastersData = await systemDB("masters").select("*");

    if (!mastersData || mastersData.length === 0) {
      return res.status(404).json({ message: "No masters found" });
    }

    // Assuming you have a primary key named "id" in the "masters" table
    const responseData = {
      masters: mastersData,
    };

    return res.json(responseData);
  } catch (error: any) {
    console.error("Error in getAllMasters:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// INVITE REGISTRATION VIA LINK, THROUGH EMAIL --
const sendInvitationEmailToTenant = async (req: Request, res: Response) => {
  const { userEmail, associatedWith, fullName } = req.body;

  const emailBody = adminInviteRegister(fullName, associatedWith);

  try {
    const info = await transporter.sendMail({
      from: `"Sayyed Fahed 👻" <${process.env.USER_LOCAL_SMTP}>`,
      to: userEmail,
      subject: "Welcome to Our Platform!",
      html: emailBody,
    });

    console.log("Email sent successfully:", info);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// REGISTRATION VIA SHOOTER'S MANAGEMENT PLATFORM --
const sendPaymentEmailToTenant = async (req: Request, res: Response) => {
  const { contactPerson, paymentUrl, amount, email, address } = req.body;

  console.log(req.body, "recipt pay");
  function toTitleCase(str: any) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const fullNameTitleCase = toTitleCase(contactPerson);
  const emailBody = paymentEmailBody(fullNameTitleCase, amount, paymentUrl);

  const emailArguments = {
    from: `"Sayyed Fahed 👻" <sayyedfahed828@gmail.com>`,
    to: email,
    subject: "Welcome to Our Platform Shooter's Management!",
    html: emailBody,
  };

  try {
    const info: any = await sendLiveMail(emailArguments);
    console.log("Email sent successfully:", info);

    res
      .status(201)
      .json({ message: "Association created and email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//subject --
const sendApprovedAndRejectEmailToTenant = async (
  req: Request,
  res: Response,
  subject: any,
  emailBody: any,
  email: any
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sayyed Fahed 👻" <${process.env.USER_LOCAL_SMTP}>`,
      to: email,
      subject,
      html: emailBody,
    });

    console.log("Email sent successfully:", info);

    res
      .status(201)
      .json({ message: "Status Has Been Updated And Email Send Successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllSubscriptionAndPlan = async (req: Request, res: Response) => {
  try {
    console.log(req.body, "-----email body");
    // Connect to the Super Admin database and retrieve all records from the "masters" table
    const mastersData = await systemDB("subscription_plans_master").select("*");

    if (!mastersData || mastersData.length === 0) {
      return res.status(404).json({ message: "No masters found" });
    }

    // Assuming you have a primary key named "id" in the "masters" table
    const responseData = {
      subscriptionAndPlan: mastersData,
    };

    return res.json(responseData);
  } catch (error: any) {
    console.error("Error in getting subscription and plans:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export {
  createTenant,
  checkUniqueState,
  getTenants,
  editTenant,
  getTenant,
  updateUserStatus,
  updateRoleAndPermission,
  createRolesAndPermissions,
  getClubDraList,
  getRoleAndPermissionsByTenantId,
  getAllMasters,
  sendInvitationEmailToTenant,
  getAllSubscriptionAndPlan,
  sendPaymentEmailToTenant,
};
