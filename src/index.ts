import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { userRoutes } from "@/api/users/routes";
import { songRoutes } from "@/api/songs/routes";
import { playlistRoutes } from "@/api/playlists/routes";
import { artistRoutes } from "@/api/artists/routes";
import { cloudinary } from "@/services/cloudinary";
import backblaze from "./services/backblaze";

const app = express();

app.use(express.json());
app.use(cors<Request>());

const port = process.env.PORT || 7554;

app.get("/", (req, res) => {
  res.status(200).json({
    msg: "Server is healthy",
    last_checked: new Date(),
  });
});

app.use("/v1/users", userRoutes);
app.use("/v1/songs", songRoutes);
app.use("/v1/collections", playlistRoutes);
app.use("/v1/artists", artistRoutes);

app.listen(port, () => {
  return console.log(`Listening on localhost:${port}`);
});
