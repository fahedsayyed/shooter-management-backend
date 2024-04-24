require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { sha512 } from "js-sha512";

import { sendLiveMail, sendEtherealMail } from "../../utils/sendMail";
import { getBaseUrl, curl_call } from "./util";
import {
  authenticateNextToken,
  authenticateToken,
  connectToDatabase,
  findAndConnectToStateDB,
} from "../../config/dbutil";
import { adminInvoiceBody, shooterRegistrationBody } from "../../utils/emailBody";
import { header } from "express-validator";
import { GLOBALID } from "../tenant";

type ConfigType = {
  key: string;
  salt: string;
  env: string;
  enable_iframe: string | number;
};

let config: ConfigType;

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { stateunit }: any = req.query;

    const normalizedState = stateunit?.toLowerCase();
    const systemDB = await findAndConnectToStateDB(normalizedState);

    config = {
      key: process.env.EASEBUZZ_KEY || "default_key",
      salt: process.env.EASEBUZZ_SALT || "default_salt",
      env: process.env.EASEBUZZ_ENV || "test",
      enable_iframe: process.env.EASEBUZZ_IFRAME || "0",
    };

    function generateHash() {
      const hashstring = `${config.key}|${data.txnid}|${data.amount}|${data.productinfo
        }|${data.firstname || ""}|${data.email}|${data.udf1 || ""}|${data.udf2 || ""
        }|${data.udf3 || ""}|${data.udf4 || ""}|${data.udf5 || ""}|${data.udf6 || ""
        }|${data.udf7 || ""}|${data.udf8 || ""}|${data.udf9 || ""}|${data.udf10 || ""
        }|${config.salt}`;

      console.log("Hashstring:", hashstring);

      return sha512(hashstring);
    }

    var hash_key = generateHash();
    const paymentUrl = getBaseUrl(config.env) + "/payment/initiateLink";
    // const paymentUrl = "https://testpay.easebuzz.in/payment/initiateLink";

    console.log("Generated Hash:", hash_key);

    const form = {
      key: config.key,
      txnid: data.txnid,
      amount: data.amount,
      email: data.email,
      phone: data.phone,
      firstname: data.firstname,
      productinfo: data.productinfo,
      furl: data.furl,
      surl: data.surl,
      hash: hash_key,
    };

    // console.log("Form Data:", form);
    const response = await curl_call(paymentUrl, form);

    console.log(response, "resp");

    if (response.status !== 1) {
      return res.status(400).json({
        message: "Payment initiation failed",
        error: {
          status: response.status,
          error_desc: response.error_desc,
          data: response.data,
        },
      });
    } else {
      //without ID not insertions for logs --
      const existingPayment = await systemDB("payment_log")
        .where("txnid", data.txnid)
        .first();

      if (existingPayment) {
        return res.status(400).json({
          message: "Payment with the same Transaction ID already exists.",
        });
      }
    }

    if (config.enable_iframe === "0") {
      const paymentRedirectUrl =
        getBaseUrl(config.env) + "/pay/" + response.data;
      res.json(paymentRedirectUrl);
    } else {
      return res.render("enable_iframe.html", {
        key: config.key,
        access_key: response.access_key,
      });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const handlePaymentResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = req.body;
    const { stateunit }: any = req.query;

    console.log(response, stateunit, "check coming")

    const normalizedState = stateunit?.toLowerCase();
    let systemDB;

    if (req.headers.authorization) {
      const dbName = authenticateNextToken(req, res, next);
      systemDB = await connectToDatabase(dbName);
    } else {
      systemDB = await findAndConnectToStateDB(normalizedState);
    }

    if (checkReverseHash(response, req.body.hash)) {
      const queryString = new URLSearchParams({
        status: response.status,
        txnid: response.txnid,
        payment_source: response.payment_source,
        easepayid: response.easepayid,
        card_type: response.card_type,
        error: response.error,
        firstname: response.firstname,
        hash: response.hash,
        bankRefNum: response.bank_ref_num,
        productInfo: response.productinfo,
        amount: response.amount,
        msg: response.error_Message,
      }).toString();

      const paymentLogs = {
        txnid: response.txnid,
        amount: response.amount,
        productinfo: response.productinfo,
        name: response.firstname,
        email: response.email,
        phone: response.phone,
        status: response.status,
      };

      await systemDB("payment_log").insert(paymentLogs)
      res.redirect(`${process.env.SERVER_HOST}/payment-response?${new URLSearchParams(queryString).toString()}`);

      const emaildetails = {
        status: response.status,
        txnid: response.txnid,
        card_type: response.card_type,
        error: response.error,
        firstname: response.firstname,
        bank_ref_num: response.bank_ref_num,
        productinfo: response.productinfo,
        amount: response.amount,
        msg: response.error_Message,
      }

      const emailBody = shooterRegistrationBody(emaildetails);

      const info = {
        from: `"Sumit Singh 👻" <${process.env.USER_LOCAL_SMTP}>`,
        to: response.email,
        subject: "Regarding Your Registration Payment status",
        html: emailBody,
      }

      const emailResult = await sendEtherealMail(info)

      console.log("Email sent: %s after payment", emailResult);
    } else {
      res.status(400).json({ message: "Hash validation failed. Check the hash value." });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const superadminPaymentResponse = async (
  req: Request,
  res: Response, next: NextFunction
) => {
  try {
    const response = req.body;
    const { stateunit }: any = req.query;

    const normalizedState = stateunit?.toLowerCase();
    const superadminDB = await findAndConnectToStateDB("superadmin");

    let systemDB;

    if (req.headers.authorization) {
      const dbName = authenticateNextToken(req, res, next);
      systemDB = await connectToDatabase(dbName);
    } else {
      systemDB = await findAndConnectToStateDB(normalizedState);
    }

    if (checkReverseHash(response, req.body.hash)) {
      const queryString = new URLSearchParams({
        status: response.status,
        txnid: response.txnid,
        payment_source: response.payment_source,
        easepayid: response.easepayid,
        card_type: response.card_type,
        error: response.error,
        firstname: response.firstname,
        hash: response.hash,
        bankRefNum: response.bank_ref_num,
        productInfo: response.productinfo,
        amount: response.amount,
        msg: response.error_Message,
      }).toString();

      const paystatusqry = new URLSearchParams({
        status: response.status,
      }).toString();

      const paymentLogs = {
        txnid: response.txnid,
        amount: response.amount,
        productinfo: response.productinfo,
        name: response.firstname,
        email: response.email,
        phone: response.phone,
        status: response.status,
      };

      await systemDB("payment_log")
        .insert(paymentLogs)
        .orderBy("createdAt", "desc");
      await superadminDB("tenant_data")
        .where({ id: GLOBALID })
        .update({ payment_status: paymentLogs.status });

      const tenantData = await superadminDB("tenant_data")
        .select(
          "tenant_data.id as tenantId",
          "tenant_data.name as recipientName",
          "address.state as recipientState",
          "address.address as recipientAddress",
          "address.city as recipientCity",
          "address.pincode as recipientPincode",
          "tenant_data.plan_id"
        )
        .leftJoin("address", "tenant_data.id", "address.tenant_data_id")
        .where("tenant_data.id", GLOBALID)
        .first();

      const { recipientName, recipientAddress, recipientCity, recipientState, recipientPincode, plan_id,
      } = tenantData;

      const planDetails = await superadminDB("subscription_plans_master")
        .select("plan_name", "duration")
        .where("id", plan_id)
        .first();

      const { plan_name, duration } = planDetails;

      const emailBody = adminInvoiceBody(
        response.txnid,
        response.amount,
        recipientName,
        recipientAddress,
        recipientCity,
        recipientState,
        recipientPincode,
        response.productinfo,
        plan_name,
        duration
      );

      const emailInfo = {
        from: `"Sumit Singh 👻" <sayyedfahed828@gmail.com>`,
        to: response.email,
        subject: "Regarding Your Payment status",
        html: emailBody,
      };

      const emailResult: any = await sendLiveMail(emailInfo);

      console.log("Email sent: %s after payment", emailResult);
      res.status(201).redirect(`${process.env.SUPER_ADMIN_SERVER_HOST}/payment-response?${new URLSearchParams(queryString).toString()}`);
    } else {
      res.status(400).json({ message: "Hash validation failed. Check the hash value." });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// Function to check reverse hash
const checkReverseHash = (response: any, hash: string) => {
  const hashstring = `${config.salt}|${response.status}|${response.udf10}|${response.udf9}|${response.udf8}|${response.udf7}|${response.udf6}|${response.udf5}|${response.udf4}|${response.udf3}|${response.udf2}|${response.udf1}|${response.email}|${response.firstname}|${response.productinfo}|${response.amount}|${response.txnid}|${response.key}`;
  const calculatedHash = sha512(hashstring);

  console.log("Generated Hash:", calculatedHash);
  console.log("Received Hash:", hash);

  return calculatedHash === hash;
};

export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { stateunit }: any = req.query;
    const normalizedState = stateunit?.toLowerCase();

    console.log(normalizedState, id, " id state --");

    let systemDB;

    if (req.headers.authorization) {
      const dbName = authenticateToken(req, res);
      systemDB = await connectToDatabase(dbName);
    } else {
      systemDB = await findAndConnectToStateDB(normalizedState);
    }

    const paymentRecord = await systemDB("payment_log")
      .where("txnid", id)
      .first();

    if (!paymentRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction ID not found." });
    }

    res.json({
      success: true,
      status: paymentRecord.status,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const checkEmailPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const { productInfo, stateunit, txnId }: any = req.query;
    // console.log(req.query, 'query email --');

    const normalizedState = stateunit?.toLowerCase();
    let systemDB;

    if (req.headers.authorization) {
      const dbName = authenticateToken(req, res);
      systemDB = await connectToDatabase(dbName);
    } else {
      systemDB = await findAndConnectToStateDB(normalizedState);
    }

    const paymentRecord = await systemDB("payment_log")
      .where({
        email: email,
        // productInfo: productInfo,
      })
      .first();

    // console.log(email, paymentRecord, 'rec of email --');

    if (!paymentRecord) {
      res.json({ emailAlreadyUsed: false });
    } else {
      res.json({ emailAlreadyUsed: true });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// export const checkEmailPaymentStatus = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.params;
//     const { productInfo, stateunit, txnId }: any = req.query;

//     const normalizedState = stateunit?.toLowerCase();
//     let systemDB;

//     if (req.headers.authorization) {
//       const dbName = authenticateToken(req, res);
//       systemDB = await connectToDatabase(dbName);
//     } else {
//       systemDB = await findAndConnectToStateDB(normalizedState);
//     }

//     const existingPayment = await systemDB("payment_log")
//       .where("txnid", txnId)
//       .first();

//     if (existingPayment) {
//       return res.status(400).json({
//         message: "Payment with the same Transaction ID already exists.",
//       });
//     }

//     const paymentRecord = await systemDB("payment_log")
//       .where({
//         email: email,
//         productInfo: productInfo,
//       })
//       .orderBy('createdAt', 'desc')
//       .first();

//     console.log(email, paymentRecord, 'rec of email --');

//     if (!paymentRecord) {
//       res.json({ emailAlreadyUsed: false });
//     } else {

//       const isFailure = paymentRecord.status === 'failure';
//       res.json({ emailAlreadyUsed: true, paymentStatus: isFailure ? 'failure' : 'success' });
//     }
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error.", error: error.message });
//   }
// };

// TO CHECK THE REGISTRATION PRIMARY FIELDS IF THEY EXIST OR NOT THEN START THE PAYMENT FROM CLIENT SIDE -------------------

export const checkRegistrationDetails = async (req: Request, res: Response) => {
  try {
    const { email, passportNumber, contactNumber, stateunit }: any = req.query;

    console.log(
      email,
      passportNumber,
      contactNumber,
      stateunit,
      "query details --"
    );

    const normalizedState = stateunit?.toLowerCase();
    let systemDB;

    if (req.headers.authorization) {
      const dbName = authenticateToken(req, res);
      systemDB = await connectToDatabase(dbName);
    } else {
      systemDB = await findAndConnectToStateDB(normalizedState);
    }

    const emailRecord = await systemDB("basic_details")
      .where({ email })
      .first();

    console.log("Email Record:", emailRecord);

    let passportRecord;

    if (passportNumber) {
      passportRecord = await systemDB("passport")
        .where({ passport_number: passportNumber })
        .first();

      console.log("Passport Record:", passportRecord);
    }

    const missingFields = [];

    if (
      emailRecord !== "" &&
      emailRecord !== undefined &&
      emailRecord !== null
    ) {
      missingFields.push("email");
    }

    if (
      passportRecord !== "" &&
      passportRecord !== undefined &&
      passportRecord !== null
    ) {
      missingFields.push("passport Number");
    }

    if (missingFields.length === 0) {
      res.json({ detailsAlreadyUsed: false });
    } else {
      res.json({ detailsAlreadyUsed: true, missingFields });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
