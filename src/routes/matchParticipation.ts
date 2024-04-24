import express from "express";
import * as matchParticipationController from "../controller/athletematchparticipation/matchParticipation";
const router = express.Router();

router.post(
  "/match-entry",

  matchParticipationController.createMatchParticipation
);

router.put(
  "/update-match-participation/:matchParticipationId",
  matchParticipationController.updateMatchParticipationStatus
);


router.get(
  "/get-match-participant-list",
  matchParticipationController.getAllMatchParticipations
);

router.get(
  "/match-participations/:competition_id",
  matchParticipationController.getAllMatchParticipationsAccordingCompetition
);

router.get(
  "/match-participations-details/:matchParticipationId",
  matchParticipationController.getAllMatchDetails
);

router.get("/match-participant-detail-status/:matchParticipationId/:status",
matchParticipationController.getMatchesByParticipationIdAndStatus
)

router.get("/match-participant-approve-disapprove/:match_status/:comp_id",
matchParticipationController.getAllMatchDetailsBystatus
)


export default router;
