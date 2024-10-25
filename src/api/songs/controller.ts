import backblaze from "@/services/backblaze";
import { Request, Response } from "express";

const interactBlobStorage = async (
  req: Request,
  res: Response,
): Promise<Response> => {
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
        return res.status(400).json({
          error: "Invalid operation when trying to interact with storage",
        });
    }
  } catch (err) {
    if (req.params.op === "r" || req.params.op === "u") {
      return res.status(500).json({ error: `Error generating pre-signed URL` });
    } else if (req.params.op === "d") {
      return res
        .status(500)
        .json({ error: `Error deleting file "${fileName}"` });
    } else {
      return res
        .status(500)
        .json({ error: `An unexpected error occurred: ${err}` });
    }
  }

  return res.status(200).json(response);
};

export default { interactBlobStorage };
