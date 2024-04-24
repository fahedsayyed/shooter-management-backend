import { connectToDatabase, authenticateToken } from "../../config/dbutil";
import { Request, Response } from "express";
import jwtSecret from "../../config/auth";
import knex from "knex";

let systemDBInstance: any;

export const connectToDatabaseOnce = async (req: Request, res: Response) => {
  if (!systemDBInstance) {
    const decoded = authenticateToken(req, res);
    systemDBInstance = await connectToDatabase(decoded);
  }
  return systemDBInstance;
};

export const createCompetitionCategory = async (
  req: Request,
  res: Response
) => {
  try {
    // const decodeding = authenticateToken(req, res);
    //   const systemDB = await connectToDatabase(decodeding);
    // console.log(decodeding, "util");
    const systemDB = await connectToDatabaseOnce(req, res);

    const { comp_category_id, category_name, is_national } = req.body;
    const categoryData = { id: comp_category_id, category_name, is_national };
    console.log(categoryData);

    await systemDB.raw("SELECT 1");
    const tenantId = await systemDB("competition_category").insert(
      categoryData
    );

    if (tenantId.length === 0) {
      throw new Error("Failed to insert tenant data into the 'tenant' table.");
    }

    return res.json({ message: "User created successfully" });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCompetitionCategoryById = async (
  req: Request,
  res: Response
) => {
  try {
    //const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabaseOnce(req, res);

    const categoryId = req.params.id;
    console.log(categoryId, "gbd");

    const category = await systemDB("competition_category")
      .where({ id: categoryId })
      .first();

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateCompetitionCategory = async (
  req: Request,
  res: Response
) => {
  try {
    // const decoded = authenticateToken(req, res);
    // const systemDB = await connectToDatabase(decoded);
    const systemDB = await connectToDatabaseOnce(req, res);

    const categoryId = req.params.id;
    const { comp_category_id, category_name, is_national } = req.body;
    const updatedData = { id: comp_category_id, category_name, is_national };

    const updatedCategory = await systemDB("competition_category")
      .where({ comp_category_id: categoryId })
      .update(updatedData);

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.json({ message: "Category updated successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllCompetitionCategories = async (
  req: Request,
  res: Response
) => {
  try {
    // const decoded = authenticateToken(req, res);
    // const systemDB = await connectToDatabase(decoded);

    const systemDB = await connectToDatabaseOnce(req, res);

    const categories = await systemDB("competition_category").select("*");
    return res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteCompetitionCategoryById = async (
  req: Request,
  res: Response
) => {
  try {
    // const decoded = authenticateToken(req, res);
    // const systemDB = await connectToDatabase(decoded);

    const systemDB = await connectToDatabaseOnce(req, res);

    const categoryId = req.params.id;

    const deletedCategory = await systemDB("competition_category")
      .where({ id: categoryId })
      .del();

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
