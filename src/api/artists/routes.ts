import express, { Router } from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";

const router = Router();

router.get("/", controller.getAllArtists);

router.post("/", controller.addArtist);

router.post(
  "/:id/upload",
  ratelimit,
  storage.single("file"),
  controller.uploadAvatar,
);

router.patch("/:id", controller.updateArtist);

router.delete("/:id", controller.deleteArtist);

export { router as artistRoutes };
