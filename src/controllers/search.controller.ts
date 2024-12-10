import redis from "@/services/redis";
import { supabase } from "@/services/supabase";
import { sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

const searchDefault: RequestHandler = async (req: Request, res: Response) => {
  const term = decodeURIComponent(req.params.term);
  const key = `searches?term=${encodeURIComponent(term)}`;

  const role = req.user.role;

  if (role !== "Admin") {
    const cache = await redis.get(key);
    if (cache) {
      console.log("Fetch data from cache");
      res.status(200).json(cache);
      return;
    }
  }

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
        .select(
          "id, title, thumbnailurl, duration, artists: artistssongs(artist: artists(id, name))",
        )
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

    if (role !== "Admin") {
      redis.set(
        key,
        { data: { songs, artists, albums, playlists, users } },
        { ex: 300 },
      );
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
  const term = decodeURIComponent(req.params.term);
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 20,
    min: 10,
    max: 50,
  });
  const key = `searches?cat=songs&term=${encodeURIComponent(term)}&page=${page}&limit=${limit}`;

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
    .from("songs")
    .select(
      "id, title, thumbnailurl, duration, artists: artistssongs(artist: artists(id, name))",
    )
    .textSearch("title", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  res.status(200).json({ data });
  return;
};

const searchArtists: RequestHandler = async (req: Request, res: Response) => {
  const term = decodeURIComponent(req.params.term);
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 30,
    min: 10,
    max: 50,
  });

  const key = `searches?cat=artists&term=${encodeURIComponent(term)}&page=${page}&limit=${limit}`;

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
    .from("artists")
    .select("id, name, avatarurl")
    .textSearch("name", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  res.status(200).json({ data });
  return;
};

const searchUsers: RequestHandler = async (req: Request, res: Response) => {
  const term = decodeURIComponent(req.params.term);
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 30,
    min: 10,
    max: 50,
  });

  const key = `searches?cat=users&term=${encodeURIComponent(term)}&page=${page}&limit=${limit}`;

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
    .select("id, username, avatarurl")
    .textSearch("username", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  res.status(200).json({ data });
  return;
};

const searchPlaylists: RequestHandler = async (req: Request, res: Response) => {
  const term = decodeURIComponent(req.params.term);
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 30,
    min: 10,
    max: 50,
  });

  const key = `searches?cat=playlists&term=${encodeURIComponent(term)}&page=${page}&limit=${limit}`;

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
    .select("id, title, thumbnailurl, user: profiles (username)")
    .eq("type", "Playlist")
    .textSearch("title", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  res.status(200).json({ data });
  return;
};

const searchAlbums: RequestHandler = async (req: Request, res: Response) => {
  const term = decodeURIComponent(req.params.term);
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 30,
    min: 10,
    max: 50,
  });
  const key = `searches?cat=albums&term=${encodeURIComponent(term)}&page=${page}&limit=${limit}`;

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
    .select("id, title, thumbnailurl, user: profiles (username)")
    .in("type", ["Album", "EP", "Single"])
    .textSearch("title", term)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  res.status(200).json({ data });
};

const SearchController = {
  searchDefault,
  searchSongs,
  searchUsers,
  searchAlbums,
  searchPlaylists,
  searchArtists,
};

export { SearchController };
