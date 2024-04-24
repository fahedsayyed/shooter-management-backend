import express from 'express';
import { tenantResetPassword } from '../controller/authTenant';


const router = express.Router();

router.post('/reset-password',
tenantResetPassword
)




export default router;