import { z, ZodError,number,string,object ,AnyZodObject} from "zod";
import  { Request, Response, NextFunction } from "express";

const ContractSchema = z.object({
  contractName: z.string(),
  contractStatus: z.string(),
  contract_start_date: z.string(),
  contract_end_date: z.string(),
  file: z.object({
    path: z.string(),
  }),
});

// Define the Zod schema for create tenant data

const CreateTenant = object({
  tenantType: string(),
  name: string(),
  state: string(),
  address: string(),
  addressTwo: string().optional(),
  addressThree: string().optional(),
  city: string(),
  pincode: string().refine((val:any)=>{
    return /^[0-9]{6}$/.test(val);

  },{
    message:"invalid pincode"
  }),
  contactPerson: string(),
  alternateContactPerson: string().optional(),
  email: string().email(),
  //  alternateEmail: string().email().optional().nullable(),
  contactNumber: string().refine((val:any)=>{
    return /^[0-9]{10}$/.test(val);
  },{
    message:"invalid number"
  }),
  alternateContactNumber: string().optional(),
  password: string().optional(),
  // contract: ContractSchema,
  // contractName: string(),
  // contractStatus: string(),
  // contract_start_date: string(),
  // contract_end_date: string(),
});

const CreateTenantPayload={
  body:CreateTenant
}

export const CreateTenantSchema=object({
  ...CreateTenantPayload
})

export const ValidateZod = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      const errorMessage: any[] = [];
      e.errors.map((err: any) => {
        return errorMessage.push({
          errorField: err.path[err.path.length - 1],
          Message: err.message,
        });
      });
      return res.status(400).send({
        // ...Constants.failure(),
        // ...Constants.info(errorMessage),
        message:errorMessage
      });
    }
  };
}

// export const validateCreateTenant = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const reqData = CreateTenantSchema.parse(req.body);
//     req.body = reqData; 
//     next();
//   } catch (error: any) {
//     if (error instanceof ZodError) {
//       console.error("Zod validation error:", error.errors);
//       return res.status(400).json({ message: "Validation error", errors: error.errors });
//     }
//     console.error("Global error:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };