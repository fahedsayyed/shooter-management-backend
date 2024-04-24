import { connectToDatabase, authenticateToken } from "../../config/dbutil";
import { Request, Response, response } from "express";

export const createScoreEntry = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);

    const {
      competitionID,
      matchGroupId,
      competitor_code,
      scores,
      score_type,
      series_score,
      penalty,
      inner10,
      tiePoint,
    } = req.body.data;
    console.log(req.body.data);

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");
    console.log("Tenant Database connected successfully");

    // Step 2: Get match_participation_id from the match_participations table
    const matchParticipation = await systemDB("match_participations")
      .where({ competition_id: competitionID, competitor_code })
      .first();

    if (!matchParticipation) {
      throw new Error("Match participation not found.");
    }

    // Step 4: Get match_participation_detail_id from the match_participation_details table
    const matchParticipationDetail = await systemDB(
      "match_participation_details"
    )
      .where({
        match_group_id: matchGroupId,
        match_participation_id: matchParticipation.id,
      })
      .first();

    if (!matchParticipationDetail) {
      throw new Error("Match participation detail not found.");
    }

    const eventGroupSeries = await systemDB("event_group_series")
      .where({ match_group_id: matchGroupId })
      .select("id", "title");

    if (score_type === "series") {
      for (const round in series_score) {
        const matchTitleId: any = parseInt(round.replace("round", ""), 10);
        const titleId = parseInt(matchTitleId);
        const seriesScore = series_score[round];
        const final_series_score = seriesScore;

        console.log(seriesScore, titleId, "for series wise");

        await systemDB("match_series_score_total").insert({
          match_participation_details_id: matchParticipationDetail.id,
          match_series_title_id: titleId,
          series_score: seriesScore,
          penalty: 0,
          final_series_score,
        });
      }
    } else {
      // Set to track processed match_series_title_id
      const processedMatchSeriesTitleIds = new Set();

      // Step 5: Insert score into match_series_score table
      for (let i = 0; i < scores.length; i++) {
        const titleId = eventGroupSeries[i].id;
        const title = eventGroupSeries[i].title;
        const scoreData = scores[i];

        for (const [shotIdentifier, score] of Object.entries(scoreData)) {
          if (shotIdentifier === "penalty") continue;

          const shot_no = parseInt(shotIdentifier.replace(/\D/g, ""), 10);

          if (isNaN(shot_no)) {
            console.error(`Invalid shot identifier: ${shotIdentifier}`);
            continue; // Skip this score if the shot identifier is not recognized
          }

          await systemDB("match_series_score").insert({
            match_participant_detail_id: matchParticipationDetail.id,
            match_series_title_id: titleId,
            shot_no,
            score,
          });
        }

        // Extract penalty value from scoreData after the loop
        const penaltyValue = scoreData.penalty;
        console.log(scoreData, "all score");

        // Step 6: Apply GROUP BY on the score having the same ID in the event_group_series table
        const groupedScores = await systemDB("match_series_score")
          .select("match_series_title_id")
          .sum("score as series_score")
          .groupBy("match_series_title_id");

        // Step 7: Insert records into match_series_score_total table only for new match_series_title_id
        for (const groupedScore of groupedScores) {
          if (
            !processedMatchSeriesTitleIds.has(
              groupedScore.match_series_title_id
            )
          ) {
            const final_series_score = groupedScore.series_score - penaltyValue;
            await systemDB("match_series_score_total").insert({
              match_participation_details_id: matchParticipationDetail.id,
              match_series_title_id: groupedScore.match_series_title_id,
              series_score: groupedScore.series_score,
              penalty: penaltyValue,
              final_series_score,
            });
            processedMatchSeriesTitleIds.add(
              groupedScore.match_series_title_id
            );
          }
        }
      }
    }

    // Step 8: Insert records into match_participation_score table
    const matchSeriesTotal = await systemDB("match_series_score_total")
      .select("match_participation_details_id")
      .sum("final_series_score as series_total")
      .groupBy("match_participation_details_id");

    for (const seriesTotal of matchSeriesTotal) {
      const matchParticipationDetailsId =
        seriesTotal.match_participation_details_id;

      await systemDB("match_participation_score").insert({
        match_participation_details_id: matchParticipationDetailsId,
        series_total: seriesTotal.series_total,
        by_series_penalty: penalty,
        inner_10: inner10,
        tie: tiePoint,
        score_type: score_type,
      });
    }

    console.log(
      competitionID,
      matchParticipation.id,
      matchGroupId,
      matchParticipationDetail.id,
      eventGroupSeries,
      "ids"
    );

    res.status(201).json({ message: "Score entered successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const updateScoreEntryById = async (req: Request, res: Response) => {
//   try {
//     const decoded = authenticateToken(req, res);
//     console.log(decoded, "util");

//     const scoreEntryId = req.params.id;

//     const {
//       Competition_Name,
//       match_group_name,
//       competitor_code,
//       scores,
//       score_type,
//       series_score,
//       penalty,
//       inner10,
//       tiePoint,
//     } = req.body;

//     const systemDB = await connectToDatabase(decoded);
//     await systemDB.raw("SELECT 1");
//     console.log("Tenant Database connected successfully");

//     // Step 1: Get the existing score entry from match_participation_score table
//     const existingScoreEntry = await systemDB("match_participation_score")
//       .where({ id: scoreEntryId })
//       .first();

//     if (!existingScoreEntry) {
//       throw new Error("Score entry not found.");
//     }

//     // Step 2: Update the necessary fields based on the provided data
//     existingScoreEntry.Competition_Name = Competition_Name;
//     existingScoreEntry.match_group_name = match_group_name;
//     existingScoreEntry.competitor_code = competitor_code;
//     // Update other fields as needed

//     // Step 3: Update the scores in match_series_score and match_series_score_total tables
//     if (score_type === "series") {
//       // Update series scores logic for series type
//       for (const round in series_score) {
//         const matchTitleId = round.replace("round", "");
//         const titleId = parseInt(matchTitleId);
//         const seriesScore = series_score[round];
//         const final_series_score = seriesScore;

//         await systemDB("match_series_score_total")
//           .where({
//             match_participation_details_id:
//               existingScoreEntry.match_participation_details_id,
//             match_series_title_id: titleId,
//           })
//           .update({
//             series_score: seriesScore,
//             final_series_score: final_series_score,
//           });
//       }
//     } else {
//       // Update scores logic for other types
//       for (let i = 0; i < scores.length; i++) {
//         const titleId = existingScoreEntry.match_series_title_id; // Assuming this information is available in the existing entry
//         const scoreData = scores[i];

//         for (const [shotIdentifier, score] of Object.entries(scoreData)) {
//           if (shotIdentifier === "penalty") continue;
//           const shot_no = extractNumber(shotIdentifier);

//           if (shot_no === undefined) {
//             console.error(`Invalid shot identifier: ${shotIdentifier}`);
//             continue;
//           }

//           await systemDB("match_series_score")
//             .where({
//               match_participant_detail_id:
//                 existingScoreEntry.match_participation_details_id,
//               match_series_title_id: titleId,
//               shot_no: shot_no,
//             })
//             .update({ score: score });
//         }

//         const penaltyValue = scoreData.penalty;

//         const groupedScores = await systemDB("match_series_score")
//           .select("match_series_title_id")
//           .sum("score as series_score")
//           .groupBy("match_series_title_id");

//         for (const groupedScore of groupedScores) {
//           const final_series_score = groupedScore.series_score - penaltyValue;

//           await systemDB("match_series_score_total")
//             .where({
//               match_participation_details_id:
//                 existingScoreEntry.match_participation_details_id,
//               match_series_title_id: groupedScore.match_series_title_id,
//             })
//             .update({
//               series_score: groupedScore.series_score,
//               penalty: penaltyValue,
//               final_series_score: final_series_score,
//             });
//         }
//       }
//     }

//     // Step 4: Update the match_participation_score table with the updated values
//     await systemDB("match_participation_score")
//       .where({ id: scoreEntryId })
//       .update({
//         series_total: existingScoreEntry.series_total, // Update as needed
//         by_series_penalty: penalty,
//         inner_10: inner10,
//         tie: tiePoint,
//         score_type: score_type,
//       });

//     res.json({ message: "Score entry updated successfully" });
//   } catch (error: any) {
//     console.error(error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const updateScoreEntryById = async (req: Request, res: Response) => {
//   try {
//     const decoded = authenticateToken(req, res);
//     const { competitionID, matchGroupId, matchId, competitorCode } = req.query;

//     const { scores, score_type, series_score, penalty, inner10, tiePoint } =
//       req.body;

//     const systemDB = await connectToDatabase(decoded);
//     await systemDB.raw("SELECT 1");
//     console.log("Tenant Database connected successfully");

//     // Step 2: Get match_participation_id from the match_participations table
//     const matchParticipation = await systemDB("match_participations")
//       .where({
//         competition_id: competitionID,
//         competitor_code: competitorCode,
//       })
//       .first();

//     if (!matchParticipation) {
//       throw new Error("Match participation not found.");
//     }

//     const matchParticipationDetail = await systemDB(
//       "match_participation_details"
//     )
//       .where({
//         match_group_id: matchGroupId,
//         match_id: matchId,
//         match_participation_id: matchParticipation.id,
//       })
//       .first();

//     if (!matchParticipationDetail) {
//       throw new Error("Match participation detail not found.");
//     }

//     console.log(matchParticipationDetail.id, "id");
//     // Step 1: Get the existing score entry from match_participation_score table
//     const existingScoreEntry = await systemDB("match_participation_score")
//       .where({ match_participation_details_id: matchParticipationDetail.id })
//       .first();

//     if (!existingScoreEntry) {
//       throw new Error("Score entry not found.");
//     }

//     // Step 3: Get match_participation_details_id from the existing score entry
//     const matchParticipationDetailsId =
//       existingScoreEntry.match_participation_details_id;

//     // Step 4: Update scores in match_series_score table based on match_participation_details_id
//     if (score_type === "series") {
//       for (const round in series_score) {
//         const matchTitleId = round.replace("round", "");
//         const titleId = parseInt(matchTitleId);
//         const seriesScore = series_score[round];
//         const final_series_score = seriesScore;

//         await systemDB("match_series_score")
//           .where({
//             match_participant_detail_id: matchParticipationDetailsId,
//             match_series_title_id: titleId,
//           })
//           .update({
//             series_score: seriesScore,
//           });
//       }
//     } else {
//       for (let i = 0; i < scores.length; i++) {
//         const titleId = existingScoreEntry.match_series_title_id;
//         const scoreData = scores[i];

//         for (const [shotIdentifier, score] of Object.entries(scoreData)) {
//           if (shotIdentifier === "penalty") continue;
//           const shot_no = extractNumber(shotIdentifier);

//           if (shot_no === undefined) {
//             console.error(`Invalid shot identifier: ${shotIdentifier}`);
//             continue;
//           }

//           await systemDB("match_series_score")
//             .where({
//               match_participant_detail_id: matchParticipationDetailsId,
//               match_series_title_id: titleId,
//               shot_no: shot_no,
//             })
//             .update({ score: score });
//         }

//         const penaltyValue = scoreData.penalty;

//         const groupedScores = await systemDB("match_series_score")
//           .select("match_series_title_id")
//           .sum("score as series_score")
//           .groupBy("match_series_title_id");

//         for (const groupedScore of groupedScores) {
//           const final_series_score = groupedScore.series_score - penaltyValue;

//           await systemDB("match_series_score_total")
//             .where({
//               match_participation_details_id: matchParticipationDetailsId,
//               match_series_title_id: groupedScore.match_series_title_id,
//             })
//             .update({
//               series_score: groupedScore.series_score,
//               penalty: penaltyValue,
//               final_series_score: final_series_score,
//             });
//         }
//       }
//     }

//     // Step 5: Update records in match_participation_score table
//     await systemDB("match_participation_score")
//       .where({ id: matchParticipationDetail.id })
//       .update({
//         by_series_penalty: penalty,
//         inner_10: inner10,
//         tie: tiePoint,
//         score_type: score_type,
//       });

//     res.json({ message: "Score entry updated successfully" });
//   } catch (error: any) {
//     console.error(error.message);
//     res
//       .status(500)
//       .json({ error: "Internal Server Error", message: error.message });
//   }
// };

export const updateScoreEntryById = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const { competitionID, matchGroupId, matchId, competitorCode } = req.query;
    const { scores, score_type, series_score, penalty, inner10, tiePoint } =
      req.body;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");
    console.log("Tenant Database connected successfully");

    const matchParticipation = await systemDB("match_participations")
      .where({
        competition_id: competitionID,
        competitor_code: competitorCode,
      })
      .first();

    if (!matchParticipation) {
      throw new Error("Match participation not found.");
    }

    const matchParticipationDetail = await systemDB(
      "match_participation_details"
    )
      .where({
        match_group_id: matchGroupId,
        match_id: matchId,
        match_participation_id: matchParticipation.id,
      })
      .first();

    if (!matchParticipationDetail) {
      throw new Error("Match participation detail not found.");
    }

    console.log(matchParticipationDetail.id, "id");

    const existingScoreEntry = await systemDB("match_participation_score")
      .where({ match_participation_details_id: matchParticipationDetail.id })
      .first();

    if (!existingScoreEntry) {
      throw new Error("Score entry not found.");
    }

    const matchParticipationDetailsId =
      existingScoreEntry.match_participation_details_id;

    console.log(score_type, series_score, "type");

    if (score_type === "series" && series_score) {
      for (const round in series_score) {
        const matchTitleId = round.replace("round", "");
        const titleId = parseInt(matchTitleId);
        const seriesScore = series_score[round];
        const final_series_score = seriesScore;

        await systemDB("match_series_score_total")
          .where({
            match_participation_details_id: matchParticipationDetailsId,
            match_series_title_id: titleId,
          })
          .update({
            series_score: seriesScore,
            penalty: 0,
            final_series_score: final_series_score,
          });
      }

      const seriesTotal = await systemDB("match_series_score_total")
        .where({ match_participation_details_id: matchParticipationDetailsId })
        .sum("final_series_score as series_total")
        .first();

      await systemDB("match_participation_score")
        .where({ match_participation_details_id: matchParticipationDetailsId })
        .update({
          by_series_penalty: penalty,
          inner_10: inner10,
          tie: tiePoint,
          score_type: score_type,
          series_total: seriesTotal?.series_total || 0,
        });

      res.json({ message: "Score entry updated successfully" });
    } else if (score_type !== "series" && scores) {
      // Adjusted condition here
      const eventGroupSeries = await systemDB("event_group_series")
        .where({ match_group_id: matchGroupId })
        .select("id", "title");

      console.log(eventGroupSeries, "even");

      const processedMatchSeriesTitleIds = new Set();

      for (let i = 0; i < scores.length; i++) {
        const titleId = eventGroupSeries[i].id;
        const scoreData = scores[i];

        for (const [shotIdentifier, score] of Object.entries(scoreData)) {
          if (shotIdentifier === "penalty") continue;

          const shot_no = parseInt(shotIdentifier.replace(/\D/g, ""), 10);

          if (isNaN(shot_no)) {
            console.error(`Invalid shot identifier: ${shotIdentifier}`);
            continue;
          }

          const existingRecord = await systemDB("match_series_score")
            .where({
              match_participant_detail_id: matchParticipationDetail.id,
              match_series_title_id: titleId,
              shot_no,
            })
            .first();

          if (existingRecord) {
            await systemDB("match_series_score")
              .where({
                match_participant_detail_id: matchParticipationDetail.id,
                match_series_title_id: titleId,
                shot_no,
              })
              .update({ score });
          }
        }

        const penaltyValue = scoreData.penalty;
        console.log(scoreData, "all score");

        const groupedScores = await systemDB("match_series_score")
          .select("match_series_title_id")
          .sum("score as series_score")
          .groupBy("match_series_title_id");

        for (const groupedScore of groupedScores) {
          const matchSeriesTitleId = groupedScore.match_series_title_id;

          if (!processedMatchSeriesTitleIds.has(matchSeriesTitleId)) {
            const existingRecord = await systemDB("match_series_score_total")
              .where({
                match_participation_details_id: matchParticipationDetail.id,
                match_series_title_id: matchSeriesTitleId,
              })
              .first();

            const final_series_score = groupedScore.series_score - penaltyValue;

            if (existingRecord) {
              await systemDB("match_series_score_total")
                .where({
                  match_participation_details_id: matchParticipationDetail.id,
                  match_series_title_id: matchSeriesTitleId,
                })
                .update({
                  series_score: groupedScore.series_score,
                  penalty: penaltyValue,
                  final_series_score,
                });
            }
            processedMatchSeriesTitleIds.add(matchSeriesTitleId);
          }
        }

        const seriesTotal = await systemDB("match_series_score_total")
          .where({
            match_participation_details_id: matchParticipationDetailsId,
          })
          .sum("final_series_score as series_total")
          .first();

        await systemDB("match_participation_score")
          .where({
            match_participation_details_id: matchParticipationDetailsId,
          })
          .update({
            by_series_penalty: penalty,
            inner_10: inner10,
            tie: tiePoint,
            // score_type: score_type,
            series_total: seriesTotal?.series_total || 0,
          });
      }

      res.json({ message: "Score entry updated successfully" });
    } else {
      console.log("One of the required fields is missing");
      res.status(400).json({
        error: "Bad Request",
        message: "One of the required fields is missing",
      });
    }
  } catch (error: any) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

export const scoreEntryMatchDetails = async (req: Request, res: Response) => {
  try {
    const { comp_id } = req.params;
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    // Add a WHERE clause to filter match_groups based on competition_id
    const matchGroups = await systemDB("match_groups")
      .where({ competition_id: comp_id })
      .select("*");

    res.status(200).json(matchGroups);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const scoreEntryMatchGroupDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const { matchGroupId } = req.params;
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    // Add a WHERE clause to filter match_groups based on competition_id
    const matchGroups = await systemDB("match_groups")
      .where({ id: matchGroupId })
      .select("*");

    res.status(200).json(matchGroups);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMatchesByMatchGroupId = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const { matchGroupId } = req.params;

    // Fetch all match_id entries for the specified match_group_id
    const matchIds = await systemDB("match_group_matches")
      .where({ match_group_id: matchGroupId })
      .select("match_id");

    // Extract match names from matches table based on match_ids
    const matches = await systemDB("matches")
      .whereIn(
        "id",
        matchIds.map((entry: any) => entry.match_id)
      )
      .select("id", "name");

    // Fetch all match_participation_details for the retrieved match_ids
    const matchParticipationDetails = await systemDB(
      "match_participation_details"
    ).whereIn(
      "match_id",
      matchIds.map((entry: any) => entry.match_id)
    );

    // Organize details inside matches array
    const matchesWithDetails = await Promise.all(
      matches.map(async (match: any) => {
        const details = matchParticipationDetails.filter(
          (detail: any) => detail.match_id === match.id
        );
        // const athleteIds = await Promise.all(
        //   details.map(async (detail) => {
        //     // Fetch athlete_id based on match_participation_id from match_participations table
        //     const athleteIdEntry = await systemDB("match_participations")
        //       .where({ id: detail.match_participation_id })
        //       .select("athlete_id")
        //       .first();
        //     return athleteIdEntry ? athleteIdEntry.athlete_id : null;
        //   })
        // );

        return {
          ...match,
          // details: details.map((detail, index) => ({
          //   ...detail,
          //   athlete_id: athleteIds[index],
          // })),
        };
      })
    );

    res.status(200).json(matchesWithDetails);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMatchesByAthleteId = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const { athleteId } = req.params;

    // Step 1: Fetch all match_participation_ids for the specified athlete_id
    const matchParticipationIds = await systemDB("match_participations")
      .where({ athlete_id: athleteId })
      .select("id");

    // Step 2: Fetch match_ids associated with the obtained match_participation_ids
    const matchIds = await systemDB("match_participation_details")
      .whereIn(
        "match_participation_id",
        matchParticipationIds.map((entry: any) => entry.id)
      )
      .distinct("match_id")
      .pluck("match_id");

    // Step 3: Fetch match names and details based on match_ids
    const matchesWithDetails = await Promise.all(
      matchIds.map(async (matchId: any) => {
        const matchDetails = await systemDB(
          "match_participation_details"
        ).where("match_id", matchId);

        const match = await systemDB("matches")
          .where("id", matchId)
          .select("id", "name")
          .first();

        // Filter details to include only those with the specified athlete_id
        const filteredDetails = matchDetails
          .filter((detail: any) => detail.athlete_id === parseInt(athleteId))
          .map((detail: any) => ({
            ...detail,
            athlete_id: athleteId,
          }));

        return {
          ...match,
          details: filteredDetails,
        };
      })
    );

    res.status(200).json(matchesWithDetails);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getMatchesByAthleteId = async (req: Request, res: Response) => {
//   try {
//     const decoded = authenticateToken(req, res);
//     const systemDB = await connectToDatabase(decoded);
//     await systemDB.raw("SELECT 1");

//     const { matchGroupId,athleteId } = req.params;

//     // Fetch all match_id entries for the specified match_group_id
//     const matchIds = await systemDB("match_group_matches")
//       .where({ match_group_id: matchGroupId })
//       .select("match_id");

//     // Extract match names from matches table based on match_ids
//     const matches = await systemDB("matches")
//       .whereIn("id", matchIds.map((entry) => entry.match_id))
//       .select("id", "name");

//     // Fetch all match_participation_details for the retrieved match_ids
//     const matchParticipationDetails = await systemDB("match_participation_details")
//       .whereIn("match_id", matchIds.map((entry) => entry.match_id));

//     // Organize details inside matches array
//     const matchesWithDetails = await Promise.all(matches.map(async (match) => {
//       const details = matchParticipationDetails.filter((detail) => detail.match_id === match.id);

//       // Filter details based on the provided athlete_id
//       const filteredDetails = athleteId
//         ? details.filter((detail) => detail.athlete_id === parseInt(athleteId as string, 10))
//         : details;

//       return {
//         ...match,
//         details: filteredDetails,
//       };
//     }));

//     res.status(200).json(matchesWithDetails);
//   } catch (error: any) {
//     console.error(error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getScoreDetails = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);

    const { competition_id } = req.query;
    console.log(competition_id, "id");
    const systemDB = await connectToDatabase(decoded);
    // Step 1: Get match_participations based on competition_id
    const matchParticipations = await systemDB("match_participations")
      .select(
        "match_participations.id as match_participation_id",

        "match_participations.athlete_id",
        "match_participations.competitor_code",
        "match_participations.status",
        "match_participation_details.id as match_participation_details_id",
        "match_participation_details.match_group_id",
        "match_participation_details.match_id"
      )
      .leftJoin(
        "match_participation_details",
        "match_participations.id",
        "match_participation_details.match_participation_id"
      )
      .where("match_participations.competition_id", competition_id);

    // Step 2: Organize the data into a suitable format
    const responseObj: Record<string, any> = {};

    for (const row of matchParticipations) {
      const {
        match_participation_id,
        athlete_id,
        competitor_code,
        status,
        match_participation_details_id,
        match_group_id,
        match_id,
        team_id,
        detail,
        detail_qualification_two,
        lane,
      } = row;

      if (!responseObj[match_participation_id]) {
        responseObj[match_participation_id] = [];
      }

      // Fetch additional details from the "athlete" table
      const athleteDetails = await systemDB("athlete")
        .select("basic_detail_id")
        .where("id", athlete_id);

      if (athleteDetails.length > 0) {
        const basicDetailId = athleteDetails[0].basic_detail_id;

        // Fetch basic details from the "basic_details" table
        const basicDetails = await systemDB("basic_details")
          .select("first_name", "last_name")
          .where("id", basicDetailId);

        if (basicDetails.length > 0) {
          const { first_name, last_name } = basicDetails[0];

          // Construct shooterName
          const shooterName = `${competitor_code}-${first_name} ${last_name}`;

          const matchParticipationDetailsObj = {
            athlete_id,
            competitor_code,
            status,
            match_participation_details_id,
            match_group_id,
            match_id,
            team_id,
            detail: null,
            detail_qualification_two,
            lane: null,
            series_total: null,
            eventName: null as string | null,
            eventType: null as string | null,
            shooterName,
          };

          // Fetch series_total from match_participation_score
          const scores = await systemDB("match_participation_score")
            .select("series_total")
            .where(
              "match_participation_details_id",
              match_participation_details_id
            );

          if (scores.length > 0) {
            matchParticipationDetailsObj.series_total = scores[0].series_total;
          }

          // Fetch additional details from the "matches" table
          const matchDetails = await systemDB("matches")
            .select("name", "event_id", "match_no", "event_type_id")
            .where("id", match_id);

          if (matchDetails.length > 0) {
            const { name, event_id, match_no } = matchDetails[0];

            // Construct eventName
            matchParticipationDetailsObj.eventName = `${match_no} - ${name}`;

            // Fetch eventType from the "event_types_master" table
            const eventTypeDetails = await systemDB("event_types_master")
              .select("event_name")
              .where("id", event_id);

            if (eventTypeDetails.length > 0) {
              matchParticipationDetailsObj.eventType =
                eventTypeDetails[0].event_name;
            }
          }

          responseObj[match_participation_id].push(
            matchParticipationDetailsObj
          );
        }
      }
    }
    // Convert the responseObj into an array of objects

    const formattedResponse = Object.keys(responseObj).map((key) => ({
      match_participation_id: key,
      details: responseObj[key],
    }));

    res.json(formattedResponse);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllScores = async (req: Request, res: Response) => {
  try {
    const decoded = authenticateToken(req, res);

    // const { matchParticipationDetailsId } = req.query;
    // console.log(matchParticipationDetailsId, "id");

    const { competitionID, matchGroupId, matchId, competitorCode } = req.query;

    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");
    console.log("Tenant Database connected successfully");

    // Step 2: Get match_participation_id from the match_participations table
    const matchParticipation = await systemDB("match_participations")
      .where({ competition_id: competitionID, competitor_code: competitorCode })
      .first();

    if (!matchParticipation) {
      throw new Error("Match participation not found.");
    }

    // Fetch additional details
    const competitionDetails = await systemDB("competition")
      .select("name")
      .where("id", competitionID)
      .first();

    const matchGroupDetails = await systemDB("match_groups")
      .select("name")
      .where("id", matchGroupId)
      .first();

    const matchDetails = await systemDB("matches")
      .select("name")
      .where("id", matchId)
      .first();

    const athleteDetails = await systemDB("athlete")
      .select("athlete.id as athleteId", "basic_detail_id")
      .where("id", matchParticipation.athlete_id)
      .first();

    const basicDetails = await systemDB("basic_details")
      .select("first_name", "last_name")
      .where("id", athleteDetails.basic_detail_id)
      .first();

    // Step 4: Get match_participation_detail_id from the match_participation_details table
    const matchParticipationDetail = await systemDB(
      "match_participation_details"
    )
      .where({
        match_group_id: matchGroupId,
        match_id: matchId,
        match_participation_id: matchParticipation.id,
      })
      .first();

    if (!matchParticipationDetail) {
      throw new Error("Match participation detail not found.");
    }
    const matchParticipationDetailsId = matchParticipationDetail.id;

    console.log(matchParticipationDetailsId, "getid");
    // Fetch the score_type to determine whether it's "series" or not
    const score_type = await systemDB("match_participation_score")
      .select("*")
      .where("match_participation_details_id", matchParticipationDetailsId)
      .first();

    let resultObject: Record<string, any> = {};

    // // Include details from the query in the response object
    // const responseDetails = {
    //   competitionID,
    //   matchGroupId,
    //   matchId,
    //   competitorCode,
    //   isSeriesWise: score_type === "series",
    // };

    // Include details from the query in the response object
    const responseDetails = {
      competitionID,
      competitionName: competitionDetails.name,
      matchGroupId,
      matchGroupName: matchGroupDetails.name,
      matchId,
      matchName: matchDetails.name,
      competitorCode,
      athleteId: athleteDetails.athleteId,
      shooterName: `${basicDetails.first_name} ${basicDetails.last_name}`,
      // athleteFirstName: basicDetails.first_name,
      // athleteLastName: basicDetails.last_name,
      // isSeriesWise: score_type === "series",
      isSeriesWise: score_type.score_type === "series",
      seriesTotal: score_type.series_total,
      inner10: score_type.inner_10,
      tie: score_type.tie,
      scoreType: score_type.score_type,
      scoreTypeFinal: score_type.score_type_final,
      bySeriesPenalty: score_type.by_series_penalty,
      finalTie: score_type.final_tie,
      finalTotal: score_type.final_total,
      finalRank: score_type.final_rank,
    };

    //if (score_type === "series") {
    // If score_type is "series," fetch data from match_series_score_total

    if (score_type.score_type === "series") {
      const seriesScores = await systemDB("match_series_score_total")
        .select("match_series_title_id", "series_score")
        .where("match_participation_details_id", matchParticipationDetailsId);
      const formattedSeriesResponse: Record<string, any> = {};

      seriesScores.forEach((seriesScore: any) => {
        const { match_series_title_id, series_score } = seriesScore;
        const roundKey = `round${match_series_title_id}`;
        formattedSeriesResponse[roundKey] = series_score;
      });

      // Now, formattedSeriesResponse contains a single object with all the merged keys
      const finalResponse = {
        ...responseDetails,
        series_score: formattedSeriesResponse,
      };
      res.json(finalResponse);
      return; // Exit the function after sending the response
    } else {
      // If score_type is not "series," continue with the existing logic for "shotwise"
      const scores = await systemDB("match_series_score")
        .select(
          "match_series_score.match_series_title_id",
          "match_series_score.shot_no",
          "match_series_score.score",
          "match_series_score_total.penalty",
          "match_series_score_total.final_series_score"
        )
        .leftJoin("match_series_score_total", (builder: any) => {
          builder
            .on(
              "match_series_score.match_participant_detail_id",
              "=",
              "match_series_score_total.match_participation_details_id"
            )
            .andOn(
              "match_series_score.match_series_title_id",
              "=",
              "match_series_score_total.match_series_title_id"
            );
        })
        .where(
          "match_series_score.match_participant_detail_id",
          matchParticipationDetailsId
        );

      scores.forEach((scoreRow: any) => {
        const {
          match_series_title_id,
          shot_no,
          score,
          penalty,
          final_series_score,
        } = scoreRow;

        const roundKey = `score${match_series_title_id}`;

        if (!resultObject[roundKey]) {
          resultObject[roundKey] = {
            series_score: final_series_score,
            scores: [],
          };
        }

        resultObject[roundKey].scores.push({
          [`shoot${shot_no}`]: score,
          penalty: penalty,
        });
      });
    }

    const mainObject = {
      ...responseDetails,
      scores: Object.values(resultObject).map((roundData: any) => {
        const scoresObject: any = {
          penalty: roundData.scores.reduce(
            (totalPenalty: number, shoot: any) =>
              totalPenalty + (shoot.penalty || 0),
            0
          ),
        };

        roundData.scores.forEach((shoot: any) => {
          Object.assign(scoresObject, shoot);
        });

        scoresObject.series_score = roundData.series_score;

        return scoresObject;
      }),
    };

    res.json(mainObject);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAthleteDetailsOfMatchGroupMatches = async (
  req: Request,
  res: Response
) => {
  try {
    const { comp_id, match_group_id, match_id } = req.params;
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    // Fetch all match_participation_id from match_participation_details
    const matchParticipationDetails = await systemDB(
      "match_participation_details as mpd"
    )
      .join("match_participations as mp", "mpd.match_participation_id", "mp.id")
      .where({
        "mpd.match_group_id": match_group_id,
        "mpd.match_id": match_id,
        "mp.competition_id": comp_id,
        "mp.status": "APPROVED",
      })
      .select(
        "mpd.match_participation_id",
        "mpd.*",
        "mp.athlete_id",
        "mp.id as match_participation_id_in_matches"
      );

    // Extract athlete IDs from the response
    const athleteIds = matchParticipationDetails.map(
      (participation: any) => participation.athlete_id
    );

    // Fetch all data from match_participations for the athletes
    const allAthleteDetails = await systemDB("match_participations as mp")
      .whereIn("mp.athlete_id", athleteIds)
      .select("*");

    // Fetch athlete details from the basic_details table using basic_detail_id
    const athleteDetails = await systemDB("athlete")
      .join("basic_details", "athlete.basic_detail_id", "basic_details.id")
      .whereIn("athlete.id", athleteIds)
      .select(
        "athlete.id as athlete_id",
        "basic_details.first_name",
        "basic_details.last_name"
      );

    // Combine athlete details with matchParticipationDetails and allAthleteDetails
    const result = matchParticipationDetails.map((participation: any) => {
      const athleteDetail = athleteDetails.find(
        (athlete: any) => athlete.athlete_id === participation.athlete_id
      );
      const allDetails = allAthleteDetails.find(
        (details: any) => details.athlete_id === participation.athlete_id
      );
      return {
        match_participation_id: participation.match_participation_id_in_matches,
        athlete_id: participation.athlete_id,
        first_name: athleteDetail?.first_name,
        last_name: athleteDetail?.last_name,
        ...allDetails,
      };
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMatchSeriesTitle = async (req: Request, res: Response) => {
  try {
    const { matchGroupId } = req.params;
    const decoded = authenticateToken(req, res);
    const systemDB = await connectToDatabase(decoded);
    await systemDB.raw("SELECT 1");

    const matchGroups = await systemDB("event_group_series")
      .where({ match_group_id: matchGroupId })
      .select("*");

    res.status(200).json(matchGroups);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const extractNumber = (shotIdentifier: any) => {
  const match = shotIdentifier.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
};
