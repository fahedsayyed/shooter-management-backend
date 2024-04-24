import { Request, Response } from "express";
import { authenticateToken, connectToDatabase } from "../../config/dbutil";

const createMatchParticipation = async (req: Request, res: Response) => {
  try {
    const {
      competition_id,
      athlete_id,
      location_id,
      remarks,
      status,
      payment_remarks,
      total_fees,
      approve_flag,
      payment_amt,
      is_para,
      is_tripple,
      is_sharing_weapon,
      events,
      is_offline,
    } = req.body;

    console.log(events, "event");

    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);

    await systemDB.transaction(async (trx: any) => {
      try {
        // Insert data into match_participation_temp
        const [matchParticipationTempId] = await trx(
          "match_participations"
        ).insert({
          competition_id,
          athlete_id,
          location_id,
          remarks,
          payment_remarks,
          total_fees,
          approve_flag,
          status: "PENDING",
          payment_amt,
          is_para,
          is_tripple,
          is_sharing_weapon,
          created_at: systemDB.fn.now(),
        });

        // Insert data into match_participation_detail_temp for each match_detail
        const matchDetailsPromises = events.map(async (matchDetail: any) => {
          // Ensure that mqs_comp_id is a valid integer or set it to a default value
          const mqsCompId = parseInt(matchDetail.mqs_comp_id, 10) || null;
          console.log(mqsCompId, "mqsCompId");

          // Fetch match_group_id based on match_id from match_group_matches table
          const matchGroupMatch = await trx("match_group_matches")
            .where({ match_id: matchDetail.match_id })
            .select("match_group_id")
            .first();

          if (!matchGroupMatch) {
            throw new Error(
              `No match_group_id found for match_id ${matchDetail.match_id}`
            );
          }

          // Insert into match_participation_details
          await trx("match_participation_details").insert({
            match_id: matchDetail.match_id,
            match_group_id: matchGroupMatch.match_group_id,
            match_participation_id: matchParticipationTempId,
            wild_card: matchDetail.wild_card,
            match_status: "PENDING",
            eligible_match: matchDetail.eligible_match,
            mqs_score: matchDetail.mqs?.score || null,
            mqs_comp_name: matchDetail.mqs?.comp_name || null,
            mqs_comp_id: mqsCompId,
            mqs_comp_year: matchDetail.mqs?.comp_year || null,
            mqs_comp_type: matchDetail.mqs?.comp_type || null,
            is_offline,
            created_at: systemDB.fn.now(),
          });
        });

        // Wait for all match_details to be inserted
        await Promise.all(matchDetailsPromises);

        // Commit the transaction
        await trx.commit();

        return res
          .status(201)
          .json({ message: "Done Match participation successfully" });
      } catch (error: any) {
        console.error(
          "Error in createMatchParticipation transaction:",
          error.message
        );
        // Rollback the transaction
        res.status(500).json({ error: error.message });
        await trx.rollback();
        throw error;
      }
    });
  } catch (error: any) {
    console.error("Global error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllMatchParticipations = async (req: Request, res: Response) => {
  const decoded = authenticateToken(req, res);
  const systemDB = await connectToDatabase(decoded);
  await systemDB.raw("SELECT 1");
  try {
    const matchParticipations = await systemDB
      .select(
        "mt.*",
        "competition.name as competition_name",
        "competition.in_MQS_applicable",
        "basic_details.first_name",
        "basic_details.last_name"
      )
      .from("match_participations as mt")
      .leftJoin(
        "match_participation_details as md",
        "mt.id",
        "=",
        "md.match_participation_id"
      )
      .leftJoin("competition", "mt.competition_id", "=", "competition.id")
      .leftJoin("athlete", "mt.athlete_id", "=", "athlete.id")
      .leftJoin(
        "basic_details",
        "athlete.basic_detail_id",
        "=",
        "basic_details.id"
      );

    return res.status(200).json(matchParticipations);
  } catch (error: any) {
    console.error("Error in getAllMatchParticipations:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getAllMatchParticipationsAccordingCompetition = async (
  req: Request,
  res: Response
) => {
  const decoded = authenticateToken(req, res);
  const systemDB = await connectToDatabase(decoded);
  await systemDB.raw("SELECT 1");
  try {
    const { competition_id } = req.params;
    console.log(competition_id, "----rq");
    const matchParticipations = await systemDB
      .distinct("mt.id")
      .select(
        "mt.*",
        "competition.name as competition_name",
        "basic_details.first_name",
        "basic_details.last_name",
        "club_dra_listing.name as club_dra_name"
      )
      .from("match_participations as mt")
      .leftJoin(
        "match_participation_details as md",
        "mt.id",
        "=",
        "md.match_participation_id"
      )
      .leftJoin("competition", "mt.competition_id", "=", "competition.id")
      .leftJoin("athlete", "mt.athlete_id", "=", "athlete.id")
      .leftJoin(
        "basic_details",
        "athlete.basic_detail_id",
        "=",
        "basic_details.id"
      )
      .leftJoin(
        "club_dra_listing",
        "club_dra_listing.id",
        "=",
        "mt.club_dra_listing_id"
      )
      .where("mt.competition_id", competition_id)
      .andWhere("mt.status", "PENDING");

    return res.status(200).json(matchParticipations);
  } catch (error: any) {
    console.error("Error in getAllMatchParticipations:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getAllMatchDetails = async (req: Request, res: Response) => {
  const decoded = authenticateToken(req, res);
  const systemDB = await connectToDatabase(decoded);
  await systemDB.raw("SELECT 1");
  try {
    const { matchParticipationId } = req.params;

    const matchDetails = await systemDB
      .select(
        "mpdt.*",
        "mt.*",
        "competition.name as competition_name",
        "basic_details.first_name",
        "basic_details.last_name",
        "club_dra_listing.name as club_dra_name",
        "matches.name as match_name",
        "matches.match_no",
        "matches.fees"
      )
      .from("match_participation_details as mpdt")
      .leftJoin(
        "match_participations as mt",
        "mpdt.match_participation_id",
        "=",
        "mt.id"
      )
      .leftJoin("competition", "mt.competition_id", "=", "competition.id")
      .leftJoin("athlete", "mt.athlete_id", "=", "athlete.id")
      .leftJoin(
        "basic_details",
        "athlete.basic_detail_id",
        "=",
        "basic_details.id"
      )
      .leftJoin(
        "club_dra_listing",
        "club_dra_listing.id",
        "=",
        "mt.club_dra_listing_id"
      )
      .leftJoin("matches", "matches.id", "=", "mpdt.match_id")
      .where("mpdt.match_participation_id", matchParticipationId);

    return res.status(200).json(matchDetails);
  } catch (error: any) {
    console.error("Error in getAllMatchDetails:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const updateMatchParticipationStatus = async (req: Request, res: Response) => {
  const { matchParticipationId } = req.params;
  const { updateStatus } = req.body; // Update the destructuring here

  console.log(updateStatus, "----reqqqq", matchParticipationId);
  const decoded = authenticateToken(req, res);
  const systemDB = await connectToDatabase(decoded);
  await systemDB.raw("SELECT 1");
  console.log(req.body, matchParticipationId, "----req");

  try {
    // Find the competition_id using matchParticipationId
    const { competition_id } = await systemDB("match_participations")
      .select("competition_id")
      .where({ id: matchParticipationId })
      .first();

    await systemDB.transaction(async (trx: any) => {
      if (!Array.isArray(updateStatus)) {
        return res
          .status(400)
          .json({ error: "Invalid data format. Expected an array." });
      }

      try {
        let anyPending = false;
        let anyDisapproved = false;
        let anyApproved = false;

        if (updateStatus.length === 0) {
          anyPending = true;
        } else {
          for (const updateStatuss of updateStatus) {
            const { match_id, status, disapprove_reason } = updateStatuss;

            // Update match participation details and disapprove_reason
            const updateResultDetailsTemp = await trx(
              "match_participation_details"
            )
              .where({
                match_participation_id: matchParticipationId,
                match_id: match_id,
              })
              .update({
                match_status: status,
                disapprove_reason: disapprove_reason,
              });

            if (updateResultDetailsTemp === 0) {
              return res.status(404).json({
                error: `No match participation details found for match_id ${match_id}`,
              });
            }

            if (status === "PENDING") {
              anyPending = true;
            } else if (status === "DISAPPROVED") {
              anyDisapproved = true;
            } else if (status === "APPROVED") {
              anyApproved = true;
            }
          }
        }

        const matchDetails = await trx("match_participation_details").where({
          match_participation_id: matchParticipationId,
        });

        const hasPendingMatches = matchDetails.some(
          (match: any) => match.match_status === "PENDING"
        );

        await trx.commit();

        if (anyPending || hasPendingMatches) {
          console.log(
            "anypending or hasPendingMatches",
            anyPending,
            hasPendingMatches
          );
          await systemDB("match_participations")
            .where({ id: matchParticipationId })
            .update({ status: "PENDING", competitor_code: null });
        } else if (anyDisapproved) {
          await systemDB("match_participations")
            .where({ id: matchParticipationId })
            .update({ status: "DISAPPROVED", competitor_code: null });
        } else if (anyApproved) {
          const newCompetitorCode = await generateCompetitorCode(
            req,
            res,
            competition_id
          );
          console.log(newCompetitorCode, "newcompetitorCode");
          await systemDB("match_participations")
            .where({ id: matchParticipationId })
            .update({
              status: "APPROVED",
              competitor_code: newCompetitorCode,
            });
        }

        return res.status(200).json({
          message: "Match participation details updated successfully",
        });
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    });
  } catch (error: any) {
    console.error("Error in updateMatchParticipationStatus:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getMatchesByParticipationIdAndStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { matchParticipationId, status } = req.params;
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const matchParticipationData = await systemDB
      .select(
        "mp.*",
        "bd.first_name",
        "bd.last_name",
        "cdl.name as club_dra_name"
      )
      .from("match_participations as mp")
      .leftJoin("athlete as a", "mp.athlete_id", "=", "a.id")
      .leftJoin("basic_details as bd", "a.basic_detail_id", "=", "bd.id")
      .leftJoin(
        "club_dra_listing as cdl",
        "mp.club_dra_listing_id",
        "=",
        "cdl.id"
      )
      .where("mp.id", matchParticipationId);

    if (matchParticipationData.length === 0) {
      return res.status(404).json({
        message:
          "No matches found for the specified matchParticipationId and status.",
      });
    }

    const matches = await systemDB
      .select(
        "mpd.id",
        "mpd.match_id",
        "mpd.created_at",
        "mpd.updated_at",
        "mpd.mqs_comp_year",
        "mpd.mqs_score",
        "mpd.match_status",
        "matches.name as match_name",
        "matches.fees as match_fee",
        "matches.match_no"
      )
      .from("match_participation_details as mpd")
      .leftJoin("matches", "mpd.match_id", "=", "matches.id")
      .where("mpd.match_participation_id", matchParticipationId)
      .andWhere("mpd.match_status", status);

    const result = {
      ...matchParticipationData[0],
      matches,
    };

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(
      "Error in getMatchesByParticipationIdAndStatus:",
      error.message
    );
    return res.status(500).json({ error: error.message });
  }
};

const getAllMatchDetailsBystatus = async (req: Request, res: Response) => {
  const { match_status, comp_id } = req.params;

  console.log(match_status, comp_id, "---reqqq");
  const decoded = authenticateToken(req, res);
  const systemDB = await connectToDatabase(decoded);
  await systemDB.raw("SELECT 1");
  try {
    const participantsData = await systemDB
      .select(
        "mp.id",
        "mp.competition_id",
        "mp.athlete_id",
        "mp.location_id",
        "mp.competitor_code",
        "mp.status",
        "mp.remarks",
        "mp.payment_remarks",
        "mp.payment_done",
        "mp.total_fees",
        "mp.approve_flag",
        "mp.payment_amt",
        "mp.receipt_no",
        "mp.is_para",
        "mp.is_tripple",
        "mp.is_autoapproved",
        "mp.participation_remark",
        "mp.status_updated_by",
        "mp.super_admin_approve",
        "mp.is_sharing_weapon",
        "mp.ws_grp_id",
        "mp.created_at",
        "mp.updated_at",
        "mp.mqs_year",
        "mp.mqs_score",
        "mp.club_dra_listing_id",
        "bd.first_name",
        "bd.last_name",
        "cdl.name as club_dra_name"
      )
      .from("match_participations as mp")
      .leftJoin("athlete as a", "mp.athlete_id", "=", "a.id")
      .leftJoin("basic_details as bd", "a.basic_detail_id", "=", "bd.id")
      .leftJoin(
        "club_dra_listing as cdl",
        "a.club_dra_listing_id",
        "=",
        "cdl.id"
      )
      .whereExists((builder: any) => {
        builder
          .select("*")
          .from("match_participation_details as mpd")
          .whereRaw("mpd.match_participation_id = mp.id")
          .andWhere("mpd.match_status", match_status);
      })
      .andWhere("mp.competition_id", comp_id);

    const result = await Promise.all(
      participantsData.map(async (participant: any) => {
        const matches = await systemDB
          .select(
            "mpd.id",
            "mpd.created_at",
            "mpd.updated_at",
            "mpd.mqs_comp_year",
            "mpd.mqs_score",
            "mpd.match_status",
            "matches.name as match_name",
            "matches.fees as match_fee",
            "matches.match_no as match_no"
          )
          .from("match_participation_details as mpd")
          .leftJoin("matches", "mpd.match_id", "=", "matches.id")
          .where("mpd.match_participation_id", participant.id)
          .andWhere("mpd.match_status", match_status);
        return {
          ...participant,
          matches,
        };
      })
    );
    console.log(result, participantsData, "--check");

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(
      "Error in getAllMatchParticipantsWithMatches:",
      error.message
    );
    return res.status(500).json({ error: error.message });
  }
};

const generateCompetitorCode = async (
  req: any,
  res: any,
  competitionId: any
) => {
  console.log(competitionId, "competitionId");
  const decoded = authenticateToken(req, res);
  const systemDB = await connectToDatabase(decoded);
  await systemDB.raw("SELECT 1");
  try {
    const lastCompetitor = await systemDB("match_participations")
      .where("competition_id", competitionId)
      .orderBy("competitor_code", "desc")
      .first();
    console.log(lastCompetitor, ";lastcompetitior");
    const lastCode = lastCompetitor
      ? parseInt(lastCompetitor.competitor_code, 10)
      : 0;

    if (isNaN(lastCode)) {
      console.error("Invalid competitor_code values in the database.");
      return 1;
    }

    const newCode = lastCode + 1;

    console.log(newCode, "newCode");
    return newCode;
  } catch (error: any) {
    console.error("Error in generateCompetitorCode:", error.message);
    throw error;
  }
};

export {
  createMatchParticipation,
  getAllMatchParticipations,
  getAllMatchParticipationsAccordingCompetition,
  updateMatchParticipationStatus,
  getAllMatchDetails,
  getMatchesByParticipationIdAndStatus,
  getAllMatchDetailsBystatus,
};

// const updateMatchParticipationStatus = async (req:Request, res:Response) => {
//   const { id } = req.params;
//   const { participant_status } = req.body;

//   try {
//     // Fetch the current status from match_participations_temp
//     const currentStatusTemp = await systemDB('match_participations_temp')
//       .where({ athlete_id: id })
//       .select('status')
//       .first();

//     // Check if the status is already the same
//     if (currentStatusTemp && currentStatusTemp.status === participant_status) {
//       return res.status(200).json({ message: `Match participation is already ${participant_status}` });
//     }

//     // Fetch the approved match participation details from match_participations_temp
//     const approvedMatchParticipationTemp = await systemDB('match_participations_temp')
//       .where({ athlete_id: id })
//       .first();

//     console.log('Approved Match Participation (Temp):', approvedMatchParticipationTemp);

//     if (!approvedMatchParticipationTemp) {
//       return res.status(404).json({ error: 'Match participation not found in temp table' });
//     }

//     // Generate competitor code (you can modify this logic as needed)
//     const competitorCode = await generateCompetitorCode();

//     // Update status to 'APPROVED' or 'DISAPPROVED' based on the request
//     const updateResult = await systemDB('match_participations_temp')
//       .where({ athlete_id: id })
//       .update({ status: participant_status });

//     if (updateResult === 0) {
//       return res.status(404).json({ error: 'No match participation found for the provided ID' });
//     }

//     const existingRecord = await systemDB('match_participation_details')
//     .where({ match_participation_id: approvedMatchParticipationTemp.id })
//     .first();

//   const { status, updated_at, ...resData } = approvedMatchParticipationTemp;
//   console.log(resData, 'data');

//   if (existingRecord) {
//     // Update the existing record if it exists
//     await systemDB('match_participation_details')
//       .where({ match_participation_id: approvedMatchParticipationTemp.id }).first()
//       // .update({ status: participant_status, updated_at: systemDB.fn.now() });
//   } else {
//     // Insert the approved or disapproved match participation details into match_participations
//     const [matchParticipationId] = await systemDB('match_participations').insert({
//       // ... other fields
//       status: participant_status,
//       updated_at: systemDB.fn.now(),
//       ...resData,
//     });

//     // Fetch data from match_participations_detail_temp based on match_participation_temp_id
//     const matchParticipationDetailTempData = await systemDB('match_participation_details_temp')
//       .where({ match_participation_id: approvedMatchParticipationTemp.id })
//       .first();

//       const updateResultDetailsTemp = await systemDB('match_participation_details_temp')
//       .where({ match_participation_id: approvedMatchParticipationTemp.id }).update({status:participant_status})

//     console.log(matchParticipationDetailTempData, 'matchParticipationDetailTempData');
//     if (matchParticipationDetailTempData) {
//       const { match_participation_id, status, ...detailsDataWithoutMatchId } = matchParticipationDetailTempData;

//       // Insert the fetched data into match_participation_details
//       await systemDB('match_participation_details').insert({
//         match_participation_id: matchParticipationId,
//         status: participant_status,
//         updated_at: systemDB.fn.now(),
//         ...detailsDataWithoutMatchId,
//       });
//     }
//   }

//     return res.status(200).json({ message: `Match participation updated to ${participant_status}` });
//   } catch (error:any) {
//     console.error('Error in updateMatchParticipationStatus:', error.message);
//     return res.status(500).json({ error: error.message });
//   }
// };

// const updateMatchParticipationStatus = async (req: Request, res: Response) => {
//   const { matchParticipationId } = req.params;
//   const { match_status, match_id } = req.body;

//   try {
//     await systemDB.transaction(async (trx) => {
//       // Update status in match_participation_details_temp
//       const updateResultDetailsTemp = await trx('match_participation_details_temp')
//         .where({ match_participation_id: matchParticipationId, match_id: match_id })
//         .update({ status: match_status });

//       if (updateResultDetailsTemp === 0) {
//         return res.status(404).json({ error: 'No match participation details found for the provided ID and match ID in temp table' });
//       }

//       // Fetch the approved match participation details from match_participations_temp
//       const approvedMatchParticipationTemp = await trx('match_participations_temp')
//         .where({ id: matchParticipationId, match_id: match_id })
//         .first();

//       if (!approvedMatchParticipationTemp) {
//         return res.status(404).json({ error: 'Match participation not found in temp table' });
//       }

//       // Generate competitor code (you can modify this logic as needed)
//       const competitorCode = await generateCompetitorCode();

//       // Update status to 'APPROVED' or 'DISAPPROVED' based on the request
//       const updateResult = await trx('match_participations_temp')
//         .where({ id: matchParticipationId, match_id: match_id })
//         .update({ status: match_status });

//       if (updateResult === 0) {
//         return res.status(404).json({ error: 'No match participation found for the provided ID and match ID' });
//       }

//       const existingRecord = await trx('match_participation_details')
//         .where({ match_participation_id: approvedMatchParticipationTemp.id })
//         .first();

//       const { status, updated_at, ...resData } = approvedMatchParticipationTemp;

//       if (existingRecord) {
//         // Update the existing record if it exists
//         await trx('match_participation_details')
//           .where({ match_participation_id: approvedMatchParticipationTemp.id })
//           .update({ status: status, updated_at: trx.fn.now() });
//       } else {
//         // Insert the approved or disapproved match participation details into match_participations
//         const [newMatchParticipationId] = await trx('match_participations').insert({
//           // ... other fields
//           status: status,
//           updated_at: trx.fn.now(),
//           ...resData,
//         });

//         // Fetch data from match_participations_detail_temp based on match_participation_temp_id
//         const matchParticipationDetailTempData = await trx('match_participation_details_temp')
//           .where({ match_participation_id: approvedMatchParticipationTemp.id })
//           .first();

//         const updateResultDetailsTemp = await trx('match_participation_details_temp')
//           .where({ match_participation_id: approvedMatchParticipationTemp.id })
//           .update({ status: status });

//         if (matchParticipationDetailTempData) {
//           const { match_participation_id, status, ...detailsDataWithoutMatchId } = matchParticipationDetailTempData;

//           // Insert the fetched data into match_participation_details
//           await trx('match_participation_details').insert({
//             match_participation_id: newMatchParticipationId,
//             status: status,
//             updated_at: trx.fn.now(),
//             ...detailsDataWithoutMatchId,
//           });
//         }
//       }
//     });

//     return res.status(200).json({ message: `Match participation updated to ${match_status}` });
//   } catch (error: any) {
//     console.error('Error in updateMatchParticipationStatus:', error.message);
//     return res.status(500).json({ error: error.message });
//   }
// };

// const getAllMatchDetailsById = async (req:Request, res:Response) => {
//   const { matchParticipationId } = req.params;

//   try {
//     // Fetch match participation details from the database based on match_participation_id
//     const matchParticipationDetails = await systemDB('match_participation_details_temp')
//       .where({ match_participation_id: matchParticipationId })
//       .select();

//     if (!matchParticipationDetails || matchParticipationDetails.length === 0) {
//       return res.status(404).json({ error: `No match participation details found for match_participation_id ${matchParticipationId}` });
//     }

//     // You can customize the response based on your requirements
//     return res.status(200).json({ matchParticipationDetails });
//   } catch (error:any) {
//     console.error('Error in fetching match participation details:', error.message);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
