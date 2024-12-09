import { IPRateLimiter } from "@/middlewares/rate-limit.config";
import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { UserRoutes } from "./users/routes";
import { userMiddleware } from "@/middlewares/user.config";
import { SongRoutes } from "./songs/routes";
import { CollectionRoutes } from "./collections/routes";
import { ArtistRoutes } from "./artists/routes";
import { SearchRoutes } from "./searches/routes";
import { PaymentRoutes } from "./payments/routes";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    msg: "Server is healthy",
    last_checked: new Date().toISOString(),
  });
});

router.use("/v1/auth", IPRateLimiter, AuthRoutes);

router.use("/v1/user", userMiddleware, UserRoutes);

router.use("/v1/song", SongRoutes);

router.use("/v1/collection", userMiddleware, CollectionRoutes);

router.use("/v1/artist", ArtistRoutes);

router.use("/v1/search", userMiddleware, SearchRoutes);

router.use("/v1/order", IPRateLimiter, PaymentRoutes);

export { router as apiRoutes };
