import { parseJWTPayload, sanitize } from "@/utils";
import { NextFunction, Request, RequestHandler, Response } from "express";

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const [payload, status] = parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  if (!payload.sub) {
    res.status(401).json({ error: "Invalid payload, missing important field" });
  }

  const sanitizedRole = sanitize(payload.user_metadata.role, {
    type: "string",
    defaultValue: "Anonymous",
    allowedValues: ["Admin", "User", "Artist Manager"],
  });

  req.user = {
    id: payload.sub,
    role: sanitizedRole,
  };

  next();
};
