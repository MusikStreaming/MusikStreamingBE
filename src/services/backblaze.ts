import { S3Client } from "@aws-sdk/client-s3";

const backblaze = new S3Client({
  endpoint: process.env.AWS_ENDPOINT!,
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default backblaze;
