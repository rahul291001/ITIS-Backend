import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js"; // Corrected import path
import https from "https";
import fs from "fs";
import sqlite3 from "sqlite3";

// open the database
let dbsql = new sqlite3.Database('./Library.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the chinook database.');
});

dbsql.serialize(() => {
  dbsql.each(`SELECT *
           FROM book`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    // console.log(row.TITLE + "\t" + row.YEAR);
  });
});


dbsql.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});



dotenv.config();

const app = express();
var key = fs.readFileSync('./cert/selfsigned.key');
var cert = fs.readFileSync('./cert/selfsigned.cr');
var options = {
  key: key,
  cert: cert
};


app.use(cors({
  origin: ["https://localhost:3000"],
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


var server = https.createServer(options, app);

server.listen(process.env.PORT, () => {
  console.log("server starting on port : " + process.env.PORT)
});

// app.listen(process.env.PORT, () => {
//   console.log(`Server started on port ${process.env.PORT}`);
// });

// app.listen(process.env.PORT, () => {
//   console.log(`Server started on port ${process.env.PORT}`);
// });
