import ApiResponse from "./constants";

/**
 * 
 * 
 * CHECK THE RESPONSE TYPE HERE THAT I'VE CREATEED FOR OUR REFRENCE --
 * BEFORE SENDING RESPONSE AND ERROR MSG USE ONE OF THESE FROM CONSTANTS FILE FROM UTILS--
 * 
 */

const successResponse = ApiResponse.success();
const failureResponse = ApiResponse.failure("Some error", "Error message");
const status400Response = ApiResponse.statusfailure(400, { message: "Error message" });
const status200Response = ApiResponse.status(200, { data: "Some data" });
const messageResponse = ApiResponse.message("Hello, world!");
const infoResponse = ApiResponse.info({ info: "Some information" });
const dataResponse = ApiResponse.data({ key: "value" });
const pageInfoResponse = ApiResponse.pageInfo({ page: 1, pageSize: 10 });