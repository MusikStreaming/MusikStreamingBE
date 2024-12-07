import "dotenv/config";
import env from "./env";
import express, { Request } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { apiRoutes } from "./api/routes";

const app = express();
const port = env.PORT || 7554;

// Compression
app.use(
  compression({
    level: 6,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Content-type
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(cors<Request>());
app.use(helmet());

// Logging
app.use(morgan(":method :url :status - :response-time ms"));

// End-points
app.use("/", apiRoutes);

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
