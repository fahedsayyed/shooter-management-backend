import express from "express";

import {
  createScoreEntry,
  getAthleteDetailsOfMatchGroupMatches,
  getMatchSeriesTitle,
  getMatchesByAthleteId,
  getMatchesByMatchGroupId,
  scoreEntryMatchDetails,
  scoreEntryMatchGroupDetails,
  updateScoreEntryById,
  getAllScores,
  getScoreDetails,
} from "../controller/scoreEntry/scoreEntry";

const router = express.Router();

//for category

router.post("/add-score", createScoreEntry);
router.get("/score", getAllScores);
router.get("/score-detail", getScoreDetails);
// router.get("/competition-categories/:id", getCompetitionCategoryById);
router.put("/update-score", updateScoreEntryById);

router.get("/get-match-details/:comp_id", scoreEntryMatchDetails);
router.get(
  "/get-match-group-details/:matchGroupId",
  scoreEntryMatchGroupDetails
);

router.get(
  "/get-match-detail-by-match-group-id/:matchGroupId",
  getMatchesByMatchGroupId
);
router.get("/get-match-detail-by-athlete-id/:athleteId", getMatchesByAthleteId);
router.get(
  "/get-athlete-detail-by-match/:comp_id/:match_group_id/:match_id",
  getAthleteDetailsOfMatchGroupMatches
);
router.get("/get-match-series-title/:matchGroupId", getMatchSeriesTitle);

// router.delete("/competition-categories/:id", deleteCompetitionCategoryById);

export default router;
