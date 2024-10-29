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

router.get("/me", controller.getUserProfile);

router.patch("/me", controller.updateUserProfile);

router.post(
  "/upload",
  uploadRateLimit,
  storage.single("file"),
  controller.uploadAvatar,
);

router.get("/history", controller.getUserListenHistory);

router.post("/history");

router.get("/playlists", controller.getUserPlaylists);

router.get("/:id", controller.getUserByID);

export { router as userRoutes };
