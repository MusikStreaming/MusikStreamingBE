import rateLimit from "express-rate-limit";

const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.params.id,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
      retryAfter: 900,
    });
  },
});

const googleSignInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

export { uploadRateLimiter, googleSignInLimiter };
