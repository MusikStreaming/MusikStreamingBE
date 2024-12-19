import redis from "@/services/redis";
import { supabase } from "@/services/supabase";
import { sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

interface SongsSchema {
  songs: any;
}

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
      res.status(200).json(cache);
      return;
    }
  }

  try {
    //console.log("task 1");
    const [
      { data: songs, error: songError },
      { data: artists, error: artistError },
      { data: albums, error: albumError },
      { data: playlists, error: playlistError },
      { data: users, error: userError },
    ] = await Promise.all([
      supabase.rpc<any, any>("search_songs", { term: term }),
      supabase.rpc<any, any>("search_artists", { term: term }),
      supabase.rpc<any, any>("search_albums", { term: term }),
      supabase.rpc<any, any>("search_playlists", { term: term }),
      supabase.rpc<any, any>("search_users", { term: term }),
    ]);

    const response = {
      data: {
        songs: songs?.songs ?? [],
        artists: artists?.artists ?? [],
        albums: albums?.albums ?? [],
        playlists: playlists?.playlists ?? [],
        users: users?.users ?? [],
      },
    };

    //console.log("task 2");
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
        response,
        { ex: 300 },
      );
    }
    //console.log("task 3");

    //console.log("task 4");
    res
    .status(200)
    .json( response );  
    //console.log(res.json);
    return;
  } catch (error) {
    res.status(500).json({ error: error });
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
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc("search_songs", { term: term }); 

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
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc<any, any>('search_playlists', { term: term });

  const response = {
    data: {
      playlists: data?.playlists ?? [],
    }
  };

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, response, { ex: 300 });
  }
  res.status(200).json( response );
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
      res.status(200).json(cache);
      return;
    }
  }

  const { data, error } = await supabase.rpc<any, any>('search_albums', { term: term });
  const response = {
    data: {
      albums: data?.albums ?? [],
    }
  };

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (role !== "Admin") {
    redis.set(key, response, { ex: 300 });
  }
  res.status(200).json( response );
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
