import express from "express";
import user from "../controller/users";

const router = express.Router();

router.post("/create", user.createUser);

export default router;
