import { cloudinary } from "@/services/cloudinary";
import redis from "@/services/redis";
import supabase from "@/services/supabase";
import { enforceRole, sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

const getAllCollections: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 10,
    min: 10,
    max: 50,
  });
  const key = `collections?page=${page}&limit=${limit}`;

  const role = enforceRole(req.headers["authorization"]);

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
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)")
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

const getAllPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 10,
    min: 10,
    max: 50,
  });
  const key = `playlists?page=${page}&limit=${limit}`;

  const role = enforceRole(req.headers["authorization"]);

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
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)")
    .eq("type", "Playlist")
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

const getAllAlbums: RequestHandler = async (req: Request, res: Response) => {
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 10,
    min: 10,
    max: 50,
  });

  const key = `albums?page=${page}&limit=${limit}`;

  const role = enforceRole(req.headers["authorization"]);

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
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)")
    .in("type", ["Album", "EP", "Single"])
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

const getCollectionByID: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const key = `collections?id=${id}`;

  const role = enforceRole(req.headers["authorization"]);

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
      "id, title, description, type, thumbnailurl, profiles (id, username, avatarurl), songs: playlistssongs (song: songs (id, title))",
    )
    .eq("id", id)
    .single();

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

const updateCollection: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;
  const { title, description, type, visibility } = req.body;
  let { thumbnailurl } = req.body;

  if (req.file) {
    cloudinary.upload(req.file, "collections", id);
    thumbnailurl = `${process.env.CLOUDINARY_PREFIX}/collections/i-${id}.jpg`;
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

export default {
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
