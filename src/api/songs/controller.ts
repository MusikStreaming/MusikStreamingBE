import backblaze from "@/services/backblaze";
import { cloudinary } from "@/services/cloudinary";
import redis from "@/services/redis";
import supabase from "@/services/supabase";
import { sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

const getAllSongs: RequestHandler = async (req: Request, res: Response) => {
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

  const key = `songs?page=${page}&limit=${limit}`;
  const cache = await redis.get(key);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  const { data, error } = await supabase
    .from("songs")
    .select()
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(key, data, {
    ex: 300,
  });
  res.status(200).json({ data });
};

const getSongByID: RequestHandler = async (req: Request, res: Response) => {
  const key = `songs?id=${req.params.id}`;

  const cache = await redis.get(key);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  const { data, error } = await supabase
    .from("songs")
    .select()
    .eq("id", req.params.id)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(key, data, {
    ex: 300,
  });
  res.status(200).json({ data });
};

const generatePresignedDownloadURL: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from("artistssongs")
    .select("artist: artists (name), song: songs (title)")
    .match({ relation: "Primary", songid: id })
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data.song || !data.artist) {
    res.status(404).json({ error: "Artist or Song does not exist" });
    return;
  }

  const fileName: string = `${data.artist.name}/${data.song.title.replace(/\s+/g, "_")}.mp3`;
  let url: string;
  try {
    url = await backblaze.generatePresignedDownloadURL(fileName, 1800);
  } catch (err) {
    res.status(500).json({ error: `Error generating pre-signed URL: ${err}` });
    return;
  }

  res.status(200).json({ url });
};

const generatePresignedUploadURL: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from("artistssongs")
    .select("artist: artists (name), song: songs (title)")
    .match({ relation: "Primary", songid: id })
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data.song || !data.artist) {
    res.status(404).json({ error: "Artist or Song does not exist" });
    return;
  }

  const fileName: string = `${data.artist.name}/${data.song.title.replace(/\s+/g, "_")}.mp3`;
  let url: string;
  try {
    url = await backblaze.generatePresignedUploadURL(fileName, 900);
  } catch (err) {
    res.status(500).json({ error: `Error generating pre-signed URL: ${err}` });
    return;
  }

  res.status(200).json({ url });
};

const updateSong: RequestHandler = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, description, duration, releasedate, genre, views } = req.body;
  let { thumbnailurl } = req.body;

  if (req.file) {
    cloudinary.upload(req.file, "songs", id);
    thumbnailurl = `${process.env.CLOUDINARY_PREFIX}/songs/i-${id}.jpg`;
  }

  const response = {
    ...(title && { title }),
    ...(description && { description }),
    ...(thumbnailurl && { thumbnailurl }),
    ...(duration && { duration }),
    ...(releasedate && { releasedate }),
    ...(genre && { genre }),
    ...(views && { views }),
  };

  const { data, error } = await supabase
    .from("songs")
    .update(response)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

const addSong: RequestHandler = async (req: Request, res: Response) => {
  const { title, thumbnailurl, duration, releasedate, genre, artists } =
    req.body;

  if (!title) {
    res.status(400).json({ error: "Payload must have field: title" });
    return;
  }

  if (typeof artists !== "string") {
    res.status(400).json({
      error:
        "Invalid payload request: artists must be a string separated by ','",
    });
    return;
  }

  const response = {
    title,
    ...(thumbnailurl && { thumbnailurl }),
    ...(duration && { duration }),
    ...(releasedate && { releasedate: new Date(releasedate).toISOString() }),
    ...(genre && { genre }),
  };

  const { data, error } = await supabase
    .from("songs")
    .insert(response)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const promises = artists.split(",").map((artistid: string, index: number) =>
    supabase.from("artistssongs").insert({
      songid: data.id,
      artistid: artistid.trim(),
      relation: index === 0 ? "Primary" : "Featured",
    }),
  );

  const results = await Promise.all(promises);
  const errors = results.filter((result) => result.error).map((e) => e.error);

  if (errors.length > 0) {
    supabase.from("songs").delete().eq("id", data.id);
    res.status(500).json({
      error: `Failed to link associate artists with current song ${data.id}`,
      details: errors.filter(Boolean).map((e) => e!.message),
    });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "songs", data.id);
  }

  res.status(200).json({ data });
};

const deleteSong: RequestHandler = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from("songs")
    .delete()
    .eq("id", id)
    .select("title")
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  backblaze.deleteObject(data.title + ".mp3");
  cloudinary.delete("songs", `i-${id}`);

  res.status(204).send();
};

export default {
  getAllSongs,
  getSongByID,
  addSong,
  generatePresignedDownloadURL,
  generatePresignedUploadURL,
  updateSong,
  deleteSong,
};
