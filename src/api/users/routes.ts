import express from "express";
import controller from "./controller";
import { storage } from "@/multer.config";
import rateLimit from "express-rate-limit";

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.params.id,
  message: "Too many requests, please try again later.",
});

const router = express.Router();

router.get("/", controller.getAllUsers);

// Profile
router.get("/me", controller.getProfile);

router.patch("/me", controller.updateProfile);

// Upload Avatar
router.post(
  "/upload",
  uploadRateLimit,
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
