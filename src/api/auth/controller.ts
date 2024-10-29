import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const signUpWithEmail: RequestHandler = async (req: Request, res: Response) => {
  const { email, password, metadata } = req.body;

  try {
    let data, error;

    if (email) {
      ({ data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        ...(metadata && { options: { data: metadata } }),
      }));
    } else {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ data });
    return;
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later" });
    return;
  }
};

const signInWithEmail: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    let data, error;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    ({ data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    }));

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ data });
    return;
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later" });
    return;
  }
};

const signInWithGoogle: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: `localhost:7554/api/v1/auth/callback`,
    },
  });
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  return res.redirect(data.url);
};

const updateUserCredentials: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { email, password } = req.body;
  let response: object;

  response = {
    ...(email && { email }),
    ...(password && { password }),
  };

  const { data, error } = await supabase.auth.updateUser(response);

  if (error) {
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: "User updated successfully" });
  return;
};

const signOut: RequestHandler = async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: "User signed out successfully" });
};

export default {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  updateUserCredentials,
  signOut,
};