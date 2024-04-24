import { connectToDatabase, authenticateToken } from "../../config/dbutil";
import { Request, Response, response } from "express";
export const createDetail = async (req: Request, res: Response) => {
    try {
        const decoded = authenticateToken(req, res);
        const systemDB = await connectToDatabase(decoded);
        await systemDB.raw("SELECT 1");
        const {
          competitionID,
          matchGroupId,
          lanes,
          reservedLanes,
          defectiveLanes,
          startDate,
          endDate,
          preparationTime,
          changeOverTime,
          matchTime,
          eventTopShooter,
          totalDetails,
          eventOrder,
          isActive,
        } = req.body.data;
    
        // Insert data into the 'details' table
        const [detailId] = await systemDB('details').insert({
          competition_id: competitionID,
          match_group_id: matchGroupId,
          lanes,
          reserved_lanes: reservedLanes,
          defective_lanes: defectiveLanes,
          start_date: startDate,
          end_date: endDate,
          preparation_time: preparationTime || null,
          change_over_time: changeOverTime || null,
          match_time: matchTime || null,
          event_top_shooter: eventTopShooter || null,
          total_details: totalDetails || null ,
          event_order: eventOrder || null,
          is_active: isActive || null,
        });
    
        res.status(201).json({ message: 'Details created successfully', detailId });
      } catch (error:any) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  };
  export const getDetailById = async (req: Request, res: Response) => {
    try {
      const decoded = authenticateToken(req, res);
      const systemDB = await connectToDatabase(decoded);
      await systemDB.raw("SELECT 1");
      const { detailId } = req.params;
  
      const detail = await systemDB('details').where({ id: detailId }).first();
  
      if (!detail) {
        return res.status(404).json({ error: "Detail not found" });
      }
  
      res.status(200).json({ detail });
    } catch (error: any) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


  
  export const createLaneDetailConfiguration = async (req: Request, res: Response) => {
    try {
      const decoded = authenticateToken(req, res);
      const systemDB = await connectToDatabase(decoded);
console.log(req.body,"---bodys")
      const { data } = req.body;
      const { detailId } = req.params;
  
     
      await Promise.all(
        data.map(async (detailDate: any) => {
          const { fields_name, detail_date_time } = detailDate;
  
          await systemDB("lane_detail_configuaration").insert({
            detail_id: detailId,
            detail_date_time: detail_date_time,
            detail_no: fields_name,
          });
        })
      );
  
      res.status(201).json({ message: "Lane detail configuration created successfully" });
    } catch (error:any) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
