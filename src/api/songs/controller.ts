import { Tables } from "@/models/types";
import backblaze from "@/services/backblaze";
import supabase from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

const getAllSongs: RequestHandler = async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("songs")
    .select()
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

const handleBlobStorage: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  let response: object;
  const fileName: string = decodeURIComponent(req.params.fileName).replace(
    /\+/g,
    " ",
  );
  try {
    switch (req.params.op) {
      case "r":
        const downUrl: string = await backblaze.generatePresignedDownloadURL(
          fileName,
          1800,
        );
        response = { url: downUrl };
        break;
      case "u":
        const upUrl: string = await backblaze.generatePresignedUploadURL(
          fileName,
          900,
        );
        response = { url: upUrl };
        break;
      case "d":
        response = { message: `File ${fileName} deleted successfully` };
        break;
      default:
        res.status(400).json({
          error: "Invalid operation when trying to interact with storage",
        });
        return;
    }
  } catch (err) {
    if (req.params.op === "r" || req.params.op === "u") {
      res.status(500).json({ error: `Error generating pre-signed URL` });
      return;
    } else if (req.params.op === "d") {
      res.status(500).json({ error: `Error deleting file "${fileName}"` });
      return;
    } else {
      res.status(500).json({ error: `An unexpected error occurred: ${err}` });
      return;
    }
  }

  res.status(200).json(response);
  return;
};

export default { getAllSongs, getSongByID, handleBlobStorage };
