import { z } from "zod";

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export const checkUpdateNewPassword = z.object({
  currentPassword: z.string(),
  newPassword: z.string().refine((value) => strongPasswordPattern.test(value), {
    message:
      "New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.",
  }),
});

const CreateUpdatePayload = {
  body: checkUpdateNewPassword,
};

export const CreateUpdateNewpassword = z.object({
  ...CreateUpdatePayload,
});

export const checkForgotPassword = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  stateUnit: z.string(),
});

const CreateForgotPayload = {
  body: checkForgotPassword,
};

export const CreateForgotpassword = z.object({
  ...CreateForgotPayload,
});

export const checkConfirmNewPassword = z.object({
  yourPassword: z.string(),
  confirmPassword: z
    .string()
    .refine((value) => strongPasswordPattern.test(value), {
      message:
        "Your password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit.",
    }),
});

const CreateConfirmForgotNewPayload = {
  body: checkConfirmNewPassword,
};

export const CreateConfirForgotpassword = z.object({
  ...CreateConfirmForgotNewPayload,
});
