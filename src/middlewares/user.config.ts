import { User } from "@/models/interfaces";
import { parseJWTPayload, sanitize } from "@/utils";
import { NextFunction, Request, RequestHandler, Response } from "express";

export const userMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user: User = {
    id: "",
    role: "Anonymous",
  };

  const [payload, status] = parseJWTPayload(req.headers["authorization"]);

  if (!("error" in payload) && status === 200 && payload.sub) {
    const role = sanitize(payload.user_metadata.role, {
      type: "string",
      defaultValue: "Anonymous",
      allowedValues: ["Admin", "User", "Artist Manager", "Anonymous"],
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
