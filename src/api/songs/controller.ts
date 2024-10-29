import { Tables } from "@/models/types";
import backblaze from "@/services/backblaze";
import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const getAllSongs: RequestHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, error } = await supabase
    .from("songs")
    .select()
    .range((page - 1) * limit, page * limit - 1)
    .returns<Tables<"songs">>();

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
    .returns<Tables<"songs">>();

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
  const fileName: string = decodeURIComponent(req.params.fileName).replace(
    /\+/g,
    " ",
  );
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
  const fileName: string = decodeURIComponent(req.params.fileName).replace(
    /\+/g,
    " ",
  );
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

export default { getAllSongs, getSongByID, generatePresignedDownloadURL, generatePresignedUploadURL };
