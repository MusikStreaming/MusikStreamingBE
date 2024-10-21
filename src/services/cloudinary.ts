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

  async generateSignature(req: Request, res: Response) {
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
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ url });
  }
}

const cld = new Cloudinary();

export { cld as cloudinary };
