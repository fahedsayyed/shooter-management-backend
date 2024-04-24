import { Request, Response } from "express";
import knex from "knex";
import bcrypt from "bcrypt";

class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const { first_name, password, role } = req.body;
      console.log(req.body);
      console.log(first_name, password, role, "requesty");
      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "Invalid password" });
      }

      const MIN_PASSWORD_LENGTH = 8;
      const MAX_PASSWORD_LENGTH = 50;

      if (
        password.length < MIN_PASSWORD_LENGTH ||
        password.length > MAX_PASSWORD_LENGTH
      ) {
        return res.status(400).json({ error: "Invalid password length" });
      }

      const systemDB = knex({
        client: "mysql2",
        connection: {
          host: "192.168.0.62",
          user: "shootingm",
          password: "iWm478*7",
          database: "shooting_management",
        },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        first_name: first_name,
        password: hashedPassword,
        role: role,
      };

      const userIds = await systemDB("user").insert(user);

      if (userIds.length === 0) {
        throw new Error("Failed to insert user data into the 'user' table.");
      }

      // return res.json({ message: "User created successfully" });
      res.status(201).json(userIds);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new UserController();
