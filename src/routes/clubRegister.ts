import express from "express";

import CheckValidation from "../middlewares/validator.middleware";

import {
  clubRegisterAthlete,
  getAllClubShooters,
  getClubShootersById,
  updateClubShooterById,
  searchFieldInAthlete,
} from "../controller/clubRegister/athleteClubRegister";

import {
  CreateConfirForgotpassword,
  CreateForgotpassword,
  CreateUpdateNewpassword,
} from "../schema/athleteloginOrSignups";
import {
  confirmPasswordReset,
  forgotPassword,
  resetPassword,
} from "../controller/athleteRegister/athleteChangePassword";
import { CreateAthleteSchema } from "../schema/athleteSchema";
import { upload } from "../middlewares/multer";

const router = express.Router();

router.use(express.json());

router.get("/check-email", searchFieldInAthlete);

router.get("/athlete", getAllClubShooters);

router.get("/athlete/:id", getClubShootersById);

router.post(
  "/update-password",
  CheckValidation(CreateUpdateNewpassword),
  resetPassword
);
router.post(
  "/forgot-password",
  CheckValidation(CreateForgotpassword),
  forgotPassword
);
router.post(
  "/confirm-password",
  CheckValidation(CreateConfirForgotpassword),
  confirmPasswordReset
);

router.post(
  "/register",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  // CheckValidation(CreateAthleteSchema),
  clubRegisterAthlete
);

router.put(
  "/update/:id",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  // CheckValidation(CreateAthleteSchema),
  updateClubShooterById
);

export default router;
