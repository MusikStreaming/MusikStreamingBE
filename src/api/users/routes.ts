import express from "express";
import controller from "./controller";
import { storage } from "@/middlewares/multer.config";

const router = express.Router();

// Profile
router.get("/me", controller.getProfile);
router.post("/me", storage.single("file"), controller.updateProfile);

// User's playlists
router.get("/me/playlists", controller.getPlaylists);

// User's listen history
router.get("/me/history", controller.getListenHistory);
router.post("/me/history/:songid", controller.upsertListenHistory);

// User's followed artists
router.get("/me/following", controller.getFollowedArtists);
router.post("/me/following/:artistid", controller.followArtist);
router.delete("/me/following/:artistid", controller.unfollowArtist);

// Basic user query
router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserByID);

export { router as userRoutes };
