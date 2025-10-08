import dotenv from "dotenv";
import "reflect-metadata";

// Esto tiene que ser lo primero
dotenv.config({ path: "./.env" });

import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createBucketIfNeeded } from "./data-s3-client";
import { AppDataSource } from "./data-source";
import router from "./routes/games";
import { setSocketIOInstance } from "./services/games-service";
import { setupGameSockets } from "./sockets/game-sockets";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Configure this based on your frontend URL in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");
    app.use("/", router);
    
    // Setup WebSocket handlers and pass the io instance to services
    setSocketIOInstance(io);
    setupGameSockets(io);
    
    const SERVER_PORT = +(process.env.SERVER_PORT ?? 3000);
    createBucketIfNeeded();
    server.listen(SERVER_PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${SERVER_PORT}`);
      console.log(`WebSocket server ready`);
    });
  })
  .catch((err) =>
    console.error("Error during Data Source initialization:", err)
  );
