import express, { Router } from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";

const router = Router();

// CRUD
router.get("/", controller.getAllSongs);
router.post("/", controller.addSong);
router.get("/:id", controller.getSongByID);
router.patch("/:id", controller.updateSong);
router.delete("/:id", controller.deleteSong);

// Uploads
router.get("/:id/presigned/stream", controller.generatePresignedDownloadURL);
router.get(
  "/:id/presigned/upload",
  ratelimit,
  controller.generatePresignedUploadURL,
);
router.post(
  "/:id/upload",
  ratelimit,
  storage.single("file"),
  controller.uploadThumbnail,
);

export { router as songRoutes };
