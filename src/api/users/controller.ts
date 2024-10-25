import { Request, Response } from "express";
import supabase from "@/services/supabase";
import { Tables } from "@/models/types";

const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .returns<Tables<"profiles">>();

  if (error) {
    return res.status(500).json({ error });
  }
  return res.status(200).json({ data });
};

const signUpWithEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
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
      return res.status(400).json({ error: "Email is required" });
    }

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later" });
  }
};

const signInWithEmail = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { email, password } = req.body;

  try {
    let data, error;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    ({ data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    }));

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later" });
  }
};

const signInWithGoogle = async (req: Request, res: Response): Promise<any> => {
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
    return res.status(400).json({ error: error.message });
  }

  return res.redirect(data.url);
};

const getUserProfile = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let metadata;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
  return res.status(200).json({ metadata });
};

const updateUser = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, metadata } = req.body;
  let response: object;

  response = {
    ...(email && { email }),
    ...(password && { password }),
    ...(metadata && { data: metadata }),
  };

  const { data, error } = await supabase.auth.updateUser(response);

  if (error) {
    return res.status(error.status ?? 500).json({ error: error.message });
  }

  return res.status(200).json({ message: "User updated successfully" });
};

export default {
  getAllUsers,
  getUserProfile,
  signUpWithEmail,
  signInWithGoogle,
  signInWithEmail,
  updateUser,
};
