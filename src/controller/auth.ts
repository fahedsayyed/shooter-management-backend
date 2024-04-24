import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import knex from "knex";
import {
  authenticateToken,
  findAndConnectToStateDB,
  connectToDatabase,
} from "../config/dbutil";
import ApiResponse from "../utils/constants";
require("dotenv").config();

// const SECRET_KEY = process.env.SECRET_KEY || "nothing";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret";

function generateAccessToken(user: any) {
  return jwt.sign({ ...user, expiresIn: "15m" }, ACCESS_TOKEN_SECRET);
}

function generateRefreshToken(user: any) {
  return jwt.sign({ ...user, expiresIn: "60h" }, REFRESH_TOKEN_SECRET);
}
//
export const verifyRefreshToken = (
  refreshToken: any,
  userId: number
): Record<string, any> | null => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      userId: number;
      email: string;
      role: string;
      state: string;
    };
    if (decoded.userId !== userId) {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};
interface User {
  id: number;
  athlete_id: number;
  email: string;
  password: string;
  permissions: string;
  name: string;
}

export const login = async (req: Request, res: Response) => {
  const { email, password, state, bypassPasswordCheck } = req.body;
  console.log(email, password, state, bypassPasswordCheck, "hello");
  const normalizedState = state?.toLowerCase();

  const systemDB = await findAndConnectToStateDB("shooting_management");
  const stateDB = await findAndConnectToStateDB(normalizedState);

  let payload: any = {};

  try {
    if (!email || (!bypassPasswordCheck && !password) || !state) {
      return res
        .status(400)
        .json({ message: "Invalid Credentials, Every field is required!" });
    }

    let user;
    let userState;
    let role;
    let playerId: any;
    let isClub: boolean = false;

    user = await systemDB("tenant").where({ username: email }).first();

    if (!user) {
      user = await stateDB("users").where({ email }).first();

      if (user) {
        userState = normalizedState;
        role = user.permissions;
        isClub = user.hasOwnProperty("club_name") && user.club_name !== null;
      }
    }
    console.log(user, "user");
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    if (!bypassPasswordCheck) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid password!" });
      }
    }
    role = user.permissions;

    payload = { email, role, state: userState, isClub };
    console.log(payload, "paylo");

    if (role === "superadmin") {
      const accessToken = generateAccessToken(payload);
      return res.status(200).cookie("accessToken", accessToken, { httpOnly: true }).json({ payload, accessToken });
    }

    if (role === "admin") {
      const accessToken = generateAccessToken(payload);
      return res.status(200).cookie("accessToken", accessToken, { httpOnly: true }).json({ payload, accessToken });
    }

    const athleteInfo = await stateDB("athlete").where({ user_id: user.user_id }).first();

    if (athleteInfo) {
      playerId = athleteInfo.id;
    }

    payload = { userId: playerId, email, role, state: userState };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const existingRefreshToken = await stateDB("refresh_token_master").where({ athlete_id: playerId }).first();

    if (existingRefreshToken) {
      await stateDB("refresh_token_master").where({ athlete_id: playerId }).update({ refresh_token: refreshToken });
    } else {
      await stateDB("refresh_token_master")
        .insert({
          athlete_id: playerId,
          refresh_token: refreshToken,
        })
        .onConflict("athlete_id")
        .merge(["refresh_token"]);
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true })
      .json({ payload, accessToken, refreshToken });
  } catch (error: any) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", errorMSG: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken, userId } = req.body;

  const incomingRefreshToken = refreshToken || req.cookies.refreshToken;
  if (!incomingRefreshToken || !userId) {
    return res
      .status(400)
      .json({ message: "Invalid request. Missing refreshToken or userId." });
  }
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    REFRESH_TOKEN_SECRET
  ) as JwtPayload;
  const state = decodedToken?.state;
  const stateDB = await findAndConnectToStateDB(state);
  // console.log(stateDB, userId, refreshToken, "from user side --");
  try {
    const storedRefreshToken = await stateDB("refresh_token_master")
      .where({ athlete_id: userId })
      .select("refresh_token")
      .first();
    if (!storedRefreshToken) {
      return res.status(401).json({
        message: "No stored refresh token found for the provided athlete_id.",
      });
    }
    const decodedClaims = verifyRefreshToken(incomingRefreshToken, userId);
    if (!decodedClaims) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token or athlete_id." });
    }
    const isRefreshTokenValid =
      incomingRefreshToken === storedRefreshToken.refresh_token;
    if (!isRefreshTokenValid) {
      return res.status(401).json({
        message: "Refresh token does not match the stored refresh token.",
      });
    }
    const newAccessToken = generateAccessToken(decodedClaims);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Token refresh failed:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
export const logout = (req: Request, res: Response) => {
  res.cookie("accessToken", "", { expires: new Date(0) });
  res.status(200).json({ message: "Logout successful." });
};
// Add more authentication-related controllers as needed.
//  export const refreshToken = (req: Request, res: Response) => {
//   const token = req.cookies.jwtToken; // Assuming the JWT token is stored in a cookie
//   if (!token) {
//     return res.status(401).json({ message: "Token not provided" });
//   }
//   try {
//     const decoded = jwt.verify(token, jwtSecret);
//     const newToken = jwt.sign(
//       {
//         userId: decoded.userId,
//         username: decoded.username,
//         isSuperadmin: decoded.isSuperadmin,
//         isTenant: decoded.isTenant,
//       },
//       jwtSecret,
//       { expiresIn: "1h" }
//     );
//     res.cookie("jwtToken", newToken, { httpOnly: true });
//     res.status(200).json({ token: newToken });
//   } catch (error) {
//     res.status(401).json({ message: "Token is not valid" });
//   }
// };
export const verifyToken = (
  token: string,
  jwtSecret: string
): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    console.log(decoded, "check");
    return decoded;
  } catch (error) {
    return null;
  }
};

export const loginAsAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const superAdminDB = await findAndConnectToStateDB("superadmin");
    const adminData = await superAdminDB("tenant_data")
      .select("name", "email", "tenantType")
      .where({ id })
      .first();

    if (!adminData) {
      return res.status(404).json({ message: "Admin not found!" });
    }

    const { name, email } = adminData;
    const normalizedState = name?.toLowerCase();

    const stateDB = await findAndConnectToStateDB(normalizedState);
    const admin = await stateDB("users").where({ email }).first();

    if (!admin) {
      return res.status(404).json({ message: "Admin not found in users table!" });
    }

    const { password } = admin;
    const bypassPasswordCheck = true;

    return res.status(200).json({ state: name, email, password, bypassPasswordCheck });
    // return res.status(200).json({ state: name, email, password, bypassPasswordCheck }).redirect(`https://sm.taolabs.in/auth/login?${new URLSearchParams("something").toString()}`);;
  } catch (error: any) {
    console.error("Login as admin error:", error);
    return res.status(500).json({ message: "Internal server error.", errorMSG: error.message });
  }
};
