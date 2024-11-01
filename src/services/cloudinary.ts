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

  public async upload(
    file: Express.Multer.File,
    folder: string,
    id: string,
  ): Promise<string> {
    if (!file) {
      throw new Error("No file uploaded!");
    }

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder, public_id: `i-${id}` },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as { secure_url: string });
          },
        );
        stream.end(file.buffer);
      },
    );
    return uploadResult.secure_url;
  }

  public async delete(filePath: string): Promise<void> {
    const response = await cloudinary.uploader.destroy(filePath, {
      invalidate: true,
    });
    console.log(`[Cloudinary] Log: Delete result is ${response.result}`);
    return;
  }
}

const cld = new Cloudinary();

export { cld as cloudinary };
