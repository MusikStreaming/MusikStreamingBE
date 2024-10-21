import { Request, Response } from "express";
import supabase from "services/supabase";
import { Tables } from "models/types";

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

const signUp = async (req: Request, res: Response): Promise<Response> => {
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

const signIn = async (req: Request, res: Response): Promise<Response> => {
  const { email, phone, password } = req.body;

  try {
    let data, error;

    if (email && !phone) {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      }));
    } else if (phone && !email) {
      ({ data, error } = await supabase.auth.signInWithPassword({
        phone: phone,
        password: password,
      }));
    } else {
      return res.status(400).json({ error: "Email or phone is required" });
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

const getUserByID = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "No ID specified" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatarurl, role")
    .eq("id", id)
    .returns<Tables<"profiles">>();

  if (error) {
    return res.status(500).json({ error });
  }
  return res.status(200).json({ data });
};

export { getAllUsers, getUserByID, signUp, signInWithGoogle, signIn };
