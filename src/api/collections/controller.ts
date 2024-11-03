import { cloudinary } from "@/services/cloudinary";
import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const getAllCollections: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("playlists")
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)")
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const getAllPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("playlists")
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)")
    .eq("type", "Playlist")
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const getAllAlbums: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("playlists")
    .select("id,title, type, thumbnailurl, owner: profiles (id, username)")
    .in("type", ["Album", "EP", "Single"])
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const getCollectionByID: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from("playlists")
    .select(
      "id, title, description, type, thumbnailurl, owner: profiles (id, username, avatarurl), songs: playlistssongs (songid)",
    )
    .eq("id", id)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
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

  if (req.file) {
    cloudinary.upload(req.file, "collections", data.id);
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

  res.status(200).json({
    message: `Song ${songid} is added to Collection ${id}`,
  });
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

  res.status(200).json({
    message: `Song ${songid} is removed from Collection ${id}`,
  });
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
