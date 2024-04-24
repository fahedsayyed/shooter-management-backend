// fileUploadMiddleware.ts
import multer from "multer";
import path from "path";
import { Request } from "express";

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, path.join(__dirname, "../utils/public/images"));
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Multer File Filter
const fileFilter = (req: any, file: any, cb: any) => {
  if (true) {
    cb(null, true);
  } else {
    cb(new Error("File size exceeds the limit. Maximum allowed size is 5MB."));
  }
};
// Multer Middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
