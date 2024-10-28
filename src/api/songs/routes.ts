import express, { Router } from "express";
import controller from "./controller";
import rateLimit from "express-rate-limit";

const router = Router();
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.params.op,
  message: "Too many requests, please try again later.",
});

router.get("/", controller.getAllSongs);

router.get(
  "/presigned/:op/:fileName",
  uploadRateLimit,
  controller.handleBlobStorage,
);

router.post("/", async (req, res) => {});

router.get("/:id", controller.getSongByID);

export { router as songRoutes };
