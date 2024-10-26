import express, { Router } from "express";
import controller from "./controller";
import rateLimit from "express-rate-limit";

const router = Router();
const rate_limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many requests, please try again later.",
});

router.get("/", controller.getAllSongs);

router.get(
  "/presigned/:op/:fileName",
  rate_limit,
  controller.interactBlobStorage,
);

router.post("/", async (req, res) => {});

router.get("/:id", controller.getSongByID);

export { router as songRoutes };
