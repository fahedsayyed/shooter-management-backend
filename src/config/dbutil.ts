// databaseUtil.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import knex from "knex";

require("dotenv").config();

interface DecodedToken extends JwtPayload {
  state: string;
}

// export const authenticateToken = (
//   req: Request,
//   res: Response
// ): DecodedToken => {
//   // const tokens = req.cookies.jwtToken;
//   const token = req?.headers?.authorization?.split(" ")[1];
//   // console.log(token, req?.headers?.authorization, "token jwt");

//   if (!token) {
//     res.status(401).json({ message: "JWT token is missing." });
//     throw new Error("JWT token is missing.");
//   }

//   const decoded = jwt.verify(
//     token,
//     `${process.env.SECRET_KEY}`
//   ) as DecodedToken;

//   if (!decoded) {
//     res
//       .status(403)
//       .json({ message: "Access denied. Insufficient privileges." });
//     throw new Error("Access denied. Insufficient privileges.");
//   }

//   return decoded;
// };

// export const connectToDatabase = async (decoded: DecodedToken) => {
//   const state = decoded.state;
//   console.log(state, "state");
//   const dbName = state?.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");

//   const tenantDB = knex({
//     client: process.env.CLIENT_LOCAL,
//     connection: {
//       host: process.env.HOST_IP,
//       user: process.env.USER_LOCAL,
//       password: process.env.PASSWORD_LOCAL,
//       database: `${dbName}`,
//     },
//   });

//   // Check if the specified database exists
//   const databaseExists = await tenantDB.raw(
//     `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
//     [decoded.state]
//   );

//   if (!databaseExists.length) {
//     throw new Error(`Database '${decoded.state}' does not exist.`);
//   }

//   await tenantDB.raw("SELECT 1");
//   console.log("Tenant Database connected successfully");

//   return tenantDB;
// };

// -- TO QUERY THE DB RELATED TO IT'S COMING STATE FROM USER -------------------------------------------


let tenantDB: any;

export const authenticateToken = (req: Request, res: Response): DecodedToken => {
  const accessToken = req?.headers?.authorization?.split(" ")[1];
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    res.status(401).json({ message: "Access token or refresh token is missing." });
    throw new Error("Access token or refresh token is missing.");
  }

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, `${process.env.ACCESS_TOKEN_SECRET}`) as DecodedToken;

      if (!decoded) {
        res.status(403).json({ message: "Invalid access token." });
        throw new Error("Invalid access token.");
      }

      return decoded;
    }

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`) as DecodedToken;

      if (!decoded) {
        res.status(403).json({ message: "Invalid refresh token." });
        throw new Error("Invalid refresh token.");
      }

      return decoded;
    }

    // next();
  } catch (error: any) {
    res.status(403).json({ message: "Token verification failed.", error: error.message });
    throw new Error(`${error.message}`);
  }

  throw new Error("Unexpected state: No valid token found.");
};

export const authenticateNextToken = (req: Request, res: Response, next: NextFunction): DecodedToken => {
  const accessToken = req?.headers?.authorization?.split(" ")[1];
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    res.status(401).json({ message: "Access token or refresh token is missing." });
    throw new Error("Access token or refresh token is missing.");
  }

  try {
    if (accessToken) {
      const decoded = jwt.verify(accessToken, `${process.env.ACCESS_TOKEN_SECRET}`) as DecodedToken;

      if (!decoded) {
        res.status(403).json({ message: "Invalid access token." });
        throw new Error("Invalid access token.");
      }

      return decoded;
    }

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, `${process.env.REFRESH_TOKEN_SECRET}`) as DecodedToken;

      if (!decoded) {
        res.status(403).json({ message: "Invalid refresh token." });
        throw new Error("Invalid refresh token.");
      }

      return decoded;
    }

    next();
  } catch (error: any) {
    res.status(403).json({ message: "Token verification failed.", error: error.message });
    throw new Error(`${error.message}`);
  }

  throw new Error("Unexpected state: No valid token found.");
};

export const connectToDatabase = async (decoded: DecodedToken) => {
  const state = decoded?.state;
  console.log(state, "state");
  const dbName = state?.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");

  tenantDB = knex({
    client: process.env.CLIENT_LOCAL,
    connection: {
      host: process.env.HOST_IP,
      user: process.env.USER_LOCAL,
      password: process.env.PASSWORD_LOCAL,
      database: `${dbName}`,
    },
  });

  return tenantDB;
};


export const destroyStateDBConnection = async () => {
  if (tenantDB) {
    try {
      await tenantDB.destroy();
      console.log("Database connection destroyed successfully");
    } catch (error: any) {
      console.error("Error destroying database connection:", error.message);
    }
  }
};


export const findAndConnectToStateDB = async (state: string) => {
  console.log(state, "st");

  const queryState = knex({
    client: process.env.CLIENT_LOCAL,
    connection: {
      host: process.env.HOST_IP,
      user: process.env.USER_LOCAL,
      password: process.env.PASSWORD_LOCAL,
      database: `${state}`,
      //database: "Club_Arjuna",
    },
  });

  return queryState;
};
