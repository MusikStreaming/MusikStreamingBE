import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const getAllPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("playlists")
    .select(
      "id,title, description, type, thumbnailurl, owner: profiles (id, username, avatarurl), songs: playlistssongs (songid)",
    )
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
    .select(
      "id,title, description, type, thumbnailurl, owner: profiles (id, username, avatarurl), songs: playlistssongs (songid)",
    )
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

  const { data, status, error } = await supabase
    .from("playlists")
    .select(
      "id,title, description, thumbnailurl, userid, playlistssongs (songid)",
    )
    .eq("id", id)
    .single();

  if (error) {
    res.status(status).json({ error: error.message });
    return;
  }

  res.status(status).json({ data });
  return;
};

export default {
  getAllPlaylists,
  getAllAlbums,
  getCollectionByID,
};
