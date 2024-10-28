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

// Profile
router.get("/profile", controller.getUserProfile);

router.patch("/:id/profile", controller.updateUserProfile);

router.post(
  "/:id/upload",
  uploadRateLimit,
  storage.single("file"),
  controller.uploadAvatar,
);

// Basic query
router.get("/:id", controller.getUserByID);

router.get("/:id/playlists", controller.getUserPlaylists);

export { router as userRoutes };
