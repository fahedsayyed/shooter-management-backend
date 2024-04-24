import { connectToDatabase, authenticateToken } from "../../config/dbutil";
import { Request, Response } from "express";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const {
      competitionCategory,
      eventType,
      eventTypeName,
      eventNumber,
      eventName,
      ageGroup,
      isMixed,
      isPara,
      eventFee,
      teamFee,
      penaltyPercentage,
      stateMQS,
      isFinal,
      numberOfFinals,
      numberOfShots,
      maxShots,
    } = req.body;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const category = await systemDB("competition_category")
      .where({ category_name: competitionCategory })
      .first();
    if (!category) {
      throw new Error("Category not found.");
    }

    const segment = await systemDB("segments_master")
      .where({ label: ageGroup })
      .first();
    if (!segment) {
      throw new Error("Segment not found.");
    }

    console.log(eventType);
    const eventTypes = await systemDB("event_types_master")
      .where({ event_name: eventType })
      .first();
    if (!eventTypes) {
      throw new Error("Event Type not found.");
    }

    console.log(eventTypes.event_type_id, "for event type check");

    const eventTypesName = await systemDB("events_master")
      .where({ name: eventTypeName })
      .first();
    if (!eventTypesName) {
      throw new Error("Event Type not found.");
    }

    await systemDB.transaction(async (trx: any) => {
      await trx("matches").insert({
        name: eventName,
        event_id: eventTypesName.id,
        event_type_id: eventTypes.id,
        //competition_id: competitionCategory,
        comp_category_id: category.id,
        match_no: eventNumber,
        segment_id: segment.id,
        percent_penalty: penaltyPercentage,
        fees: eventFee,
        team_entry_fee: teamFee,
        qualifying_score: stateMQS,
        finals: isFinal,
        nof: numberOfFinals,
        nos: numberOfShots,
        max_shots: maxShots,
        is_para: isPara,
        is_mixed: isMixed,
      });
    });

    return res.json({ message: "Event created successfully" });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateEventById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const eventId = req.params.id;
    const {
      competitionCategory,
      eventType,
      eventTypeName,
      eventNumber,
      eventName,
      ageGroup,
      isMixed,
      isPara,
      eventFee,
      teamFee,
      penaltyPercentage,
      stateMQS,
      isFinal,
      numberOfFinals,
      numberOfShots,
      maxShots,
    } = req.body;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const category = await systemDB("competition_category")
      .where({ category_name: competitionCategory })
      .first();
    if (!category) {
      throw new Error("Category not found.");
    }

    const segment = await systemDB("segments_master")
      .where({ label: ageGroup })
      .first();
    if (!segment) {
      throw new Error("Segment not found.");
    }

    const eventTypes = await systemDB("event_types_master")
      .where({ event_name: eventType })
      .first();
    if (!eventType) {
      throw new Error("Event Type not found.");
    }

    const eventTypesName = await systemDB("events_master")
      .where({ name: eventTypeName })
      .first();
    if (!eventTypesName) {
      throw new Error("Event Type not found.");
    }

    await systemDB.transaction(async (trx: any) => {
      await trx("matches").where({ id: eventId }).update({
        name: eventName,
        event_id: eventTypesName.id,
        event_type_id: eventTypes.id,
        //competition_id: competitionCategory,
        comp_category_id: category.id,
        match_no: eventNumber,
        segment_id: segment.id,
        percent_penalty: penaltyPercentage,
        fees: eventFee,
        team_entry_fee: teamFee,
        qualifying_score: stateMQS,
        finals: isFinal,
        nof: numberOfFinals,
        nos: numberOfShots,
        max_shots: maxShots,
        is_para: isPara,
        is_mixed: isMixed,
      });
    });

    return res.json({ message: "Event updated successfully" });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const eventId = req.params.id;
    console.log(eventId, "eventsid");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const event = await systemDB("matches")
      .where({ "matches.id": eventId }) // No need to specify the table name for 'id'
      .leftJoin(
        "competition_category",
        "matches.comp_category_id",
        "competition_category.id"
      )
      .leftJoin("segments_master", "matches.segment_id", "segments_master.id")
      .leftJoin(
        "event_types_master",
        "matches.event_id",
        "event_types_master.id"
      )
      .select(
        "matches.*",
        "competition_category.category_name",
        "segments_master.label",
        "event_types_master.event_name"
      )
      .first();

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json(event);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const events = await systemDB("matches")
      .select(
        "matches.*",
        "competition_category.category_name",
        "segments_master.label as age_group_label",
        "event_types_master.event_name as event_type_name"
      )
      .leftJoin(
        "competition_category",
        "matches.comp_category_id",
        "competition_category.id"
      )
      .leftJoin("segments_master", "matches.segment_id", "segments_master.id")
      .leftJoin(
        "event_types_master",
        "matches.event_id",
        "event_types_master.id"
      );

    return res.json(events);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteEventById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    console.log(decoded, "util");
    console.log("Tenant Database connected successfully");

    const eventId = req.params.id;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const deletedRows = await systemDB("matches").where({ id: eventId }).del();

    if (deletedRows === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json({ message: "Event deleted successfully" });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllSegments = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);

    // Fetch all values from the 'label' column in the 'segments' table
    const segments = await systemDB("segments_master").select("id", "label");

    return res.json(segments);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllEventType = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    const eventNames = await systemDB("event_types_master").select(
      "id",
      "event_name"
    );
    return res.json(eventNames);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getEventsBySelectedEventType = async (
  req: Request,
  res: Response
) => {
  try {
    const { selectedEventType } = req.body;
    if (!selectedEventType) {
      return res.status(400).json({
        message: "Selected event type is required in the request body.",
      });
    }
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);

    const eventTypeId = await systemDB("event_types_master")
      .where("event_name", selectedEventType)
      .first("id");

    if (!eventTypeId) {
      return res.status(404).json({ message: "Event type not found." });
    }

    const events = await systemDB("events_master")
      .where("event_type_id", eventTypeId.id)
      // .pluck("name");
      .select("id", "name");

    return res.json(events);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getEventName = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const { competitionCategory } = req.params;

    const category = await systemDB("competition_category")
      .select("id")
      .where("category_name", competitionCategory)
      .first();

    if (!category) {
      return res.status(404).json({ error: "Competition category not found" });
    }

    const events = await systemDB("matches")
      .select("matches.id", "matches.name", "matches.qualifying_score")
      .leftJoin(
        "competition_category",
        "matches.comp_category_id",
        "competition_category.id"
      )
      .where("matches.comp_category_id", category.id);

    return res.json(events);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const { competitionCategory } = req.params;

    console.log(competitionCategory);
    const category = await systemDB("competition_category")
      .select("id")
      .where("category_name", competitionCategory)
      .first();

    if (!category) {
      return res.status(404).json({ error: "Competition category not found" });
    }

    const events = await systemDB("match_details")
      .select(
        "match_details.*",
        "matches.id as match_id",
        "competition_category.category_name",
        "segments_master.label as age_group_label",
        "event_types_master.event_name as event_type_name"
      )
      .leftJoin(
        "competition_category",
        "match_details.competition_category",
        "competition_category.id"
      )
      .leftJoin(
        "segments_master",
        "match_details.segment_id",
        "segments_master.id"
      )
      .leftJoin(
        "event_types_master",
        "match_details.event_type_id",
        "event_types_master.id"
      )
      .leftJoin("matches", (builder: any) => {
        builder
          .on("match_details.match_name", "=", "matches.name")
          .andOn("match_details.match_no", "=", "matches.match_no");
      })
      .where("match_details.competition_category", category.id);

    return res.json(events);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllEventsByCompetition = async (
  req: Request,
  res: Response
) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const { comp_id } = req.params;

    console.log(comp_id);

    const matches = await systemDB("matches")
      .select(
        "matches.*",
        "competition.name as competition_name",
        "competition.comp_code",
        "competition.in_MQS_applicable"
      )
      .leftJoin("competition", "matches.competition_id", "competition.id")
      .where("matches.competition_id", comp_id);

    return res.json(matches);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
