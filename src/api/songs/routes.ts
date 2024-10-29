import express, { Router } from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";

const router = Router();

router.get("/", controller.getAllSongs);

router.get("/presigned/r/:filename", controller.generatePresignedDownloadURL);

router.get(
  "/presigned/u/:fileName",
  ratelimit,
  controller.generatePresignedUploadURL,
);

router.get("/:id", controller.getSongByID);

export { router as songRoutes };
