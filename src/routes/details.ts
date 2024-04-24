import express from "express";
import { createDetail, createLaneDetailConfiguration, getDetailById } from "../controller/details/laneDetail";

const router = express.Router();

router.post("/create-details", createDetail);
router.get ("/get-detail/:detailId",getDetailById)
router.post("/create-detail-date-and-time/:detailId", createLaneDetailConfiguration)

export default router;
