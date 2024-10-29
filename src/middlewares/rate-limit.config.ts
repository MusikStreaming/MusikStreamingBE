import rateLimit from "express-rate-limit";

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    const header = req.headers["authorization"];
    if (!header) {
      throw new Error("Authorization required");
    }

    const payload = header.split(".")[1];
    if (!payload) {
      throw new Error("Invalid token format");
    }

    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    try {
      const { sub } = JSON.parse(decoded);
      if (!sub) {
        throw new Error("Token does not contain 'sub' field");
      }
      return sub;
    } catch (error) {
      console.error("Error parsing token:", error);
      throw new Error("Invalid token");
    }
  },
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
      retryAfter: 900,
    });
  },
});

export { uploadRateLimit as ratelimit };
