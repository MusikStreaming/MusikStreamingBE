import express, { Router } from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";

const router = Router();

// Uploads
router.get("/presigned/r/:filename", controller.generatePresignedDownloadURL);
router.get(
  "/presigned/u/:fileName",
  ratelimit,
  controller.generatePresignedUploadURL,
);
router.post(
  "/:id/upload",
  ratelimit,
  storage.single("file"),
  controller.uploadThumbnail,
);

// CRUD
router.get("/", controller.getAllSongs);
router.post("/", controller.addSong);
router.get("/:id", controller.getSongByID);
router.patch("/:id", controller.updateSong);
router.delete("/:id", controller.deleteSong);

export { router as songRoutes };
