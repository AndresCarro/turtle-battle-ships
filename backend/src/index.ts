import cors from "cors";
import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./dataSource";
import gamesRouter from "./routes/games";

const app = express();

// Enable CORS for all origins (or you can restrict it)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.use("/games", gamesRouter);
    app.listen(3000, () =>
      console.log("Server running on http://localhost:3000")
    );
  })
  .catch((err) =>
    console.error("Error during Data Source initialization:", err)
  );
