import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../packages/common_backend/.env")
});

export const JWT_SECRET =  process.env.JWT_SECRET as string;