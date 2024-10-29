import { Request, RequestHandler, Response } from "express";
import supabase from "@/services/supabase";
import { Tables } from "@/models/types";
import { cloudinary } from "@/services/cloudinary";
import { error } from "console";

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, status, error } = await supabase
    .from("profiles")
    .select("*")
    .range((page - 1) * limit, page * limit - 1)
    .returns<Tables<"profiles">>();

  if (error) {
    res.status(status).json({ error: error.message });
    return;
  }

  res.status(status).json({ data });
  return;
};

const getUserByID: RequestHandler = async (req: Request, res: Response) => {
  const { data, status, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.params.id)
    .single<Tables<"profiles">>();

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "User does not exist" });
    } else {
      res.status(status).json({ error: error.message });
      return;
    }
  }

  res.status(200).json({ data });
  return;
};

const getUserProfile: RequestHandler = async (req: Request, res: Response) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError.message });
    return;
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select()
    .eq("id", user!.id)
    .returns<Tables<"profiles">>();

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ data });
};

const updateUserProfile: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError.message });
    return;
  }

  const { username, country, avatarurl } = req.body;

  if (!username && !country && !avatarurl) {
    res.status(400).json({ error: "Payload must have at least one field" });
    return;
  }

  const response = {
    ...(username && { username }),
    ...(country && { country }),
    ...(avatarurl && { avatarurl }),
  };

  const { error: updateError } = await supabase
    .from("profiles")
    .update(response)
    .eq("id", user!.id)
    .returns<Tables<"profiles">>();

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.status(200).json({ message: "User profile updated" });
  return;
};

const uploadAvatar: RequestHandler = async (req: Request, res: Response) => {
  let url;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError.message });
    return;
  }

  try {
    url = await cloudinary.upload(req, "users");
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatarurl: url })
    .eq("id", user!.id)
    .returns<Tables<"profiles">>();

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.status(200).json({ message: "User's avatar updated successfully" });
  return;
};

const getUserPlaylists: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError.message });
    return;
  }

  const { data, error: playlistError } = await supabase
    .from("playlists")
    .select("id, title, description, thumbnailurl, type")
    .eq("userid", user!.id);

  if (playlistError) {
    res.status(500).json({ error: playlistError.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const getUserListenHistory: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError.message });
    return;
  }

  const { data, error: historyError } = await supabase
    .from("listenhistory")
    .select(
      `
    last_listened,
    song: songs (
      id,
      title,
      duration,
      thumbnailurl,
      artistssongs (
        artist: artists (id, name)
      )
    )
  `,
    );

  if (historyError) {
    res.status(500).json({ error: historyError.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

export default {
  getAllUsers,
  getUserByID,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserPlaylists,
  getUserListenHistory,
};
