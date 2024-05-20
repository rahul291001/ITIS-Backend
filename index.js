import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRoutes);

mongoose
  .connect(process.env.DB_URI, { dbName: "J&J" })
  .then(() => {
    console.log("DB connected 🚀");
  })
  .catch((error) => {
    console.log("Error occurred: ", error);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
