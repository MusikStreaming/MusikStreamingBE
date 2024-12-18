import env from "@/env";
import { cloudinary } from "@/services/cloudinary";
import redis from "@/services/redis";
import { supabase } from "@/services/supabase";
import { sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

/**
 * Get all collections with pagination
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/collection?page=1&limit=10
 */
const getAllCollections: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 10,
    min: 2,
    max: 50,
  });
  const key = `collections?page=${page}&limit=${limit}`;

  const role = req.user.role;

  if (role !== "Admin") {
    const cache = await redis.get(key);
    if (cache) {
      console.log("Fetch data from cache");
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error, count } = await supabase
    .from("playlists")
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)", {
      count: "estimated",
    })
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
 * Get all playlists with pagination
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/collection/playlists?page=1&limit=10
 */
const getAllPlaylists: RequestHandler = async (req: Request, res: Response) => {
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
  const key = `playlists?page=${page}&limit=${limit}`;

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
    .from("playlists")
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)", {
      count: "estimated",
    })
    .eq("type", "Playlist")
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
 * Get all albums with pagination
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/collection/albums?page=1&limit=10
 */
const getAllAlbums: RequestHandler = async (req: Request, res: Response) => {
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

  const key = `albums?page=${page}&limit=${limit}`;

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
    .from("playlists")
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)", {
      count: "estimated",
    })
    .in("type", ["Album", "EP", "Single"])
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
 * Get collection by ID
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/collection/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const getCollectionByID: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const key = `collections?id=${id}`;

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
    .from("playlists")
    .select(
      "id, title, description, type, thumbnailurl, owner: profiles(id, username, avatarurl), songs: playlistssongs (song: songs (id, title, thumbnailurl, duration, artists(id, name)))",
    )
    .eq("id", id)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, JSON.stringify({ data }), {
      ex: 300,
    });
  }
  res.status(200).json({ data });
};

/**
 * Add collection
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/collection
 */
const addCollection: RequestHandler = async (req: Request, res: Response) => {
  const { title, description, thumbnailurl, type, visibility } = req.body;
  const response = {
    ...(title && { title }),
    ...(description && { description }),
    ...(thumbnailurl && { thumbnailurl }),
    ...(type && { type }),
    ...(visibility && { visibility }),
  };

  const { data, error } = await supabase
    .from("playlists")
    .insert(response)
    .select(
      "id, title, description, type, thumbnailurl, owner: profiles (id, username, avatarurl), songs: playlistssongs (songid)",
    )
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "collections", data.id);
  }

  res.status(200).json({ data });
};

/**
 * Update collection
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/collection/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const updateCollection: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const { title, description, type, visibility } = req.body;
  let { thumbnailurl } = req.body;

  if (req.file) {
    cloudinary.upload(req.file, "collections", id);
    thumbnailurl = `${env.CLOUDINARY_PREFIX}/collections/i-${id}.jpg`;
  }

  const response = {
    ...(title && { title }),
    ...(description && { description }),
    ...(thumbnailurl && { thumbnailurl }),
    ...(type && { type }),
    ...(visibility && { visibility }),
  };

  const { data, error } = await supabase
    .from("playlists")
    .update(response)
    .eq("id", id)
    .select(
      "id, title, description, type, thumbnailurl, owner: profiles (id, username, avatarurl), songs: playlistssongs (songid)",
    )
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

/**
 * Delete collection
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example DELETE /api/collection/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const deleteCollection: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const { error } = await supabase.from("playlists").delete().eq("id", id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  cloudinary.delete("collections", `i-${id}`);

  res.status(200).json({ message: `Collection ${id} is being deleted` });
};

/**
 * Add song to collection
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/collection/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca/songs/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const addCollectionSong: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const songid = req.params.songid;

  const { error } = await supabase
    .from("playlistssongs")
    .insert({ songid, playlistid: id });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
};

/**
 * Delete song from collection
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example DELETE /api/collection/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca/songs/1b26c1ea-6d6d-43eb-8b3c-4faf828050ca
 */
const deleteCollectionSong: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const songid = req.params.songid;

  const { error } = await supabase
    .from("playlistssongs")
    .delete()
    .match({ songid, playlistid: id });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
};

const CollectionController = {
  getAllCollections,
  getAllPlaylists,
  getAllAlbums,
  getCollectionByID,
  addCollection,
  updateCollection,
  addCollectionSong,
  deleteCollection,
  deleteCollectionSong,
};

export { CollectionController };
