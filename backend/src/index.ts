import dotenv from "dotenv";
import "reflect-metadata";

// Esto tiene que ser lo primero
dotenv.config({ path: "./.env" });

import cors from "cors";
import express from "express";
import { AppDataSource } from "./data-source";
import router from "./routes/games";

const app = express();
app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.use("/", router);
    const SERVER_PORT = process.env.SERVER_PORT || 3000;
    app.listen(SERVER_PORT, () =>
      console.log(`Server running on http://localhost:${SERVER_PORT}`)
    );
  })
  .catch((err) =>
    console.error("Error during Data Source initialization:", err)
  );
