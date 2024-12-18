import redis from "@/services/redis";
import { supabase } from "@/services/supabase";
import { sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

/**
 * Search default
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/search/:term
 */
const searchDefault: RequestHandler = async (req: Request, res: Response) => {
  const term = decodeURIComponent(req.params.term);
  const key = `searches?term=${encodeURIComponent(term)}`;

  const role = req.user.role;

  if (role !== "Admin") {
    const cache: { data: { songs: any, artists: any, albums: any, playlists: any, users: any } } | null = await redis.get(key);
    if (cache) {
      console.log("Fetch data from cache");
      if (cache.data.songs.songs !== null) {
        cache.data.songs.songs.forEach((item: any) => delete item.distance);
      }
      else {
        cache.data.songs.songs = [];
      }
      if (cache.data.artists.artists !== null) {
        cache.data.artists.artists.forEach((item: any) => delete item.distance);
      }
      else {
        cache.data.artists.artists = [];
      }
      if (cache.data.albums !== null) {
        cache.data.albums.albums.forEach((item: any) => delete item.similarity_score);
      }
      else {
        cache.data.albums.albums = [];
      }
      if (cache.data.playlists.playlists !== null) {
        cache.data.playlists.playlists.forEach((item: any) => delete item.similarity_score);
      }
      else {
        cache.data.playlists.playlists = [];
      }
      if (cache.data.users.users !== null) {
        cache.data.users.users.forEach((item: any) => delete item.similarity_score);
      }
      else {
        cache.data.users.users = [];
      }
      res.status(200).json({ data: { songs: cache.data.songs.songs, artists: cache.data.artists.artists, albums: cache.data.albums.albums, playlists: cache.data.playlists.playlists, users: cache.data.users.users } });
      return;
    }
  }

  try {
    console.log("task 1");
    const [
      { data: songs, error: songError },
      { data: artists, error: artistError },
      { data: albums, error: albumError },
      { data: playlists, error: playlistError },
      { data: users, error: userError },
    ] = await Promise.all([
      supabase.rpc("search_songs", { term: term }),
      supabase.rpc("search_artists", { term: term }),
      supabase.rpc("search_albums", { term: term }),
      supabase.rpc("search_playlists", { term: term }),
      supabase.rpc("search_users", { term: term }),
    ]);
    console.log("task 2");
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
    console.log("task 3");
    if (songs?.songs) {
      songs.songs.forEach((item: any) => delete item.distance);
    } else {
      songs.songs = [];
    }
    artists.artists.forEach((item: any) => delete item.distance);
    if (albums?.albums) {
      albums.albums.forEach((item: any) => delete item.similarity_score);
    } else {
      albums.albums = [];
    }
    if (playlists !== null && playlists.playlists !== null) {
      playlists.playlists.forEach((item) => delete item.similarity_score);
    }
    else {
      if (playlists !== null) {
        playlists.playlists = [];
      }
    }
    users.users.forEach((item) => delete item.similarity_score);
    console.log("task 4");
    res
    .status(200)
    .json( {data: { songs: songs?.songs ?? [],
            artists: artists?.artists ?? [],
            albums: albums?.albums ?? [],
            playlists: playlists?.playlists ?? [],
            users: users?.users ?? []
     }} );  
    console.log(res.json);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Me may' });
    return;
  }
};

/**
 * Search songs
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/search/:term/songs
 */
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
      cache.songs.forEach((item) => delete item.distance);
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc("search_songs", { term: term, }); 

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  data.songs.forEach((item) => delete item.distance);
  res.status(200).json({ data });
  return;
};

/**
 * Search artists
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/search/:term/artists
 */
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
      cache.artists.forEach((item) => delete item.distance);
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc("search_artists", { term: term, });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  data.artists.forEach((item) => delete item.distance);
  res.status(200).json({ data });
  return;
};

/**
 * Search users
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/search/:term/users
 */
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
      cache.users.forEach((item) => delete item.similarity_score);
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc('search_users', { term: term });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  data.users.forEach((item) => delete item.similarity_score);
  res.status(200).json({ data });
  return;
};

/**
 * Search playlists
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/search/:term/playlists
 */
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
      if (cache.playlists !== null) {
        cache.playlists.forEach((item) => delete item.similarity_score);
      }
      else {
        cache.playlists = [];
      }
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc('search_playlists', { term: term });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  if (data.playlists !== null) {
    data.playlists.forEach((item) => delete item.similarity_score);
  }
  else {
    data.playlists = [];
  }
  res.status(200).json({ data });
  return;
};

/**
 * Search albums
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/search/:term/albums
 */
const searchAlbums: RequestHandler = async (req: Request, res: Response) => {
  const term = decodeURIComponent(req.params.term);
  console.log(term);
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
      cache.albums.forEach((item: any) => delete item.similarity_score);
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc('search_albums', { term: term });
  if (error) {
    console.error('Error calling RPC:', error);
  } else {
    console.log('Search results:', data);
  }

  if (!Array.isArray(data)) {
    console.error("Data is not an array:", data);
  }

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, data, { ex: 300 });
  }
  data.albums.forEach((item: any) => delete item.similarity_score);
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
