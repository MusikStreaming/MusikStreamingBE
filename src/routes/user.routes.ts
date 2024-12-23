import express from "express";
import { storage } from "@/middlewares/multer.config";
import { UserController } from "@/controllers/user.controller";

const router = express.Router();

// Profile
router.get("/me", UserController.getProfile);
router.post("/me", storage.single("file"), UserController.updateProfile);

// User's playlists
router.get("/me/playlists", UserController.getPlaylists);

// User's listen history
router.get("/me/history", UserController.getListenHistory);
router.post("/me/history/:songid", UserController.upsertListenHistory);

// User's followed artists
router.get("/me/following", UserController.getFollowedArtists);
router.post("/me/following/:artistid", UserController.followArtist);
router.delete("/me/following/:artistid", UserController.unfollowArtist);

// Basic user query
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserByID);

// Total Abomination
router.delete("/:id", UserController.deleteUser);

export { router as UserRoutes };
