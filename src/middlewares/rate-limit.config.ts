import rateLimit from "express-rate-limit";

/**
 * Rate limits for upload operations.
 *
 * This middleware will rate limit a user if they satisfy the following conditions:
 * - window frame: 15 minutes
 * - max number of request: 30
 * - unique identifier: the id of the uploaded item
 *
 * Returns HTTP status 429 if too many requests.
 */
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

/**
 * Rate limits for general operations
 *
 * This middleware will rate limit a user by their ip (by reading Cloudflare headers).
 *
 * Returns HTTP status 429 if too many requests
 */
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
