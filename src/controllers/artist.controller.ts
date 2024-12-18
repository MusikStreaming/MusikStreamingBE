import env from "@/env";
import { cloudinary } from "@/services/cloudinary";
import redis from "@/services/redis";
import { supabase } from "@/services/supabase";
import { sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

/**
 *  Get all artists with pagination
 *  @param req Request
 *  @param res Response
 *  @returns Promise<void>
 *  @example GET /api/artists?page=1&limit=10
 */
const getAllArtists: RequestHandler = async (req: Request, res: Response) => {
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
  const isManaged: boolean = sanitize(req.query.managed, {
    type: "boolean",
    defaultValue: false,
  });
  const managed = isManaged && req.user.role === "Artist Manager";

  let key = `artists?page=${page}&limit=${limit}`;

  if (managed && req.user.id) {
    key = `artists?page=${page}&limit=${limit}&manager_id=${req.user.id}`;
  }

  const cache = await redis.get(key);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  console.log("Fetch data from database");

  // Query builder
  let builder = supabase
    .from("artists")
    .select("id, name, avatarurl", { count: "estimated" });
  if (managed) {
    builder = builder.eq("managerid", req.user.id);
  }

  const { data, error, count } = await builder.range(
    (page - 1) * limit,
    page * limit - 1,
  );

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(key, JSON.stringify({ count, data }), {
    ex: 300,
  });
  res.status(200).json({ count, data });
};

/**
 *  Get artist by ID
 *  @param req Request
 *  @param res Response
 *  @returns Promise<void>
 *  @example GET /api/artists/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const getArtistByID: RequestHandler = async (req: Request, res: Response) => {
  const key = `artists?id=${req.params.id}`;
  const cache = await redis.get(key);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  const { data, error } = await supabase
    .from("artists")
    .select()
    .eq("id", req.params.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(key, JSON.stringify(data), { ex: 300 });
  res.status(200).json({ data });
};

/**
 *  Get artist songs by ID
 *  @param req Request
 *  @param res Response
 *  @returns Promise<void>
 *  @example GET /api/artists/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca/songs
 */
const getArtistSongsByID: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const key = `artists?id=${req.params.id}&show_songs=true`;
  const cache = await redis.get(key);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  const { data, count, error } = await supabase
    .from("artistssongs")
    .select("song: songs(id, title, thumbnailurl)", { count: "estimated" })
    .eq("artistid", req.params.id)
    .limit(10);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(key, JSON.stringify({ count, data }), { ex: 300 });
  res.status(200).json({ count, data });
};

const getArtistAlbumsByID: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const key = `artists?id=${req.params.id}&show_albums=true`;
  const cache = await redis.get(key);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  const { data, count, error } = await supabase
    .from("artist_playlist")
    .select("id, title, thumbnailurl, created_at, type", { count: "estimated" })
    .eq("artist_id", req.params.id)
    .limit(10);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(key, JSON.stringify({ count, data }), { ex: 300 });
  res.status(200).json({ count, data });
};

/**
 * Update artists by ID
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example PUT /api/artists/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const updateArtist: RequestHandler = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, description, country } = req.body;
  let { avatarurl } = req.body;

  if (req.file) {
    cloudinary.upload(req.file, "artists", id);
    avatarurl = `${env.CLOUDINARY_PREFIX}/artists/i-${id}.jpg`;
  }

  const response = {
    name,
    ...(description && { description }),
    ...(avatarurl && { avatarurl }),
    ...(country && { country }),
  };

  const { data, error } = await supabase
    .from("artists")
    .update(response)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.del(`artists?id=${id}`);
  res.status(200).json({ data });
};

/**
 * Add artist
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/artists
 */
const addArtist: RequestHandler = async (req: Request, res: Response) => {
  const { name, description, avatarurl, country } = req.body;

  if (!name) {
    res.status(400).json({ error: "Payload must have field: name" });
    return;
  }

  const response = {
    name,
    ...(description && { description }),
    ...(avatarurl && { avatarurl }),
    ...(country && { country }),
  };

  const { data, error } = await supabase
    .from("artists")
    .insert(response)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "artists", data.id);
  }

  redis.del("artists", { exclude: "artists?id=" });
  res.status(200).json({ data });
};

/**
 * Delete artist by ID
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example DELETE /api/artists/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const deleteArtist: RequestHandler = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { error } = await supabase.from("artists").delete().eq("id", id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  cloudinary.delete("artists", `i-${id}`);

  redis.del("artists");
  res.status(204).send();
};

const ArtistController = {
  getAllArtists,
  getArtistByID,
  getArtistSongsByID,
  getArtistAlbumsByID,
  addArtist,
  updateArtist,
  deleteArtist,
};

export { ArtistController };
