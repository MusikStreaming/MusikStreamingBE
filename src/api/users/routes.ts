import express from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";

const router = express.Router();

// Profile
router.get("/me", controller.getProfile);
router.patch("/me", controller.updateProfile);

// Uploads
router.post(
  "/me/upload",
  ratelimit,
  storage.single("file"),
  controller.uploadAvatar,
);

// User's playlists
router.get("/me/playlists", controller.getPlaylists);

// User's listen history
router.get("/me/history", controller.getListenHistory);
router.post("/me/history", controller.upsertListenHistory);

// User's followed artists
router.get("/me/following", controller.getFollowedArtists);
router.post("/me/following", controller.followArtist);
router.delete("/me/following", controller.unfollowArtist);

// Basic user query
router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserByID);

export { router as userRoutes };
