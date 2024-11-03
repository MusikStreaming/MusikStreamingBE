import { Request, RequestHandler, Response } from "express";
import supabase from "@/services/supabase";
import { Tables } from "@/models/types";
import { cloudinary } from "@/services/cloudinary";
import utils from "@/utils";

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, role, avatarurl")
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
    .select()
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
  const [{ sub: userid, error }, status] = utils.parseJWTPayload(
    req.headers["authorization"],
  );

  if (error) {
    res.status(status).json({ error: error });
    return;
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select()
    .eq("id", userid)
    .single();

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ data });
};

const updateProfile: RequestHandler = async (req: Request, res: Response) => {
  const [{ sub: userid, error }, status] = utils.parseJWTPayload(
    req.headers["authorization"],
  );

  if (error) {
    res.status(status).json({ error: error });
    return;
  }

  const { username, country, avatarurl, role } = req.body;

  if (!username && !country) {
    res.status(400).json({ error: "Payload must have at least one field" });
    return;
  }

  const response = {
    ...(username && { username }),
    ...(country && { country }),
    ...(avatarurl && { avatarurl }),
    ...(role && { role }),
  };

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update(response)
    .eq("id", userid);

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "users", userid);
  }

  res.status(202).json({ message: "User profile updated" });
  return;
};

const getPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const [{ sub: userid, error }, status] = utils.parseJWTPayload(
    req.headers["authorization"],
  );

  if (error) {
    res.status(status).json({ error: error });
    return;
  }

  const { data, error: playlistError } = await supabase
    .from("playlists")
    .select("id, title, description, thumbnailurl, type")
    .eq("userid", userid);

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
      artists: artistssongs (
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
  const songid = req.params.songid;
  const [{ sub: userid, error }, status] = utils.parseJWTPayload(
    req.headers["authorization"],
  );

  if (error) {
    res.status(status).json({ error: error });
    return;
  }

  const { error: historyError } = await supabase.from("listenhistory").upsert(
    [
      {
        userid,
        songid,
      },
    ],
    { onConflict: "userid, songid" },
  );

  if (historyError) {
    res.status(500).json({ error: historyError.message });
    return;
  }

  res.status(200).json({});
};

const getFollowedArtists: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const [{ sub: id, error }, status] = utils.parseJWTPayload(
    req.headers["authorization"],
  );

  if (error) {
    res.status(status).json({ error: error });
    return;
  }

  const { data, error: followError } = await supabase
    .from("follows")
    .select("artist: artists(id, name, avatarurl)")
    .eq("userid", id);

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const followArtist: RequestHandler = async (req: Request, res: Response) => {
  const artistid = req.params.artistid;
  const [{ sub: userid, error }, status] = utils.parseJWTPayload(
    req.headers["authorization"],
  );

  if (error) {
    res.status(status).json({ error: error });
    return;
  }

  const { error: followError } = await supabase
    .from("follows")
    .insert({ userid, artistid });

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(200).json({ message: `Followed artist ${artistid}` });
  return;
};

const unfollowArtist: RequestHandler = async (req: Request, res: Response) => {
  const artistid = req.params.artistid;
  const [{ sub: userid, error }, status] = utils.parseJWTPayload(
    req.headers["authorization"],
  );

  if (error) {
    res.status(status).json({ error: error });
    return;
  }

  const { error: unfollowError } = await supabase
    .from("follows")
    .delete()
    .match({ artistid, userid });

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
  getPlaylists,
  getListenHistory,
  upsertListenHistory,
  getFollowedArtists,
  followArtist,
  unfollowArtist,
};
