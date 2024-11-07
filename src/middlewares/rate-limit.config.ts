import rateLimit from "express-rate-limit";

const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.params.id,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
      retryAfter: 900,
    });
  },
});

const IPRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    const ipAddress =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "Unknown IP";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";
    return `${ipAddress}::${userAgent}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
      retryAfter: 900,
    });
  },
});

export { uploadRateLimiter, IPRateLimiter };
