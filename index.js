import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import https from "https"
import fs from "fs"
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";


dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const key = fs.readFileSync('./cert/selfsigned.key')
const cert = fs.readFileSync('./cert/selfsigned.cr')
const options ={
  key:key,
  cert:cert
}
app.use(cors({
  origin: [`${process.env.BASE_URL}`],
  credentials: true,
}));

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRoutes);
app.use("/api/books", bookRoutes);

// Serve static files from the React app
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// All other GET requests not handled before will return the React app


mongoose
  .connect(process.env.DB_URI, { dbName: "J&J" })
  .then(() => {
    console.log("🚀DB connected ");
  })
  .catch((error) => {
    console.log("Error occurred: ", error);
  });

var server = https.createServer(options,app) 
server.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

// app.listen(process.env.PORT, () => {
//   console.log(`Server started on port ${process.env.PORT}`);
// });