import express, { Router } from "express";
import controller from "./controller";
import rateLimit from "express-rate-limit";

const router = Router();
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Too many requests, please try again later.",
});

router.get("/", controller.getAllSongs);

router.get("/presigned/r/:filename", controller.generatePresignedDownloadURL);

router.get(
  "/presigned/u/:fileName",
  uploadRateLimit,
  controller.generatePresignedUploadURL,
);

router.get("/:id", controller.getSongByID);

export { router as songRoutes };
