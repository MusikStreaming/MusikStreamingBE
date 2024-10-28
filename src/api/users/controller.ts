import { Request, RequestHandler, Response } from "express";
import supabase from "@/services/supabase";
import { Tables } from "@/models/types";
import { cloudinary } from "@/services/cloudinary";
import axios from "axios";

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

const updateUserProfile: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
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

  const { error } = await supabase
    .from("profiles")
    .update(response)
    .eq("id", id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: "User profile updated" });
  return;
};

const getUserPlaylists: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const limit = Number(req.query.limit) || 5;

  const { data, error } = await supabase
    .from("playlists")
    .select("id, title, thumbnailurl")
    .eq("userid", id)
    .limit(limit);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const uploadAvatar: RequestHandler = async (req: Request, res: Response) => {
  let url;
  const id = req.params.id;

  try {
    url = await cloudinary.upload(req, "users");
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatarurl: url })
    .eq("id", id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: "User's avatar updated successfully" });
  return;
};

export default {
  getUserByID,
  getUserProfile,
  updateUserProfile,
  getUserPlaylists,
  uploadAvatar,
};
