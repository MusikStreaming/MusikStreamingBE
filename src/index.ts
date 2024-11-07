import express, { Request } from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { authRoutes } from "@/api/auth/routes";
import { userRoutes } from "@/api/users/routes";
import { songRoutes } from "@/api/songs/routes";
import { collectionRoutes } from "@/api/collections/routes";
import { artistRoutes } from "@/api/artists/routes";
import { searchRoutes } from "@/api/search/routes";
import { IPRateLimiter } from "@/middlewares/rate-limit.config";
import { paymentRoutes } from "@/api/payments/routes";

const app = express();
const port = process.env.PORT || 7554;

// Content-type
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(cors<Request>());
app.use(helmet());

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// End-points
app.get("/", (req, res) => {
  res.status(200).json({
    msg: "Server is healthy",
    last_checked: new Date().toISOString(),
  });
});

app.use("/v1/auth", IPRateLimiter, authRoutes);
app.use("/v1/user", userRoutes);
app.use("/v1/song", songRoutes);
app.use("/v1/collection", collectionRoutes);
app.use("/v1/artist", artistRoutes);
app.use("/v1/search", searchRoutes);
app.use("/v1/order", IPRateLimiter, paymentRoutes);

// Server start
app.listen(port, () => {
  console.log(`
    \x1b[35m\n 🚀 Musik-Backend 1.0.0\n\x1b[0m
    - Local:\thttp://localhost:${port}/
    
    Note that the development build is not optimized.
    To create a production build, use \x1b[32mnpm run build\x1b[0m.\n
  `);
  return;
});
