import { User } from "@/models/interfaces";
import { parseJWTPayload, sanitize } from "@/utils";
import { NextFunction, Request, RequestHandler, Response } from "express";

export const userMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user: User = {
    id: "",
    role: "Anonymous",
  };

  if (!req.headers["authorization"]) {
    req.user = user;
    return next();
  }

  const [payload, status] = parseJWTPayload(req.headers["authorization"]);

  if (!("error" in payload) && status === 200 && payload.sub) {
    const role = sanitize(payload.user_metadata.role, {
      type: "string",
      defaultValue: "Anonymous",
      allowedValues: ["Admin", "User", "Artist Manager"],
    });

    user = {
      id: payload.sub,
      role,
    };
  }

  // Always assign user to the request
  req.user = user;
  next();
};
