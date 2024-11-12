import { User } from "@/models/interfaces";
import { supabase } from "@/services/supabase";
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

    if (error) {
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
