import express from "express";
import { login, loginAsAdmin, logout, refreshToken } from "../controller/auth";

const router = express.Router();

router.post("/login", login);
router.get("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/refresh-token", refreshToken);
router.get("/admin-login/:id", loginAsAdmin);

export default router;
