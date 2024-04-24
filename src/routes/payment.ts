import express from "express";
import {
  checkEmailPaymentStatus,
  checkPaymentStatus,
  checkRegistrationDetails,
  handlePaymentResponse,
  initiatePayment,
  superadminPaymentResponse,
} from "../controller/easeBuzzPayment/paymentGateway";

const router = express.Router();

router.post("/pay", initiatePayment);
router.get("/check-payment-status/:id", checkPaymentStatus);
router.get("/check-email-payment-status/:email", checkEmailPaymentStatus);
router.get("/check-registration-status/", checkRegistrationDetails);
router.post("/payment-response", handlePaymentResponse);
router.post("/superadmin-payment-response", superadminPaymentResponse);

export default router;
