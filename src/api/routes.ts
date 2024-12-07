import { IPRateLimiter } from "@/middlewares/rate-limit.config";
import { Router } from "express";
import { authRoutes } from "./auth/routes";
import { userRoutes } from "./users/routes";
import { userMiddleware } from "@/middlewares/user.config";
import { songRoutes } from "./songs/routes";
import { collectionRoutes } from "./collections/routes";
import { artistRoutes } from "./artists/routes";
import { searchRoutes } from "./search/routes";
import { paymentRoutes } from "./payments/routes";
import { SongController } from "./songs/controller";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    msg: "Server is healthy",
    last_checked: new Date().toISOString(),
  });
});

router.use("/v1/auth", IPRateLimiter, authRoutes);

router.use("/v1/user", userMiddleware, userRoutes);

router.use("/v1/song", songRoutes);

router.use(
  "/v2/song/:id/presigned/stream",
  SongController.generatePresignedDownloadURLv2,
);

router.use("/v1/collection", userMiddleware, collectionRoutes);

router.use("/v1/artist", artistRoutes);

router.use("/v1/search", userMiddleware, searchRoutes);

router.use("/v1/order", IPRateLimiter, paymentRoutes);

export { router as apiRoutes };
