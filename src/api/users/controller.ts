import { Request, RequestHandler, Response } from "express";
import supabase from "@/services/supabase";
import { Tables } from "@/models/types";
import { cloudinary } from "@/services/cloudinary";

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .returns<Tables<"profiles">>();

  if (error) {
    res.status(500).json({ error });
    return;
  }
  res.status(200).json({ data });
  return;
};

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

const signUpWithEmailForm: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { json } = req.body;
  const obj = JSON.parse(json);
  const { email, password, metadata } = obj;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    let { data, error } = await supabase.auth.signUp({
      email,
      password,
      ...(metadata && { options: { data: metadata } }),
    });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    const url = await cloudinary.upload(req, "users");
    await supabase
      .from("profiles")
      .update({ avatarurl: url })
      .eq("id", data.user!.id);

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

const getUserProfile: RequestHandler = async (req: Request, res: Response) => {
  let metadata;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }
  res.status(200).json({ metadata });
  return;
};

const updateUser: RequestHandler = async (req: Request, res: Response) => {
  const { email, password, metadata } = req.body;
  let response: object;

  response = {
    ...(email && { email }),
    ...(password && { password }),
    ...(metadata && { data: metadata }),
  };

  const { data, error } = await supabase.auth.updateUser(response);

  if (error) {
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: "User updated successfully" });
  return;
};

const getUserByID: RequestHandler = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.params.id)
    .returns<Tables<"profiles">>();

  if (error) {
    res.status(500).json({ error });
    return;
  }
  res.status(200).json({ data });
  return;
};

export default {
  getAllUsers,
  getUserProfile,
  signUpWithEmail,
  signUpWithEmailForm,
  signInWithGoogle,
  signInWithEmail,
  updateUser,
};
