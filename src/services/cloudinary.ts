import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";

class Cloudinary {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_SECRET!,
      secure: true,
    });
  }

  public async upload(req: Request) {
    if (!req.file) {
      throw new Error("No file uploaded!");
    }

    const folder = req.params.folder || "misc";

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as { secure_url: string });
          },
        );
        stream.end(req.file!.buffer);
      },
    );
    return uploadResult;
  }
}

const cld = new Cloudinary();

export { cld as cloudinary };
