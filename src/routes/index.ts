import { IPRateLimiter } from "@/middlewares/rate-limit.config";
import { Router } from "express";
import { userMiddleware } from "@/middlewares/user.config";
import { AuthRoutes } from "./auth.routes";
import { UserRoutes } from "./user.routes";
import { SongRoutes } from "./song.routes";
import { CollectionRoutes } from "./collection.routes";
import { ArtistRoutes } from "./artist.routes";
import { SearchRoutes } from "./search.routes";
import { PaymentRoutes } from "./payment.routes";

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

export { router as ApiRoutes };
