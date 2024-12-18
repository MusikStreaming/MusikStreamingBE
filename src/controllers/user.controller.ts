import env from "@/env";
import { Request, RequestHandler, Response } from "express";
import { supabase } from "@/services/supabase";
import { cloudinary } from "@/services/cloudinary";
import redis from "@/services/redis";
import { sanitize } from "@/utils";

/**
 * Get all users with pagination
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/user?page=1&limit=10
 */
const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 10,
    min: 10,
    max: 50,
  });
  const key = `users?page=${page}&limit=${limit}`;

  const role = req.user.role;

  if (role !== "Admin") {
    const cache = await redis.get(key);
    if (cache) {
      console.log("Fetch data from cache");
      res.status(200).json(cache);
      return;
    }
  }

  const { data, count, error } = await supabase
    .from("profiles")
    .select("id, username, role, avatarurl", { count: "estimated" })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, JSON.stringify({ count, data }), {
      ex: 300,
    });
  }
  res.status(200).json({ count, data });
};

/**
 * Get user by ID
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/user/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const getUserByID: RequestHandler = async (req: Request, res: Response) => {
  const key = `users?id=${req.params.id}`;
  const role = req.user.role;

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

/**
 * Get user profile
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/user/me
 */
const getProfile: RequestHandler = async (req: Request, res: Response) => {
  const id = req.user!.id;

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select()
    .eq("id", id)
    .single();

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ data });
};

/**
 * Update user profile
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/user/me
 */
const updateProfile: RequestHandler = async (req: Request, res: Response) => {
  const id = req.user!.id;

  const { username, country, role } = req.body;
  let { avatarurl } = req.body;

  if (!username && !country) {
    res.status(400).json({ error: "Payload must have at least one field" });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "users", id);
    avatarurl = `${env.CLOUDINARY_PREFIX}/users/i-${id}.jpg`;
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
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  redis.del(`users?id=${id}`);
  res.status(200).json({ data });
};

/**
 * Get user playlists
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/user/me/playlists
 */
const getPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const id = req.user!.id;

  const { data, error: playlistError } = await supabase
    .from("playlists")
    .select("id, title, description, thumbnailurl, type")
    .eq("userid", id);

  if (playlistError) {
    res.status(500).json({ error: playlistError.message });
    return;
  }

  res.status(200).json({ data });
};

/**
 * Get user listen history
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/user/me/history
 */
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
    )
    .order("last_listened", { ascending: false })
    .limit(20);

  if (historyError) {
    res.status(500).json({ error: historyError.message });
    return;
  }

  res.status(200).json({ data });
};

/**
 * Upsert user listen history
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/user/me/history/:songid
 */
const upsertListenHistory: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const songid = req.params.songid;
  const userid = req.user!.id;

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

  res.status(204).send();
};

/**
 * Get user followed artists
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/user/me/following
 */
const getFollowedArtists: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.user!.id;

  const { data, error: followError } = await supabase
    .from("follows")
    .select("artist: artists(id, name, avatarurl)")
    .eq("userid", id);

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(200).json({ data });
};

/**
 * Follow artist
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/user/me/following/:artistid
 */
const followArtist: RequestHandler = async (req: Request, res: Response) => {
  const artistid = req.params.artistid;
  const userid = req.user!.id;

  const { error: followError } = await supabase
    .from("follows")
    .insert({ userid, artistid });

  if (followError) {
    res.status(500).json({ error: followError.message });
    return;
  }

  res.status(204).send();
};

/**
 * Unfollow artist
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example DELETE /api/user/me/following/:artistid
 */
const unfollowArtist: RequestHandler = async (req: Request, res: Response) => {
  const artistid = req.params.artistid;
  const userid = req.user!.id;

  const { error: unfollowError } = await supabase
    .from("follows")
    .delete()
    .match({ artistid, userid });

  if (unfollowError) {
    res.status(500).json({ error: unfollowError.message });
    return;
  }

  res.status(204).send();
};

const UserController = {
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

export { UserController };
