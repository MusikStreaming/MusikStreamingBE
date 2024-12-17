import { User } from "@/types/interfaces";
import { supabase } from "@/services/supabase";
import { parseJWTPayload, sanitize } from "@/utils";
import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Extracts the user information and validate from JWT authentication
 *
 * This middleware extracts info from JWT payload, then validate if the user exist and have the correct role.
 *
 * If the cannot be found in database (anonymous or error), the role will be defaulted to "Anonymous"
 */
export const userMiddleware: RequestHandler = async (
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
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", payload.sub)
      .single();

    if (error || !data) {
      req.user = user;
      return next();
    }

    user = {
      id: payload.sub,
      role: data.role || "Anonymous",
    };
  }

  // Always assign user to the request
  req.user = user;
  next();
};
