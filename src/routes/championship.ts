import express from "express";
import upload from "../middlewares/fileUpload";
import {
  createCompetitionCategory,
  getAllCompetitionCategories,
  getCompetitionCategoryById,
  updateCompetitionCategory,
  deleteCompetitionCategoryById,
} from "../controller/championship/competition_category";

import {
  createCompetition,
  updateCompetitionById,
  getAllCompetitions,
  getCompetitionById,
  deleteCompetitionById,
  updateMatchesForCompetition,
  getPreferredLocationByCompetitionId,
  getApprovedAthleteByCompetition,
} from "../controller/championship/competition";

import {
  createEvent,
  updateEventById,
  getAllEvents,
  getEventById,
  deleteEventById,
  getAllSegments,
  getAllEventType,
  getEventsBySelectedEventType,
  getEventName,
  getAllEventsByCompetition,
} from "../controller/championship/event";

import {
  createEventGroup,
  getAllEventGroups,
  getEventGroupById,
  getEventGroupData,
  getAllSelectedMatches,
  updateEventGroupById,
  deleteEventGroupById,
  getApprovedAthleteByCompetitionAndMatchGroup,
} from "../controller/championship/eventGroup";

const router = express.Router();
router.use(express.json());

//for category

router.post("/create_compitition_category", createCompetitionCategory);
router.get("/competition-categories", getAllCompetitionCategories);
router.get("/competition-categories/:id", getCompetitionCategoryById);
router.put("/competition-categories/:id", updateCompetitionCategory);
router.delete("/competition-categories/:id", deleteCompetitionCategoryById);

//for competition

// router.post("/create_compitition", createCompetition);
router.post(
  "/create_compitition",
  upload.single("circular"),
  createCompetition
);

router.get(
  "/get-preferred-location-competition/:comp_id",
  getPreferredLocationByCompetitionId
);
//router.put("/competition/:id", updateCompetitionById);
router.put(
  "/competition/:id",
  upload.single("circular"),
  updateCompetitionById
);
router.get("/competition", getAllCompetitions);
router.get("/competition/:id", getCompetitionById);
router.delete("/competition/:id", deleteCompetitionById);
router.post("/update-match", updateMatchesForCompetition);
//for Events

router.post("/create-event", createEvent);
router.put("/event/:id", updateEventById);
router.get("/event/:competitionCategory", getAllEvents);
router.get("/event-by-competition/:comp_id", getAllEventsByCompetition);
router.get("/events/:id", getEventById);
router.delete("/event/:id", deleteEventById);
router.get("/agegroup", getAllSegments);
router.get("/event-type", getAllEventType);

router.post("/eventname", getEventsBySelectedEventType);
router.get("/mqs/:competitionCategory", getEventName);

//for EventGroup

router.post("/create-eventgroup", createEventGroup);
router.put("/eventgroup/:id", updateEventGroupById);
router.get("/eventgroup", getAllEventGroups);
router.get("/eventgroup/:id", getEventGroupById);
router.delete("/eventgroup/:id", deleteEventGroupById);
router.post("/eventdata", getEventGroupData);
router.post("/getSelectedMatches", getAllSelectedMatches);
router.get(
  "/get-all-athelete-by-competition-and-eventgroup-id/:comp_id/:match_group_id",
  getApprovedAthleteByCompetitionAndMatchGroup
);

//athlete
router.get(
  "/get-all-athelete-by-competition-id/:comp_id",
  getApprovedAthleteByCompetition
);

export default router;
