import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const searchDefault: RequestHandler = async (req: Request, res: Response) => {
  const term = req.params.term;

  try {
    const [
      { data: songs, error: songError },
      { data: artists, error: artistError },
      { data: albums, error: albumError },
      { data: playlists, error: playlistError },
      { data: users, error: userError },
    ] = await Promise.all([
      supabase
        .from("songs")
        .select("id, title, thumbnailurl, duration")
        .textSearch("title", term)
        .range(0, 19),
      supabase
        .from("artists")
        .select("id, name, avatarurl")
        .textSearch("name", term)
        .range(0, 29),
      supabase
        .from("playlists")
        .select("id, title, thumbnailurl, user: profiles (username)")
        .in("type", ["Album", "EP", "Single"])
        .textSearch("title", term)
        .range(0, 29),
      supabase
        .from("playlists")
        .select("id, title, thumbnailurl, user: profiles (username)")
        .eq("type", "Playlist")
        .textSearch("title", term)
        .range(0, 29),
      supabase
        .from("profiles")
        .select("id, username, avatarurl")
        .textSearch("username", term)
        .range(0, 29),
    ]);

    const errors = [
      songError,
      artistError,
      albumError,
      playlistError,
      userError,
    ].filter(Boolean);

    if (errors.length) {
      res.status(500).json({ error: errors.map((e) => e?.message) });
      return;
    }

    res
      .status(200)
      .json({ data: { songs, artists, albums, playlists, users } });
    return;
  } catch (error) {
    res.status(500).json({ error: error });
    return;
  }
};

const searchSongs: RequestHandler = async (req: Request, res: Response) => {
  const term = req.params.term;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const { data, error } = await supabase
    .from("songs")
    .select("id, title, thumbnailurl, duration")
    .textSearch("title", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

const searchArtists: RequestHandler = async (req: Request, res: Response) => {
  const term = req.params.term;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const { data, error } = await supabase
    .from("artists")
    .select("id, name, avatarurl")
    .textSearch("name", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

const searchUsers: RequestHandler = async (req: Request, res: Response) => {
  const term = req.params.term;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatarurl")
    .textSearch("username", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

const searchPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const term = req.params.term;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const { data, error } = await supabase
    .from("playlists")
    .select("id, title, thumbnailurl, user: profiles (username)")
    .eq("type", "Playlist")
    .textSearch("title", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

const searchAlbums: RequestHandler = async (req: Request, res: Response) => {
  const term = req.params.term;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const { data, error } = await supabase
    .from("playlists")
    .select("id, title, thumbnailurl, user: profiles (username)")
    .eq("type", `"Album" | "EP" | "Single"`)
    .textSearch("title", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

export default {
  searchDefault,
  searchSongs,
  searchUsers,
  searchAlbums,
  searchPlaylists,
  searchArtists,
};
