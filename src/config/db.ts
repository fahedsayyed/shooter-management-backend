import knex from "knex";

const environment = process.env.NODE_ENV || "development";
const knexConfig = require("../../knexfile")[environment];

let knexDB: any;

// Function to connect to the database
const connectToDatabase = async () => {
  try {
    knexDB = knex(knexConfig);
    await knexDB.raw("SELECT 1"); // Check the database connection
    console.log("Database connected successfully");
    return knexDB;
  } catch (error: any) {
    console.error("Error connecting to the database:", error.message);
    throw error;
  }
};

const closeDatabaseConnection = async (knexDB: any) => {
  try {
    await knexDB.destroy();
    console.log("Database connection closed");
  } catch (error: any) {
    console.error("Error closing database connection:", error.message);
    throw error;
  }
};

// Function to destroy the database connection
const destroyDatabaseConnection = async () => {
  if (knexDB) {
    try {
      await knexDB.destroy();
      console.log("Database connection destroyed successfully");
    } catch (error: any) {
      console.error("Error destroying database connection:", error.message);
    }
  }
};

// Export the function for external use
export { connectToDatabase, destroyDatabaseConnection };
