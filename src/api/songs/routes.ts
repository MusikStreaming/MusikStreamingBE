import { Router } from "express";
import controller from "./controller";
import { ratelimit } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";

const router = Router();

// CRUD
router.get("/", controller.getAllSongs);
router.post("/", storage.single("file"), controller.addSong);
router.get("/:id", controller.getSongByID);
router.post("/:id", storage.single("file"), controller.updateSong);
router.delete("/:id", controller.deleteSong);

// Uploads
router.get("/:id/presigned/stream", controller.generatePresignedDownloadURL);
router.get(
  "/:id/presigned/upload",
  ratelimit,
  controller.generatePresignedUploadURL,
);

export { router as songRoutes };
