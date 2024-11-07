import express from "express";
import controller from "./controller";
import { storage } from "@/middlewares/multer.config";
import { authMiddleware } from "@/middlewares/auth.config";

const router = express.Router();

// Profile
router.get("/me", authMiddleware, controller.getProfile);
router.post(
  "/me",
  authMiddleware,
  storage.single("file"),
  controller.updateProfile,
);

// User's playlists
router.get("/me/playlists", authMiddleware, controller.getPlaylists);

// User's listen history
router.get("/me/history", authMiddleware, controller.getListenHistory);
router.post(
  "/me/history/:songid",
  authMiddleware,
  controller.upsertListenHistory,
);

// User's followed artists
router.get("/me/following", authMiddleware, controller.getFollowedArtists);
router.post("/me/following/:artistid", authMiddleware, controller.followArtist);
router.delete(
  "/me/following/:artistid",
  authMiddleware,
  controller.unfollowArtist,
);

// Basic user query
router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserByID);

export { router as userRoutes };
