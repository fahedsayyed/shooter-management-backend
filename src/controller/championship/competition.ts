import { connectToDatabase, authenticateToken } from "../../config/dbutil";
import { Request, Response } from "express";
import { handleFileUpload } from "../../utils/fileupload";
import express from "express";

let currentCompetitionId: any;
export const getCurrentCompetitionId = () => currentCompetitionId;

const getYearFromToDate = (toDate: string): number => {
  const year = parseInt(toDate.substring(0, 4), 10);
  return year;
};

export const getCompetitionById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const competitionId = req.params.id;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const secretaries = await systemDB("organising_secretary")
      .select("secratery_name", "post")
      .where({ competition_id: competitionId });

    if (!secretaries.length) {
      return res
        .status(404)
        .json({ message: "No secretaries found for the competition" });
    }

    const competitionDetails = await systemDB("competition")
      .select(
        "competition.*",
        "competition_category.category_name",
        "districts_master.name as district_name",
        "preferred_location_master.id as preferred_location_id",
        "preferred_location_master.name as preferred_location_name"
      )
      .leftJoin(
        "competition_category",
        "competition.comp_category_id",
        "competition_category.id"
      )
      .leftJoin(
        "districts_master",
        "competition.district_id",
        "districts_master.id"
      )
      .leftJoin(
        "preferred_location_master",
        "competition.preferred_location_id",
        "preferred_location_master.id"
      )
      .where({ "competition.id": competitionId })
      .first();

    if (!competitionDetails) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Fetch preferred locations for the current competition
    const preferredLocations = await systemDB("competition_prefered_location")
      .distinct("prefered_loctaion_id")
      .where({ competition_id: competitionId });

    // Create a mapping of preferred location IDs to names
    const preferredLocationsMap: Record<string, string> = {};
    for (const loc of preferredLocations) {
      const locDetails = await systemDB("preferred_location_master")
        .select("name")
        .where({ id: loc.prefered_loctaion_id })
        .first();
      if (locDetails) {
        preferredLocationsMap[loc.prefered_loctaion_id] = locDetails.name;
      }
    }

    const result = {
      ...competitionDetails,
      competition_id: competitionId, // Add competition_id to the result
      secretaries: secretaries.map((secretary: any) => ({
        secratery_name: secretary.secratery_name,
        post: secretary.post,
      })),
      preferredLocations: preferredLocations.map((loc: any) => ({
        id: loc.prefered_loctaion_id,
        name: preferredLocationsMap[loc.prefered_loctaion_id],
      })),
    };

    return res.json(result);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllCompetitions = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);

    await systemDB.raw("SELECT 1");

    const competitions = await systemDB("competition")
      .select(
        "competition.*",
        "competition_category.category_name",
        "districts_master.name as district_name",
        "organising_secretary.secratery_name",
        "organising_secretary.post"
      )
      .leftJoin(
        "competition_category",
        "competition.comp_category_id",
        "competition_category.id"
      )
      .leftJoin(
        "districts_master",
        "competition.district_id",
        "districts_master.id"
      )
      .leftJoin(
        "organising_secretary",
        "organising_secretary.competition_id",
        "competition.id"
      );

    const uniqueCompetitions: any[] = [];

    for (const comp of competitions) {
      const existingCompIndex = uniqueCompetitions.findIndex(
        (uniqueComp) =>
          uniqueComp.id === comp.id &&
          uniqueComp.comp_category_id === comp.comp_category_id
      );

      // Fetch distinct preferred location IDs for the current competition
      const preferredLocationIDs = await systemDB(
        "competition_prefered_location"
      )
        .distinct("prefered_loctaion_id")
        .where({ competition_id: comp.id });

      // Fetch names of preferred locations based on IDs from preferred_location_master
      const preferredLocations = await systemDB("preferred_location_master")
        .select("id", "name")
        .whereIn(
          "id",
          preferredLocationIDs.map((loc: any) => loc.prefered_loctaion_id)
        );

      // Map IDs with names
      const preferredLocationsMap = preferredLocations.reduce(
        (map: any, loc: any) => {
          map[loc.id] = loc.name;
          return map;
        },
        {}
      );

      if (existingCompIndex !== -1) {
        uniqueCompetitions[existingCompIndex].secretaries.push({
          secratery_name: comp.secratery_name,
          post: comp.post,
        });
        uniqueCompetitions[existingCompIndex].preferredLocations =
          preferredLocationsMap;
      } else {
        uniqueCompetitions.push({
          ...comp,
          secretaries: [
            {
              secratery_name: comp.secratery_name,
              post: comp.post,
            },
          ],
          preferredLocations: preferredLocationsMap,
        });
      }
    }

    return res.json(uniqueCompetitions);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteCompetitionById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const competitionId = req.params.id;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    await systemDB.transaction(async (trx: any) => {
      await trx("matches").where({ competition_id: competitionId }).del();

      await trx("organising_secretary")
        .where({ competition_id: competitionId })
        .del();

      // Delete associated records in competition_prefered_location
      await trx("competition_prefered_location")
        .where({ competition_id: competitionId })
        .del();

      const deletedCompetition = await trx("competition")
        .where({ id: competitionId })
        .del();

      if (!deletedCompetition) {
        throw new Error("Competition not found.");
      }
    });

    return res.json({ message: "Competition deleted successfully" });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createCompetition: express.RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const {
      comp_code,
      name,
      place,
      conducted_by,
      organisers,
      category_name,
      target_type,
      detail_creation,
      late_fee_end_date,
      reg_start_date,
      reg_end_date,
      cut_off_date,
      from_date,
      to_date,
      district,
      in_MQS_applicable,
      preferred_loc,
      //circular,
    } = req.body;

    console.log(req.body, "req");

    if (!req.file) {
      throw new Error("File is not defined");
    }

    const circularFileName = (req.file as Express.Multer.File).filename;
    console.log(circularFileName, "filename");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const category = await systemDB("competition_category")
      .where({ category_name: category_name })
      .first();
    if (!category) {
      throw new Error("Category not found.");
    }

    const districtval = await systemDB("districts_master")
      .where({ name: district })
      .first();
    if (!districtval) {
      throw new Error("district not found.");
    }

    const competitionData = {
      comp_code,
      name,
      competition_year: getYearFromToDate(to_date).toString(),
      place,
      conducted_by,
      comp_category_id: category.id,
      target_type,
      detail_creation,
      late_fee_end_date,
      reg_start_date,
      reg_end_date,
      cut_off_date,
      from_date,
      to_date,
      district_id: districtval.id,
      in_MQS_applicable,
      circular: circularFileName,
    };

    console.log(competitionData, "comp");

    await systemDB.transaction(async (trx: any) => {
      const competitionId = await trx("competition").insert(competitionData);
      currentCompetitionId = competitionId[0];

      const secretaryData = organisers.map((organiser: any) => ({
        competition_id: competitionId[0],
        secratery_name: organiser.secretary_name,
        post: organiser.post,
      }));

      console.log(secretaryData, "from fronte");

      await trx("organising_secretary").insert(secretaryData);

      if (competitionId.length === 0) {
        throw new Error(
          "Failed to insert competition data into the 'Competition' table."
        );
      }
    });

    //const preferredLocArray = preferred_loc.split(",").map(Number);

    // const competitionPreferredLocations = preferred_loc.map(
    //   (locationId: number) => ({
    //     competition_id: currentCompetitionId,
    //     prefered_loctaion_id: locationId,
    //   })
    // );

    const competitionPreferredLocations = preferred_loc.map(
      (location: any) => ({
        competition_id: currentCompetitionId,
        prefered_loctaion_id: location.id,
      })
    );

    await systemDB("competition_prefered_location").insert(
      competitionPreferredLocations
    );
    return res.json({ message: "Competition created successfully" });
  } catch (error: any) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCompetitionById: express.RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const competitionIdToUpdate = req.params.id;
    currentCompetitionId = competitionIdToUpdate;

    const {
      comp_code,
      name,
      place,
      conducted_by,
      organisers,
      category_name,
      target_type,
      detail_creation,
      late_fee_end_date,
      reg_start_date,
      reg_end_date,
      cut_off_date,
      from_date,
      to_date,
      district,
      in_MQS_applicable,
      preferred_loc,
    } = req.body;

    console.log(req.body, "req");

    let circularFileName;

    // if (!req.file) {
    //   throw new Error("File is not defined");
    // }

    if (req.file) {
      circularFileName = (req.file as Express.Multer.File).filename;
      console.log(circularFileName, "filename");
    }

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    console.log(category_name, "check");

    const category = await systemDB("competition_category")
      .where({ category_name: category_name })
      .first();
    if (!category) {
      throw new Error("Category not found.");
    }

    const districtval = await systemDB("districts_master")
      .where({ name: district })
      .first();
    if (!districtval) {
      throw new Error("district not found.");
    }

    function formatToDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace("T", " ");
    }

    const competitionData = {
      comp_code,
      name,
      competition_year: getYearFromToDate(to_date).toString(),
      place,
      conducted_by,
      comp_category_id: category.id,
      target_type,
      detail_creation,
      late_fee_end_date: formatToDate(late_fee_end_date),
      reg_start_date: formatToDate(reg_start_date),
      reg_end_date: formatToDate(reg_end_date),
      cut_off_date: formatToDate(cut_off_date),
      from_date: formatToDate(from_date),
      to_date: formatToDate(to_date),
      district_id: districtval.id,
      in_MQS_applicable,
      // preferred_location_id: preferred.id,
      circular: circularFileName,
    };

    await systemDB.transaction(async (trx: any) => {
      const competitionId = await trx("competition")
        .where({ id: competitionIdToUpdate })
        .update(competitionData);

      const secretaryData = organisers.map((organiser: any) => ({
        competition_id: competitionIdToUpdate,
        secratery_name: organiser.secretary_name,
        post: organiser.post,
      }));

      console.log(secretaryData, "from fronte");

      await trx("organising_secretary")
        .where({ competition_id: competitionIdToUpdate })
        .del();

      await trx("organising_secretary").insert(secretaryData);

      const updatedCompetition = await trx("competition")
        .where({ id: competitionIdToUpdate })
        .first();

      if (!updatedCompetition) {
        throw new Error("Failed to update competition data.");
      }

      // const preferredLocArray = preferred_loc.split(",").map(Number);

      const competitionPreferredLocations = preferred_loc.map(
        (location: any) => ({
          competition_id: competitionIdToUpdate,
          prefered_loctaion_id: location.id,
        })
      );

      // Delete existing preferred locations
      await trx("competition_prefered_location")
        .where({ competition_id: competitionIdToUpdate })
        .del();

      // Insert updated preferred locations
      await trx("competition_prefered_location").insert(
        competitionPreferredLocations
      );
    });

    return res.json({ message: "Competition updated successfully" });
  } catch (error: any) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateMatchesForCompetition = async (
  req: Request,
  res: Response
) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const currentCompetitionId = getCurrentCompetitionId();
    console.log(currentCompetitionId, "from comp");

    const selectedMatchesIds = req.body.selectedMatches;
    console.log(selectedMatchesIds, "ids");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const selectedMatchesDetails = [];

    for (const id of selectedMatchesIds) {
      const matchDetails = await systemDB("match_details")
        .select("match_no", "match_name")
        .where({ id })
        .first();

      if (matchDetails) {
        selectedMatchesDetails.push(matchDetails);
      }
    }

    for (const match of selectedMatchesDetails) {
      const { match_no, match_name } = match;

      const rs = await systemDB("matches")
        .where({ match_no, name: match_name })
        .update({ competition_id: currentCompetitionId });
    }

    return res.json({
      message: "Matches updated successfully for the current competition",
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPreferredLocationByCompetitionId = async (
  req: Request,
  res: Response
) => {
  try {
    const decoded = authenticateToken(req, res);
    const competitionId = req.params.comp_id;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const preferredLocationDetails = await systemDB(
      "competition_prefered_location"
    )
      .select("preferred_location_master.*")
      .where({ competition_id: competitionId })
      .leftJoin(
        "preferred_location_master",
        "competition_prefered_location.prefered_loctaion_id",
        "=",
        "preferred_location_master.id"
      );

    if (!preferredLocationDetails.length) {
      return res
        .status(404)
        .json({ message: "Preferred Locations not found for the competition" });
    }

    return res.json(preferredLocationDetails);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getApprovedAthleteByCompetition = async (
  req: Request,
  res: Response
) => {
  try {
    const decoded = authenticateToken(req, res);
    const competitionId = req.params.comp_id as any;
    console.log(competitionId, "comp_id");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    // Fetch approved athlete IDs for the specified competition
    const approvedAthleteIds = await systemDB("match_participations")
      .distinct("athlete_id")
      .where({ competition_id: competitionId, status: "APPROVED" });

    if (!approvedAthleteIds.length) {
      return res
        .status(404)
        .json({ message: "No approved athletes found for the competition" });
    }

    const approvedAthletes = await systemDB("athlete as a")
      .select("a.id as athlete_id", "bd.first_name", "bd.last_name")
      .leftJoin("basic_details as bd", "a.basic_detail_id", "=", "bd.id")
      .whereIn(
        "a.id",
        approvedAthleteIds.map((row: any) => row.athlete_id)
      );

    console.log(approvedAthletes, "approvedAthletes");

    const result = approvedAthletes.map((athlete: any) => ({
      athlete_id: athlete.athlete_id,
      full_name: `${athlete.first_name} ${athlete.last_name}`,
    }));

    console.log(result, "result");

    return res.json(result);
  } catch (error: any) {
    console.error("Error in getApprovedAthleteByCompetition:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
