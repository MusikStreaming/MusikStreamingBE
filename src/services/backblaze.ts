import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class Backblaze {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT!,
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  public async generatePresignedDownloadURL(fileName: string): Promise<string> {
    const expiresIn = 1800;
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: fileName,
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
      return signedUrl;
    } catch (err) {
      throw new Error(`Error generating pre-signed URL: ${err}`);
    }
  }

  public async generatePresignedUploadURL(fileName: string): Promise<string> {
    const expiresIn = 900;
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: fileName,
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
      return signedUrl;
    } catch (err) {
      throw new Error(`Error generating pre-signed URL: ${err}`);
    }
  }
}

const backblaze = new Backblaze();

export default backblaze;
