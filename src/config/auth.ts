require("dotenv").config();

const secretKey = process.env.SECRET_KEY || "myseceret";
console.log(secretKey, "sec");

export default secretKey;
