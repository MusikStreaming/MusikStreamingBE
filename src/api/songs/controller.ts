import backblaze from "@/services/backblaze";
import { cloudinary } from "@/services/cloudinary";
import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const getAllSongs: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("songs")
    .select()
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const getSongByID: RequestHandler = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("songs")
    .select()
    .eq("id", req.params.id)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
  return;
};

const generatePresignedDownloadURL: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const fileName: string = `s-${req.params.id}.mp3`;
  let url: string;
  try {
    url = await backblaze.generatePresignedDownloadURL(fileName, 1800);
  } catch (err) {
    res.status(500).json({ error: `Error generating pre-signed URL: ${err}` });
  }
  return;

  res.status(200).json({ url });
  return;
};

const generatePresignedUploadURL: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const fileName: string = `s-${req.params.id}.mp3`;
  let url: string;
  try {
    url = await backblaze.generatePresignedUploadURL(fileName, 900);
  } catch (err) {
    res.status(500).json({ error: `Error generating pre-signed URL: ${err}` });
  }
  return;

  res.status(200).json({ url });
  return;
};

const updateSong: RequestHandler = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, description, thumbnailurl, duration, releasedate, genre } =
    req.body;

  const response = {
    ...(title && { title }),
    ...(description && { description }),
    ...(thumbnailurl && { thumbnailurl }),
    ...(duration && { duration }),
    ...(releasedate && { releasedate }),
    ...(genre && { genre }),
  };

  const { error } = await supabase.from("songs").update(response).eq("id", id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "songs", id);
  }

  res.status(200).json({ message: `Song ${id} updated successfully` });
  return;
};

const addSong: RequestHandler = async (req: Request, res: Response) => {
  const { title, description, thumbnailurl, duration, releasedate, genre } =
    req.body;

  if (!title) {
    res.status(400).json({ error: "Payload must have field: title" });
    return;
  }

  const response = {
    title,
    ...(description && { description }),
    ...(thumbnailurl && { thumbnailurl }),
    ...(duration && { duration }),
    ...(releasedate && { releasedate }),
    ...(genre && { genre }),
  };

  const { data, error } = await supabase
    .from("songs")
    .insert(response)
    .select("id")
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "songs", data.id);
  }

  res.status(201).json({ message: `Song ${title} created` });
  return;
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

  res.status(202).json({ message: `Song ${id} is being deleted` });
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
