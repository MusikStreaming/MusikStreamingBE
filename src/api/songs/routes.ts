import { Router } from "express";
import { uploadRateLimiter } from "@/middlewares/rate-limit.config";
import { storage } from "@/middlewares/multer.config";
import { SongController } from "./controller";

const router = Router();

// CRUD
router.get("/", SongController.getAllSongs);
router.post("/", storage.single("file"), SongController.addSong);
router.get("/:id", SongController.getSongByID);
router.post("/:id", storage.single("file"), SongController.updateSong);
router.delete("/:id", SongController.deleteSong);

// Uploads
router.get(
  "/:id/presigned/stream",
  SongController.generatePresignedDownloadURL,
);
router.get(
  "/:id/presigned/upload",
  uploadRateLimiter,
  SongController.generatePresignedUploadURL,
);

export { router as songRoutes };
