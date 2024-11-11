import env from "@/env";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class Backblaze {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: env.AWS_ENDPOINT,
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  public async generatePresignedDownloadURL(
    fileName: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: fileName,
      ResponseContentType: "audio/mpeg",
      ResponseContentDisposition: "inline",
    });

    const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
    return signedUrl;
  }

  public async generatePresignedUploadURL(
    fileName: string,
    expiresIn: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: fileName,
      ContentType: "audio/mpeg",
    });

    const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
    return signedUrl;
  }

  public async deleteObject(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: fileName,
    });
    try {
      await this.client.send(command);
    } catch (error) {
      console.error(
        "\x1b[31m[Backblaze] Error: File not removed properly:",
        fileName,
        "Error message:",
        error,
        "\x1b[0m",
      );
    }
  }
}

const backblaze = new Backblaze();

export default backblaze;
