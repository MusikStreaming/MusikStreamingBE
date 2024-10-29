import express from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";

const router = express.Router();

router.get("/", controller.getAllUsers);

// Profile
router.get("/me", controller.getProfile);

router.patch("/me", controller.updateProfile);

// Upload Avatar
router.post(
  "/upload",
  ratelimit,
  storage.single("file"),
  controller.uploadAvatar,
);

// User's playlists
router.get("/playlists", controller.getPlaylists);

// User's listen history
router.get("/history", controller.getListenHistory);

router.post("/history", controller.upsertListenHistory);

// User's followed artists
router.get("/following", controller.getFollowedArtists);

router.post("/following", controller.followArtist);

router.post("/following", controller.unfollowArtist);

// Basic user query
router.get("/:id", controller.getUserByID);

export { router as userRoutes };
