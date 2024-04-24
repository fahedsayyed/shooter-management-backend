import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToDatabase, destroyDatabaseConnection } from "./src/config/db";
import { destroyStateDBConnection } from "./src/config/dbutil";
import user from "./src/routes/user";
import tenant from "./src/routes/tenant";
import tenantAuth from './src/routes/tenantAuth'
import authRoutes from "./src/routes/auth";
import championship from "./src/routes/championship";
import athleteRegister from "./src/routes/athleteRegister";
import clubRegister from "./src/routes/clubRegister";
import matchParticipation from "./src/routes/matchParticipation";
import scoreEntry from "./src/routes/scoreEntry";
import payment from "./src/routes/payment";
import getloc from "./src/routes/util";
import details from "./src/routes/details";
import path from "path";

require("dotenv").config();

const app = express();
const port = process.env.SERVER_PORT;
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // credentials: true,
  sameSite: "none",
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.get("/v1/public", express.static("public"));

app.use("/v1/images", express.static(path.join(__dirname, "src/images")));

app.use("/v1/api", payment);
app.use("/v1/api/users", user);
app.use("/v1/tenants", tenant);
app.use("/v1/auth/tenants", tenantAuth);
app.use("/v1/auth", authRoutes);
app.use("/v1/api/tenants/championship", championship);
app.use("/v1/athlete", athleteRegister);
app.use("/v1/club", clubRegister);
app.use("/v1/util", getloc);

app.use("/v1/match-participation", matchParticipation);
app.use("/v1/score-entry", scoreEntry);

app.use("/v1/match-participation", matchParticipation);
app.use("/v1/score-entry", scoreEntry);
app.use("/v1/details", details);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express!");
});

/**
 *
 * PAYMENT GATEWAY, DEMO WORK FOR THE START OF IT ---
 *
 *
 */

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
//   connectToDatabase();
// });

// Connect to the database when the application starts

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  try {
    await destroyDatabaseConnection();
    await destroyStateDBConnection();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
  process.exit(0);
});
