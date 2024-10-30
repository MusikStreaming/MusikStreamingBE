import { Request, RequestHandler, Response } from "express";
import supabase from "@/services/supabase";
import { Tables } from "@/models/types";
import { cloudinary } from "@/services/cloudinary";

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const getUserByID: RequestHandler = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "User does not exist" });
    } else {
      res.status(500).json({ error: error.message });
      return;
    }
  }

  res.status(200).json({ data });
  return;
};

const getProfile: RequestHandler = async (req: Request, res: Response) => {
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
    .single();

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ data });
};

const updateProfile: RequestHandler = async (req: Request, res: Response) => {
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

  const { error: updateError } = await supabase.auth.updateUser({
    data: response,
  });

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
    .eq("id", user!.id);

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.status(200).json({ message: "User's avatar updated successfully" });
  return;
};

const getPlaylists: RequestHandler = async (req: Request, res: Response) => {
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

const getListenHistory: RequestHandler = async (
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
    songs (
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

const upsertListenHistory: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { songid } = req.body;
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
    .upsert(
      [
        {
          userid: user!.id,
          songid: songid,
        },
      ],
      { onConflict: "userid, songid" },
    );

  if (historyError) {
    res.status(500).json({ error: historyError.message });
    return;
  }
};

const getFollowedArtists: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError });
    return;
  }

  const { data, error: followError } = await supabase
    .from("follows")
    .select("artist: artists(id, name, avatarurl)")
    .eq("userid", user!.id);

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const followArtist: RequestHandler = async (req: Request, res: Response) => {
  const { artistid } = req.body;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError.message });
    return;
  }

  const { error: followError } = await supabase
    .from("follows")
    .insert({ userid: user!.id, artistid });

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(200).json({ message: `Followed artist ${artistid}` });
  return;
};

const unfollowArtist: RequestHandler = async (req: Request, res: Response) => {
  const { artistid } = req.body;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    res.status(userError.status ?? 401).json({ error: userError.message });
    return;
  }

  const { error: unfollowError } = await supabase
    .from("follows")
    .delete()
    .eq("userid", user!.id)
    .eq("artistid", artistid);

  if (unfollowError) {
    res.status(500).json({ error: unfollowError.message });
    return;
  }

  res.status(200).json({ message: `Unfollowed artist ${artistid}` });
  return;
};

export default {
  getAllUsers,
  getUserByID,
  getProfile,
  updateProfile,
  uploadAvatar,
  getPlaylists,
  getListenHistory,
  upsertListenHistory,
  getFollowedArtists,
  followArtist,
  unfollowArtist,
};
