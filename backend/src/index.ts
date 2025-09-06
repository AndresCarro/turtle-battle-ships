import dotenv from "dotenv";
import "reflect-metadata";

// Esto tiene que ser lo primero
dotenv.config({ path: "./.env" });

import cors from "cors";
import express from "express";
import { AppDataSource } from "./dataSource";
import gamesRouter from "./routes/games";

const app = express();
app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.use("/games", gamesRouter);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) =>
    console.error("Error during Data Source initialization:", err)
  );
