import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { userRoutes } from "@/api/users/routes";
import { songRoutes } from "@/api/songs/routes";
import { playlistRoutes } from "@/api/playlists/routes";
import { artistRoutes } from "@/api/artists/routes";
import { cloudinary } from "@/services/cloudinary";
import multer from "multer";

const app = express();

app.use(express.json());
app.use(cors<Request>());
const storage = multer({ storage: multer.memoryStorage() });

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
  console.log("\x1b[35m\n 🚀 Musik-Backend 1.0.0\n\x1b[0m");
  console.log(`- Local:\thttp://localhost:${port}/`);
  return;
});
