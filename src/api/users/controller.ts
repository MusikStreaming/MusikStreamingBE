import { Request, RequestHandler, Response } from "express";
import supabase from "@/services/supabase";
import { cloudinary } from "@/services/cloudinary";
import utils from "@/utils";
import redis from "@/services/redis";

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const key = `users?page=${page}&limit=${limit}`;

  const role = utils.enforceRole(req.headers["authorization"]);

  if (role !== "Admin") {
    const cache = await redis.get(key);
    if (cache) {
      console.log("Fetch data from cache");
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, role, avatarurl")
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, {
      ex: 300,
    });
  }
  res.status(200).json({ data });
};

const getUserByID: RequestHandler = async (req: Request, res: Response) => {
  const key = `users?id=${req.params.id}`;
  const role = utils.enforceRole(req.headers["authorization"]);

  if (role !== "Admin") {
    const cache = await redis.get(key);
    if (cache) {
      console.log("Fetch data from cache");
      res.status(200).json(cache);
      return;
    }
  }

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

  if (role !== "Admin") {
    redis.set(key, data, {
      ex: 300,
    });
  }
  res.status(200).json({ data });
};

const getProfile: RequestHandler = async (req: Request, res: Response) => {
  const [payload, status] = utils.parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select()
    .eq("id", payload.sub)
    .single();

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ data });
};

const updateProfile: RequestHandler = async (req: Request, res: Response) => {
  const [payload, status] = utils.parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  const { username, country, role } = req.body;
  let { avatarurl } = req.body;

  if (!username && !country) {
    res.status(400).json({ error: "Payload must have at least one field" });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "users", payload.sub);
    avatarurl = `${process.env.CLOUDINARY_PREFIX}/users/i-${payload.sub}.jpg`;
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
    .eq("id", payload.sub)
    .select()
    .single();

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.status(200).json({ data });
};

const getPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const [payload, status] = utils.parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  const { data, error: playlistError } = await supabase
    .from("playlists")
    .select("id, title, description, thumbnailurl, type")
    .eq("userid", payload.sub);

  if (playlistError) {
    res.status(500).json({ error: playlistError.message });
    return;
  }

  res.status(200).json({ data });
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
};

const upsertListenHistory: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const songid = req.params.songid;
  const [payload, status] = utils.parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  const { error: historyError } = await supabase.from("listenhistory").upsert(
    [
      {
        userid: payload.sub,
        songid,
      },
    ],
    { onConflict: "userid, songid" },
  );

  if (historyError) {
    res.status(500).json({ error: historyError.message });
    return;
  }

  res.status(204);
};

const getFollowedArtists: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const [payload, status] = utils.parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  const { data, error: followError } = await supabase
    .from("follows")
    .select("artist: artists(id, name, avatarurl)")
    .eq("userid", payload.sub);

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(200).json({ data });
};

const followArtist: RequestHandler = async (req: Request, res: Response) => {
  const artistid = req.params.artistid;
  const [payload, status] = utils.parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  const { error: followError } = await supabase
    .from("follows")
    .insert({ userid: payload.sub, artistid });

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(204);
};

const unfollowArtist: RequestHandler = async (req: Request, res: Response) => {
  const artistid = req.params.artistid;
  const [payload, status] = utils.parseJWTPayload(req.headers["authorization"]);

  if ("error" in payload) {
    res.status(status).json({ error: payload.error });
    return;
  }

  const { error: unfollowError } = await supabase
    .from("follows")
    .delete()
    .match({ artistid, userid: payload.sub });

  if (unfollowError) {
    res.status(500).json({ error: unfollowError.message });
    return;
  }

  res.status(204);
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
