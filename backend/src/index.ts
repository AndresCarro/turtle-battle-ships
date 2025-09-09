import dotenv from "dotenv";
import "reflect-metadata";

// Esto tiene que ser lo primero
dotenv.config({ path: "./.env" });

import cors from "cors";
import express from "express";
import { createBucketIfNeeded } from "./data-s3-client";
import { AppDataSource } from "./data-source";
import router from "./routes/games";

const app = express();
app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");
    app.use("/", router);
    const SERVER_PORT = +(process.env.SERVER_PORT ?? 3000);
    createBucketIfNeeded();
    app.listen(SERVER_PORT, "0.0.0.0", (err) => {
      if (err) {
        console.error(err);
      }
      console.log(`Server running on http://0.0.0.0:${SERVER_PORT}`)
    });
  })
  .catch((err) =>
    console.error("Error during Data Source initialization:", err)
  );
