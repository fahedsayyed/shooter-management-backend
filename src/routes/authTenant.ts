import express from 'express';
import { tenantResetPassword } from '../controller/authTenant';


const router = express.Router();

router.post('/resetPassword/:token',
tenantResetPassword
)




export default router;