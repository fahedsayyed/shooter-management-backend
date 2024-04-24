import knex from "knex";
import {
  connectToDatabase,
  authenticateToken,
  findAndConnectToStateDB,
} from "../config/dbutil";
import { Request, Response } from "express";

export const getAllDistricts = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    const districts = await systemDB("districts_master").select("*");
    return res.json(districts);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllStateUnits = async (req: Request, res: Response) => {
  try {
    // const { state } = req.query;

    // if (typeof state !== 'string') {
    //   return res.status(400).json({ message: "Invalid state parameter." });
    // }

    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const stateUnits = await stateDB("state_unit_master").select("*");

    return res.json(stateUnits);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllStates = async (req: Request, res: Response) => {
  try {
    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const allStates = await stateDB("state_master").select("*");

    return res.json(allStates);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllCities = async (req: Request, res: Response) => {
  try {
    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const allCities = await stateDB("cities_master").select("*");

    return res.json(allCities);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllEventTypes = async (req: Request, res: Response) => {
  try {
    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const allEvents = await stateDB("event_types_master").select("*");

    return res.json(allEvents);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllMembershipPlans = async (req: Request, res: Response) => {
  try {
    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const allEvents = await stateDB("membership_detail_master")
      .select("main")
      .distinct("main");

    return res.json(allEvents);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllMembershipTypes = async (req: Request, res: Response) => {
  try {
    const mainField = req.params.id;

    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const allEvents = await stateDB("membership_detail_master")
      .where("main", mainField)
      .select("type")
      .distinct("type");

    const types = allEvents.map((event) => ({ type: event.type }));

    // const distinctTypes = await stateDB("club_dra_listings").distinct("type");
    // const types = distinctTypes.map((row) => ({ type: row.type }));

    return res.json(types);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllMembershipSubTypes = async (req: Request, res: Response) => {
  try {
    const mainField = req.params.id;

    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const allEvents = await stateDB("membership_detail_master")
      .where("main", mainField)
      .select("sub_type")
      .distinct("sub_type");

    const subtypes = allEvents.map((event) => ({ type: event.sub_type }));

    return res.json(subtypes);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllSubtypeWithClub = async (req: Request, res: Response) => {
  try {
    let { type } = req.params;
    type = decodeURIComponent(type.replace(/\+/g, " "));
    const formattedType = type.replace(/_/g, " ").toUpperCase();

    console.log(formattedType, type);

    const stateDB = await findAndConnectToStateDB("uttarakhand");
    const names = await stateDB("club_dra_listings")
      .select("name")
      .where("type", formattedType)
      .pluck("name");

    const resultArray = names.map((name) => ({ type: name }));
    return res.json(resultArray);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllPreferredLocations = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    const preferredLocations = await systemDB(
      "preferred_location_master"
    ).select("*");
    return res.json(preferredLocations);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllTargets = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "tryyu");
    const systemDB = await connectToDatabase(decoded);

    const targets = await systemDB("targets_master").select("*");
    return res.json(targets);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getCitybasedOnState = async (req: Request, res: Response) => {
  try {
    const stateId = req.query.stateId;
    const stateDB = await findAndConnectToStateDB("uttarakhand");

    console.log(stateId, "for state-city");
    const allCities = await stateDB("cities_master")
      .where("state_id", stateId)
      .select("name");
    return res.json(allCities);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
