import { connectToDatabase, authenticateToken } from "../../config/dbutil";
import { Request, Response } from "express";

export const createEventGroup = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");
    const {
      eventName,
      eventType,
      isMixed,
      numberOfShots,
      maxShots,
      seriesCount,
      shotsInSeries,
      seriesTitles,
      stageCount,
      stageTitles,
      competitionName,
      targetGroups,
      matches,
    } = req.body;

    console.log(seriesTitles, stageTitles, "from frontend");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    console.log(matches, "add event");

    const competition = await systemDB("competition")
      .where({ name: competitionName })
      .first();
    if (!competition) {
      throw new Error("Competition not found.");
    }

    console.log(eventType);
    const eventTypeRow = await systemDB("event_types_master")
      .where({ event_name: eventType })
      .first();
    if (!eventTypeRow) {
      throw new Error("Event type not found.");
    }

    const [matchGroupId] = await systemDB("match_groups").insert({
      name: eventName,
      is_mixed: isMixed,
      no_of_shots: numberOfShots,
      max_value: maxShots,
      no_of_series: seriesCount,
      shoots_in_series: shotsInSeries,
      series_titles: JSON.stringify([seriesTitles]),
      no_of_stages: stageCount,
      stage_titles: JSON.stringify([stageTitles]),
      type: eventType,
      competition_id: competition.id,
      event_type_id: eventTypeRow.id,
    });

    const matchIds = matches;

    console.log(matchIds, "match id");

    const matchGroupMatches = matchIds.map((matchId: number) => ({
      match_group_id: matchGroupId,
      match_id: matchId,
    }));

    // Insert into match_group_matches table
    await systemDB("match_group_matches").insert(matchGroupMatches);

    const targetData = targetGroups.map((target: any) => ({
      group_id: matchGroupId,
      target: target.target,
      record: target.record,
      sighter: target.sighter,
    }));

    await systemDB("target_groups").insert(targetData);

    const titles = seriesTitles.map((title: any) => ({
      match_group_id: matchGroupId,
      title: title,
    }));

    await systemDB("event_group_series").insert(titles);

    return res.json({ message: "Event group created successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateEventGroupById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const eventGroupId = req.params.id;

    const {
      eventName,
      eventType,
      isMixed,
      numberOfShots,
      maxShots,
      seriesCount,
      shotsInSeries,
      seriesTitles,
      stageCount,
      stageTitles,
      competitionName,
      targetGroups,
      matches,
    } = req.body;

    console.log(seriesTitles, stageTitles, "from frontend");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    console.log(matches, "update event");

    const existingEventGroup = await systemDB("match_groups")
      .where({ id: eventGroupId })
      .first();

    if (!existingEventGroup) {
      throw new Error("Event group not found.");
    }

    await systemDB("match_groups")
      .where({ id: eventGroupId })
      .update({
        name: eventName,
        is_mixed: isMixed,
        no_of_shots: numberOfShots,
        max_value: maxShots,
        no_of_series: seriesCount,
        shoots_in_series: shotsInSeries,
        series_titles: JSON.stringify([seriesTitles]),
        //series_titles: seriesTitles,
        no_of_stages: stageCount,
        stage_titles: JSON.stringify([stageTitles]),
        //stage_titles: stageTitles,
        type: eventType,
      });

    await systemDB("target_groups").where({ group_id: eventGroupId }).del();

    const updatedTargetData = targetGroups.map((target: any) => ({
      group_id: eventGroupId,
      target: target.target,
      record: target.record,
      sighter: target.sighter,
    }));

    await systemDB("target_groups").insert(updatedTargetData);

    await systemDB("match_group_matches")
      .where({ match_group_id: eventGroupId })
      .del();

    const updatedMatchIds = matches;

    console.log(updatedMatchIds, "updated match ids");

    const updatedMatchGroupMatches = updatedMatchIds.map((matchId: number) => ({
      match_group_id: eventGroupId,
      match_id: matchId,
    }));

    await systemDB("match_group_matches").insert(updatedMatchGroupMatches);

    return res.json({ message: "Event group updated successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllEventGroups = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const eventGroups = await systemDB("match_groups")
      .select(
        "match_groups.name",
        "match_groups.is_mixed",
        "match_groups.no_of_shots",
        "match_groups.max_value",
        "match_groups.no_of_series",
        "match_groups.shoots_in_series",
        "match_groups.series_titles",
        "match_groups.no_of_stages",
        "match_groups.stage_titles",
        "match_groups.type",
        "competition.name as competition_name",
        "event_types_master.event_name as event_type_name",
        "match_groups.id"
      )
      .leftJoin("competition", "match_groups.competition_id", "competition.id")
      .leftJoin(
        "event_types_master",
        "match_groups.event_type_id",
        "event_types_master.id"
      );

    const result = eventGroups.map(async (group: any) => {
      const targetGroups = await systemDB("target_groups")
        .where("group_id", group.id)
        .select("target", "record", "sighter");

      const matches = await systemDB("match_group_matches")
        .where("match_group_id", group.id)
        .join("matches", "match_group_matches.match_id", "matches.id")
        .select("matches.name", "matches.match_no");

      return {
        ...group,
        target_groups: targetGroups,
        matches: matches,
      };
    });

    const eventGroupDetails = await Promise.all(result);

    return res.json(eventGroupDetails);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEventGroupById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const id = req.params.id;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const eventGroup = await systemDB("match_groups")
      .select(
        "match_groups.name",
        "match_groups.is_mixed",
        "match_groups.no_of_shots",
        "match_groups.max_value",
        "match_groups.no_of_series",
        "match_groups.shoots_in_series",
        "match_groups.series_titles",
        "match_groups.no_of_stages",
        "match_groups.stage_titles",
        "match_groups.type",
        "competition.name as competition_name",
        "event_types_master.event_name as event_type_name",
        "match_groups.id"
      )
      .leftJoin("competition", "match_groups.competition_id", "competition.id")
      .leftJoin(
        "event_types_master",
        "match_groups.event_type_id",
        "event_types_master.id"
      )
      .where("match_groups.id", id)
      .first();

    if (!eventGroup) {
      return res.status(404).json({ error: "Event Group not found." });
    }

    const targetGroups = await systemDB("target_groups")
      .where("group_id", eventGroup.id)
      .select("target", "record", "sighter");

    const matches = await systemDB("match_group_matches")
      .where("match_group_id", eventGroup.id)
      .join("matches", "match_group_matches.match_id", "matches.id")
      .select("matches.name", "matches.match_no");

    const eventGroupDetails = {
      ...eventGroup,
      target_groups: targetGroups,
      matches: matches,
    };

    return res.json(eventGroupDetails);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEventGroupData = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const { competitionName } = req.body;

    const competitionDetails = await systemDB("competition")
      .select("id")
      .where("name", competitionName)
      .first();

    if (!competitionDetails) {
      return res.status(404).json({ error: "Competition not found" });
    }

    const eventsGroups = await systemDB("match_groups")
      .select(
        "match_groups.id",
        "match_groups.name",
        "match_groups.no_of_shots",
        "match_groups.max_value"
      )
      .leftJoin("competition", "match_groups.competition_id", "competition.id")
      .where("match_groups.competition_id", competitionDetails.id);

    return res.json(eventsGroups);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllSelectedMatches = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const { competitionName, eventType } = req.body;

    console.log(competitionName, eventType, "check group");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");
    const competition = await systemDB("competition")
      .where({ name: competitionName })
      .first();
    if (!competition) {
      throw new Error("Competition not found.");
    }
    const eventTypeRow = await systemDB("event_types_master")
      .where({ event_name: eventType })
      .first();
    if (!eventTypeRow) {
      throw new Error("Event type not found.");
    }
    console.log(competition.id, eventTypeRow.event_type_id, "selected match");

    const matches = await systemDB("matches")
      .select("id", "name", "match_no")
      .where({
        competition_id: competition.id,
        event_type_id: eventTypeRow.id,
      });

    return res.json(matches);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteEventGroupById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const eventGroupId = req.params.id;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const existingEventGroup = await systemDB("match_groups")
      .where({ id: eventGroupId })
      .first();

    if (!existingEventGroup) {
      throw new Error("Event group not found.");
    }

    await systemDB("match_groups").where({ id: eventGroupId }).del();

    await systemDB("target_groups").where({ group_id: eventGroupId }).del();

    await systemDB("match_group_matches")
      .where({ match_group_id: eventGroupId })
      .del();

    return res.json({ message: "Event group deleted successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getApprovedAthleteByCompetitionAndMatchGroup = async (
  req: Request,
  res: Response
) => {
  try {
    const decoded = authenticateToken(req, res);
    const { comp_id, match_group_id } = req.params;
    console.log(comp_id, "comp_id");
    console.log(match_group_id, "match_group_id");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    // Fetch approved athlete IDs for the specified competition and match_group
    const approvedAthleteIds = await systemDB("match_participations")
      .distinct("athlete_id")
      .where({ competition_id: comp_id, status: "APPROVED" })
      .whereIn("id", (builder: any) => {
        builder
          .select("match_participation_id")
          .from("match_participation_details")
          .where({ match_group_id: match_group_id });
      });

    if (!approvedAthleteIds.length) {
      return res.status(404).json({
        message:
          "No approved athletes found for the specified competition and match group",
      });
    }

    const approvedAthletes = await systemDB("athlete as a")
      .select("a.id as athlete_id", "bd.first_name", "bd.last_name")
      .leftJoin("basic_details as bd", "a.basic_detail_id", "=", "bd.id")
      .whereIn(
        "a.id",
        approvedAthleteIds.map((row: any) => row.athlete_id)
      );

    console.log(approvedAthletes, "approvedAthletes");

    const result = approvedAthletes.ma.map((athlete: any) => ({
      athlete_id: athlete.athlete_id,
      full_name: `${athlete.first_name} ${athlete.last_name}`,
    }));

    console.log(result, "result");

    return res.json(result);
  } catch (error: any) {
    console.error(
      "Error in getApprovedAthleteByCompetitionAndMatchGroup:",
      error.message
    );
    return res.status(500).json({ error: error.message });
  }
};
