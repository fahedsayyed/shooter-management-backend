import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import ApiResponse from "../utils/constants";

const CheckValidation = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (e: any) {
            
            const errorMessage: any[] = e.errors.map((err: any) => ({
                errorField: err.path[err.path.length - 1],
                message: err.message,
            }));

            res.status(400).json({
                ...ApiResponse.failure(),
                ...ApiResponse.info(errorMessage),
            });
        }
    };
};

export default CheckValidation;
