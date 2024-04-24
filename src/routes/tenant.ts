import express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as tenantController from '../controller/tenant';
import multer from 'multer';
import path from 'path';
import { CreateTenantSchema, ValidateZod } from '../middlewares/validations/tenantvalidation';
// import createTenantValidation from '../middlewares/validations/tenantvalidation';
// import { validationResult } from 'express-validator';

const router = express.Router();

const storage = multer.diskStorage({
  destination: './src/public/image/tenantContractImage',
  filename: (req, file, cb) => {
    const fileName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    return cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});

router.post(
  "/create",
  upload.single("memoRandomProof"),

  // const flag = req.body.flag;

  // try {
  //   // if (!req.file) {
  //   //   return res.status(400).json({ error: 'No file uploaded.' });
  //   // }
  //   next();
  // } catch (error) {
  //   console.error("Error creating tenant:", error);
  //   res.status(500).json({ error: "Internal server error." });
  // }
  // async (req, res, next) => {
  //   const flag = req.body.flag;

  //   if (flag !== "draft") {
  //     // validateCreateTenant();
  //   } else {
  //     next();
  //   }
  // },
  ValidateZod(CreateTenantSchema),
  tenantController.createTenant
);

router.get('/check-unique-state/:state',
  tenantController.checkUniqueState
)

router.get('/role-and-permission/:id',
  tenantController.getRoleAndPermissionsByTenantId
)


router.put("/update-role-and-permission/:id",
  tenantController.createRolesAndPermissions)

router.get(
  "/get-tenant-list",
  tenantController.getTenants
);

// router.put(
//   "/edit-tenant/:id",
//   upload.single('contract_document'),
//   tenantController.editTenant
// );

router.put("/edit-tenant/:id", upload.single('memoRandomProof'), async (req, res, next) => {
  console.log(req.file, "file");
  try {
    // if (!req.file) {
    //   return res.status(400).json({ error: 'No file uploaded.' });
    // }
    next()

  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }

},
  ValidateZod(CreateTenantSchema),

  tenantController.editTenant

);


router.get("/club-dra-listing",
  tenantController.getClubDraList)

router.put(
  "/tenant-roles-permission/:id",
  tenantController.updateRoleAndPermission

)
router.patch(
  "/tenant-status-update/:id",
  tenantController.updateUserStatus

)
router.get(
  "/get-tenant/:id",
  tenantController.getTenant
);

router.get(
  "/get-all-masters",
  tenantController.getAllMasters
);

router.post("/invite-email", tenantController.sendInvitationEmailToTenant)
router.post("/payment-email", tenantController.sendPaymentEmailToTenant)
router.get("/subscription-and-plan", tenantController.getAllSubscriptionAndPlan)


export default router;
