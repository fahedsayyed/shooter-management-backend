import express from "express";
import {
  getAllCities,
  getAllDistricts,
  getAllEventTypes,
  getAllMembershipPlans,
  getAllMembershipSubTypes,
  getAllMembershipTypes,
  getAllPreferredLocations,
  getAllStateUnits,
  getAllStates,
  getAllSubtypeWithClub,
  getAllTargets,
  getCitybasedOnState,
} from "../utils/locationapi";

const router = express.Router();

router.get("/district", getAllDistricts);
router.get("/state-units", getAllStateUnits);
router.get("/states", getAllStates);
router.get("/cities", getAllCities);
router.get("/event-types", getAllEventTypes);
router.get("/membership-plans", getAllMembershipPlans);
router.get("/state-city", getCitybasedOnState);

router.get("/membership-types/:id", getAllMembershipTypes);
router.get("/membership-subTypes/:id", getAllMembershipSubTypes);
router.get("/membership-subTypesAllClubs/:type", getAllSubtypeWithClub);

router.get("/preferred", getAllPreferredLocations);
//router.get("/refresh-token",refreshToken);

router.get("/targets", getAllTargets);

export default router;
