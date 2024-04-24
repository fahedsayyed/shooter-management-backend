import express from "express";

import CheckValidation from "../middlewares/validator.middleware";
import { athleteRegister, getAthleteDetails, getAthleteDetailsById, updateAthleteDetails, updateAthleteStatus } from "../controller/athleteRegister/athleteRegister";
import { CreateConfirForgotpassword, CreateForgotpassword, CreateUpdateNewpassword } from "../schema/athleteloginOrSignups";
import { confirmPasswordReset, forgotPassword, resetPassword } from "../controller/athleteRegister/athleteChangePassword";
import { CreateAthleteSchema } from "../schema/athleteSchema";
import { upload } from "../middlewares/multer";

const router = express.Router();
router.use(express.json());

router.get('/', getAthleteDetails);
router.get('/:id', getAthleteDetailsById);

router.post('/update-password', CheckValidation(CreateUpdateNewpassword), resetPassword);
router.post('/forgot-password', CheckValidation(CreateForgotpassword), forgotPassword);
router.post('/confirm-password', CheckValidation(CreateConfirForgotpassword), confirmPasswordReset);

router.post('/athlete-register',
    upload.fields([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'birthProof', maxCount: 1 },
        { name: 'actionPhoto', maxCount: 1 },
        { name: 'addressProof', maxCount: 1 },
        { name: 'passportImage', maxCount: 1 },
        { name: 'arjunaAwardeeCertificate', maxCount: 1 },
        { name: 'internationalAwardeeCertificate', maxCount: 1 },
        { name: 'membershipAssociationCertificate', maxCount: 1 },
    ]),
    CheckValidation(CreateAthleteSchema),
    athleteRegister);

router.put('/update-athlete/:id',
    upload.fields([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'birthProof', maxCount: 1 },
        { name: 'actionPhoto', maxCount: 1 },
        { name: 'addressProof', maxCount: 1 },
        { name: 'passportImage', maxCount: 1 },
        { name: 'arjunaAwardeeCertificate', maxCount: 1 },
        { name: 'internationalAwardeeCertificate', maxCount: 1 },
        { name: 'membershipAssociationCertificate', maxCount: 1 },
    ]),
    // CheckValidation(CreateAthleteSchema),
    updateAthleteDetails)


router.patch('/update-athlete-status/:id', updateAthleteStatus)

export default router;