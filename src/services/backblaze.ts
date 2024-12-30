import env from "@/env";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * A service that provides Blob storage, needed to store files like music or video and supports streaming.
 *
 * The `Backblaze` class provides methods to manage files such as adding, deleting and download/streaming.
 *
 * @class
 */
class Backblaze {
  /**
   * A S3 client to interact with.
   */
  private readonly client: S3Client;

  /**
   * Creates a new connection to Backblaze (please only do this once when running the app and do connection polling).
   *
   * @constructor
   */
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

  /**
   * Generates a presigned url that only works in the time frame of choice.
   * Used for downloading/streaming.
   * @async
   * @function generatePresignedDownloadURL
   * @param {string} fileName - The name of the file after urlencoded.
   * @param {number} expiresIn - The time of link expiration, in seconds.
   * @returns {Promise<string>} A promise that contains the signed url
   */
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

  /**
   * Generates a presigned url that only works in the time frame of choice.
   * Used for uploading.
   * @async
   * @function generatePresignedUploadURL
   * @param {string} fileName - The name of the file after urlencoded.
   * @param {number} expiresIn - The time of link expiration, in seconds.
   * @returns {Promise<string>} A promise that contains the signed url
   */
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

  /**
   * Deletes a file in the storage
   * @async
   * @function deleteObject
   * @param {string} fileName - The name of the file after urlencoded.
   * @returns {Promise<void>} Must have been the wind...
   */
  public async deleteObject(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: fileName,
    });
    try {
      await this.client.send(command);
      console.log("[Backblaze] Log: File removed");
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
