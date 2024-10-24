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

  public async generatePresignedUploadURL(req: Request) {
    const folder = req.params.folder;
    let url;

    try {
      const timestamp = Math.round(new Date().getTime() / 1000) - 45 * 60;
      const signature = await cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          ...(folder ? { folder: folder } : {}),
        },
        process.env.CLOUDINARY_SECRET!,
      );

      url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload?api_key=${process.env.CLOUDINARY_API_KEY}&folder=${folder}&timestamp=${timestamp}&signature=${signature}`;
    } catch (err) {
      throw new Error(`Error generating pre-signed URL: ${err}`);
    }
    return url;
  }
}

const cld = new Cloudinary();

export { cld as cloudinary };
