import express, { Router } from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";

const router = Router();

// Uploads
router.get("/presigned/r/:filename", controller.generatePresignedDownloadURL);
router.get(
  "/presigned/u/:fileName",
  ratelimit,
  controller.generatePresignedUploadURL,
);

// CRUD
router.get("/", controller.getAllSongs);
router.get("/:id", controller.getSongByID);
router.patch("/:id", controller.updateSongMetadata);

export { router as songRoutes };
