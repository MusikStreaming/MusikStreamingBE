import { cloudinary } from "@/services/cloudinary";
import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const signUpWithEmail: RequestHandler = async (req: Request, res: Response) => {
  const { email, password, avatarurl, country, username } = req.body;

  try {
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const metadata = {
      ...(avatarurl && { avatarurl }),
      ...(country && { country }),
      ...(username && { username }),
    };

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      ...(metadata && { options: { data: metadata } }),
    });

    if (error) {
      res.status(error.status ?? 500).json({ error: error.message });
      return;
    }

    if (req.file) {
      cloudinary.upload(req.file, "users", data.user!.id);
    }

    res.status(200).json({
      user: { id: data.user?.id, aud: data.user?.aud },
      session: {
        access_token: data.session?.access_token,
        expires_in: data.session?.expires_in,
        refresh_token: data.session?.refresh_token,
      },
    });
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
      res.status(error.status ?? 500).json({ error: error.message });
      return;
    }

    res.status(200).json({
      user: { id: data.user?.id, aud: data.user?.aud },
      session: {
        access_token: data.session?.access_token,
        expires_in: data.session?.expires_in,
        refresh_token: data.session?.refresh_token,
      },
    });
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
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  res.redirect(data.url);
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

  const { error } = await supabase.auth.updateUser(response);

  if (error) {
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  res.status(204).send();
};

const signOut: RequestHandler = async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  res.status(204).send();
};

export default {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  updateUserCredentials,
  signOut,
};
