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
  switch (req.params.op) {
    case "r":
      const downUrl: string =
        await backblaze.generatePresignedDownloadURL(fileName);
      response = { url: downUrl };
      break;
    case "u":
      const upUrl: string =
        await backblaze.generatePresignedUploadURL(fileName);
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
  return res.status(200).json(response);
};

export default { interactBlobStorage };
